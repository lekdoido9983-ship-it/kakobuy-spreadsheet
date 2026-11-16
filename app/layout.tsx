import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import NewsletterPopup from "@/components/NewsletterPopup";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/site";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | 8,000+ Kakobuy finds`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: ["kakobuy", "kakobuy spreadsheet", "kakobuy finds", "shoes", "hoodies", "jackets", "bags"],
  openGraph: { type: "website", siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESCRIPTION, url: SITE_URL },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#100b19" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <NewsletterPopup />
        <Analytics />
      </body>
    </html>
  );
}
