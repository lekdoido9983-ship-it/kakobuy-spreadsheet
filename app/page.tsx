import Link from "next/link";
import { getFeaturedProducts, getCategoryStats, CATEGORIES, CATEGORY_ICONS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const featured = getFeaturedProducts(20);
  const stats = getCategoryStats();
  const totalProducts = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="star-bg min-h-screen">
      {/* Hero */}
      <section className="px-4 pt-16 pb-12 text-center max-w-4xl mx-auto">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold mb-6"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
        >
          <span>🔥</span>
          <span>{totalProducts.toLocaleString()} products available</span>
        </div>

        <h1
          className="font-black text-4xl md:text-6xl leading-tight mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Find Your Perfect{" "}
          <span className="gradient-text">Kakobuy</span>{" "}
          Products
        </h1>

        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
          Browse thousands of shoes, clothes, bags and accessories. All products link directly to Kakobuy.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products" className="btn-primary text-base px-8 py-3.5">
            Browse All Products
          </Link>
          <Link href="#categories" className="btn-secondary text-base px-8 py-3.5">
            View Categories
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="px-4 py-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Categories
          </h2>
          <Link href="/products" className="text-sm font-semibold hover:text-white transition-colors" style={{ color: "var(--text-muted)" }}>
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => (
            <Link key={cat} href={`/category/${cat.toLowerCase()}`} className="category-card p-4 text-center group block">
              <div className="text-3xl mb-2 transition-transform group-hover:scale-110">{CATEGORY_ICONS[cat]}</div>
              <div className="font-bold text-sm">{cat}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {(stats[cat] || 0).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-4 py-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Featured Products
          </h2>
          <Link href="/products" className="text-sm font-semibold hover:text-white transition-colors" style={{ color: "var(--text-muted)" }}>
            See all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/products" className="btn-primary px-10 py-3.5 text-base">
            Browse All {totalProducts.toLocaleString()} Products
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-4 py-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Total Products", value: totalProducts.toLocaleString(), icon: "📦" },
            { label: "Categories", value: CATEGORIES.length.toString(), icon: "🗂️" },
            { label: "Platform", value: "Kakobuy", icon: "🛒" },
            { label: "Free to Browse", value: "100%", icon: "✅" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-black text-2xl gradient-text" style={{ fontFamily: "var(--font-display)" }}>
                {stat.value}
              </div>
              <div className="text-sm font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
