"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/wishlist";

export default function WishlistLink({ className = "", onClick }: { className?: string; onClick?: () => void }) {
  const n = useWishlist().length;
  return (
    <Link href="/wishlist" className={className} onClick={onClick} aria-label={`Wishlist${n ? ` (${n})` : ""}`}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
      <span>Wishlist</span>
      {n > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[0.65rem] font-black" style={{ background: "#e8394d", color: "#fff" }}>
          {n}
        </span>
      )}
    </Link>
  );
}
