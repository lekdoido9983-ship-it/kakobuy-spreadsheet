"use client";

import { useState, useMemo, Suspense } from "react";
import { getAllProducts, CATEGORIES, CATEGORY_ICONS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";

const PAGE_SIZE = 48;
const allProducts = getAllProducts();

function ProductsContent() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = allProducts;
    if (category) {
      result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [query, category]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (q: string) => {
    setQuery(q);
    setPage(1);
  };

  const handleCategory = (cat: string) => {
    setCategory(cat === category ? "" : cat);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-black text-3xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
          All Products
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          {filtered.length.toLocaleString()} products
          {category ? ` in ${category}` : ""}
          {query ? ` matching "${query}"` : ""}
        </p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <SearchBar onSearch={handleSearch} placeholder="Search all 6,000+ products…" size="lg" />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          onClick={() => handleCategory("")}
          className={`category-pill ${!category ? "active" : ""}`}
        >
          All ({allProducts.length.toLocaleString()})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`category-pill flex items-center gap-1.5 ${category.toLowerCase() === cat.toLowerCase() ? "active" : ""}`}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            {cat}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-24" style={{ color: "var(--text-muted)" }}>
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</p>
          <p className="font-semibold text-lg">No products found</p>
          <p className="text-sm mt-1">Try a different search term or category</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === 1}
                className="btn-secondary px-5 py-2.5 text-sm disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="px-4 text-sm" style={{ color: "var(--text-muted)" }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === totalPages}
                className="btn-secondary px-5 py-2.5 text-sm disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8" style={{ color: "var(--text-muted)" }}>Loading products…</div>}>
      <ProductsContent />
    </Suspense>
  );
}
