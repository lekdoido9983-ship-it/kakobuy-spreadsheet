import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { guard } from "@/lib/adminAuth";
import { CATEGORIES } from "@/lib/categories";
import { readStore, writeStore, type Override } from "@/lib/store";
import productsData from "@/data/products.json";

const AFF = "affcode=8p34q";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = guard(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  if (!(productsData as { id: number }[]).some((p) => String(p.id) === id)) return Response.json({ error: "Unknown product." }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const store = readStore();
  const overrides = { ...store.overrides };

  if (body.reset === true) {
    delete overrides[id];
  } else {
    const o: Override = { ...(overrides[id] || {}) };
    if ("name" in body) {
      const v = typeof body.name === "string" ? body.name.trim().slice(0, 160) : "";
      if (!v) return Response.json({ error: "Name cannot be empty." }, { status: 400 });
      o.name = v;
    }
    if ("price" in body) {
      const v = Number(body.price);
      if (!Number.isFinite(v) || v < 0 || v > 100000) return Response.json({ error: "Invalid price." }, { status: 400 });
      o.price = Math.round(v * 100) / 100;
    }
    if ("category" in body) {
      if (typeof body.category !== "string" || !CATEGORIES.includes(body.category)) return Response.json({ error: "Invalid category." }, { status: 400 });
      o.category = body.category;
    }
    if ("popular" in body) o.popular = body.popular === true;
    if ("hidden" in body) o.hidden = body.hidden === true;
    if ("kakobuyUrl" in body) {
      const v = typeof body.kakobuyUrl === "string" ? body.kakobuyUrl.trim() : "";
      if (!v.startsWith("https://www.kakobuy.com/item/details?url=") || !v.includes(AFF)) {
        return Response.json({ error: `Link must be a kakobuy.com item link that contains ${AFF}.` }, { status: 400 });
      }
      o.kakobuyUrl = v;
    }
    overrides[id] = o;
  }

  try {
    writeStore({ ...store, overrides });
  } catch {
    return Response.json({ error: "Could not save: the server storage is read-only (admin edits work on the Fly.io deploy)." }, { status: 500 });
  }
  revalidatePath("/", "layout");
  return Response.json({ ok: true });
}
