"use client";

import { useEffect, useRef, useState } from "react";
import { CURRENCIES, setCurrency, useCurrency } from "@/lib/currency";

export default function CurrencySwitcher() {
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${currency}`}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold tracking-wider hover:bg-white/10 transition-colors"
        style={{ border: "1px solid var(--line)", color: "var(--amber-soft)" }}
      >
        {currency}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-44 rounded-2xl p-1.5 z-[70]"
          style={{ background: "rgba(28,18,42,0.99)", border: "1px solid var(--line)", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}
        >
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              role="option"
              aria-selected={c.code === currency}
              onClick={() => {
                setCurrency(c.code);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors text-left"
              style={{ color: c.code === currency ? "var(--amber)" : "var(--text)" }}
            >
              <span>
                <span className="font-black mr-2">{c.symbol}</span>
                {c.code}
              </span>
              {c.code === currency && <span aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
