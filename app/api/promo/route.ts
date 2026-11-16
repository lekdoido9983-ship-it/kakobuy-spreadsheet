import { connection } from "next/server";
import { isExpired, readStore } from "@/lib/store";

export async function GET() {
  // read the store per request (not at build time) so admin edits show up
  await connection();
  const { coupons, notices, settings } = readStore();
  const activeCoupons = coupons
    .filter((c) => c.active && c.code && !isExpired(c))
    .map(({ id, code, title, description, expiresAt }) => ({ id, code, title, description, expiresAt }));
  const activeNotices = notices
    .filter((n) => n.active)
    .map(({ id, title, message, link, createdAt }) => ({ id, title, message, link, createdAt }));
  const { community, welcome } = settings;
  return Response.json(
    { coupons: activeCoupons, notices: activeNotices, community, welcome: welcome.enabled ? welcome : null },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" } }
  );
}
