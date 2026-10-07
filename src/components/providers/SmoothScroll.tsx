"use client";

import type Lenis from "lenis";
import { useEffect } from "react";
import { loadGsap } from "@/lib/motion/gsap";

let instance: Lenis | null = null;

/** Smooth-scroll to an element or y position (falls back to native scrolling). */
export function scrollToTarget(target: string | HTMLElement | number) {
  if (instance) {
    instance.scrollTo(target, { offset: typeof target === "number" ? 0 : -72, duration: 1.4 });
    return;
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
}

/** Pause / resume smooth scroll (e.g. while a dialog is open). */
export function setScrollLocked(locked: boolean) {
  if (!instance) return;
  if (locked) instance.stop();
  else instance.start();
}

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * stay in lockstep. Desktop fine pointers only (touch keeps native momentum
 * scrolling) and never with reduced motion. Loaded on demand and created
 * imperatively so toggling never remounts the page.
 */
export function SmoothScroll() {
  useEffect(() => {
    const m = window.matchMedia("(pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)");
    let stopFn: (() => void) | null = null;
    let cancelled = false;

    const start = async () => {
      if (instance) return;
      const [{ default: LenisCtor }, { gsap, ScrollTrigger }] = await Promise.all([import("lenis"), loadGsap()]);
      if (cancelled || instance) return;
      const lenis = new LenisCtor({ autoRaf: false, lerp: 0.1, anchors: { offset: -72 } });
      instance = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      stopFn = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        instance = null;
      };
    };
    const stop = () => {
      stopFn?.();
      stopFn = null;
    };
    const sync = () => (m.matches ? void start() : stop());

    sync();
    m.addEventListener("change", sync);
    return () => {
      cancelled = true;
      m.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}
