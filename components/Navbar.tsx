"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/products";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);

  return (
    <nav className="navbar px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🛍️</span>
          <span className="gradient-text font-black text-xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            KakoBuy
          </span>
          <span className="text-white/70 font-semibold text-xl hidden sm:block">Spreadsheet</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/products" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
            All Products
          </Link>

          {/* Categories dropdown */}
          <div className="relative" onMouseEnter={() => setCatsOpen(true)} onMouseLeave={() => setCatsOpen(false)}>
            <button className="text-sm font-semibold text-white/60 hover:text-white transition-colors flex items-center gap-1">
              Categories
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {catsOpen && (
              <div className="absolute top-full left-0 mt-2 bg-[#1a1340] border border-white/10 rounded-2xl p-3 w-56 shadow-2xl z-50 grid grid-cols-2 gap-1">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/category/${cat.toLowerCase()}`}
                    className="px-3 py-2 rounded-xl hover:bg-white/10 text-sm font-semibold text-white/60 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span>{CATEGORY_ICONS[cat]}</span>
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <Link href="/products" className="btn-primary text-sm px-5 py-2.5">
            Browse Products
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-white/10"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`w-5 h-0.5 bg-white mb-1.5 transition-all origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <div className={`w-5 h-0.5 bg-white mb-1.5 transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <div className={`w-5 h-0.5 bg-white transition-all origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 border-t border-white/10 pt-3 px-2 pb-4">
          <div className="flex flex-col gap-1">
            <Link href="/" className="py-2.5 px-3 rounded-xl hover:bg-white/10 font-semibold" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/products" className="py-2.5 px-3 rounded-xl hover:bg-white/10 font-semibold" onClick={() => setMenuOpen(false)}>
              All Products
            </Link>
            <div className="border-t border-white/10 my-2" />
            <p className="px-3 text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Categories</p>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat.toLowerCase()}`}
                className="py-2 px-3 rounded-xl hover:bg-white/10 text-sm text-white/60 font-semibold flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
