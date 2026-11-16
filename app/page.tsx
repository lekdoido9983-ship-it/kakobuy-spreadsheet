import Link from "next/link";
import { getFeaturedProducts, getCategoryStats, CATEGORIES, CATEGORY_ICONS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const featured = getFeaturedProducts(20);
  const stats = getCategoryStats();
  const totalProducts = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 text-center">
        {/* Background glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%), " +
              "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(244,179,53,0.08) 0%, transparent 60%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold mb-6"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "var(--text-muted)" }}>
            <span>🔥</span>
            <span>{totalProducts.toLocaleString()} products available</span>
          </div>

          <h1
            className="font-black text-5xl md:text-7xl leading-[1.08] mb-5"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
          >
            Find Your Perfect{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #c084fc 0%, #f4b335 60%, #f97316 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Kakobuy
            </span>
            <br />Products
          </h1>

          <p
            className="text-lg md:text-xl mb-8 max-w-xl mx-auto leading-relaxed text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Browse 6,000+ shoes, clothes, bags and accessories. All products link directly to Kakobuy with the best prices.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="btn-primary text-base px-8 py-4 font-black"
              style={{ borderRadius: "14px", fontSize: "1rem" }}
            >
              🛍️ Browse All Products
            </Link>
            <Link
              href="#categories"
              className="btn-secondary text-base px-8 py-4 font-bold"
              style={{ borderRadius: "14px" }}
            >
              View Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="px-4 py-6">
        <div
          className="max-w-3xl mx-auto grid grid-cols-4 gap-4 rounded-2xl py-5 px-6"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {[
            { label: "Products", value: totalProducts.toLocaleString(), icon: "📦" },
            { label: "Categories", value: "14", icon: "🗂️" },
            { label: "Platform", value: "Kakobuy", icon: "🛒" },
            { label: "Commission", value: "18%", icon: "💰" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl mb-0.5">{stat.icon}</div>
              <div
                className="font-black text-lg"
                style={{
                  fontFamily: "var(--font-display)",
                  background: "linear-gradient(135deg, #f3f2ff, #c084fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="px-4 py-10 max-w-7xl mx-auto">
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
      <section className="px-4 py-10 max-w-7xl mx-auto">
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

        <div className="text-center mt-10">
          <Link href="/products" className="btn-primary px-10 py-4 text-base font-black" style={{ borderRadius: "14px" }}>
            Browse All {totalProducts.toLocaleString()} Products →
          </Link>
        </div>
      </section>
    </div>
  );
}
