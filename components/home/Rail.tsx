"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Horizontal rail: free drag with the mouse that keeps gliding after release (inertia, like a finger on a phone),
 * native touch scrolling, and two yellow arrows on the outer edges to move to the previous / next items.
 */
export default function Rail({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0, lastX: 0, lastT: 0, v: 0 });
  const raf = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const l = el.scrollLeft > 4;
    const r = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setCanLeft((p) => (p === l ? p : l));
    setCanRight((p) => (p === r ? p : r));
  }, []);

  const stopGlide = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const stop = () => stopGlide();
    el.addEventListener("wheel", stop, { passive: true });
    el.addEventListener("touchstart", stop, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      stopGlide();
      el.removeEventListener("scroll", update);
      el.removeEventListener("wheel", stop);
      el.removeEventListener("touchstart", stop);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const glide = (el: HTMLDivElement, v0: number) => {
    // v in px per ms, exponential friction -> long, smooth coast
    let v = v0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      const before = el.scrollLeft;
      el.scrollLeft = before + v * dt;
      v *= Math.exp(-dt / 325);
      const hitEdge = Math.abs(el.scrollLeft - before) < 0.01;
      if (Math.abs(v) < 0.015 || hitEdge) {
        raf.current = 0;
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return; // touch/pen scroll natively
    const el = ref.current;
    if (!el) return;
    stopGlide();
    drag.current = { active: true, moved: false, startX: e.clientX, startLeft: el.scrollLeft, lastX: e.clientX, lastT: performance.now(), v: 0 };

    const move = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d.active) return;
      const dx = ev.clientX - d.startX;
      if (!d.moved && Math.abs(dx) > 5) {
        d.moved = true;
        setDragging(true);
      }
      if (!d.moved) return;
      el.scrollLeft = d.startLeft - dx;
      const now = performance.now();
      const dt = now - d.lastT;
      if (dt > 0) {
        const inst = (d.lastX - ev.clientX) / dt; // scroll velocity (px/ms)
        d.v = d.v * 0.6 + inst * 0.4;
      }
      d.lastX = ev.clientX;
      d.lastT = now;
    };
    const up = () => {
      const d = drag.current;
      d.active = false;
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      // a pause before release means "stop here"; otherwise keep gliding with the flick speed
      const idle = performance.now() - d.lastT;
      if (d.moved && idle < 90 && Math.abs(d.v) > 0.05) glide(el, Math.max(-6, Math.min(6, d.v * 1.15)));
      // let the click that follows a drag be swallowed (see onClickCapture), then reset
      setTimeout(() => (drag.current.moved = false), 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    stopGlide();
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="rail-wrap">
      {canLeft && (
        <button type="button" className="rail-arrow rail-left" aria-label="Previous" onClick={() => go(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
      )}
      <div className="rail-mask">
        <div
          ref={ref}
          className={`${className} rail-scroller ${dragging ? "rail-dragging" : ""}`}
          onPointerDown={onPointerDown}
          onDragStart={(e) => e.preventDefault()}
          onClickCapture={(e) => {
            if (drag.current.moved) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {children}
        </div>
      </div>
      {canRight && (
        <button type="button" className="rail-arrow rail-right" aria-label="Next" onClick={() => go(1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
