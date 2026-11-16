import Link from "next/link";
import { getFeaturedProducts, getAllProducts, getCategoryStats, CATEGORIES } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";

export default function HomePage() {
  const featured = getFeaturedProducts(20);
  const stats = getCategoryStats();
  const all = getAllProducts();
  const totalProducts = all.length;
  const showcase = featured.slice(0, 3);

  const categoryTiles = CATEGORIES.map((cat) => ({
    cat,
    count: stats[cat] || 0,
    image: all.find((p) => p.category === cat && p.image)?.image,
  })).filter((c) => c.count > 0);

  return (
    <div>
      {/* Hero */}
      <section className="relative px-4 pt-14 pb-16 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div>
            <p className="eyebrow mb-6">Kakobuy spreadsheet / {totalProducts.toLocaleString()} finds</p>

            <h1 className="hero-title text-5xl sm:text-6xl xl:text-7xl mb-6">
              Good finds.
              <br />
              <span className="hl">Great prices.</span>
            </h1>

            <p className="text-base md:text-lg mb-8 max-w-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Discover the finds, compare the prices and grab them straight from Kakobuy. Every product links directly to
              the seller.
            </p>

            <div className="max-w-xl mb-6">
              <SearchBar size="lg" placeholder="Find your next obsession…" />
            </div>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/products" className="btn-primary px-7 py-4">
                Explore the finds →
              </Link>
              <Link href="#categories" className="btn-secondary px-7 py-4">
                Browse categories
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-10 gap-y-4">
              {[
                ["Products", totalProducts.toLocaleString()],
                ["Categories", String(categoryTiles.length)],
                ["Platform", "Kakobuy"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="font-black text-2xl" style={{ color: "var(--amber)" }}>
                    {value}
                  </div>
                  <div className="eyebrow !text-[0.6rem] !gap-0 before:hidden">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Showcase */}
          <div className="relative hidden lg:block h-[520px]">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(255,170,70,0.35), rgba(255,150,60,0.08) 55%, transparent 70%)",
                filter: "blur(10px)",
              }}
            />
            {showcase.map((p, i) => {
              const pos = [
                "top-0 right-16 w-[270px] rotate-[5deg] z-30",
                "top-[190px] left-0 w-[240px] -rotate-[6deg] z-10",
                "bottom-0 right-0 w-[240px] rotate-[3deg] z-20",
              ][i];
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className={`absolute ${pos} rounded-3xl p-3 transition-transform hover:scale-105 hover:z-10`}
                  style={{
                    background: "linear-gradient(165deg, rgba(58,38,84,0.96), rgba(26,16,40,0.98))",
                    border: "1px solid rgba(255,180,84,0.3)",
                    boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
                  }}
                >
                  <div className="product-image-frame" style={{ aspectRatio: "4 / 3" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.image && <img src={p.image} alt={p.name} />}
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-3 px-1">
                    <span className="text-xs font-bold truncate" style={{ color: "var(--text)" }}>
                      {p.name}
                    </span>
                    <span className="price-tag text-sm">${p.price?.toFixed(0)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="px-4 py-12 max-w-7xl mx-auto scroll-mt-24">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="eyebrow mb-3">Enter the kingdom</p>
            <h2 className="section-title text-4xl md:text-5xl">
              Pick your <em>style.</em>
            </h2>
          </div>
          <Link href="/products" className="text-xs font-bold tracking-wider uppercase whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
            All products ↗
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoryTiles.map(({ cat, count, image }) => (
            <Link key={cat} href={`/category/${cat.toLowerCase()}`} className="category-card group block p-4">
              <div
                className="h-36 flex items-center justify-center mb-3 rounded-2xl"
                style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.09), transparent 65%)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {image && <img src={image} alt={cat} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110" />}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[0.6rem] font-bold tracking-[0.18em] uppercase" style={{ color: "var(--text-dim)" }}>
                    {count.toLocaleString()} finds
                  </div>
                  <div className="font-black text-lg" style={{ color: "var(--text)" }}>
                    {cat}
                  </div>
                </div>
                <span className="text-xl transition-transform group-hover:translate-x-1" style={{ color: "var(--amber)" }}>
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="px-4 py-12 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="eyebrow mb-3">The finds directory</p>
            <h2 className="section-title text-4xl md:text-5xl">
              Trending <em>right now.</em>
            </h2>
          </div>
          <Link href="/products" className="text-xs font-bold tracking-wider uppercase whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
            See all ↗
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/products" className="btn-primary px-10 py-4">
            Browse all {totalProducts.toLocaleString()} products →
          </Link>
        </div>
      </section>
    </div>
  );
}
