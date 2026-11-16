"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { usePromo, type PromoWelcome } from "@/lib/promoClient";

export const WELCOME_KEY = "kb_welcome_day";

/** local calendar day, e.g. 2026-11-16 */
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function WelcomeModal({ w, onClose }: { w: PromoWelcome; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

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

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(w.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4"
      style={{ background: "rgba(8,4,14,0.82)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={w.title || "Welcome gift"}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl p-7 text-center"
        style={{
          maxHeight: "92dvh",
          overflowY: "auto",
          background: "linear-gradient(165deg, rgba(64,42,92,0.99), rgba(24,15,38,0.99))",
          border: "1px solid var(--line)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.75)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center text-base hover:bg-white/10"
          style={{ border: "1px solid var(--line)", color: "var(--text)" }}
        >
          ✕
        </button>

        <p className="text-4xl mb-2" aria-hidden>
          🎁
        </p>
        {w.title && <p className="eyebrow justify-center mb-2">{w.title}</p>}
        {w.discount && (
          <p className="section-title text-5xl mb-2" style={{ color: "var(--amber)" }}>
            {w.discount}
          </p>
        )}
        {w.message && (
          <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-muted)" }}>
            {w.message}
          </p>
        )}

        {w.code && (
          <div className="flex items-center gap-2 mb-3">
            <code
              className="flex-1 px-3 py-3 rounded-xl text-lg font-black tracking-widest text-center"
              style={{ background: "rgba(255,180,84,0.12)", border: "1px dashed rgba(255,180,84,0.55)", color: "var(--amber-soft)" }}
            >
              {w.code}
            </code>
            <button
              onClick={copy}
              className="px-4 py-3 rounded-xl text-xs font-extrabold"
              style={{ background: "linear-gradient(180deg, #ffc474, #f59a3a)", color: "#2a1405" }}
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
        )}

        {w.note && (
          <p className="text-[0.7rem]" style={{ color: "var(--text-dim)" }}>
            {w.note}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}

/** Shows once per calendar day per visitor, on their first visit of that day. */
export default function WelcomePopup() {
  const promo = usePromo();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const w = promo?.welcome ?? null;

  useEffect(() => {
    if (!w || pathname.startsWith("/admin")) return;
    let last = "";
    try {
      last = localStorage.getItem(WELCOME_KEY) || "";
    } catch {}
    if (last === today()) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(WELCOME_KEY, today());
      } catch {}
      setOpen(true);
    }, 700);
    return () => clearTimeout(t);
  }, [w, pathname]);

  const close = useCallback(() => setOpen(false), []);
  if (!open || !w) return null;
  return <WelcomeModal w={w} onClose={close} />;
}
