"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap } from "@/lib/motion/gsap";

/**
 * Desktop-only companion cursor: a 10px wheat dot that grows into a 56px ring
 * with a label over [data-cursor] targets ("View", "Book"). The native cursor
 * stays visible.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const m = matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => setEnabled(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let off: (() => void) | undefined;
    let cancelled = false;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
      let shown = false;
      const move = (e: PointerEvent) => {
        if (!shown) {
          gsap.set(el, { x: e.clientX, y: e.clientY });
          gsap.to(el, { autoAlpha: 1, duration: 0.2 });
          shown = true;
        }
        xTo(e.clientX);
        yTo(e.clientY);
        const t = (e.target as Element | null)?.closest<HTMLElement>(
          "[data-cursor]",
        );
        setLabel(t?.dataset.cursor ?? null);
      };
      const leave = () => {
        gsap.to(el, { autoAlpha: 0, duration: 0.2 });
        shown = false;
      };
      window.addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
      off = () => {
        window.removeEventListener("pointermove", move);
        document.documentElement.removeEventListener("pointerleave", leave);
      };
    });
    return () => {
      cancelled = true;
      off?.();
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] invisible opacity-0"
      style={{ willChange: "transform" }}
    >
      <div
        className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-wheat text-on-wheat transition-[width,height,background-color] duration-[var(--dur-ui)] ease-[var(--ease-out)]"
        style={{ width: label ? 56 : 10, height: label ? 56 : 10 }}
      >
        <span
          className="eyebrow text-[0.62rem] transition-opacity duration-150"
          style={{ opacity: label ? 1 : 0, letterSpacing: "0.08em" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
