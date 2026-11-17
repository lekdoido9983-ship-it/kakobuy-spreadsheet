import fs from "node:fs";
import path from "node:path";
import { getAllProducts } from "./products";
import type { Product } from "./categories";
import { SITE_URL, SITE_NAME } from "./site";
import { hookFor, ctaLine } from "./autopostText";

/**
 * Auto-poster: every few minutes (≈ AUTOPOST_PER_DAY times a day) it posts one of OUR products to Telegram and Discord:
 * photo + short hook + real price + the affiliate link + a line pointing back to the site.
 * Runs inside the always-on server, so it works whether or not anyone's computer is on.
 *
 * Env:  TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (e.g. @mychannel or -100123…), DISCORD_WEBHOOK_URL,
 *       AUTOPOST_PER_DAY (default 20), AUTOPOST_ENABLED ("false" pauses).
 */

const DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "autopost.json");
const AFF = "affcode=8p34q";

interface State {
  nextAt: number;
  lastAt: number;
  total: number;
  lastHook?: string;
  recent: { id: number; at: number; cat: string }[];
  log: { at: number; ok: boolean; id?: number; msg: string }[];
}

const EMPTY: State = { nextAt: 0, lastAt: 0, total: 0, recent: [], log: [] };

function load(): State {
  try {
    return { ...EMPTY, ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
  } catch {
    return { ...EMPTY, recent: [], log: [] };
  }
}

function save(s: State) {
  try {
    fs.mkdirSync(DIR, { recursive: true });
    const tmp = FILE + "." + process.pid + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(s));
    fs.renameSync(tmp, FILE);
  } catch {}
}

export function autopostConfig() {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN || "";
  const tgChat = process.env.TELEGRAM_CHAT_ID || "";
  const discord = process.env.DISCORD_WEBHOOK_URL || "";
  const perDay = Math.min(96, Math.max(1, Number(process.env.AUTOPOST_PER_DAY) || 20));
  return {
    telegram: !!(tgToken && tgChat),
    discord: !!discord,
    perDay,
    enabled: process.env.AUTOPOST_ENABLED !== "false",
    tgToken,
    tgChat,
    discordUrl: discord,
  };
}

export function autopostStatus() {
  const c = autopostConfig();
  const s = load();
  return {
    telegram: c.telegram,
    discord: c.discord,
    enabled: c.enabled,
    perDay: c.perDay,
    total: s.total,
    lastAt: s.lastAt ? new Date(s.lastAt).toISOString() : null,
    nextAt: s.nextAt ? new Date(s.nextAt).toISOString() : null,
    log: s.log.slice(-15).map((l) => ({ ...l, at: new Date(l.at).toISOString() })),
  };
}

