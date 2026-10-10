"use client";

import { Check, Flame, Phone, Send, Wallet } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

const icons = { request: Send, checking: Phone, pay: Wallet, booked: Flame } as const;

/**
 * The booking journey drawn as one day: a sun arcs over four stops from dawn
 * (request) to bonfire (booked). `progress` 0→3 lights the stops (fractions animate the sun).
 */
export function DayPath({
  progress,
  pulse = false,
  className,
  labels = site.steps,
  tone = "auto",
}: {
  progress: number;
  /** pulse the current stop (we're working on it) */
  pulse?: boolean;
  className?: string;
  labels?: { id: string; time: string; title: string; body?: string }[];
  tone?: "auto" | "night";
}) {
  const reduce = useReducedMotion();
  const n = labels.length;
  const t = Math.max(0, Math.min(n - 1, progress)) / (n - 1);
  // arc from (40,150) over (500,20) to (960,150) — quadratic Bézier
  const P0 = { x: 40, y: 150 }, P1 = { x: 500, y: -60 }, P2 = { x: 960, y: 150 };
  const at = (u: number) => ({
    x: (1 - u) ** 2 * P0.x + 2 * (1 - u) * u * P1.x + u * u * P2.x,
    y: (1 - u) ** 2 * P0.y + 2 * (1 - u) * u * P1.y + u * u * P2.y,
  });
  const sun = at(t);
  const night = t > 0.95;

  return (
    <div className={cn("relative", className)}>
      {/* desktop arc */}
      <svg viewBox="0 0 1000 170" className="hidden h-auto w-full overflow-visible md:block" aria-hidden="true">
        <path d={`M${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`} fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="3 7" />
        <motion.path
          d={`M${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`}
          fill="none"
          stroke="var(--wheat)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: t }}
          transition={{ duration: reduce ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <line x1="0" y1="150" x2="1000" y2="150" stroke="var(--line)" strokeWidth="1" />
        <motion.g initial={false} animate={{ x: sun.x, y: sun.y }} transition={{ duration: reduce ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}>
          <circle r="34" fill={night ? "var(--ember)" : "var(--wheat)"} opacity=".18" />
          <circle r="16" fill={night ? "var(--ember)" : "var(--wheat)"} />
        </motion.g>
      </svg>

      <ol className="grid gap-6 md:-mt-6 md:grid-cols-4 md:gap-4">
        {labels.map((s, i) => {
          const Icon = icons[s.id as keyof typeof icons] ?? Check;
          const done = progress > i || (progress >= n - 1 && i === n - 1);
          const current = Math.floor(progress) === i && progress < n - 1;
          return (
            <li key={s.id} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
              {/* mobile rail */}
              {i < n - 1 && <span aria-hidden="true" className={cn("absolute left-[21px] top-12 h-[calc(100%-1.5rem)] w-px md:hidden", done ? "bg-wheat" : "bg-line")} />}
              <span
                className={cn(
                  "relative z-10 grid size-11 shrink-0 place-items-center rounded-full border transition-colors duration-500",
                  done ? "border-wheat bg-wheat text-on-wheat" : current ? "border-sage bg-card text-sage" : "border-line bg-card text-muted",
                  tone === "night" && !done && !current && "bg-night",
                )}
              >
                {current && pulse && !reduce && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full border-2 border-sage/60" />}
                {done && i < n - 1 ? <Check className="size-5" strokeWidth={1.5} aria-hidden="true" /> : <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />}
              </span>
              <div>
                <p className={cn("eyebrow", done || current ? "text-sage" : "text-muted")}>{s.time}</p>
                <h3 className={cn("display mt-1 text-[1.45rem] leading-tight", !(done || current) && "text-muted")}>
                  {s.title}
                  <span className="sr-only">{done ? " (done)" : current ? " (in progress)" : ""}</span>
                </h3>
                {s.body && <p className="mx-auto mt-1.5 max-w-[30ch] text-[0.95rem] text-muted">{s.body}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
