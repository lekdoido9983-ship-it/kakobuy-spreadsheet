"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NewsletterForm from "./NewsletterForm";

const ENABLED = process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED === "true";
const DISMISS_DAYS = 7;
const SHOW_AFTER_MS = 25_000;

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem("kb_newsletter_dismissed", String(Date.now()));
    } catch {}
  }, []);

  useEffect(() => {
    if (!ENABLED || pathname.startsWith("/privacy") || pathname.startsWith("/disclosure")) return;
    try {
      if (localStorage.getItem("kb_newsletter") === "subscribed") return;
      const last = Number(localStorage.getItem("kb_newsletter_dismissed") || 0);
      if (last && Date.now() - last < DISMISS_DAYS * 86_400_000) return;
    } catch {}

    const timer = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    const onScroll = () => {
      const scrolled = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      if (scrolled > 0.6) {
        setOpen(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(8,4,14,0.7)", backdropFilter: "blur(5px)" }}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Join the newsletter"
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-7"
        style={{
          background: "linear-gradient(165deg, rgba(58,38,84,0.98), rgba(24,15,38,0.99))",
          border: "1px solid var(--line)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10"
          style={{ border: "1px solid var(--line)" }}
        >
          ✕
        </button>
        <p className="eyebrow mb-3">Join the kingdom</p>
        <h2 className="section-title text-3xl mb-2">
          Never miss a <em>good find.</em>
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
          Get the best new finds, price drops and deals straight to your inbox. No spam.
        </p>
        <NewsletterForm source="popup" onDone={() => setTimeout(close, 2500)} />
      </div>
    </div>
  );
}
