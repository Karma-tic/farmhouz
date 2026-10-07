"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";

export const LOADER_FLAG = "fz-intro-seen";

/** Runs before first paint: skip the loader on repeat visits and for reduced motion. */
export const loaderScript = `try{if(sessionStorage.getItem("${LOADER_FLAG}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-noloader","")}catch(e){document.documentElement.setAttribute("data-noloader","")}`;

/**
 * First-visit intro (≤ 1.6s, skippable): the wordmark strokes in, a sun dot rises
 * behind it, then the whole layer wipes upward.
 */
export function Loader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || document.documentElement.hasAttribute("data-noloader")) return;
    try {
      sessionStorage.setItem(LOADER_FLAG, "1");
    } catch {}
    const word = el.querySelector("text");
    const sun = el.querySelector(".loader-sun");
    const tl = gsap.timeline({
      onComplete: () => {
        el.style.display = "none";
        document.documentElement.setAttribute("data-noloader", "");
        window.dispatchEvent(new Event("fz:intro-done"));
      },
    });
    tl.fromTo(word, { strokeDashoffset: 900, fillOpacity: 0 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" })
      .to(word, { fillOpacity: 1, duration: 0.25 }, 0.6)
      .fromTo(sun, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.3)
      .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: "expo.inOut" }, 1.0);

    const skip = () => tl.progress(1);
    window.addEventListener("keydown", skip, { once: true });
    el.addEventListener("pointerdown", skip, { once: true });
    return () => {
      tl.kill();
      window.removeEventListener("keydown", skip);
    };
  }, []);

  return (
    <div ref={ref} className="loader" aria-hidden="true" suppressHydrationWarning>
      <svg viewBox="0 0 640 200" className="w-[min(80vw,640px)] overflow-visible">
        <circle className="loader-sun fill-wheat" cx="470" cy="70" r="34" opacity="0" />
        <text
          x="320"
          y="130"
          textAnchor="middle"
          className="display fill-ink stroke-ink"
          style={{ fontSize: 112, strokeWidth: 1.2, strokeDasharray: 900, strokeDashoffset: 900, fillOpacity: 0 }}
        >
          Farmhouze
        </text>
      </svg>
      <button
        type="button"
        className="eyebrow absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full px-4 py-3 text-muted"
        onClick={(e) => e.currentTarget.parentElement?.dispatchEvent(new PointerEvent("pointerdown"))}
        tabIndex={-1}
      >
        Skip intro
      </button>
    </div>
  );
}
