"use client";

import { toggleWishlist, useWishlist } from "@/lib/wishlist";

/** Heart toggle. Stops the click so it never opens the card / quick view underneath. */
export default function WishlistButton({ id, className = "", size = 34 }: { id: number; className?: string; size?: number }) {
  const list = useWishlist();
  const on = list.includes(id);
  return (
    <button
      type="button"
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={on}
      className={`wish-btn ${on ? "on" : ""} ${className}`}
      style={{ width: size, height: size }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(id);
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
