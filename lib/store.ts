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

export interface Store {
  coupons: Coupon[];
  notices: Notice[];
  overrides: Record<string, Override>;
}

const DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "store.json");

const EMPTY: Store = { coupons: [], notices: [], overrides: {} };

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
