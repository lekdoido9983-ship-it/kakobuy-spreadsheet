"use client";

/** Fire-and-forget click tracking (counted once per session per product+kind). */
export function trackClick(id: number, kind: "open" | "buy" = "open") {
  try {
    const key = `kb_t_${id}_${kind}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const body = JSON.stringify({ id, kind });
    if (navigator.sendBeacon && navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }))) return;
    fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
  } catch {}
}
