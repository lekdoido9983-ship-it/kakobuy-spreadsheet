"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/categories";
import PromoButton from "@/components/PromoButton";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="navbar-wrap">
      <nav className="navbar px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <span
              className="flex items-center justify-center w-10 h-10 rounded-xl text-xl"
              style={{ background: "linear-gradient(180deg, #ffc474, #f59a3a)", boxShadow: "0 6px 18px rgba(245,154,58,0.35)" }}
            >
              👑
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-black text-lg tracking-tight" style={{ color: "var(--amber-soft)", fontFamily: "var(--font-display)" }}>
                KAKOBUY
              </span>
              <span className="text-[0.6rem] font-bold tracking-[0.3em] mt-1" style={{ color: "var(--text-dim)" }}>
                SPREADSHEET
              </span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
              Home
            </Link>
            <Link href="/products" className={`nav-link ${isActive("/products") ? "active" : ""}`}>
              Products
            </Link>

            <PromoButton className="nav-link flex items-center gap-1.5" />

            <div className="relative" onMouseEnter={() => setCatsOpen(true)} onMouseLeave={() => setCatsOpen(false)}>
              <button className={`nav-link flex items-center gap-1.5 ${isActive("/category") ? "active" : ""}`}>
                Categories
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {catsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div
                    className="rounded-2xl p-3 w-72 grid grid-cols-2 gap-1"
                    style={{ background: "rgba(28,18,42,0.98)", border: "1px solid var(--line)", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}
                  >
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat}
                        href={`/category/${cat.toLowerCase()}`}
                        className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors hover:bg-white/5"
                        style={{ color: "var(--text-muted)" }}
                        onClick={() => setCatsOpen(false)}
                      >
                        <span>{CATEGORY_ICONS[cat]}</span>
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            <Link href="/products" className="btn-primary px-6 py-3">
              Browse finds →
            </Link>
          </div>

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

        {menuOpen && (
          <div className="md:hidden mt-3 pt-3 pb-2" style={{ borderTop: "1px solid var(--line-soft)" }}>
            <div className="flex flex-col gap-1">
              <Link href="/" className="py-2.5 px-3 rounded-xl hover:bg-white/10 font-semibold" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link href="/products" className="py-2.5 px-3 rounded-xl hover:bg-white/10 font-semibold" onClick={() => setMenuOpen(false)}>
                Products
              </Link>
              <PromoButton className="py-2.5 px-3 rounded-xl hover:bg-white/10 font-semibold text-left flex items-center gap-2" />
              <p className="eyebrow px-3 mt-3 mb-1">Categories</p>
              <div className="grid grid-cols-2 gap-1">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/category/${cat.toLowerCase()}`}
                    className="py-2 px-3 rounded-xl hover:bg-white/10 text-sm font-semibold flex items-center gap-2"
                    style={{ color: "var(--text-muted)" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>{CATEGORY_ICONS[cat]}</span>
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
