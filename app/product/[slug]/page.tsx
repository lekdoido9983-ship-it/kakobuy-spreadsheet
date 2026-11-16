import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getAllProducts, CATEGORY_ICONS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export async function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const icon = CATEGORY_ICONS[product.category] ?? "🛍️";
  const displayPrice = product.price ? `$${product.price.toFixed(2)}` : "Price TBD";

  const related = getAllProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6 flex-wrap" style={{ color: "var(--text-muted)" }}>
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-white transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="truncate max-w-xs" style={{ color: "var(--text)" }}>
          {product.name}
        </span>
      </div>

      {/* Product detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Image frame */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            aspectRatio: "1",
            background: "radial-gradient(ellipse at 50% 60%, rgba(43,30,55,0.6), rgba(27,19,39,0.95))",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Placeholder — replace with <img> when image URLs are available */}
          <span style={{ fontSize: "7rem", opacity: 0.75 }}>{icon}</span>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Link href={`/category/${product.category.toLowerCase()}`}>
              <span
                className="badge hover:opacity-80 transition-opacity"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}
              >
                {icon} {product.category}
              </span>
            </Link>
          </div>

          <h1 className="font-black text-2xl md:text-3xl mb-4 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            {product.name}
          </h1>

          <div className="text-4xl font-black price-tag mb-6">{displayPrice}</div>

          <div className="mt-auto space-y-3">
            <a
              href={product.kakobuyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full py-4 text-base font-black text-center block"
              style={{ borderRadius: "14px" }}
            >
              🛒 Buy on Kakobuy
            </a>
            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              Opens on Kakobuy. Prices may vary.
            </p>
          </div>

          <div className="mt-6 pt-6 space-y-2 text-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Category</span>
              <span className="font-semibold">{product.category}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Platform</span>
              <span className="font-semibold">Kakobuy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="font-black text-2xl mb-6" style={{ fontFamily: "var(--font-display)" }}>
            More {product.category}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
