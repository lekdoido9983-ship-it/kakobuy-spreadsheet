export interface Product {
  id: number;
  slug: string;
  category: string;
  name: string;
  price: number | null;
  kakobuyUrl: string;
  image?: string;
  popular?: boolean;
  qc?: string;
  qcN?: number;
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
  "Perfumes",
  "Watches",
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
  Perfumes: "🧴",
  Watches: "⌚",
  Popular: "🔥",
};

const QC_BASE = process.env.NEXT_PUBLIC_QC_BASE ?? "/q";

export function galleryImages(p: Pick<Product, "image" | "qc" | "qcN">) {
  const full: string[] = p.image ? [p.image] : [];
  const thumbs: string[] = p.image ? [p.image] : [];
  if (p.qc && p.qcN) {
    for (let i = 1; i <= p.qcN; i++) {
      full.push(`${QC_BASE}/${p.qc}/${i}.webp`);
      thumbs.push(`${QC_BASE}/${p.qc}/${i}-t.webp`);
    }
  }
  return { full, thumbs };
}
