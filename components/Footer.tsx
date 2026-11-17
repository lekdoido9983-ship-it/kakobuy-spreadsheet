import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import NewsletterForm from "./NewsletterForm";

const NEWSLETTER = process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED === "true";

export default function Footer() {
  return (
    <footer className="mt-24 py-12 px-4" style={{ borderTop: "1px solid var(--line-soft)", background: "rgba(10,6,16,0.6)" }}>
      <div className="site-wrap mx-auto">
        {NEWSLETTER && (
          <div className="rounded-3xl p-6 md:p-8 mb-12 grid md:grid-cols-2 gap-6 items-center" style={{ background: "linear-gradient(165deg, rgba(48,31,70,0.7), rgba(22,14,34,0.8))", border: "1px solid var(--line)" }}>
            <div>
              <p className="eyebrow mb-2">Stay in the loop</p>
              <h3 className="section-title text-2xl md:text-3xl">Get the best finds <em>first.</em></h3>
              <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>New finds, price drops and deals in your inbox.</p>
            </div>
            <NewsletterForm source="footer" compact />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" width={36} height={37} className="h-9 w-auto" />
              <span className="font-black text-lg tracking-[0.04em]" style={{ color: "var(--amber-soft)" }}>
                REPSTITAN
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
              Mythic finds. Browse thousands of products from Kakobuy: shoes, hoodies, jackets, bags and more.
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
          <p className="flex justify-center gap-5 mb-3">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/disclosure" className="hover:text-white transition-colors">Affiliate Disclosure</Link>
          </p>
          <p>© 2026 RepsTitan. All product links open on Kakobuy.</p>
          <p className="mt-1">Referral links may earn us a commission on qualifying purchases.</p>
        </div>
      </div>
    </footer>
  );
}
