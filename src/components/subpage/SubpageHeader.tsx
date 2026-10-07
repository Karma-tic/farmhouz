import Image from "next/image";
import { ViewTransition } from "react";
import type { Media } from "@/content/site";

/** Subpage hero: photo morphs in from the matching homepage image via a shared view-transition name. */
export function SubpageHeader({
  eyebrow,
  title,
  intro,
  image,
  transitionName,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  image: Media;
  transitionName: string;
}) {
  return (
    <header data-daylight="0.3" className="container-x pb-14 pt-[calc(var(--header-h)+3rem)]">
      <div className="grid items-end gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="eyebrow mb-4 text-sage">{eyebrow}</p>
          <h1 className="display display-xl">{title}</h1>
          <p className="mt-6 max-w-lg text-lg text-muted">{intro}</p>
        </div>
        <ViewTransition name={transitionName} share="morph" default="none">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] shadow-lift">
            <Image src={image.src} alt={image.alt} fill preload sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
          </div>
        </ViewTransition>
      </div>
    </header>
  );
}
