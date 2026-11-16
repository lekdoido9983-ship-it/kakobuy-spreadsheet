"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  source: string;
  onDone?: () => void;
  compact?: boolean;
}

export default function NewsletterForm({ source, onDone, compact }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState("ok");
      setMessage("You're in! Watch your inbox for the best finds and deals.");
      try {
        localStorage.setItem("kb_newsletter", "subscribed");
      } catch {}
      onDone?.();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "ok") {
    return (
      <p className="font-bold text-sm" style={{ color: "var(--amber)" }} role="status">
        ✓ {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="relative">
        <input
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@email.com"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`search-input w-full rounded-2xl font-medium pl-4 pr-28 ${compact ? "py-3 text-sm" : "py-4 text-base"}`}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2.5 disabled:opacity-60"
        >
          {state === "loading" ? "…" : "Join"}
        </button>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
        />
      </div>
      {state === "error" && (
        <p className="text-xs mt-2 font-semibold" style={{ color: "#ff8a7a" }} role="alert">
          {message}
        </p>
      )}
      <p className="text-[0.68rem] mt-2 leading-snug" style={{ color: "var(--text-dim)" }}>
        By joining you agree to receive promotional emails. Unsubscribe anytime. See our{" "}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
