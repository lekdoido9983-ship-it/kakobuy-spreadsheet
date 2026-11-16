"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/products";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🛍️</span>
              <span className="font-black text-lg gradient-text">KakoBuy Spreadsheet</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Browse thousands of products from Kakobuy. Find shoes, clothes, and accessories at competitive prices.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-white/40 mb-4">Categories</h3>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.slice(0, 10).map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat.toLowerCase()}`}
                  className="text-sm text-white/50 hover:text-white transition-colors py-0.5"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-white/40 mb-4">Browse</h3>
            <div className="flex flex-col gap-1">
              <Link href="/products" className="text-sm text-white/50 hover:text-white transition-colors py-0.5">
                All Products
              </Link>
              <Link href="/category/shoes" className="text-sm text-white/50 hover:text-white transition-colors py-0.5">
                Shoes
              </Link>
              <Link href="/category/hoodies" className="text-sm text-white/50 hover:text-white transition-colors py-0.5">
                Hoodies
              </Link>
              <Link href="/category/bags" className="text-sm text-white/50 hover:text-white transition-colors py-0.5">
                Bags
              </Link>
              <Link href="/category/accessories" className="text-sm text-white/50 hover:text-white transition-colors py-0.5">
                Accessories
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 text-center text-xs text-white/30">
          <p>© 2026 KakoBuy Spreadsheet. All product links open on Kakobuy.</p>
          <p className="mt-1">This site may earn commission from qualifying purchases through affiliate links.</p>
        </div>
      </div>
    </footer>
  );
}
