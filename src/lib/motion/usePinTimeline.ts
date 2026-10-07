"use client";

import type { RefObject } from "react";
import { gsap, mq, ScrollTrigger, useGSAP } from "./gsap";

type Build = (ctx: { tl: gsap.core.Timeline; root: HTMLElement }) => void;

/**
 * Pins `ref` for `length` (e.g. "+=300%") on desktop and scrubs a timeline built
 * by `build`. Mobile and reduced-motion branches are left to the caller's CSS
 * fallbacks (no pin, no scrub).
 */
export function usePinTimeline(
  ref: RefObject<HTMLElement | null>,
  build: Build,
  { length = "+=300%", scrub = 0.6, deps = [] as unknown[] } = {},
) {
  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(mq.desktop, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root, start: "top top", end: length, pin: true, scrub, anticipatePin: 1, invalidateOnRefresh: true },
        });
        build({ tl, root });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: deps },
  );
  return ScrollTrigger;
}
