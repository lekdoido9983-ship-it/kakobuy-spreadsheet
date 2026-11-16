"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  name: string;
  full: string[];
  thumbs: string[];
  fallback?: React.ReactNode;
  showThumbs?: boolean;
  aspect?: string;
  padding?: number;
  /** Fill the parent's height (used in the quick view so nothing scrolls). */
  fill?: boolean;
  showNote?: boolean;
}

function Arrow({ dir, onClick, size = 40 }: { dir: "prev" | "next"; onClick: (e: React.MouseEvent) => void; size?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous photo" : "Next photo"}
      className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-xl font-bold transition-colors hover:bg-white/20"
      style={{
        [dir === "prev" ? "left" : "right"]: 10,
        width: size,
        height: size,
        background: "rgba(16,11,25,0.72)",
        border: "1px solid rgba(255,180,84,0.35)",
        color: "var(--amber-soft)",
        backdropFilter: "blur(6px)",
        zIndex: 5,
      }}
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
}

function Lightbox({
  name,
  full,
  index,
  setIndex,
  onClose,
}: {
  name: string;
  full: string[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
}) {
  const go = useCallback((d: number) => setIndex((index + d + full.length) % full.length), [index, full.length, setIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onClose();
      }
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      style={{ background: "rgba(6,3,10,0.92)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} photos`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 w-11 h-11 rounded-xl flex items-center justify-center text-lg hover:bg-white/10"
        style={{ border: "1px solid var(--line)", color: "var(--text)", zIndex: 6 }}
      >
        ✕
      </button>
      <div className="relative w-full max-w-4xl h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={full[index]} alt={`${name} photo ${index + 1}`} className="max-w-full max-h-full object-contain rounded-xl" />
        {full.length > 1 && (
          <>
            <Arrow dir="prev" onClick={() => go(-1)} size={48} />
            <Arrow dir="next" onClick={() => go(1)} size={48} />
          </>
        )}
        <span
          className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: "rgba(16,11,25,0.8)", color: "var(--amber-soft)" }}
        >
          {index + 1} / {full.length}
        </span>
      </div>
    </div>,
    document.body
  );
}

/** One single row of thumbnails: scroll with the side buttons, drag with the mouse, or swipe on touch screens. */
function ThumbStrip({ thumbs, index, setIndex }: { thumbs: string[]; index: number; setIndex: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, thumbs.length]);

  // keep the selected thumbnail visible (scroll the strip only, never the page)
  useEffect(() => {
    const el = ref.current;
    const child = el?.children[index] as HTMLElement | undefined;
    if (!el || !child) return;
    const left = child.offsetLeft - (el.clientWidth - child.clientWidth) / 2;
    el.scrollTo({ left, behavior: "smooth" });
  }, [index]);

  const scrollBy = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className="relative">
      <div
        ref={ref}
        role="tablist"
        aria-label="Photo thumbnails"
        className="flex gap-2 overflow-x-auto select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", touchAction: "pan-x", cursor: "grab", padding: "2px" }}
        onScroll={measure}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") return;
          drag.current = { down: true, x: e.clientX, left: ref.current?.scrollLeft ?? 0, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d.down || !ref.current) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 4) d.moved = true;
          ref.current.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => (drag.current.down = false)}
        onPointerLeave={() => (drag.current.down = false)}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.moved = false;
          }
        }}
      >
        {thumbs.map((src, i) => (
          <button
            key={src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show photo ${i + 1}`}
            onClick={() => setIndex(i)}
            className="shrink-0 rounded-xl overflow-hidden transition-all"
            style={{
              width: 64,
              height: 64,
              background: "linear-gradient(180deg, rgba(70,46,100,0.55), rgba(32,20,48,0.9))",
              border: i === index ? "2px solid var(--amber)" : "1px solid var(--line-soft)",
              opacity: i === index ? 1 : 0.8,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" decoding="async" draggable={false} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {edges.left && (
        <button
          type="button"
          aria-label="Scroll thumbnails left"
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-base font-bold"
          style={{ background: "rgba(16,11,25,0.88)", border: "1px solid rgba(255,180,84,0.4)", color: "var(--amber-soft)", zIndex: 4 }}
        >
          ‹
        </button>
      )}
      {edges.right && (
        <button
          type="button"
          aria-label="Scroll thumbnails right"
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-base font-bold"
          style={{ background: "rgba(16,11,25,0.88)", border: "1px solid rgba(255,180,84,0.4)", color: "var(--amber-soft)", zIndex: 4 }}
        >
          ›
        </button>
      )}
    </div>
  );
}

export default function ProductGallery({
  name,
  full,
  thumbs,
  fallback,
  showThumbs = true,
  aspect = "1 / 1",
  padding = 14,
  fill = false,
  showNote = true,
}: Props) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = full.length;

  const go = (d: number) => setIndex((i) => (i + d + count) % count);

  return (
    <div className={fill ? "flex flex-col h-full min-h-0" : undefined}>
      <div
        className="product-image-frame"
        style={{
          ...(fill ? { flex: "1 1 0", minHeight: 0, aspectRatio: "auto" } : { aspectRatio: aspect }),
          borderRadius: "20px",
          // clearly closed frame: lighter fill + visible border all the way around
          background:
            "radial-gradient(ellipse at 50% 38%, rgba(255,255,255,0.12), transparent 62%), linear-gradient(180deg, rgba(104,72,148,0.62), rgba(70,46,102,0.92))",
          border: "1.5px solid rgba(255,180,84,0.4)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(0,0,0,0.25)",
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || count < 2) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {count > 0 ? (
          <button
            type="button"
            onClick={() => index > 0 && setLightbox(true)}
            aria-label={index > 0 ? "Open photo" : undefined}
            className="w-full h-full flex items-center justify-center"
            style={{ cursor: index > 0 ? "zoom-in" : "default" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={full[index]} src={full[index]} alt={`${name} photo ${index + 1}`} style={{ padding }} />
          </button>
        ) : (
          fallback
        )}

        {count > 1 && (
          <>
            <Arrow dir="prev" onClick={() => go(-1)} />
            <Arrow dir="next" onClick={() => go(1)} />
            <span
              className="absolute top-3 right-3 text-[0.65rem] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(16,11,25,0.75)", color: "var(--amber-soft)", border: "1px solid rgba(255,180,84,0.25)" }}
              aria-live="polite"
            >
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {showThumbs && count > 1 && (
        <div className={fill ? "shrink-0" : undefined}>
          {showNote && (
            <p className="text-[0.7rem] mt-3 mb-2 leading-snug" style={{ color: "var(--text-dim)" }}>
              Third-party product and QC images. These images do not establish authenticity.
            </p>
          )}
          <div className={showNote ? "" : "mt-3"}>
            <ThumbStrip thumbs={thumbs} index={index} setIndex={setIndex} />
          </div>
        </div>
      )}

      {lightbox && <Lightbox name={name} full={full} index={index} setIndex={setIndex} onClose={() => setLightbox(false)} />}
    </div>
  );
}
