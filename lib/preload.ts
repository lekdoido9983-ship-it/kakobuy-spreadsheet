"use client";

const seen = new Set<string>();
const keep: HTMLImageElement[] = [];

/** Fetch + decode images in the background so they appear instantly later. */
export function preloadImages(urls: string[]) {
  if (typeof window === "undefined") return;
  for (const u of urls) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    const img = new Image();
    img.decoding = "async";
    img.src = u;
    keep.push(img);
    if (keep.length > 400) keep.shift();
  }
}
