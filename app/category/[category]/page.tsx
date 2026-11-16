import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductsByCategory, CATEGORIES, CATEGORY_ICONS } from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.toLowerCase() }));
}

export default async function CategoryPage({ params }: PageProps<"/category/[category]">) {
  const { category: categorySlug } = await params;
  const catName = CATEGORIES.find((c) => c.toLowerCase() === categorySlug.toLowerCase());
  if (!catName) notFound();

  const products = getProductsByCategory(catName);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
        <p className="eyebrow mb-3">{products.length.toLocaleString()} finds</p>
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

      <ProductGrid products={products} />
    </div>
  );
}
