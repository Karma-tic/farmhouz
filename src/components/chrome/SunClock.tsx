"use client";

import { useCallback, useRef } from "react";
import { clockAt } from "@/lib/motion/daylight";
import { useDaylightListener } from "@/lib/motion/useDaylight";

/**
 * Fixed time-of-day readout: the page's progress indicator. A sun (then moon)
 * travels along a small arc while the clock runs 06:00 AM → 11:48 PM.
 */
export function SunClock() {
  const timeRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const sunRef = useRef<SVGCircleElement>(null);
  const moonRef = useRef<SVGPathElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const onDaylight = useCallback((d: number) => {
    if (timeRef.current) timeRef.current.textContent = clockAt(d);
    // arc from (6,30) through top to (58,30)
    const a = Math.PI * (1 - d);
    const x = 32 + Math.cos(a) * 26;
    const y = 30 - Math.sin(a) * 22;
    dotRef.current?.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    const night = d > 0.78;
    sunRef.current?.setAttribute("opacity", night ? "0" : "1");
    moonRef.current?.setAttribute("opacity", night ? "1" : "0");
    rootRef.current?.classList.toggle("theme-night", night);
  }, []);
  useDaylightListener(onDaylight);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="sun-clock pointer-events-none fixed bottom-4 left-4 z-40 hidden items-center gap-2 rounded-full border border-line bg-card/75 py-1.5 pl-2 pr-3.5 shadow-soft backdrop-blur-md transition-colors duration-500 md:flex"
    >
      <svg viewBox="0 0 64 34" className="h-6 w-11 text-muted">
        <path d="M6 30 A 26 22 0 0 1 58 30" fill="none" stroke="currentColor" strokeDasharray="2 3" strokeWidth="1" />
        <path d="M2 30 H62" stroke="currentColor" strokeWidth="1" />
        <g ref={dotRef} transform="translate(6 30)">
          <circle ref={sunRef} r="4.5" className="fill-wheat" />
          <path ref={moonRef} d="M2.5 -4 A4.5 4.5 0 1 0 4 3 A3.5 3.5 0 1 1 2.5 -4Z" className="fill-moon" opacity="0" />
        </g>
      </svg>
      <span ref={timeRef} className="eyebrow tabular-nums text-ink">
        06:00 AM
      </span>
    </div>
  );
}
