import Link from "next/link";
import type { Product } from "@/lib/categories";

/** Pill button with a tight collage of product photos behind the label (dark overlay keeps the text readable). */
export default function CollageButton({ href, items, children, icon }: { href: string; items: Product[]; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Link href={href} className="collage-btn group">
      <span className="cb-bg" aria-hidden>
        {items.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.id} src={p.image} alt="" loading="eager" decoding="async" style={{ transform: `rotate(${[-8, 6, -4, 9, -6, 5, -9, 4][i % 8]}deg) scale(${1.25 + (i % 3) * 0.12})`, marginLeft: i ? -22 : 0 }} />
        ))}
      </span>
      <span className="cb-label">
        {icon}
        <span>{children}</span>
        <span aria-hidden className="cb-arrow">→</span>
      </span>
    </Link>
  );
}
