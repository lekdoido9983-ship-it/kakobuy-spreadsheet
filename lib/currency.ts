"use client";

import { useSyncExternalStore } from "react";

export type Currency = "USD" | "EUR" | "GBP";
export const CURRENCIES: { code: Currency; symbol: string; name: string }[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

type Rates = Record<Currency, number>;
interface State {
  currency: Currency;
  rates: Rates;
}

// Fallback rates (USD base), used until live rates load or if the rates API is down.
const FALLBACK: Rates = { USD: 1, EUR: 0.905, GBP: 0.756 };
const SERVER_STATE: State = { currency: "USD", rates: FALLBACK };

const CUR_KEY = "kb_currency";
const RATES_KEY = "kb_rates";
const RATES_TTL = 6 * 60 * 60 * 1000;

let state: State = SERVER_STATE;
let started = false;
const listeners = new Set<() => void>();

function emit(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function isCurrency(v: unknown): v is Currency {
  return v === "USD" || v === "EUR" || v === "GBP";
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  let currency: Currency = "USD";
  let rates = FALLBACK;
  let fresh = false;
  try {
    const c = localStorage.getItem(CUR_KEY);
    if (isCurrency(c)) currency = c;
    const raw = localStorage.getItem(RATES_KEY);
    if (raw) {
      const r = JSON.parse(raw);
      if (r && typeof r.EUR === "number" && typeof r.GBP === "number") {
        rates = { USD: 1, EUR: r.EUR, GBP: r.GBP };
        fresh = Date.now() - (r.ts || 0) < RATES_TTL;
      }
    }
  } catch {}
  if (currency !== state.currency || rates !== state.rates) emit({ currency, rates });

  window.addEventListener("storage", (e) => {
    if (e.key === CUR_KEY && isCurrency(e.newValue)) emit({ ...state, currency: e.newValue });
  });

  if (!fresh) {
    fetch("/api/rates")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d || typeof d.EUR !== "number" || typeof d.GBP !== "number") return;
        try {
          localStorage.setItem(RATES_KEY, JSON.stringify({ EUR: d.EUR, GBP: d.GBP, ts: Date.now() }));
        } catch {}
        emit({ ...state, rates: { USD: 1, EUR: d.EUR, GBP: d.GBP } });
      })
      .catch(() => {});
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  start();
  return () => {
    listeners.delete(cb);
  };
}

export function useCurrency() {
  const s = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE
  );
  return s;
}

export function setCurrency(c: Currency) {
  try {
    localStorage.setItem(CUR_KEY, c);
  } catch {}
  emit({ ...state, currency: c });
}

export function formatPrice(usd: number, { currency, rates }: State): string {
  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$";
  const v = usd * (rates[currency] ?? 1);
  return `${symbol}${v.toFixed(2).replace(/\.00$/, "")}`;
}
