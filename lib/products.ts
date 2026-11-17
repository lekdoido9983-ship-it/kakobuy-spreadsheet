import productsData from "@/data/products.json";
import type { Product } from "./categories";
import { CATEGORIES } from "./categories";
import { readStore, storeStamp } from "./store";
import { getClickCounts } from "./clicks";

export { CATEGORIES, CATEGORY_ICONS } from "./categories";
export type { Product } from "./categories";

const base: Product[] = productsData as Product[];

let merged: { stamp: number; list: Product[] } | null = null;

/** Base catalog + admin edits (name, price, category, popular, hidden, link). */
function all(): Product[] {
  const stamp = storeStamp();
  if (merged && merged.stamp === stamp) return merged.list;
  const { overrides } = readStore();
  const keys = Object.keys(overrides);
  let list = base;
  if (keys.length) {
    list = [];
    for (const p of base) {
      const o = overrides[String(p.id)];
      if (!o) {
        list.push(p);
        continue;
      }
      if (o.hidden) continue;
      const category = o.category && CATEGORIES.includes(o.category) ? o.category : p.category;
      list.push({
        ...p,
        name: o.name ?? p.name,
        price: typeof o.price === "number" ? o.price : p.price,
        category,
        popular: o.popular ?? p.popular,
        kakobuyUrl: o.kakobuyUrl ?? p.kakobuyUrl,
      });
    }
  }
  merged = { stamp, list };
  return list;
}

/** Every product including hidden ones, with edits applied (used by the admin panel). */
export function getAdminProducts(): (Product & { hidden?: boolean; edited?: boolean })[] {
  const { overrides } = readStore();
  return base.map((p) => {
    const o = overrides[String(p.id)];
    if (!o) return p;
    return {
      ...p,
      name: o.name ?? p.name,
      price: typeof o.price === "number" ? o.price : p.price,
      category: o.category && CATEGORIES.includes(o.category) ? o.category : p.category,
      popular: o.popular ?? p.popular,
      kakobuyUrl: o.kakobuyUrl ?? p.kakobuyUrl,
      hidden: !!o.hidden,
      edited: true,
    };
  });
}

export function getAllProducts(): Product[] {
  return all();
}

export function getProductsByCategory(category: string): Product[] {
  return all().filter((p) => p.category.toLowerCase() === category.toLowerCase());
}

export function getProductBySlug(slug: string): Product | undefined {
  return all().find((p) => p.slug === slug);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return all();
  return all().filter((p) => p.name.toLowerCase().includes(q));
}

export function getRandomProducts(count: number, excludeIds: number[] = []): Product[] {
  const filtered = all().filter((p) => !excludeIds.includes(p.id));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getFeaturedProducts(count = 12): Product[] {
  const withImg = all().filter((p) => p.image && p.price && p.price > 0);
  const popular = withImg.filter((p) => p.popular);
  const rest = withImg.filter((p) => !p.popular);
  return [...popular, ...rest].slice(0, count);
}

export function getCategoryStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const p of all()) {
    stats[p.category] = (stats[p.category] || 0) + 1;
  }
  return stats;
}

/** Most popular finds: flagged popular first, items with the most QC photos on top. */
export function getBestSellers(count = 10): Product[] {
  const withImg = all().filter((p) => p.image && p.price && p.price > 0);
  const score = (p: Product) => (p.popular ? 1000 : 0) + (p.qcN || 0);
  return [...withImg].sort((a, b) => score(b) - score(a) || a.id - b.id).slice(0, count);
}

/** Photos for a category collage (popular + QC items first). */
export function getCategoryCollage(category: string, count = 9): Product[] {
  const score = (p: Product) => (p.popular ? 1000 : 0) + (p.qcN || 0);
  return all()
    .filter((p) => p.category === category && p.image)
    .sort((a, b) => score(b) - score(a) || a.id - b.id)
    .slice(0, count);
}

/** Most clicked products first (exact click ranking); ties / zero clicks fall back to the curated order. */
export function getBestSellersByClicks(count = 50): Product[] {
  const clicks = getClickCounts();
  const score = (p: Product) => (p.popular ? 1000 : 0) + (p.qcN || 0);
  return all()
    .filter((p) => p.image && p.price && p.price > 0)
    .sort((a, b) => (clicks[String(b.id)] || 0) - (clicks[String(a.id)] || 0) || score(b) - score(a) || a.id - b.id)
    .slice(0, count);
}
