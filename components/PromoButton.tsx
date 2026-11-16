"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePromo } from "@/lib/promoClient";

type Promo = Pick<NonNullable<ReturnType<typeof usePromo>>, "coupons" | "notices">;

const SEEN_KEY = "kb_promo_seen";

function PromoModal({ promo, onClose }: { promo: Promo; onClose: () => void }) {
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(""), 1800);
    } catch {}
  };

  const empty = promo.coupons.length === 0 && promo.notices.length === 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: "rgba(8,4,14,0.78)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Coupons and notifications"
    >
      <div
        className="w-full max-w-md rounded-3xl p-5 flex flex-col"
        style={{
          maxHeight: "min(86dvh, 640px)",
          background: "linear-gradient(165deg, rgba(58,38,84,0.98), rgba(24,15,38,0.99))",
          border: "1px solid var(--line)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <p className="eyebrow">Coupons &amp; news</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base hover:bg-white/10"
            style={{ border: "1px solid var(--line)", color: "var(--text)" }}
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto min-h-0 space-y-3 pr-1">
          {empty && (
            <p className="text-sm py-8 text-center" style={{ color: "var(--text-dim)" }}>
              No coupons or news right now. Check back soon.
            </p>
          )}

          {promo.coupons.map((c) => (
            <div key={c.id} className="rounded-2xl p-4" style={{ background: "rgba(10,6,16,0.55)", border: "1px solid var(--line-soft)" }}>
              {c.title && <p className="font-extrabold text-sm mb-1">{c.title}</p>}
              {c.description && (
                <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
                  {c.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                <code
                  className="flex-1 px-3 py-2 rounded-xl text-sm font-black tracking-widest text-center"
                  style={{ background: "rgba(255,180,84,0.12)", border: "1px dashed rgba(255,180,84,0.5)", color: "var(--amber-soft)" }}
                >
                  {c.code}
                </code>
                <button
                  onClick={() => copy(c.code)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold"
                  style={{ background: "linear-gradient(180deg, #ffc474, #f59a3a)", color: "#2a1405" }}
                >
                  {copied === c.code ? "Copied ✓" : "Copy"}
                </button>
              </div>
              {c.expiresAt && (
                <p className="text-[0.65rem] mt-2" style={{ color: "var(--text-dim)" }}>
                  Valid until {c.expiresAt}
                </p>
              )}
            </div>
          ))}

          {promo.notices.map((n) => (
            <div key={n.id} className="rounded-2xl p-4" style={{ background: "rgba(10,6,16,0.55)", border: "1px solid var(--line-soft)" }}>
              <p className="font-extrabold text-sm mb-1">🔔 {n.title}</p>
              {n.message && (
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {n.message}
                </p>
              )}
              {n.link &&
                (n.link.startsWith("/") ? (
                  <Link href={n.link} onClick={onClose} className="inline-block mt-2 text-xs font-bold" style={{ color: "var(--amber)" }}>
                    Open →
                  </Link>
                ) : (
                  <a href={n.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs font-bold" style={{ color: "var(--amber)" }}>
                    Open ↗
                  </a>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function PromoButton({ className = "", label = "Coupons", onOpen }: { className?: string; label?: string; onOpen?: () => void }) {
  const promo = usePromo();
  const [open, setOpen] = useState(false);
  const [justSeen, setJustSeen] = useState<string>("");
  // promo only exists after mount (client fetch), so reading localStorage here cannot cause a hydration mismatch
  const stored = promo ? (() => { try { return localStorage.getItem(SEEN_KEY) || ""; } catch { return ""; } })() : "";
  const seen = justSeen || stored;

  const signature = promo ? [...promo.coupons.map((c) => c.id), ...promo.notices.map((n) => n.id)].join(",") : "";
  const count = promo ? promo.coupons.length + promo.notices.length : 0;
  const unseen = count > 0 && signature !== seen;

  const close = useCallback(() => setOpen(false), []);
  const toggle = () => {
    onOpen?.();
    setOpen(true);
    if (signature) {
      try {
        localStorage.setItem(SEEN_KEY, signature);
      } catch {}
      setJustSeen(signature);
    }
  };

  return (
    <>
      <button onClick={toggle} className={className} aria-haspopup="dialog">
        <span aria-hidden>🎟️</span>
        {label}
        {unseen && (
          <span
            className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[0.65rem] font-black"
            style={{ background: "#e8394d", color: "#fff" }}
          >
            {count}
          </span>
        )}
      </button>
      {open && <PromoModal promo={promo ?? { coupons: [], notices: [] }} onClose={close} />}
    </>
  );
}
