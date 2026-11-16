"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Product, CATEGORY_ICONS, galleryImages } from "@/lib/categories";
import ProductGallery from "@/components/ProductGallery";

interface Props {
  product: Product;
}

function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const icon = CATEGORY_ICONS[product.category] ?? "🛍️";
  const displayPrice = product.price ? `$${product.price.toFixed(2).replace(/\.00$/, "")}` : "See price";
  const gallery = galleryImages(product);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(8,4,14,0.78)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl p-5 flex flex-col overflow-hidden"
        style={{
          height: "min(94dvh, 760px)",
          background: "linear-gradient(165deg, rgba(58,38,84,0.98), rgba(24,15,38,0.99))",
          border: "1px solid var(--line)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 shrink-0">
          <p className="eyebrow">A closer look</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-colors hover:bg-white/10"
            style={{ border: "1px solid var(--line)", color: "var(--text)" }}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0">
          <ProductGallery
            name={product.name}
            full={gallery.full}
            thumbs={gallery.thumbs}
            fill
            showNote={false}
            fallback={<span style={{ fontSize: "6rem", opacity: 0.8 }}>{icon}</span>}
          />
        </div>

        <div className="shrink-0">
          <div className="flex items-center justify-between gap-3 mt-3">
            <span
              className="badge"
              style={{ background: "rgba(255,180,84,0.12)", color: "var(--amber)", border: "1px solid var(--line)" }}
            >
              {product.category}
            </span>
            <div className="price-tag text-2xl">{displayPrice}</div>
          </div>
          <h2
            className="font-black text-lg mt-2 leading-snug"
            style={{
              color: "var(--text)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.name}
          </h2>
          <p className="text-[0.65rem] mt-1 mb-3" style={{ color: "var(--text-dim)" }}>
            Third-party photos. Prices are indicative.
          </p>
          <Link href={`/product/${product.slug}`} className="btn-primary w-full py-3.5" onClick={onClose}>
            Full details →
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ProductCard({ product }: Props) {
  const [open, setOpen] = useState(false);
  const icon = CATEGORY_ICONS[product.category] ?? "🛍️";
  const displayPrice = product.price ? `$${product.price.toFixed(2).replace(/\.00$/, "")}` : "See price";

  return (
    <>
      <Link
        href={`/product/${product.slug}`}
        className="product-card cursor-pointer"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          setOpen(true);
        }}
      >
        <div className="p-2.5 pb-0">
          <div className="product-image-frame">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
            ) : (
              <span style={{ fontSize: "4.5rem", opacity: 0.8 }}>{icon}</span>
            )}
            <span
              className="badge absolute top-2.5 left-2.5"
              style={{
                background: "rgba(16, 11, 25, 0.7)",
                color: "var(--amber-soft)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,180,84,0.25)",
              }}
            >
              {product.category}
            </span>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-3.5 pt-3">
          <h3
            className="text-[0.82rem] font-bold leading-snug mb-2"
            style={{
              color: "var(--text)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.3rem",
            }}
          >
            {product.name}
          </h3>

          <div className="price-tag text-xl mb-3 mt-auto">{displayPrice}</div>

          <span className="buy-btn">Quick view ↗</span>
        </div>
      </Link>

      {open && <QuickView product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
