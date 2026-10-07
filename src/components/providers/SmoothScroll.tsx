"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";

let instance: Lenis | null = null;

/** Smooth-scroll to an element or y position (falls back to native scrolling). */
export function scrollToTarget(target: string | HTMLElement | number) {
  if (instance) {
    instance.scrollTo(target, { offset: typeof target === "number" ? 0 : -72, duration: 1.4 });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (typeof el === "number") window.scrollTo({ top: el, behavior: "smooth" });
  else el?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

/** Pause / resume smooth scroll (e.g. while a dialog is open). */
export function setScrollLocked(locked: boolean) {
  if (!instance) return;
  if (locked) instance.stop();
  else instance.start();
}

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * stay in lockstep. Off for reduced motion and touch devices — native momentum
 * scrolling is better there. Created imperatively so toggling never remounts the page.
 */
export function SmoothScroll() {
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)");
    let tick: ((t: number) => void) | null = null;

    const start = () => {
      if (instance) return;
      instance = new Lenis({ autoRaf: false, lerp: 0.1, anchors: { offset: -72 } });
      instance.on("scroll", ScrollTrigger.update);
      tick = (time: number) => instance?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    };
    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      instance?.destroy();
      instance = null;
    };
    const sync = () => (m.matches ? stop() : start());

    sync();
    m.addEventListener("change", sync);
    return () => {
      m.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}
