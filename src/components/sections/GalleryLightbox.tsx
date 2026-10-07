"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import { useCallback, useRef } from "react";
import { setScrollLocked } from "@/components/providers/SmoothScroll";
import { Button } from "@/components/ui/button";
import type { GalleryPhoto } from "@/content/site";

export default function Lightbox({
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

