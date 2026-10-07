"use client";

/**
 * GSAP is only needed for desktop choreography (pins, scrubs, magnetic buttons,
 * cursor, smooth scroll), so it is loaded on demand instead of shipping in the
 * initial bundle. Phones never download it.
 */
type GsapBundle = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
};

let loading: Promise<GsapBundle> | null = null;

export function loadGsap(): Promise<GsapBundle> {
  if (!loading) {
    loading = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
      g.gsap.registerPlugin(st.ScrollTrigger);
      g.gsap.config({ nullTargetWarn: false });
      return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
    });
  }
  return loading;
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
