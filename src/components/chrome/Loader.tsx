"use client";

import { useEffect, useRef } from "react";

export const LOADER_FLAG = "fz-intro-seen";

/** Runs before first paint: skip the loader on repeat visits and for reduced motion. */
export const loaderScript = `try{if(sessionStorage.getItem("${LOADER_FLAG}")||matchMedia("(prefers-reduced-motion: reduce), (max-width: 767px)").matches)document.documentElement.setAttribute("data-noloader","")}catch(e){document.documentElement.setAttribute("data-noloader","")}`;

/**
 * First-visit intro on desktop (≤ 1.6s, skippable): the wordmark strokes in, a sun dot rises
 * behind it, then the layer wipes upward. Pure CSS so it paints before any
 * JavaScript runs; JS only remembers the visit and handles "skip".
 */
export function Loader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el || root.hasAttribute("data-noloader")) return;
    try {
      sessionStorage.setItem(LOADER_FLAG, "1");
    } catch {}
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      root.setAttribute("data-noloader", "");
      window.dispatchEvent(new Event("fz:intro-done"));
    };
    const skip = () => {
      el.classList.add("loader-skip");
      window.setTimeout(finish, 450);
    };
    el.addEventListener("animationend", (e) => e.animationName === "loader-wipe" && finish());
    const t = window.setTimeout(finish, 1700); // safety net
    window.addEventListener("keydown", skip, { once: true });
    el.addEventListener("pointerdown", skip, { once: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  return (
    <div ref={ref} className="loader" aria-hidden="true">
      <svg viewBox="0 0 640 200" className="w-[min(80vw,640px)] overflow-visible">
        <circle className="loader-sun fill-wheat" cx="470" cy="70" r="34" />
        <text x="320" y="130" textAnchor="middle" className="loader-word display fill-ink stroke-ink" style={{ fontSize: 112, strokeWidth: 1.2 }}>
          Farmhouze
        </text>
      </svg>
      <span className="eyebrow absolute bottom-8 left-1/2 -translate-x-1/2 text-muted">Tap to skip</span>
    </div>
  );
}
