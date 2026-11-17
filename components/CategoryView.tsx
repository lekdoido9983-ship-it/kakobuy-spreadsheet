import Link from "next/link";
import { getProductsByCategory } from "@/lib/products";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/categories";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";

export const CATEGORY_PAGE_SIZE = 48;

export function categoryPageCount(catName: string) {
  return Math.max(1, Math.ceil(getProductsByCategory(catName).length / CATEGORY_PAGE_SIZE));
}

export default function CategoryView({ catName, page }: { catName: string; page: number }) {
  const products = getProductsByCategory(catName);
  const totalPages = Math.max(1, Math.ceil(products.length / CATEGORY_PAGE_SIZE));
  const items = products.slice((page - 1) * CATEGORY_PAGE_SIZE, page * CATEGORY_PAGE_SIZE);
  const base = `/category/${catName.toLowerCase()}`;

  return (
    <div className="site-wrap mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-xs font-semibold mb-8" style={{ color: "var(--text-dim)" }}>
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-white transition-colors">
          Products
        </Link>
        <span>/</span>
        <span style={{ color: "var(--amber)" }}>{catName}</span>
      </div>

      <div className="mb-8">
        <p className="eyebrow mb-3">
          {products.length.toLocaleString()} finds{page > 1 ? ` · page ${page}` : ""}
        </p>
        <h1 className="section-title text-4xl md:text-6xl">
          <em>{catName}</em>
        </h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/category/${cat.toLowerCase()}`}
            className={`category-pill flex items-center gap-1.5 ${cat === catName ? "active" : ""}`}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            {cat}
          </Link>
        ))}
      </div>

      <ProductGrid products={items} />
      <Pagination page={page} totalPages={totalPages} hrefFor={(p) => (p > 1 ? `${base}/page/${p}` : base)} />
    </div>
  );
}
