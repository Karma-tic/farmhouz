"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import { useCallback, useMemo, useRef, useState } from "react";
import { setScrollLocked } from "@/components/providers/SmoothScroll";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/reveal";
import { site, type GalleryCategory, type GalleryPhoto } from "@/content/site";
import { cn } from "@/lib/utils";

const photos = site.gallery.photos as GalleryPhoto[];

/* ------------------------------------------------------------ zoom parallax */
// position (relative to centre) and size of each tile; index 0 is the centre photo
const TILES = [
  { pick: 11, w: 25, h: 25, top: 0, left: 0, scale: 4 },
  { pick: 1, w: 35, h: 30, top: -30, left: 5, scale: 5 },
  { pick: 2, w: 20, h: 45, top: -10, left: -25, scale: 6 },
  { pick: 4, w: 25, h: 25, top: 0, left: 27.5, scale: 5 },
  { pick: 6, w: 20, h: 25, top: 27.5, left: 5, scale: 6 },
  { pick: 8, w: 30, h: 25, top: 27.5, left: -22.5, scale: 8 },
  { pick: 13, w: 15, h: 15, top: 22.5, left: 25, scale: 9 },
];

function ZoomTile({ t, progress }: { t: (typeof TILES)[number]; progress: MotionValue<number> }) {
  const scale = useTransform(progress, [0, 1], [1, t.scale]);
  const p = photos[t.pick];
  return (
    <motion.div style={{ scale }} className="absolute inset-0 flex items-center justify-center">
      <div
        className="relative overflow-hidden rounded-[calc(var(--radius-card)/2)]"
        style={{ width: `${t.w}vw`, height: `${t.h}vh`, top: `${t.top}vh`, left: `${t.left}vw` }}
      >
        <Image src={p.src} alt={p.alt} fill sizes={`${Math.min(100, t.w * t.scale)}vw`} className="object-cover" />
      </div>
    </motion.div>
  );
}

function ZoomParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <div ref={ref} className="relative hidden h-[300vh] md:motion-safe:block" aria-label="Photo montage">
      <div className="sticky top-0 h-svh overflow-hidden">
        {TILES.map((t, i) => (
          <ZoomTile key={i} t={t} progress={scrollYProgress} />
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- lightbox */
function Lightbox({
  list,
  index,
  onIndex,
  onClose,
}: {
  list: GalleryPhoto[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const open = index !== null;
  const p = index !== null ? list[index] : null;
  const go = useCallback(
    (d: number) => index !== null && onIndex((index + d + list.length) % list.length),
    [index, list.length, onIndex],
  );
  const touch = useRef<number | null>(null);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setScrollLocked(o);
        if (!o) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[85] bg-night/92 backdrop-blur-sm" />
        <Dialog.Content
          className="theme-night fixed inset-0 z-[86] flex flex-col outline-none"
          aria-describedby={undefined}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touch.current = null;
          }}
        >
          <div className="container-x flex h-[var(--header-h)] items-center justify-between">
            <Dialog.Title className="eyebrow text-moon">
              {p?.category} · {index !== null ? index + 1 : 0} / {list.length}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close gallery" className="text-moon">
                <X />
              </Button>
            </Dialog.Close>
          </div>
          <div className="relative flex-1">
            <AnimatePresence initial={false} mode="popLayout">
              {p && (
                <motion.figure
                  key={p.src}
                  className="absolute inset-x-[var(--gutter)] inset-y-0 m-0 flex flex-col items-center justify-center gap-4 pb-6"
                  initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="relative h-full w-full">
                    <Image src={p.src} alt={p.alt} fill sizes="100vw" className="object-contain" quality={85} />
                  </div>
                  <figcaption className="text-center text-night-muted">{p.alt}</figcaption>
                </motion.figure>
              )}
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-3">
              <Button variant="outline" size="icon" className="pointer-events-auto bg-night/60 text-moon" onClick={() => go(-1)} aria-label="Previous photo">
                <ChevronLeft />
              </Button>
              <Button variant="outline" size="icon" className="pointer-events-auto bg-night/60 text-moon" onClick={() => go(1)} aria-label="Next photo">
                <ChevronRight />
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ------------------------------------------------------------------ section */
const ALL = "All" as const;
type Filter = GalleryCategory | typeof ALL;

export function Gallery() {
  const [filter, setFilter] = useState<Filter>(ALL);
  const [index, setIndex] = useState<number | null>(null);
  const list = useMemo(() => (filter === ALL ? photos : photos.filter((p) => p.category === filter)), [filter]);
  const tabs: Filter[] = [ALL, ...site.gallery.categories];

  return (
    <section id="gallery" data-daylight="0.58" aria-labelledby="gallery-title" className="relative pt-[clamp(5rem,12vw,9rem)]">
      <div className="container-x mb-10">
        <SectionHeading
          id="gallery-title"
          eyebrow="Moments here · 05:10 PM"
          title={
            <>
              Golden hour, <span className="italic-soft text-terra">every</span> hour.
            </>
          }
          intro="Real days at the farm: birthdays by the pool, haldis on the lawn, quiet mornings with chai."
        />
      </div>

      <ZoomParallax />

      <div className="container-x pb-[clamp(5rem,12vw,9rem)] pt-10 md:pt-20">
        <div role="group" aria-label="Filter photos" className="no-scrollbar -mx-[var(--gutter)] mb-8 flex gap-2 overflow-x-auto px-[var(--gutter)]">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={filter === t}
              onClick={() => setFilter(t)}
              className={cn(
                "relative min-h-11 shrink-0 rounded-full border px-5 text-sm font-medium transition-colors duration-[var(--dur-ui)]",
                filter === t ? "border-ink text-cream" : "border-line bg-card/60 text-ink hover:border-ink/40",
              )}
            >
              {filter === t && (
                <motion.span layoutId="gallery-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 300, damping: 24 }} />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>

        <motion.ul layout className="columns-2 gap-3 md:columns-3 md:gap-5 lg:columns-4" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((p, i) => (
              <motion.li
                key={p.src}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mb-3 break-inside-avoid md:mb-5"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setScrollLocked(true);
                  }}
                  data-cursor="View"
                  className="group relative block w-full overflow-hidden rounded-[calc(var(--radius-card)*0.75)] shadow-soft"
                  style={{ aspectRatio: p.ratio }}
                  aria-label={`Open photo: ${p.alt}`}
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 48vw"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]"
                  />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>

      <Lightbox list={list} index={index} onIndex={setIndex} onClose={() => setIndex(null)} />
    </section>
  );
}
