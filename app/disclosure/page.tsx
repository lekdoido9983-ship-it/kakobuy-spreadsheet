import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: `${SITE_NAME} is an independent directory and may earn commissions from referral links.`,
  alternates: { canonical: "/disclosure" },
};

export default function DisclosurePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="eyebrow mb-3">Legal</p>
      <h1 className="section-title text-4xl md:text-5xl mb-8">
        Affiliate <em>Disclosure</em>
      </h1>
      <div className="space-y-5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
        <p>
          <strong style={{ color: "var(--text)" }}>{SITE_NAME} is an independent directory.</strong> We do not sell, ship, or
          authenticate any product shown on this site. Listings, photos and prices come from third-party sources and may be
          inaccurate or outdated. Inclusion does not certify authenticity or imply endorsement by any brand owner.
        </p>
        <p>
          <strong style={{ color: "var(--text)" }}>Affiliate links.</strong> Links on this site lead to Kakobuy and include a
          referral code. If you create an account or place an order through them, we may earn a commission at no extra cost to you.
        </p>
        <p>
          Prices are indicative. Always check the current price, availability, shipping costs and seller terms on Kakobuy before
          buying. All trademarks belong to their respective owners.
        </p>
      </div>
    </div>
  );
}
