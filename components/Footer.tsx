import Link from "next/link";
import { CATEGORIES } from "@/lib/products";

export default function Footer() {
  return (
    <footer className="mt-24 py-12 px-4" style={{ borderTop: "1px solid var(--line-soft)", background: "rgba(10,6,16,0.6)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="flex items-center justify-center w-9 h-9 rounded-xl"
                style={{ background: "linear-gradient(180deg, #ffc474, #f59a3a)" }}
              >
                👑
              </span>
              <span className="font-black text-lg" style={{ color: "var(--amber-soft)" }}>
                KAKOBUY SPREADSHEET
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
              A kingdom of finds. Browse thousands of products from Kakobuy: shoes, hoodies, jackets, bags and more.
            </p>
          </div>

          <div>
            <h3 className="eyebrow mb-4">Categories</h3>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.slice(0, 12).map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat.toLowerCase()}`}
                  className="text-sm py-0.5 transition-colors hover:text-white"
                  style={{ color: "var(--text-muted)" }}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="eyebrow mb-4">Browse</h3>
            <div className="flex flex-col gap-1">
              {[
                ["/products", "All Products"],
                ["/category/shoes", "Shoes"],
                ["/category/hoodies", "Hoodies"],
                ["/category/bags", "Bags"],
                ["/category/accessories", "Accessories"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="text-sm py-0.5 transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 text-center text-xs" style={{ borderTop: "1px solid var(--line-soft)", color: "var(--text-dim)" }}>
          <p>© 2026 Kakobuy Spreadsheet. All product links open on Kakobuy.</p>
          <p className="mt-1">Referral links may earn us a commission on qualifying purchases.</p>
        </div>
      </div>
    </footer>
  );
}
