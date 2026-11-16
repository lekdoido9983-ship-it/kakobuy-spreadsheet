import { Product, CATEGORY_ICONS } from "@/lib/products";

const CATEGORY_GRADIENTS: Record<string, string> = {
  Shoes:       "radial-gradient(ellipse at 40% 70%, #1e3a8a 0%, #0f172a 70%)",
  Hoodies:     "radial-gradient(ellipse at 40% 70%, #3b1d6e 0%, #0f0a1f 70%)",
  Tees:        "radial-gradient(ellipse at 40% 70%, #7c1d6f 0%, #1a0820 70%)",
  Jackets:     "radial-gradient(ellipse at 40% 70%, #7c3600 0%, #1c0d00 70%)",
  Pants:       "radial-gradient(ellipse at 40% 70%, #0f4c4c 0%, #061515 70%)",
  Tracksuits:  "radial-gradient(ellipse at 40% 70%, #1a4731 0%, #061510 70%)",
  Accessories: "radial-gradient(ellipse at 40% 70%, #5c4000 0%, #1a1000 70%)",
  Bags:        "radial-gradient(ellipse at 40% 70%, #5c2800 0%, #1c0a00 70%)",
  Caps:        "radial-gradient(ellipse at 40% 70%, #1e1b4b 0%, #080714 70%)",
  Beanies:     "radial-gradient(ellipse at 40% 70%, #1a3a5c 0%, #060f1a 70%)",
  Belts:       "radial-gradient(ellipse at 40% 70%, #2d1b0e 0%, #0a0500 70%)",
  Glasses:     "radial-gradient(ellipse at 40% 70%, #0a4a5c 0%, #021218 70%)",
  Socks:       "radial-gradient(ellipse at 40% 70%, #3b1d5e 0%, #100820 70%)",
  Boxers:      "radial-gradient(ellipse at 40% 70%, #1e3a6e 0%, #060e20 70%)",
};

const CATEGORY_ACCENT: Record<string, string> = {
  Shoes:       "rgba(59, 130, 246, 0.3)",
  Hoodies:     "rgba(139, 92, 246, 0.3)",
  Tees:        "rgba(236, 72, 153, 0.3)",
  Jackets:     "rgba(249, 115, 22, 0.3)",
  Pants:       "rgba(20, 184, 166, 0.3)",
  Tracksuits:  "rgba(34, 197, 94, 0.3)",
  Accessories: "rgba(234, 179, 8, 0.3)",
  Bags:        "rgba(249, 115, 22, 0.25)",
  Caps:        "rgba(99, 102, 241, 0.3)",
  Beanies:     "rgba(14, 165, 233, 0.3)",
  Belts:       "rgba(161, 123, 86, 0.3)",
  Glasses:     "rgba(6, 182, 212, 0.3)",
  Socks:       "rgba(167, 139, 250, 0.3)",
  Boxers:      "rgba(59, 130, 246, 0.25)",
};

interface Props {
  product: Product;
  imageUrl?: string;
}

export default function ProductCard({ product, imageUrl }: Props) {
  const icon = CATEGORY_ICONS[product.category] ?? "🛍️";
  const displayPrice = product.price ? `$${product.price.toFixed(2)}` : "Price TBD";
  const gradient = CATEGORY_GRADIENTS[product.category] ?? "radial-gradient(ellipse at 40% 70%, #2b1e37 0%, #0f0a1a 70%)";
  const accent = CATEGORY_ACCENT[product.category] ?? "rgba(139, 92, 246, 0.3)";

  return (
    <a
      href={product.kakobuyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="product-card block cursor-pointer"
    >
      <div className="m-3 mb-0">
        <div
          className="product-image-frame"
          style={{ background: gradient, boxShadow: `inset 0 0 40px ${accent}` }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: "5rem", lineHeight: 1, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))" }}>
              {icon}
            </span>
          )}

          <div className="absolute top-2 left-2">
            <span
              className="badge"
              style={{
                background: accent,
                color: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {product.category}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 pt-2.5">
        <h3
          className="text-sm font-semibold leading-snug mb-1.5"
          style={{
            color: "rgba(255,255,255,0.9)",
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
              border: "1px solid rgba(244,179,53,0.2)",
            }}
          >
            Buy ↗
          </span>
        </div>
      </div>
    </a>
  );
}
