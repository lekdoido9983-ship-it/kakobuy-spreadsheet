"use client";

import { useSyncExternalStore } from "react";

const KEY = "kb_wishlist";
const EMPTY: number[] = [];

let ids: number[] = EMPTY;
let started = false;
const listeners = new Set<() => void>();

function read(): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((n) => Number.isInteger(n)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  ids = read();
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      ids = read();
      emit();
    }
  });
}

function subscribe(cb: () => void) {
  start();
  listeners.add(cb);
  // pick up the stored list right after mount (server snapshot is empty)
  queueMicrotask(() => {
    const next = read();
    if (next.length !== ids.length || next.some((n, i) => n !== ids[i])) {
      ids = next;
      emit();
    }
  });
  return () => listeners.delete(cb);
}

function save(next: number[]) {
  ids = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  emit();
}

export function useWishlist(): number[] {
  return useSyncExternalStore(subscribe, () => ids, () => EMPTY);
}

export function toggleWishlist(id: number) {
  start();
  save(ids.includes(id) ? ids.filter((n) => n !== id) : [id, ...ids]);
}

export function addAllToWishlist(list: number[]) {
  start();
  const merged = [...ids];
  for (const n of list) if (!merged.includes(n)) merged.push(n);
  save(merged);
}

export function clearWishlist() {
  start();
  save([]);
}
