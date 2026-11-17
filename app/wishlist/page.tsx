import type { Metadata } from "next";
import { Suspense } from "react";
import WishlistView from "@/components/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved finds. Share the list with a link.",
  robots: { index: false },
};

export default function WishlistPage() {
  return (
    <Suspense fallback={<div className="px-4 pt-12 pb-20 site-wrap mx-auto" style={{ minHeight: 400 }} />}>
      <WishlistView />
    </Suspense>
  );
}
