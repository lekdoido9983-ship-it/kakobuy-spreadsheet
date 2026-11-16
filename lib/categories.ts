export interface Product {
  id: number;
  slug: string;
  category: string;
  name: string;
  price: number | null;
  kakobuyUrl: string;
  image?: string;
  popular?: boolean;
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
