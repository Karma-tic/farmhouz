"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "./gsap";

/**
 * Pulls an element up to `strength` px toward the cursor while hovered.
 * Desktop fine pointers only; does nothing for touch or reduced motion.
 */
export function useMagnetic<T extends HTMLElement>(ref: RefObject<T | null>, strength = 6) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      xTo(Math.max(-1, Math.min(1, dx)) * strength);
      yTo(Math.max(-1, Math.min(1, dy)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [ref, strength]);
}
