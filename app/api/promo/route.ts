import { isExpired, readStore } from "@/lib/store";

export async function GET() {
  const { coupons, notices } = readStore();
  const activeCoupons = coupons
    .filter((c) => c.active && c.code && !isExpired(c))
    .map(({ id, code, title, description, expiresAt }) => ({ id, code, title, description, expiresAt }));
  const activeNotices = notices
    .filter((n) => n.active)
    .map(({ id, title, message, link, createdAt }) => ({ id, title, message, link, createdAt }));
  return Response.json({ coupons: activeCoupons, notices: activeNotices }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" } });
}
