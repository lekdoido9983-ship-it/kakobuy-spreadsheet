import Link from "next/link";
import { getAllProducts, getCategoryStats, getBestSellers, getCategoryCollage, CATEGORIES } from "@/lib/products";
import SearchBar from "@/components/SearchBar";
import HeroMarquee from "@/components/home/HeroMarquee";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import BestSellers from "@/components/home/BestSellers";
import AgentBanner from "@/components/home/AgentBanner";
import Faq from "@/components/home/Faq";

export default function HomePage() {
  const stats = getCategoryStats();
  const all = getAllProducts();
  const totalProducts = all.length;
  const marquee = getBestSellers(24);
  const bestSellers = getBestSellers(10);

  const categoryTiles = CATEGORIES.map((cat) => ({
    cat,
    count: stats[cat] || 0,
    items: getCategoryCollage(cat, 8),
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      {/* Hero */}
      <section className="relative px-4 pt-14 pb-16 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div>
            <p className="eyebrow mb-6">RepsTitan / {totalProducts.toLocaleString()} finds</p>

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
              <SearchBar size="lg" placeholder="Search for products, brands, or categories…" />
            </div>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/products" className="btn-primary px-7 py-4">
                Browse {totalProducts.toLocaleString()} products →
              </Link>
              <Link href="#best-seller" className="btn-secondary px-7 py-4">
                ★ Best sellers
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

          <div className="relative hidden lg:block">
            <HeroMarquee items={marquee} />
          </div>
        </div>
      </section>

      <FeaturedCategories tiles={categoryTiles} />

      <BestSellers items={bestSellers} />

      <AgentBanner />

      <Faq />
    </div>
  );
}
