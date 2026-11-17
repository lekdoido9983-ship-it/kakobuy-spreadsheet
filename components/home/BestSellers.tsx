import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Rail from "@/components/home/Rail";
import type { Product } from "@/lib/categories";
import { getBestSellers, getBestSellersByClicks } from "@/lib/products";

function View({ items }: { items: Product[] }) {
  return (
    <section id="best-seller" className="px-4 py-14 site-wrap scroll-mt-24">
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

      <Rail className="bs-rail scrollbar-none">
        {items.map((p, i) => (
          <div key={p.id} className="bs-item">
            <ProductCard product={p} rank={i + 1} tag={i < 10 ? "Best seller" : i < 20 ? "Trending" : undefined} />
          </div>
        ))}
      </Rail>
    </section>
  );
}

/** Ranked by real clicks, read per request. */
async function Live() {
  await connection();
  return <View items={getBestSellersByClicks(50)} />;
}

export default function BestSellers() {
  return (
    <Suspense fallback={<View items={getBestSellers(50)} />}>
      <Live />
    </Suspense>
  );
}
