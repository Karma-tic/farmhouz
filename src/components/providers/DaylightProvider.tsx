"use client";

import { useEffect } from "react";
import { skyAt } from "@/lib/motion/daylight";
import { daylightStore } from "@/lib/motion/useDaylight";

/**
 * Maps page scroll to a 0→1 "daylight" value. Every section declares where it
 * sits in the day with `data-daylight="0.36"`; between sections the value is
 * interpolated using the viewport centre, so the sky follows the story even when
 * sections change height. Writes CSS variables on <html> for the sky, light tint
 * and shadow angle.
 */
export function DaylightProvider() {
  useEffect(() => {
    const root = document.documentElement;
    let anchors: { y: number; d: number }[] = [];
    let raf = 0;
    let last = -1;

    const measure = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-daylight]"));
      anchors = els
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { y: r.top + window.scrollY + Math.min(r.height, window.innerHeight) / 2, d: Number(el.dataset.daylight) };
        })
        .sort((a, b) => a.y - b.y);
      // the very bottom of the page is always deep night
      const end = document.documentElement.scrollHeight - window.innerHeight / 2;
      if (!anchors.length || anchors[anchors.length - 1].y < end) anchors.push({ y: end, d: 1 });
      last = -1;
      update();
    };

    const valueAt = (y: number) => {
      if (!anchors.length) return 0;
      if (y <= anchors[0].y) return anchors[0].d;
      for (let i = 0; i < anchors.length - 1; i++) {
        const a = anchors[i], b = anchors[i + 1];
        if (y <= b.y) return a.d + ((b.d - a.d) * (y - a.y)) / Math.max(1, b.y - a.y);
      }
      return anchors[anchors.length - 1].d;
    };

    const update = () => {
      raf = 0;
      // a page can pin the time of day (e.g. the booking tracker follows the booking's status)
      const fixed = root.dataset.daylightFixed;
      const d = fixed ? Number(fixed) : valueAt(window.scrollY + window.innerHeight / 2);
      if (Math.abs(d - last) < 0.0005) return;
      last = d;
      const s = skyAt(d);
      root.style.setProperty("--daylight", d.toFixed(4));
      root.style.setProperty("--sky-top", s.top);
      root.style.setProperty("--sky-bottom", s.bottom);
      root.style.setProperty("--sky-veil", s.veil.toFixed(3));
      root.style.setProperty("--tint", s.tint);
      // the sun travels east → west: shadows swing from long-left to long-right
      root.style.setProperty("--shadow-x", `${Math.round(-24 + d * 48)}px`);
      root.dataset.phase = s.phase;
      daylightStore.set(d, s.phase);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    const force = () => {
      last = -1;
      update();
    };
    window.addEventListener("fz:daylight", force);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("fz:daylight", force);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="sky" aria-hidden="true" />
      <div className="sky-tint" aria-hidden="true" />
    </>
  );
}
