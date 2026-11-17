import CommunityButton from "@/components/CommunityButton";
import { SITE_NAME } from "@/lib/site";

const FAQ: [string, string][] = [
  [`Why should I use ${SITE_NAME}?`, "Finding good products is slow. Here every find sits in one searchable place: photos, prices, categories, wishlist and QC photos whenever we have them, all linking straight to Kakobuy."],
  [`What is ${SITE_NAME}?`, "A product directory for Kakobuy. We list finds from Chinese marketplaces so you can compare and pick what you like, then open it on Kakobuy to order."],
  ["What are Best Sellers?", "The finds people look at the most. They sit at the top of the home page so you can start with proven picks instead of scrolling thousands of items."],
  ["How do I buy a product?", "Open a product, press “View on Kakobuy”, and the item opens on Kakobuy. Create your account there, add it to your cart, pay, and the agent buys it from the seller and ships it to you."],
  ["What is a shopping agent and do I need one?", "Most Chinese marketplaces do not ship abroad. An agent such as Kakobuy buys the item for you, checks it, stores it and sends it to your country. Yes, you need one to order these products."],
  ["What is QC?", "QC means Quality Check: photos the agent takes of your exact item in the warehouse before it ships. Compare them with the listing and fix problems before you pay for international shipping."],
  ["How can I get cheaper shipping?", "Order several items together so they ship as one parcel, pick a line that fits your weight, and look for coupons. Open the Coupons button in the top bar for the current ones."],
  [`Does ${SITE_NAME} sell or ship products?`, "No. We never sell, store or ship anything and we do not take payments. We only point you to the item on Kakobuy, where the purchase happens."],
  ["Are prices, colours and availability always accurate?", "Not always. Sellers change prices, colours and stock without warning, so treat what you see here as a guide and confirm the final details on Kakobuy before you pay."],
  [`Does ${SITE_NAME} guarantee product quality or authenticity?`, "No. We cannot inspect the items. Photos and QC images come from third parties and are only a reference, so check the QC photos on your order before shipping."],
  ["What should I do if a product link is broken or incorrect?", "Sellers delist items from time to time. Tell us in the community and we will fix or replace the find, or search for a similar item on the products page."],
];

const STEPS = [
  ["1", "Pick a find", "Search or browse and open the product you want."],
  ["2", "Open it on Kakobuy", "Press “View on Kakobuy” and sign up with your account."],
  ["3", "Order & check the QC", "Pay, wait for the QC photos and approve or swap the item."],
  ["4", "Ship it home", "Choose a shipping line and track your parcel."],
];

export default function Faq() {
  return (
    <section id="faq" className="px-4 py-14 max-w-7xl mx-auto scroll-mt-24">
      <div className="text-center mb-10">
        <h2 className="section-title text-5xl md:text-7xl">FAQ</h2>
        <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
          Everything you need to know about {SITE_NAME}
        </p>
      </div>

      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
        <div className="faq-side">
          <p className="eyebrow mb-3">The only tutorial you need</p>
          <h3 className="section-title text-3xl md:text-4xl mb-4">
            How to buy with <em>Kakobuy</em>
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            A step-by-step guide on how to buy and ship products from Chinese marketplaces with a shopping agent.
          </p>
          <ol className="space-y-3 mb-6">
            {STEPS.map(([n, t, d]) => (
              <li key={n} className="faq-step">
                <span className="faq-n">{n}</span>
                <span>
                  <strong className="block text-sm">{t}</strong>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {d}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <div className="pt-5" style={{ borderTop: "1px solid var(--line-soft)" }}>
            <p className="eyebrow mb-3">Need more help?</p>
            <CommunityButton className="btn-primary px-6 py-3" label="Join the community" />
          </div>
        </div>

        <div className="space-y-2.5">
          {FAQ.map(([q, a]) => (
            <details key={q} className="faq-item">
              <summary>
                <span>{q}</span>
                <i aria-hidden />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
