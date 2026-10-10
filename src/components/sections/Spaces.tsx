"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { SectionHeading } from "@/components/ui/reveal";
import type { Farmhouse, Media } from "@/content/types";

/** One stop on the walk-through: a space of a farm, or a whole farmhouse on the homepage */
export type WalkItem = { id: string; name: string; description: string; chips: readonly string[]; image: Media; href?: string; kicker?: string };

function More({ href, name }: { href?: string; name: string }) {
  if (!href) return null;
  return (
    <Link href={href} className="link-draw mt-7 inline-flex min-h-11 items-center gap-2 font-medium text-sage" data-cursor="View">
      See {name} <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
    </Link>
  );
}
import { usePinTimeline } from "@/lib/motion/usePinTimeline";


function Chips({ chips }: { chips: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Highlights">
      {chips.map((c) => (
        <li key={c} className="eyebrow rounded-full border border-line bg-card/70 px-3 py-1.5 text-muted">
          {c}
        </li>
      ))}
    </ul>
  );
}

/**
 * Supporting moment — a pinned walk through the farm. Desktop pins for ~300vh:
 * photos crossfade and slowly zoom on the left while the copy swaps on the right.
 * Mobile is a snap carousel; reduced motion is a plain stacked list.
 */
export function Spaces({
  farm,
  items,
  id = "spaces",
  eyebrow = "The spaces · 10:00 AM",
  title,
  intro,
  action,
}: {
  farm?: Farmhouse;
  items?: WalkItem[];
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  intro?: string;
  action?: React.ReactNode;
}) {
  const spaces: WalkItem[] = items ?? farm?.spaces ?? [];
  const pinRef = useRef<HTMLDivElement>(null);

  usePinTimeline(
    pinRef,
    ({ tl, root, gsap }) => {
      const photos = gsap.utils.toArray<HTMLElement>(".sp-photo", root);
      const texts = gsap.utils.toArray<HTMLElement>(".sp-text", root);
      gsap.set(photos.slice(1), { autoAlpha: 0 });
      gsap.set(texts.slice(1), { autoAlpha: 0, y: 40 });
      tl.to(root.querySelector(".sp-progress"), { scaleY: 1, duration: spaces.length }, 0);
      photos.forEach((p, i) => {
        tl.fromTo(p.querySelector("img"), { scale: 1 }, { scale: 1.08, duration: 1.4 }, Math.max(0, i - 0.2));
        if (i === 0) return;
        tl.to(photos[i], { autoAlpha: 1, duration: 0.35, ease: "power1.inOut" }, i - 0.2)
          .to(texts[i - 1], { autoAlpha: 0, y: -40, duration: 0.3, ease: "power2.in" }, i - 0.25)
          .to(texts[i], { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, i - 0.05)
          .to(root.querySelectorAll(".sp-count"), { yPercent: -100 * i, duration: 0.35, ease: "power2.inOut" }, i - 0.2);
      });
      tl.to({}, { duration: 0.6 });
    },
    { length: `+=${spaces.length * 75}%` },
    // spaces differ per farmhouse; the hook reads them once per mount
  );

  return (
    <section id={id} data-daylight="0.34" aria-labelledby={`${id}-title`} className="relative">
      <div className="container-x flex flex-col justify-between gap-8 pb-12 pt-8 md:flex-row md:items-end md:pb-16">
        <SectionHeading
          id={`${id}-title`}
          eyebrow={eyebrow}
          title={
            title ?? (
              <>
                Walk the farm, <span className="italic-soft text-terra">one corner</span> at a time.
              </>
            )
          }
          intro={intro ?? (farm ? `${farm.acres} acres, and all of it is yours for the day.` : undefined)}
        />
        {action}
      </div>

      {/* Desktop: pinned walk-through */}
      <div ref={pinRef} className="hidden h-svh items-center md:motion-safe:flex">
        <div className="container-x grid w-full grid-cols-12 items-center gap-10">
          <div className="relative col-span-7 aspect-[4/3] max-h-[78svh] overflow-hidden rounded-[var(--radius-card)] shadow-lift">
            {spaces.map((s) => (
              <div key={s.id} className="sp-photo absolute inset-0">
                <Image src={s.image.src} alt={s.image.alt} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="relative col-span-5 flex h-[60svh] gap-8">
            <div aria-hidden="true" className="relative w-px bg-line">
              <div className="sp-progress absolute inset-0 origin-top scale-y-0 bg-sage" />
            </div>
            <div className="relative flex-1">
              <div className="eyebrow mb-6 flex h-[1.4em] gap-1 overflow-hidden text-sage" aria-hidden="true">
                <span className="flex flex-col">
                  {spaces.map((s, i) => (
                    <span key={s.id} className="sp-count h-[1.4em]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  ))}
                </span>
                <span>/ {String(spaces.length).padStart(2, "0")}</span>
              </div>
              {spaces.map((s) => (
                <div key={s.id} className="sp-text absolute inset-x-0 top-16">
                  {s.kicker && <p className="eyebrow mb-3 text-sage">{s.kicker}</p>}
                  <h3 className="display display-lg mb-5">{s.name}</h3>
                  <p className="mb-7 max-w-[34ch] text-lg text-muted">{s.description}</p>
                  <Chips chips={s.chips} />
                  <More href={s.href} name={s.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop, reduced motion: plain stacked list */}
      <ul className="container-x hidden gap-16 pb-24 md:motion-reduce:grid">
        {spaces.map((s) => (
          <li key={s.id} className="grid grid-cols-12 items-center gap-10">
            <div className="relative col-span-7 aspect-[4/3] overflow-hidden rounded-[var(--radius-card)]">
              <Image src={s.image.src} alt={s.image.alt} fill sizes="58vw" className="object-cover" />
            </div>
            <div className="col-span-5">
              {s.kicker && <p className="eyebrow mb-3 text-sage">{s.kicker}</p>}
              <h3 className="display display-md mb-4">{s.name}</h3>
              <p className="mb-6 text-muted">{s.description}</p>
              <Chips chips={s.chips} />
              <More href={s.href} name={s.name} />
            </div>
          </li>
        ))}
      </ul>

      {/* Mobile: snap carousel */}
      <ul
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-16 md:hidden"
        aria-label={typeof eyebrow === "string" ? eyebrow : "Walk-through"}
      >
        {spaces.map((s) => (
          <li key={s.id} className="w-[85vw] shrink-0 snap-center">
            <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] shadow-soft">
              <Image src={s.image.src} alt={s.image.alt} fill sizes="85vw" className="object-cover" />
            </div>
            {s.kicker && <p className="eyebrow mb-2 text-sage">{s.kicker}</p>}
            <h3 className="display display-md mb-3">{s.name}</h3>
            <p className="mb-5 text-muted">{s.description}</p>
            <Chips chips={s.chips} />
            <More href={s.href} name={s.name} />
          </li>
        ))}
      </ul>
    </section>
  );
}
