"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/reveal";
import { site, type Review } from "@/content/site";
import { cn } from "@/lib/utils";

function Card({ r }: { r: Review }) {
  return (
    <figure className="rounded-[var(--radius-card)] border border-line bg-card p-6 shadow-soft">
      <blockquote className="text-pretty">&ldquo;{r.text}&rdquo;</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        {r.photo && <Image src={r.photo} alt="" width={44} height={44} className="size-11 rounded-full object-cover" />}
        <span>
          <span className="block font-medium">{r.name}</span>
          <span className="eyebrow text-muted">
            {r.occasion} · {new Date(`${r.date}T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Real guest reviews only. Renders nothing until site.reviews has entries. */
export function Reviews() {
  const reviews = site.reviews;
  const [paused, setPaused] = useState(false);
  if (reviews.length === 0) return null;
  const cols = [reviews.filter((_, i) => i % 2 === 0), reviews.filter((_, i) => i % 2 === 1)];

  return (
    <section data-daylight="0.74" aria-labelledby="reviews-title" className="py-[clamp(5rem,12vw,9rem)]">
      <div className="container-x">
        <div className="mb-10 flex items-end justify-between gap-6">
          <SectionHeading id="reviews-title" eyebrow="Guests say · 08:00 PM" title="Kind words." />
          <Button variant="outline" size="icon" className="text-ink motion-reduce:hidden" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play reviews" : "Pause reviews"}>
            {paused ? <Play /> : <Pause />}
          </Button>
        </div>
        {/* scrolling columns */}
        <div className="relative grid h-[640px] grid-cols-1 gap-5 overflow-hidden [mask-image:linear-gradient(transparent,black_12%,black_88%,transparent)] md:grid-cols-2 motion-reduce:hidden">
          {cols.map((c, ci) => (
            <div
              key={ci}
              className={cn("flex flex-col gap-5", ci === 1 && "hidden md:flex")}
              style={{
                animation: `${ci === 0 ? "marquee-up" : "marquee-down"} ${Math.max(20, c.length * 8)}s linear infinite`,
                animationPlayState: paused ? "paused" : "running",
              }}
            >
              {[...c, ...c].map((r, i) => (
                <Card key={i} r={r} />
              ))}
            </div>
          ))}
        </div>
        {/* reduced motion: static grid */}
        <div className="hidden gap-5 md:grid-cols-2 motion-reduce:grid">
          {reviews.map((r, i) => (
            <Card key={i} r={r} />
          ))}
        </div>
      </div>
    </section>
  );
}
