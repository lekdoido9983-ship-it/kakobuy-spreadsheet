import Link from "next/link";
import { Product, CATEGORY_ICONS } from "@/lib/products";

interface Props {
  product: Product;
  imageUrl?: string;
}

export default function ProductCard({ product, imageUrl }: Props) {
  const icon = CATEGORY_ICONS[product.category] ?? "🛍️";
  const displayPrice = product.price ? `$${product.price.toFixed(2)}` : "Price TBD";

  return (
    <a
      href={product.kakobuyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="product-card block cursor-pointer"
    >
      {/* Image frame — PNG transparent bg blends with the dark gradient below */}
      <div className="m-3 mb-0">
        <div className="product-image-frame">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            /* Placeholder until real PNG images are added */
            <span style={{ fontSize: "3.5rem", opacity: 0.75 }}>{icon}</span>
          )}

          {/* Category badge top-left */}
          <div className="absolute top-2 left-2">
            <span className="badge" style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }}>
              {product.category}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 pt-2.5">
        <h3
          className="text-sm font-semibold leading-snug text-white/90 mb-1.5"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.5rem",
          }}
        >
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <span className="price-tag text-base">{displayPrice}</span>
          <span
            className="text-xs font-bold whitespace-nowrap"
            style={{
              background: "rgba(244,179,53,0.15)",
              color: "#f4b335",
              padding: "3px 8px",
              borderRadius: "999px",
            }}
          >
            Buy ↗
          </span>
        </div>
      </div>
    </a>
  );
}
