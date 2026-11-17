import fs from "node:fs";
import path from "node:path";

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  active: boolean;
  /** ISO date (yyyy-mm-dd). Empty = never expires. */
  expiresAt?: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  link?: string;
  active: boolean;
  createdAt: string;
}

export interface Override {
  name?: string;
  price?: number;
  category?: string;
  popular?: boolean;
  hidden?: boolean;
  kakobuyUrl?: string;
}

/** "Community" window in the top bar. */
export interface Community {
  title: string;
  discordUrl: string;
  telegramUrl: string;
  /** Label of the main button */
  buttonLabel: string;
  /** Where the main button goes (empty = the Discord link) */
  joinUrl: string;
  /** Free text under the buttons */
  text: string;
}

/** First-visit-of-the-day popup with a discount coupon. */
export interface Welcome {
  enabled: boolean;
  title: string;
  /** Big text, e.g. "10% OFF" */
  discount: string;
  message: string;
  code: string;
  note: string;
}

export interface Settings {
  community: Community;
  welcome: Welcome;
}

export interface Store {
  coupons: Coupon[];
  notices: Notice[];
  overrides: Record<string, Override>;
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  community: {
    title: "Join our community",
    discordUrl: "https://discord.gg/your-invite",
    telegramUrl: "https://t.me/repstitan",
    buttonLabel: "Join Community",
    joinUrl: "",
    text: "Daily promotions, new products and discounts every day.",
  },
  welcome: {
    enabled: true,
    title: "Welcome gift",
    discount: "10% OFF",
    message: "Use this coupon code on your first purchase.",
    code: "WELCOME10",
    note: "Valid on your first purchase only.",
  },
};

export function mergeSettings(raw: unknown): Settings {
  const r = (raw && typeof raw === "object" ? raw : {}) as { community?: Partial<Community>; welcome?: Partial<Welcome> };
  return {
    community: { ...DEFAULT_SETTINGS.community, ...(r.community || {}) },
    welcome: { ...DEFAULT_SETTINGS.welcome, ...(r.welcome || {}) },
  };
}

const DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "store.json");

const EMPTY: Store = { coupons: [], notices: [], overrides: {}, settings: DEFAULT_SETTINGS };

let cache: { stamp: number; data: Store } | null = null;

function stamp(): number {
  try {
    return fs.statSync(FILE).mtimeMs;
  } catch {
    return 0;
  }
}

export function readStore(): Store {
  const s = stamp();
  if (cache && cache.stamp === s) return cache.data;
  let data: Store = EMPTY;
  if (s) {
    try {
      const raw = JSON.parse(fs.readFileSync(FILE, "utf8"));
      data = {
        coupons: Array.isArray(raw.coupons) ? raw.coupons : [],
        notices: Array.isArray(raw.notices) ? raw.notices : [],
        overrides: raw.overrides && typeof raw.overrides === "object" ? raw.overrides : {},
        settings: mergeSettings(raw.settings),
      };
    } catch {
      data = EMPTY;
    }
  }
  cache = { stamp: s, data };
  return data;
}

/** Atomic write. Throws if the storage is read-only (e.g. on Vercel). */
export function writeStore(next: Store): void {
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = FILE + "." + process.pid + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(next, null, 2));
  fs.renameSync(tmp, FILE);
  cache = null;
}

export function storageWritable(): boolean {
  try {
    fs.mkdirSync(DIR, { recursive: true });
    fs.accessSync(DIR, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export function storeStamp(): number {
  return stamp();
}

export function isExpired(c: { expiresAt?: string }): boolean {
  if (!c.expiresAt) return false;
  const end = Date.parse(c.expiresAt + "T23:59:59");
  return Number.isFinite(end) && end < Date.now();
}
