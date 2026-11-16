"use client";

import { useEffect, useState } from "react";

export interface PromoCoupon {
  id: string;
  code: string;
  title: string;
  description: string;
  expiresAt?: string;
}
export interface PromoNotice {
  id: string;
  title: string;
  message: string;
  link?: string;
  createdAt: string;
}
export interface PromoCommunity {
  title: string;
  discordUrl: string;
  telegramUrl: string;
  buttonLabel: string;
  joinUrl: string;
  text: string;
}
export interface PromoWelcome {
  enabled: boolean;
  title: string;
  discount: string;
  message: string;
  code: string;
  note: string;
}
export interface Promo {
  coupons: PromoCoupon[];
  notices: PromoNotice[];
  community: PromoCommunity | null;
  welcome: PromoWelcome | null;
}

let inflight: Promise<Promo | null> | null = null;
let loaded: Promo | null = null;

function load(): Promise<Promo | null> {
  if (loaded) return Promise.resolve(loaded);
  if (!inflight) {
    inflight = fetch("/api/promo")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) loaded = { coupons: d.coupons ?? [], notices: d.notices ?? [], community: d.community ?? null, welcome: d.welcome ?? null };
        inflight = null;
        return loaded;
      })
      .catch(() => {
        inflight = null;
        return null;
      });
  }
  return inflight;
}

/** One shared /api/promo request for every component that needs coupons, notices, community or welcome data. */
export function usePromo(): Promo | null {
  const [promo, setPromo] = useState<Promo | null>(loaded);
  useEffect(() => {
    let alive = true;
    load().then((p) => alive && p && setPromo(p));
    return () => {
      alive = false;
    };
  }, []);
  return promo;
}
