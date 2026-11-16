import productsData from "@/data/products.json";
import type { Product } from "./categories";

export { CATEGORIES, CATEGORY_ICONS } from "./categories";
export type { Product } from "./categories";

export const products: Product[] = productsData as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return products;
  return products.filter((p) => p.name.toLowerCase().includes(q));
}

export function getRandomProducts(count: number, excludeIds: number[] = []): Product[] {
  const filtered = products.filter((p) => !excludeIds.includes(p.id));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getFeaturedProducts(count = 12): Product[] {
  const withImg = products.filter((p) => p.image && p.price && p.price > 0);
  const popular = withImg.filter((p) => p.popular);
  const rest = withImg.filter((p) => !p.popular);
  return [...popular, ...rest].slice(0, count);
}

export function getCategoryStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const p of products) {
    stats[p.category] = (stats[p.category] || 0) + 1;
  }
  return stats;
}
