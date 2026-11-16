import productsData from "@/data/products.json";

export interface Product {
  id: number;
  slug: string;
  category: string;
  name: string;
  price: number | null;
  kakobuyUrl: string;
  linkType: string;
}

export const CATEGORIES = [
  "Shoes",
  "Hoodies",
  "Tees",
  "Jackets",
  "Pants",
  "Tracksuits",
  "Accessories",
  "Bags",
  "Caps",
  "Beanies",
  "Belts",
  "Glasses",
  "Socks",
  "Boxers",
];

export const CATEGORY_ICONS: Record<string, string> = {
  Shoes: "👟",
  Hoodies: "🧥",
  Tees: "👕",
  Jackets: "🧤",
  Pants: "👖",
  Tracksuits: "🏃",
  Accessories: "⌚",
  Bags: "👜",
  Caps: "🧢",
  Beanies: "🎩",
  Belts: "👔",
  Glasses: "🕶️",
  Socks: "🧦",
  Boxers: "🩲",
};

export const AFFCODE = "8p34q";

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
  return products.filter((p) => p.price && p.price > 0).slice(0, count);
}

export function getCategoryStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const p of products) {
    stats[p.category] = (stats[p.category] || 0) + 1;
  }
  return stats;
}
