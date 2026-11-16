import { NextRequest } from "next/server";
import { guard } from "@/lib/adminAuth";
import { readStore, writeStore, type Community, type Coupon, type Notice, type Welcome } from "@/lib/store";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const id = () => Math.random().toString(36).slice(2, 10);

function cleanCoupons(v: unknown): Coupon[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 200).map((c) => {
    const exp = str(c?.expiresAt, 10);
    return {
      id: str(c?.id, 20) || id(),
      code: str(c?.code, 40).toUpperCase(),
      title: str(c?.title, 120),
      description: str(c?.description, 400),
      active: c?.active !== false,
      expiresAt: /^\d{4}-\d{2}-\d{2}$/.test(exp) ? exp : undefined,
      createdAt: str(c?.createdAt, 30) || new Date().toISOString(),
    };
  });
}

function safeLink(v: unknown): string | undefined {
  const s = str(v, 300);
  if (!s) return undefined;
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

function cleanNotices(v: unknown): Notice[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 200).map((n) => ({
    id: str(n?.id, 20) || id(),
    title: str(n?.title, 120),
    message: str(n?.message, 600),
    link: safeLink(n?.link),
    active: n?.active !== false,
    createdAt: str(n?.createdAt, 30) || new Date().toISOString(),
  }));
}

function cleanCommunity(v: unknown, cur: Community): Community {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const url = (x: unknown, fallback: string) => {
    const s = str(x, 300);
    if (!s) return "";
    return safeLink(s)?.startsWith("http") ? safeLink(s)! : fallback;
  };
  return {
    title: str(o.title, 80) || cur.title,
    discordUrl: url(o.discordUrl, cur.discordUrl),
    telegramUrl: url(o.telegramUrl, cur.telegramUrl),
    buttonLabel: str(o.buttonLabel, 40) || cur.buttonLabel,
    joinUrl: url(o.joinUrl, cur.joinUrl),
    text: str(o.text, 500),
  };
}

function cleanWelcome(v: unknown): Welcome {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return {
    enabled: o.enabled !== false,
    title: str(o.title, 80),
    discount: str(o.discount, 40),
    message: str(o.message, 300),
    code: str(o.code, 40).toUpperCase(),
    note: str(o.note, 200),
  };
}

export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  const { coupons, notices, settings } = readStore();
  return Response.json({ coupons, notices, community: settings.community, welcome: settings.welcome }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  let body: { coupons?: unknown; notices?: unknown; community?: unknown; welcome?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const cur = readStore();
  const next = {
    ...cur,
    coupons: body.coupons !== undefined ? cleanCoupons(body.coupons).filter((c) => c.code) : cur.coupons,
    notices: body.notices !== undefined ? cleanNotices(body.notices).filter((n) => n.title || n.message) : cur.notices,
    settings: {
      community: body.community !== undefined ? cleanCommunity(body.community, cur.settings.community) : cur.settings.community,
      welcome: body.welcome !== undefined ? cleanWelcome(body.welcome) : cur.settings.welcome,
    },
  };
  try {
    writeStore(next);
  } catch {
    return Response.json({ error: "Could not save: the server storage is read-only (admin edits work on the Fly.io deploy)." }, { status: 500 });
  }
  return Response.json({ coupons: next.coupons, notices: next.notices, community: next.settings.community, welcome: next.settings.welcome });
}
