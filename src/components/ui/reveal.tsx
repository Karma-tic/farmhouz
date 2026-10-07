"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/** Fades/lifts children in once when they scroll into view (700ms, ease-out). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "p" | "header";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={cn(className)}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  className,
  id,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  className?: string;
  id?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal as="header" className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p className="eyebrow mb-4 text-sage">{eyebrow}</p>
      <h2 id={id} className="display display-lg text-ink">
        {title}
      </h2>
      {intro && <p className="mt-5 max-w-xl text-pretty text-muted [.text-center_&]:mx-auto">{intro}</p>}
    </Reveal>
  );
}
