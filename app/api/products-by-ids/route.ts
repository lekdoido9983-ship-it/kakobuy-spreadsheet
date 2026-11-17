import { NextRequest } from "next/server";
import { connection } from "next/server";
import { getAllProducts } from "@/lib/products";

export async function GET(req: NextRequest) {
  await connection();
  const raw = req.nextUrl.searchParams.get("ids") || "";
  const ids = raw
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 200);
  const set = new Set(ids);
  const byId = new Map(getAllProducts().filter((p) => set.has(p.id)).map((p) => [p.id, p]));
  const items = ids.map((id) => byId.get(id)).filter(Boolean);
  return Response.json({ items }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" } });
}
