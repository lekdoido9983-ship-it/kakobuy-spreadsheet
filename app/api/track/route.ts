import { NextRequest } from "next/server";
import { addClick } from "@/lib/clicks";

const WEIGHT = { open: 1, buy: 3 } as const;
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python|node-fetch/i;

// one count per visitor + product + kind every 30 minutes (in memory)
const seen = new Map<string, number>();
const WINDOW = 30 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });

  let body: { id?: unknown; kind?: unknown } = {};
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const id = Number(body.id);
  const kind = body.kind === "buy" ? "buy" : "open";
  if (!Number.isInteger(id) || id < 1 || id > 100000) return new Response(null, { status: 400 });

  const ip = req.headers.get("fly-client-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${ip}|${id}|${kind}`;
  const now = Date.now();
  const last = seen.get(key) || 0;
  if (now - last < WINDOW) return new Response(null, { status: 204 });
  seen.set(key, now);
  if (seen.size > 20000) for (const [k, t] of seen) if (now - t > WINDOW) seen.delete(k);

  addClick(id, WEIGHT[kind]);
  return new Response(null, { status: 204 });
}
