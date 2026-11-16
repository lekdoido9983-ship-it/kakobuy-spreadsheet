import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import Link from "next/link";
import { getProductBySlug, getAllProducts, CATEGORY_ICONS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import { galleryImages } from "@/lib/categories";

export async function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  const price = product.price ? ` for ${product.price}` : "";
  const title = product.name;
  const description = `${product.name}${price}. See photos and details, then view it on Kakobuy.`;
  const image = product.image ? `${SITE_URL}${product.image}` : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title, description, url: `/product/${product.slug}`, images: image ? [image] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const icon = CATEGORY_ICONS[product.category] ?? "🛍️";
  const displayPrice = product.price ? `$${product.price.toFixed(2).replace(/\.00$/, "")}` : "See price";

  const gallery = galleryImages(product);

  const related = getAllProducts()
    .filter((p) => p.category === product.category && p.id !== product.id && p.image)
    .slice(0, 10);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    category: product.category,
    image: gallery.full.length ? gallery.full.map((u) => `${SITE_URL}${u}`) : undefined,
    url: `${SITE_URL}/product/${product.slug}`,
    brand: { "@type": "Organization", name: SITE_NAME },
    offers: product.price
      ? { "@type": "Offer", price: product.price, priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${SITE_URL}/product/${product.slug}` }
      : undefined,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="flex items-center gap-2 text-xs font-semibold mb-8 flex-wrap" style={{ color: "var(--text-dim)" }}>
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-white transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="truncate max-w-xs" style={{ color: "var(--amber)" }}>
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
        <div
          className="rounded-3xl p-3"
          style={{ background: "linear-gradient(165deg, rgba(48,31,70,0.95), rgba(22,14,34,0.98))", border: "1px solid var(--line-soft)" }}
        >
          <ProductGallery
            name={product.name}
            full={gallery.full}
            thumbs={gallery.thumbs}
            padding={20}
            fallback={<span style={{ fontSize: "7rem", opacity: 0.8 }}>{icon}</span>}
          />
        </div>

        <div className="flex flex-col">
          <Link href={`/category/${product.category.toLowerCase()}`} className="mb-4 self-start">
            <span
              className="badge hover:opacity-80 transition-opacity"
              style={{ background: "rgba(255,180,84,0.12)", color: "var(--amber)", border: "1px solid var(--line)" }}
            >
              {product.category}
            </span>
          </Link>

          <h1 className="section-title text-3xl md:text-4xl mb-5" style={{ lineHeight: 1.15 }}>
            {product.name}
          </h1>

          <div className="price-tag text-5xl mb-8">{displayPrice}</div>

          <div
            className="rounded-2xl p-5 mb-5 text-sm leading-relaxed space-y-3"
            style={{ background: "rgba(10,6,16,0.55)", border: "1px solid var(--line-soft)", color: "var(--text-muted)" }}
          >
            <p>
              <strong style={{ color: "var(--text)" }}>Disclaimer:</strong> Kakobuy Spreadsheet is an independent directory.
              We do not sell, ship, or authenticate the products shown. Listing information may be inaccurate or outdated.
            </p>
            <p>
              <strong style={{ color: "var(--text)" }}>Affiliate disclosure:</strong> We may receive a referral commission
              if you create an account or order through our referral links.
            </p>
            <p>Prices are indicative. Check current price, availability, shipping costs and seller terms on Kakobuy.</p>
          </div>

          <div className="mt-auto">
            <a
              href={product.kakobuyUrl}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              className="w-full py-5 flex items-center justify-center gap-3 rounded-2xl font-extrabold transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(180deg, #fff3e4, #f3dcc7)", color: "#2a1405", fontSize: "0.95rem" }}
            >
              <span className="text-xl" style={{ color: "#e8394d" }}>
                ✦
              </span>
              View on Kakobuy ↗
            </a>
          </div>

          <div className="mt-8 pt-6 space-y-3 text-sm" style={{ borderTop: "1px solid var(--line-soft)" }}>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-dim)" }}>Category</span>
              <span className="font-bold">{product.category}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-dim)" }}>Platform</span>
              <span className="font-bold">Kakobuy</span>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <p className="eyebrow mb-3">A little further, a lot to find</p>
          <h2 className="section-title text-3xl md:text-4xl mb-8">
            More <em>{product.category}</em>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
