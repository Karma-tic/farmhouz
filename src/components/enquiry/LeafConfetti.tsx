"use client";

import { motion, useReducedMotion } from "motion/react";
import { mulberry32 } from "@/lib/utils";

/** Ten SVG leaves that drift down over 1.2s. Skipped for reduced motion. */
export function LeafConfetti() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const r = mulberry32(11);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 10 }, (_, i) => {
        const x = 8 + r() * 84;
        const rot = r() * 360;
        const color = ["var(--sage)", "var(--wheat)", "var(--terra)"][i % 3];
        return (
          <motion.svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute top-0 size-5"
            style={{ left: `${x}%` }}
            initial={{ y: -30, rotate: rot, opacity: 0 }}
            animate={{ y: 260 + r() * 140, x: (r() - 0.5) * 120, rotate: rot + (r() - 0.5) * 540, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, delay: r() * 0.2, ease: "easeOut" }}
          >
            <path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15Zm0 0 9-9" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </motion.svg>
        );
      })}
    </div>
  );
}
