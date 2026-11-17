"use client";

import { Children, cloneElement, isValidElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const CLONES = 12; // items repeated on each side so the loop is seamless on very wide screens too

/**
 * Infinite horizontal rail: [last k clones][all items][first k clones]. Whenever the scroll position leaves the
 * "real" block it is moved by exactly one block width, which looks identical, so the rail never ends.
 * Free mouse drag with inertia (like a finger on a phone), native touch scrolling, yellow arrows on the outer edges.
 */
export default function Rail({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0, lastX: 0, lastT: 0, v: 0 });
  const raf = useRef(0);
  const metrics = useRef({ P: 0, S: 0, k: 0 });
  const [dragging, setDragging] = useState(false);

  const items = useMemo(() => Children.toArray(children).filter(isValidElement), [children]);
  const N = items.length;
  const k = Math.min(N, CLONES);

  const nodes = useMemo(() => {
    const clone = (el: React.ReactElement, tag: string) =>
      cloneElement(el as React.ReactElement<Record<string, unknown>>, { key: `${tag}-${el.key}`, "aria-hidden": true, "data-clone": "1" });
    return [...items.slice(N - k).map((el) => clone(el, "h")), ...items, ...items.slice(0, k).map((el) => clone(el, "t"))];
  }, [items, N, k]);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el || !N) return false;
    const kids = el.children;
    const first = kids[0] as HTMLElement | undefined;
    const real0 = kids[k] as HTMLElement | undefined;
    const tail0 = kids[k + N] as HTMLElement | undefined;
    if (!first || !real0 || !tail0) return false;
    const P = real0.getBoundingClientRect().left - first.getBoundingClientRect().left;
    const S = tail0.getBoundingClientRect().left - real0.getBoundingClientRect().left;
    if (S <= 0) return false;
    metrics.current = { P, S, k };
    return true;
  }, [N, k]);

  /** Keep scrollLeft inside the real block; returns how far it was moved (so a running drag can follow). */
  const wrap = useCallback(() => {
    const el = ref.current;
    const { P, S } = metrics.current;
    if (!el || S <= 0) return 0;
    const x = el.scrollLeft;
    let d = 0;
    if (x < P) d = S * Math.ceil((P - x) / S);
    else if (x >= P + S) d = -S * Math.floor((x - P) / S);
    if (d) {
      el.scrollLeft = x + d;
      if (drag.current.active) drag.current.startLeft += d;
    }
    return d;
  }, []);

  const stopGlide = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (measure()) el.scrollLeft = metrics.current.P;
  }, [measure, nodes]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => wrap();
    const stop = () => stopGlide();
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", stop, { passive: true });
    el.addEventListener("touchstart", stop, { passive: true });
    const ro = new ResizeObserver(() => {
      const { P: oldP, S: oldS } = metrics.current;
      const rel = oldS > 0 ? (el.scrollLeft - oldP) / oldS : 0;
      if (measure()) {
        const { P, S } = metrics.current;
        el.scrollLeft = P + (rel - Math.floor(rel)) * S;
      }
    });
    ro.observe(el);
    return () => {
      stopGlide();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", stop);
      el.removeEventListener("touchstart", stop);
      ro.disconnect();
    };
  }, [measure, wrap]);

  const glide = (el: HTMLDivElement, v0: number) => {
    // v in px per ms with exponential friction -> long, smooth coast (total distance = v0 * 325)
    let v = v0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      el.scrollLeft += v * dt;
      wrap();
      v *= Math.exp(-dt / 325);
      if (Math.abs(v) < 0.015) {
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
      wrap();
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
    glide(el, (dir * Math.max(240, el.clientWidth * 0.8)) / 325);
  };

  return (
    <div className="rail-wrap">
      <button type="button" className="rail-arrow rail-left" aria-label="Previous" onClick={() => go(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
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
          {nodes}
        </div>
      </div>
      <button type="button" className="rail-arrow rail-right" aria-label="Next" onClick={() => go(1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
