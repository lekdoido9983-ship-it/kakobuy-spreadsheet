import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/categories";

export default function BestSellers({ items }: { items: Product[] }) {
  return (
    <section id="best-seller" className="px-4 py-14 max-w-7xl mx-auto scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between mb-8 gap-4">
        <div>
          <p className="eyebrow mb-3">Best seller</p>
          <h2 className="section-title text-4xl md:text-6xl">
            Most popular <em>of last month</em>
          </h2>
        </div>
        <Link href="/products" className="fc-all">
          All products <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="bs-rail scrollbar-none">
        {items.map((p, i) => (
          <div key={p.id} className="bs-item">
            <ProductCard product={p} rank={i + 1} tag={i < 5 ? "Best seller" : i < 8 ? "Trending" : undefined} />
          </div>
        ))}
      </div>
    </section>
  );
}
