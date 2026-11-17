import Link from "next/link";
import Price from "@/components/Price";
import type { Product } from "@/lib/categories";

function Col({ items, dir }: { items: Product[]; dir: "up" | "down" }) {
  const list = [...items, ...items];
  return (
    <div className="mq-col">
      <div className={`mq-track mq-${dir}`}>
        {list.map((p, i) => (
          <Link key={`${p.id}-${i}`} href={`/product/${p.slug}`} className="mq-card" tabIndex={i >= items.length ? -1 : 0} aria-hidden={i >= items.length}>
            <div className="mq-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={i >= items.length ? "" : p.name} loading="eager" decoding="async" />
            </div>
            <div className="mq-name">{p.name}</div>
            <div className="price-tag mq-price">
              <Price usd={p.price} />
            </div>
            <span className="mq-qc">{p.qcN ? `Quality Check · ${p.qcN} QC's` : "View details"}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Tilted, endlessly moving wall of products (columns drift in opposite directions). */
export default function HeroMarquee({ items }: { items: Product[] }) {
  const cols = [0, 1, 2].map((c) => items.filter((_, i) => i % 3 === c));
  return (
    <div className="mq-wrap" aria-label="Featured finds">
      <div className="mq-tilt">
        <Col items={cols[0]} dir="up" />
        <Col items={cols[1]} dir="down" />
        <Col items={cols[2]} dir="up" />
      </div>
    </div>
  );
}
