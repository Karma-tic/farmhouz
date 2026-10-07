"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.config({ nullTargetWarn: false });
}

/** Motion tokens (mirrors the CSS custom properties in globals.css) */
export const motionTokens = {
  micro: 0.16,
  ui: 0.28,
  reveal: 0.7,
  hero: 1.4,
  stagger: 0.06,
  easeOut: "power3.out",
  camera: "expo.inOut",
  spring: { stiffness: 300, damping: 24 },
  cssEase: [0.22, 1, 0.36, 1] as [number, number, number, number],
} as const;

/** Breakpoint branches used by every gsap.matchMedia() call */
export const mq = {
  desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
