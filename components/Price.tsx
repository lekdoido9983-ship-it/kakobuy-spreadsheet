"use client";

import { formatPrice, useCurrency } from "@/lib/currency";

/** Renders a USD price in the visitor's chosen currency (USD by default). */
export default function Price({ usd, fallback = "See price" }: { usd?: number | null; fallback?: string }) {
  const s = useCurrency();
  if (!usd) return <>{fallback}</>;
  return <>{formatPrice(usd, s)}</>;
}
