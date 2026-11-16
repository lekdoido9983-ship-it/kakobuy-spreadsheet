import { NextRequest } from "next/server";
import { guard } from "@/lib/adminAuth";
import { getAdminProducts } from "@/lib/products";

const PER = 30;

export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").toLowerCase().trim();
  const category = url.searchParams.get("category") || "";
  const only = url.searchParams.get("only") || ""; // edited | hidden | qc | noqc
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);

  let list = getAdminProducts();
  if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || String(p.id) === q);
  if (category) list = list.filter((p) => p.category === category);
  if (only === "edited") list = list.filter((p) => p.edited);
  if (only === "hidden") list = list.filter((p) => p.hidden);
  if (only === "qc") list = list.filter((p) => p.qc);
  if (only === "noqc") list = list.filter((p) => !p.qc);

  const total = list.length;
  const items = list.slice((page - 1) * PER, page * PER).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    category: p.category,
    image: p.image,
    popular: !!p.popular,
    hidden: !!p.hidden,
    edited: !!p.edited,
    qcN: p.qcN ?? 0,
    kakobuyUrl: p.kakobuyUrl,
  }));
  return Response.json({ items, total, page, pages: Math.max(1, Math.ceil(total / PER)) }, { headers: { "Cache-Control": "no-store" } });
}
