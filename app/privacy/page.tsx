import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles your data.`,
  alternates: { canonical: "/privacy" },
};

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="eyebrow mb-3">Legal</p>
      <h1 className="section-title text-4xl md:text-5xl mb-8">
        Privacy <em>Policy</em>
      </h1>
      <div className="space-y-6 leading-relaxed" style={{ color: "var(--text-muted)" }}>
        <p>Last updated: November 2026. This policy explains what information {SITE_NAME} collects and how it is used.</p>

        <section>
          <h2 className="font-black text-xl mb-2" style={{ color: "var(--text)" }}>Information we collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Email address</strong>, only if you choose to join our newsletter. We use it to send promotions, new finds and
              deals. You can unsubscribe at any time using the link in every email.
            </li>
            <li>
              <strong>Anonymous usage analytics</strong> (pages viewed, device type, country) through Vercel Analytics. It does not
              use cookies and does not track you across websites.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-xl mb-2" style={{ color: "var(--text)" }}>How we use it</h2>
          <p>
            To send the emails you asked for, to understand which pages are useful, and to keep the site secure. We do not sell your
            personal data.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-2" style={{ color: "var(--text)" }}>Service providers</h2>
          <p>
            Your email is stored with our email service provider, and the site is hosted by Vercel. These providers process data on our
            behalf under their own privacy terms.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-2" style={{ color: "var(--text)" }}>Third-party links</h2>
          <p>
            Product links take you to Kakobuy, a third-party service with its own privacy policy and cookies. We are not responsible
            for their practices. Our links include an affiliate code; see the Affiliate Disclosure.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl mb-2" style={{ color: "var(--text)" }}>Your rights</h2>
          <p>
            Depending on where you live (for example under GDPR or LGPD) you may request access to, correction of, or deletion of
            your data, or withdraw consent at any time.
            {CONTACT ? (
              <>
                {" "}
                Contact us at{" "}
                <a href={`mailto:${CONTACT}`} className="underline">
                  {CONTACT}
                </a>
                .
              </>
            ) : (
              " To exercise these rights, use the unsubscribe link in any email we send you."
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
