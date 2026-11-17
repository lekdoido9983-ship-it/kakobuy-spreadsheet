import Link from "next/link";
import type { Product } from "@/lib/categories";
import Rail from "@/components/home/Rail";

export interface CatTile {
  cat: string;
  count: number;
  items: Product[];
}

/** Layout slots for the overlapping photo collage inside each category card (x%, y%, width%, rotation). */
const SLOTS: [number, number, number, number][] = [
  [2, 2, 46, -5],
  [52, 0, 44, 4],
  [4, 25, 42, 3],
  [50, 24, 46, -3],
  [1, 48, 46, -4],
  [53, 49, 43, 5],
  [3, 71, 44, 3],
  [51, 72, 46, -4],
];

export default function FeaturedCategories({ tiles }: { tiles: CatTile[] }) {
  return (
    <section id="categories" className="px-4 py-14 site-wrap mx-auto scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between mb-8 gap-4">
        <h2 className="section-title fc-title text-4xl md:text-6xl">
          Featured <em>categories</em>
        </h2>
        <Link href="/products" className="fc-all">
          All categories <span aria-hidden>→</span>
        </Link>
      </div>

      <Rail className="fc-rail scrollbar-none">
        {tiles.map(({ cat, count, items }) => (
          <Link key={cat} href={`/category/${cat.toLowerCase()}`} className="fc-card group">
            <h3 className="fc-name">{cat}</h3>
            <div className="fc-collage">
              {items.slice(0, SLOTS.length).map((p, i) => {
                const [x, y, w, r] = SLOTS[i];
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.id}
                    src={p.image}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className="fc-photo"
                    style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, transform: `rotate(${r}deg)`, zIndex: i % 2 ? 2 : 1, animationDelay: `${(i % 4) * 0.35}s` }}
                  />
                );
              })}
            </div>
            <span className="fc-count">{count.toLocaleString()} products</span>
          </Link>
        ))}
      </Rail>
    </section>
  );
}
