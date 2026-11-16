"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePromo, type PromoCommunity } from "@/lib/promoClient";

const FALLBACK: PromoCommunity = {
  title: "Join our community",
  discordUrl: "",
  telegramUrl: "",
  buttonLabel: "Join Community",
  joinUrl: "",
  text: "Daily promotions, new products and discounts every day.",
};

function Brand({ kind }: { kind: "discord" | "telegram" }) {
  return kind === "discord" ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.2.5a18.3 18.3 0 0 0-6.4 0L8.6 3a19.7 19.7 0 0 0-4.9 1.4C.6 9 0 13.5.3 18a19.9 19.9 0 0 0 6 3l1.3-2.1c-.7-.3-1.4-.6-2-1l.5-.4a14.2 14.2 0 0 0 12.1 0l.5.4c-.6.4-1.3.7-2 1l1.3 2.1a19.8 19.8 0 0 0 6-3c.4-5.2-.7-9.700-3.700-13.600ZM8.500 15.300c-1.200 0-2.100-1.100-2.100-2.400 0-1.300.9-2.400 2.100-2.400s2.100 1.100 2.100 2.400c0 1.300-.9 2.400-2.100 2.400Zm7 0c-1.200 0-2.100-1.100-2.100-2.400 0-1.300.9-2.400 2.100-2.400s2.100 1.100 2.100 2.400c0 1.300-.9 2.400-2.100 2.400Z" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21.900 4.300 18.700 19.500c-.2 1.100-.9 1.400-1.800.9l-4.900-3.600-2.400 2.300c-.3.300-.5.500-1 .5l.4-5 9.100-8.200c.4-.4-.1-.6-.6-.2L6.300 13 1.500 11.500c-1-.3-1-1 .2-1.500L20.400 2.800c.9-.3 1.600.2 1.500 1.500Z" />
    </svg>
  );
}

function CommunityModal({ c, onClose }: { c: PromoCommunity; onClose: () => void }) {
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

  const join = c.joinUrl || c.discordUrl || c.telegramUrl;
  const links = [
    { kind: "discord" as const, label: "Discord", url: c.discordUrl, color: "#5865F2" },
    { kind: "telegram" as const, label: "Telegram", url: c.telegramUrl, color: "#229ED9" },
  ].filter((l) => l.url);

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: "rgba(8,4,14,0.78)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Community"
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 flex flex-col"
        style={{
          maxHeight: "min(90dvh, 620px)",
          background: "linear-gradient(165deg, rgba(58,38,84,0.98), rgba(24,15,38,0.99))",
          border: "1px solid var(--line)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <p className="eyebrow">Community</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base hover:bg-white/10"
            style={{ border: "1px solid var(--line)", color: "var(--text)" }}
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto min-h-0">
          <h2 className="section-title text-3xl mb-5">{c.title}</h2>

          <div className="space-y-3">
            {links.map((l) => (
              <a
                key={l.kind}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-transform hover:-translate-y-0.5"
                style={{ background: "rgba(10,6,16,0.55)", border: "1px solid var(--line-soft)" }}
              >
                <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: l.color }}>
                  <Brand kind={l.kind} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-extrabold text-sm">{l.label}</span>
                  <span className="block text-xs truncate" style={{ color: "var(--text-dim)" }}>
                    {l.url.replace(/^https?:\/\//, "")}
                  </span>
                </span>
                <span aria-hidden style={{ color: "var(--amber)" }}>
                  ↗
                </span>
              </a>
            ))}
          </div>

          {join && (
            <a href={join} target="_blank" rel="noopener noreferrer" className="btn-primary w-full py-4 mt-5">
              {c.buttonLabel} →
            </a>
          )}

          {c.text && (
            <p className="text-sm leading-relaxed text-center mt-5" style={{ color: "var(--text-muted)" }}>
              {c.text}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function CommunityButton({ className = "", label = "Community", onOpen }: { className?: string; label?: string; onOpen?: () => void }) {
  const promo = usePromo();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
        className={className}
        aria-haspopup="dialog"
      >
        <span aria-hidden>💬</span>
        {label}
      </button>
      {open && <CommunityModal c={promo?.community ?? FALLBACK} onClose={close} />}
    </>
  );
}
