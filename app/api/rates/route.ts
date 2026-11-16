import { NextResponse } from "next/server";

// Live USD -> EUR/GBP rates (ECB reference rates via frankfurter.dev). Cached in memory
// and at the CDN; falls back to fixed rates if the provider is unreachable.
const FALLBACK = { EUR: 0.905, GBP: 0.756 };
const TTL = 6 * 60 * 60 * 1000;

let cache: { at: number; EUR: number; GBP: number } | null = null;

export async function GET() {
  if (!cache || Date.now() - cache.at > TTL) {
    try {
      const r = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP", {
        signal: AbortSignal.timeout(5000),
      });
      const d = await r.json();
      const EUR = Number(d?.rates?.EUR);
      const GBP = Number(d?.rates?.GBP);
      if (r.ok && EUR > 0.3 && EUR < 3 && GBP > 0.3 && GBP < 3) cache = { at: Date.now(), EUR, GBP };
    } catch {}
  }
  const { EUR, GBP } = cache ?? FALLBACK;
  return NextResponse.json({ EUR, GBP }, { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
}