/** Weighted random pick: popular / QC-rich items first, no repeats for a long time, varied categories. */
function pickProduct(s: State): Product | null {
  const usedRecent = new Set(s.recent.slice(-3000).map((r) => r.id));
  const lastCats = s.recent.slice(-3).map((r) => r.cat);
  const base = getAllProducts().filter(
    (p) => p.image && p.price && p.price > 0 && p.kakobuyUrl && p.kakobuyUrl.includes(AFF) && fs.existsSync(path.join(process.cwd(), "public", p.image.replace(/^\//, "")))
  );
  if (!base.length) return null;
  let pool = base.filter((p) => !usedRecent.has(p.id) && !lastCats.includes(p.category));
  if (!pool.length) pool = base.filter((p) => !usedRecent.has(p.id));
  if (!pool.length) pool = base.filter((p) => !lastCats.includes(p.category));
  if (!pool.length) pool = base;
  const weight = (p: Product) => 1 + (p.popular ? 3 : 0) + Math.min(p.qcN || 0, 10) / 5;
  const total = pool.reduce((n, p) => n + weight(p), 0);
  let r = Math.random() * total;
  for (const p of pool) {
    r -= weight(p);
    if (r <= 0) return p;
  }
  return pool[pool.length - 1];
}

/** Branded square photo (dark purple background, product centred, small logo). JPEG so every app shows it. */
async function makeImage(p: Product): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const S = 1080;
  const file = path.join(process.cwd(), "public", (p.image as string).replace(/^\//, ""));
  // photos with an opaque (usually white) background sit on a light card instead of a white box on purple
  let opaque = false;
  try {
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const corners = [0, info.width - 1].flatMap((x) => [0, info.height - 1].map((y) => data[(y * info.width + x) * 4 + 3]));
    opaque = corners.every((a) => a > 200);
  } catch {}
  const bg = Buffer.from(
    opaque
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><rect width="${S}" height="${S}" fill="#ffffff"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><defs><radialGradient id="g" cx="30%" cy="12%" r="95%"><stop offset="0" stop-color="#4b2f78"/><stop offset="0.55" stop-color="#1d1330"/><stop offset="1" stop-color="#100b19"/></radialGradient></defs><rect width="${S}" height="${S}" fill="url(#g)"/></svg>`
  );
  const product = await sharp(file).resize({ width: 880, height: 880, fit: "inside" }).toBuffer();
  const layers: { input: Buffer; gravity?: string; left?: number; top?: number }[] = [{ input: product, gravity: "centre" }];
  try {
    const logo = await sharp(path.join(process.cwd(), "public", "logo.png")).resize({ height: 90 }).toBuffer();
    layers.push({ input: logo, left: 36, top: S - 126 });
  } catch {}
  return sharp(bg).composite(layers as never).jpeg({ quality: 88 }).toBuffer();
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function buildText(p: Product, hook: string) {
  const price = `$${Number(p.price).toFixed(2).replace(/\.00$/, "")}`;
  const cta = ctaLine();
  const host = SITE_URL.replace(/^https?:\/\//, "");
  return { price, cta, host, hook, name: p.name };
}

async function sendTelegram(cfg: ReturnType<typeof autopostConfig>, p: Product, img: Buffer, t: ReturnType<typeof buildText>) {
  const caption =
    `🔥 ${esc(t.hook)}\n\n` +
    `🛍 <b>${esc(t.name)}</b>\n` +
    `💰 Price: <b>${esc(t.price)}</b>\n\n` +
    `👉 <a href="${esc(p.kakobuyUrl)}">${esc(t.cta)}</a>\n\n` +
    `🌐 The best finds, all in one place: <a href="${esc(SITE_URL)}">${esc(t.host)}</a>`;
  const form = new FormData();
  form.set("chat_id", cfg.tgChat);
  form.set("caption", caption);
  form.set("parse_mode", "HTML");
  form.set("photo", new Blob([new Uint8Array(img)], { type: "image/jpeg" }), "find.jpg");
  const res = await fetch(`https://api.telegram.org/bot${cfg.tgToken}/sendPhoto`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

async function sendDiscord(cfg: ReturnType<typeof autopostConfig>, p: Product, img: Buffer, t: ReturnType<typeof buildText>) {
  const payload = {
    username: SITE_NAME,
    embeds: [
      {
        title: t.name.slice(0, 250),
        url: p.kakobuyUrl,
        description: `🔥 ${t.hook}\n\n💰 **Price: ${t.price}**\n👉 [${t.cta}](${p.kakobuyUrl})\n\n🌐 The best finds, all in one place: [${t.host}](${SITE_URL})`,
        color: 0xf59a3a,
        image: { url: "attachment://find.jpg" },
      },
    ],
    allowed_mentions: { parse: [] },
  };
  const form = new FormData();
  form.set("payload_json", JSON.stringify(payload));
  form.set("files[0]", new Blob([new Uint8Array(img)], { type: "image/jpeg" }), "find.jpg");
  const res = await fetch(cfg.discordUrl, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Discord ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

let busy = false;

/** Posts one product now. dry = build everything but send nothing (returns the preview). */
export async function postOne(opts: { dry?: boolean } = {}) {
  if (busy) return { ok: false, msg: "busy" };
  busy = true;
  const cfg = autopostConfig();
  const s = load();
  try {
    const p = pickProduct(s);
    if (!p) throw new Error("no product available");
    const hook = hookFor(p.name, p.category, s.lastHook);
    const t = buildText(p, hook);
    const img = await makeImage(p);
    if (opts.dry) return { ok: true, dry: true, product: { id: p.id, name: p.name, category: p.category, price: p.price, link: p.kakobuyUrl }, hook, jpegBytes: img.length, image: img };
    const errors: string[] = [];
    let sent = 0;
    if (cfg.telegram) {
      try {
        await sendTelegram(cfg, p, img, t);
        sent++;
      } catch (e) {
        errors.push(String((e as Error).message));
      }
    }
    if (cfg.discord) {
      try {
        await sendDiscord(cfg, p, img, t);
        sent++;
      } catch (e) {
        errors.push(String((e as Error).message));
      }
    }
    const now = Date.now();
    if (sent > 0) {
      s.recent.push({ id: p.id, at: now, cat: p.category });
      s.recent = s.recent.slice(-3000);
      s.lastHook = hook;
      s.lastAt = now;
      s.total += 1;
    }
    s.log.push({ at: now, ok: sent > 0 && !errors.length, id: p.id, msg: errors.length ? errors.join(" | ") : `posted #${p.id} ${p.name}`.slice(0, 160) });
    s.log = s.log.slice(-40);
    save(s);
    return { ok: sent > 0, msg: errors.join(" | ") || "sent", id: p.id };
  } catch (e) {
    const msg = String((e as Error).message);
    s.log.push({ at: Date.now(), ok: false, msg });
    s.log = s.log.slice(-40);
    save(s);
    return { ok: false, msg };
  } finally {
    busy = false;
  }
}

async function tick() {
  const cfg = autopostConfig();
  if (!cfg.enabled || (!cfg.telegram && !cfg.discord)) return;
  const s = load();
  const now = Date.now();
  if (s.nextAt && now < s.nextAt) return;
  const interval = 86_400_000 / cfg.perDay;
  // reserve the next slot first, so a crash or restart never causes a burst of posts
  s.nextAt = now + interval * (0.75 + Math.random() * 0.5);
  save(s);
  const r = await postOne();
  if (!r.ok) {
    const again = load();
    again.nextAt = Date.now() + 5 * 60_000; // retry in 5 min when sending failed
    save(again);
  }
}

let started = false;
export function startAutopost() {
  if (started) return;
  started = true;
  setTimeout(() => void tick().catch(() => {}), 20_000);
  setInterval(() => void tick().catch(() => {}), 60_000).unref?.();
}
