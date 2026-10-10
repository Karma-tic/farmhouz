"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { setScrollLocked } from "@/components/providers/SmoothScroll";
import { SectionHeading } from "@/components/ui/reveal";
import type { Farmhouse, GalleryPhoto } from "@/content/types";

const Lightbox = dynamic(() => import("@/components/sections/GalleryLightbox"), { ssr: false });
const RATIOS = [1.5, 0.8, 1.33, 1, 0.75, 1.5, 1, 0.8];

export function FarmGallery({ farm }: { farm: Farmhouse }) {
  const list: GalleryPhoto[] = [farm.cover, ...farm.spaces.map((s) => s.image), ...farm.gallery].map((m, i) => ({ ...m, category: "Stays", ratio: RATIOS[i % RATIOS.length] }));
  const [index, setIndex] = useState<number | null>(null);
  return (
    <section id="gallery" data-daylight="0.58" aria-labelledby="gallery-title" className="py-[clamp(5rem,12vw,9rem)]">
      <div className="container-x">
        <SectionHeading
          id="gallery-title"
          eyebrow="Photos · 05:10 PM"
          title={
            <>
              A look <span className="italic-soft text-terra">around</span>.
            </>
          }
        />
        <ul className="mt-10 columns-2 gap-3 md:columns-3 md:gap-5">
          {list.map((p, i) => (
            <li key={`${p.src}-${i}`} className="mb-3 break-inside-avoid md:mb-5">
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
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 32vw, 48vw" className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      {index !== null && <Lightbox list={list} index={index} onIndex={setIndex} onClose={() => setIndex(null)} />}
    </section>
  );
}
