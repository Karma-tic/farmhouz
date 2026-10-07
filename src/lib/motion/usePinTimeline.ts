"use client";

import { useEffect, type RefObject } from "react";
import { loadGsap, mq } from "./gsap";

type Build = (ctx: { tl: gsap.core.Timeline; root: HTMLElement; gsap: typeof import("gsap").gsap }) => void | (() => void);

/**
 * Pins `ref` for `length` (e.g. "+=300%") on desktop and scrubs a timeline built
 * by `build`. Wrapped in gsap.matchMedia(): the mobile and reduced-motion
 * branches get no pin and no scrub (components provide CSS fallbacks), and GSAP
 * is only fetched when the desktop branch actually matches.
 */
export function usePinTimeline(ref: RefObject<HTMLElement | null>, build: Build, { length = "+=300%", scrub = 0.6 } = {}) {
  useEffect(() => {
    const root = ref.current;
    if (!root || !matchMedia(mq.desktop).matches) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia();
      mm.add(mq.desktop, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root, start: "top top", end: length, pin: true, scrub, anticipatePin: 1, invalidateOnRefresh: true },
        });
        return build({ tl, root, gsap });
      });
      revert = () => mm.revert();
    });
    return () => {
      cancelled = true;
      revert?.();
    };
    // build is intentionally read once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, length, scrub]);
}
