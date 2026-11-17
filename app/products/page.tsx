import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts, CATEGORIES, CATEGORY_ICONS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import { searchCatalog } from "@/lib/search";

const PAGE_SIZE = 48;

export const metadata: Metadata = {
  title: "All products",
  description: "Search and filter 8,000+ Kakobuy finds by category, with photos and prices.",
  alternates: { canonical: "/products" },
};

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function href(params: { q?: string; category?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `/products?${qs}` : "/products";
}

async function ProductsContent({ searchParams }: PageProps<"/products">) {
  const sp = await searchParams;
  const q = (first(sp.q) ?? "").trim().slice(0, 80);
  const categoryParam = first(sp.category) ?? "";
  const category = CATEGORIES.find((c) => c.toLowerCase() === categoryParam.toLowerCase()) ?? "";
  const all = getAllProducts();

  const { items: filtered, mode } = searchCatalog(all, q, category);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(first(sp.page) ?? "1", 10) || 1), totalPages);
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="site-wrap mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="eyebrow mb-3">The finds directory</p>
        <h1 className="section-title text-4xl md:text-5xl mb-3">
          Find your <em>next favorite.</em>
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {mode === "popular"
            ? "Popular finds"
            : `${filtered.length.toLocaleString()} ${mode === "similar" ? "similar finds" : "finds"}`}
          {category ? ` in ${category}` : ""}
          {q && mode === "exact" ? ` matching "${q}"` : ""}
        </p>
      </div>

      {(mode === "similar" || mode === "popular") && (
        <div
          className="mb-6 rounded-2xl px-5 py-4 text-sm"
          role="status"
          style={{ background: "rgba(255,180,84,0.08)", border: "1px solid var(--line)", color: "var(--text-muted)" }}
        >
          <p className="font-bold" style={{ color: "var(--text)" }}>
            We couldn&apos;t find an exact match for &ldquo;{q}&rdquo;.
          </p>
          <p className="mt-0.5">
            {mode === "similar"
              ? "Here are similar finds you might like instead."
              : "Here are some of our most popular finds instead — try another word or pick a category."}
          </p>
        </div>
      )}

      <div className="mb-5">
        <SearchBar key={`${q}|${category}`} defaultValue={q} category={category} size="lg" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <Link href={href({ q })} className={`category-pill ${!category ? "active" : ""}`}>
          All ({all.length.toLocaleString()})
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={href({ q, category: cat })}
            className={`category-pill flex items-center gap-1.5 ${category === cat ? "active" : ""}`}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            {cat}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24" style={{ color: "var(--text-muted)" }}>
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</p>
          <p className="font-semibold text-lg">No finds match your search</p>
          <p className="text-sm mt-1">Try a different word or category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} hrefFor={(p) => href({ q, category, page: p })} />
        </>
      )}
    </div>
  );
}

export default function ProductsPage(props: PageProps<"/products">) {
  return (
    <Suspense fallback={<div className="site-wrap mx-auto px-4 py-8 min-h-[70vh]" />}>
      <ProductsContent {...props} />
    </Suspense>
  );
}
