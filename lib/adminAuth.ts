import crypto from "node:crypto";

export const ADMIN_COOKIE = "kb_admin";
const WEEK = 7 * 24 * 60 * 60;

export function adminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 8;
}

function secret(): string {
  return (process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "") + "|kakobuy-admin";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkPassword(pw: string): boolean {
  return adminConfigured() && safeEqual(pw, process.env.ADMIN_PASSWORD as string);
}

export function makeToken(): string {
  const exp = Math.floor(Date.now() / 1000) + WEEK;
  const payload = String(exp);
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token || !adminConfigured()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(sig, sign(payload))) return false;
  return Number(payload) > Date.now() / 1000;
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: WEEK,
};

/** Returns an error Response if the request is not an authenticated, same-origin admin call. */
export function guard(req: Request & { cookies: { get(name: string): { value: string } | undefined } }): Response | null {
  if (!adminConfigured()) return Response.json({ error: "Admin is not configured (set ADMIN_PASSWORD)." }, { status: 503 });
  if (!verifyToken(req.cookies.get(ADMIN_COOKIE)?.value)) return Response.json({ error: "Not signed in." }, { status: 401 });
  if (req.method !== "GET") {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host && new URL(origin).host !== host) return Response.json({ error: "Bad origin." }, { status: 403 });
  }
  return null;
}

const attempts = new Map<string, { n: number; first: number }>();
export function tooManyAttempts(ip: string): boolean {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || now - a.first > 15 * 60 * 1000) {
    attempts.set(ip, { n: 1, first: now });
    return false;
  }
  a.n++;
  return a.n > 8;
}
export function clearAttempts(ip: string) {
  attempts.delete(ip);
}
