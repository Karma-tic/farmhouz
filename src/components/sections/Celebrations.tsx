"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

const items = site.occasions;
const words = site.rotatingWords;

function RotatingWord() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <span className="relative inline-flex overflow-hidden pb-[0.12em] align-bottom">
      <span className="sr-only">{words.join(", ")}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[i]}
          aria-hidden="true"
          className="italic-soft inline-block text-terra"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Celebrations() {
  const [active, setActive] = useState(0);
  const { openEnquiry } = useEnquiry();

  return (
    <section id="celebrations" data-daylight="0.64" aria-labelledby="celebrations-title" className="relative pb-[clamp(5rem,12vw,9rem)]">
      <div className="container-x">
        <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <Reveal as="header" className="max-w-4xl">
          <p className="eyebrow mb-4 text-sage">Celebrations · 06:15 PM</p>
          <h2 id="celebrations-title" className="display display-lg">
            Make it yours. <br />
            <RotatingWord />
          </h2>
          <p className="mt-5 max-w-xl text-muted">
            Lawns for 300, rooms for the family, your own decorators and caterers. Tell us the occasion and we&apos;ll shortlist the right farms.
          </p>
        </Reveal>
        </div>

        {/* Desktop: image accordion */}
        <div className="hidden h-[min(78svh,680px)] gap-3 md:flex">
          {items.map((c, i) => {
            const open = active === i;
            return (
              <div
                key={c.id}
                onPointerEnter={() => setActive(i)}
                className={cn(
                  "group relative min-w-0 overflow-hidden rounded-[var(--radius-card)] shadow-soft transition-[flex-grow] duration-700 ease-[var(--ease-out)]",
                  open ? "grow-[5]" : "grow",
                )}
                style={{ flexBasis: 0 }}
              >
                <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <div aria-hidden="true" className="scrim-bottom absolute inset-0" />
                <div className="theme-night absolute inset-0 flex flex-col justify-end p-6">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`celebration-${c.id}`}
                      onClick={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      className={cn(
                        "display min-h-11 min-w-11 text-left leading-none text-moon transition-all duration-500",
                        open ? "text-[clamp(2rem,3.4vw,3.25rem)]" : "text-[1.5rem] [writing-mode:vertical-rl] rotate-180",
                      )}
                    >
                      {c.name}
                    </button>
                  </h3>
                  <div
                    id={`celebration-${c.id}`}
                    hidden={!open}
                    className="mt-4 max-w-md animate-[fadeUp_.6s_var(--ease-out)_both]"
                  >
                    <p className="mb-5 text-moon/90">{c.description}</p>
                    <Button size="md" onClick={() => openEnquiry({ packageId: c.packageId, occasion: c.name })}>
                      Plan this <ArrowRight />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile: stacked cards */}
        <ul className="flex flex-col gap-4 md:hidden">
          {items.map((c) => (
            <li key={c.id} className="relative overflow-hidden rounded-[var(--radius-card)] shadow-soft">
              <div className="relative aspect-[4/5]">
                <Image src={c.image.src} alt={c.image.alt} fill sizes="100vw" className="object-cover" />
                <div aria-hidden="true" className="scrim-bottom absolute inset-0" />
                <div className="theme-night absolute inset-x-0 bottom-0 p-5">
                  <h3 className="display mb-2 text-[2rem] leading-none text-moon">{c.name}</h3>
                  <p className="mb-4 text-moon/90">{c.description}</p>
                  <Button size="md" onClick={() => openEnquiry({ packageId: c.packageId, occasion: c.name })}>
                      Plan this <ArrowRight />
                    </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
