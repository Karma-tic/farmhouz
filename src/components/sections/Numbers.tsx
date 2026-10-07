"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/content/site";

/** One odometer digit: a 0–9 strip that rolls into place with a motion blur. */
function Digit({ d, go, delay }: { d: number; go: boolean; delay: number }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-top" aria-hidden="true">
      <span
        className="flex flex-col"
        style={{
          transform: `translateY(${go ? -d : 0}em)`,
          filter: go ? "blur(0px)" : "blur(6px)",
          transition: `transform 1.4s cubic-bezier(.22,1,.36,1) ${delay}ms, filter 1.2s ease-out ${delay}ms`,
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="h-[1em] leading-none">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

function BlurNumber({ value, suffix, go }: { value: number; suffix: string; go: boolean }) {
  const digits = String(value).split("").map(Number);
  return (
    <span className="display inline-flex items-baseline text-[clamp(3.25rem,7vw,6rem)] leading-none tabular-nums">
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      {digits.map((d, i) => (
        <Digit key={i} d={d} go={go} delay={i * 90} />
      ))}
      {suffix && (
        <span aria-hidden="true" className="ml-1 font-mono text-[0.28em] font-medium uppercase tracking-[0.12em] text-sage">
          {suffix.trim()}
        </span>
      )}
    </span>
  );
}

export function Numbers() {
  const ref = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGo(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setGo(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section data-daylight="0.16" aria-labelledby="numbers-title" className="relative py-[clamp(5rem,12vw,10rem)]">
      <div className="container-x">
        <Reveal className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 id="numbers-title" className="display display-md max-w-[18ch]">
            An escape that starts <span className="italic-soft text-terra">{site.location.driveTime}</span> from the city.
          </h2>
          <p className="eyebrow text-muted">Escape in numbers · 07:30 AM</p>
        </Reveal>
        <div ref={ref} className="grid grid-cols-2 gap-x-6 gap-y-12 border-t border-line pt-10 lg:grid-cols-4">
          {site.numbers.map((n) => (
            <div key={n.label} className="flex flex-col gap-3">
              <BlurNumber value={n.value} suffix={n.suffix} go={go} />
              <p className="max-w-[22ch] text-muted">{n.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
