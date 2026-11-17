"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/categories";
import { addAllToWishlist, clearWishlist, useWishlist } from "@/lib/wishlist";

function parseIds(raw: string | null): number[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 200);
}

export default function WishlistView() {
  const params = useSearchParams();
  const shared = useMemo(() => parseIds(params.get("ids")), [params]);
  const mine = useWishlist();
  const isShared = shared.length > 0;
  const ids = isShared ? shared : mine;
  const key = ids.join(",");

  const [items, setItems] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!key) return;
    let dead = false;
    fetch(`/api/products-by-ids?ids=${key}`)
      .then((r) => r.json())
      .then((d) => {
        if (dead) return;
        setItems(d.items || []);
        setLoaded(true);
      })
      .catch(() => !dead && setLoaded(true));
    return () => {
      dead = true;
    };
  }, [key]);

  // keep the on-screen order = wishlist order, drop items removed meanwhile
  const shown = ids.map((id) => items.find((p) => p.id === id)).filter(Boolean) as Product[];

  const share = async () => {
    const url = `${location.origin}/wishlist?ids=${mine.join(",")}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy your wishlist link", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="px-4 pt-12 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow mb-3">{isShared ? "Shared with you" : "Saved finds"}</p>
          <h1 className="section-title text-4xl md:text-5xl">
            {isShared ? (
              <>
                Shared <em>wishlist.</em>
              </>
            ) : (
              <>
                My <em>wishlist.</em>
              </>
            )}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {isShared ? (
            <button
              className="btn-primary px-6 py-3"
              onClick={() => {
                addAllToWishlist(shared);
                setSaved(true);
              }}
            >
              {saved ? "Saved to my wishlist ✓" : "Save all to my wishlist"}
            </button>
          ) : (
            mine.length > 0 && (
              <>
                <button className="btn-primary px-6 py-3" onClick={share}>
                  {copied ? "Link copied ✓" : "Share my wishlist"}
                </button>
                <button
                  className="btn-secondary px-5 py-3"
                  onClick={() => {
                    if (confirm("Remove every item from your wishlist?")) clearWishlist();
                  }}
                >
                  Clear
                </button>
              </>
            )
          )}
        </div>
      </div>

      {ids.length === 0 ? (
        <div className="rounded-3xl p-10 text-center" style={{ background: "rgba(10,6,16,0.55)", border: "1px solid var(--line-soft)" }}>
          <p className="text-5xl mb-4" aria-hidden>
            ♡
          </p>
          <p className="font-extrabold text-lg mb-2">Your wishlist is empty</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Tap the heart on any product to save it here, then share the list with a link.
          </p>
          <Link href="/products" className="btn-primary px-8 py-3.5">
            Browse products →
          </Link>
        </div>
      ) : !loaded ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {ids.slice(0, 10).map((id) => (
            <div key={id} className="product-card" style={{ minHeight: 300, opacity: 0.4 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
