"use client";

import { ArrowUpRight, BedDouble, Car, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { getArea } from "@/content/cities";
import { fromPrice } from "@/content/farmhouses";
import { formatPrice, site } from "@/content/site";
import type { Farmhouse } from "@/content/types";
import { cn } from "@/lib/utils";

/** Listing card with a 3D tilt (≤ 6°) and wheat spotlight on desktop. */
export function FarmCard({
  farm,
  availability,
  onHover,
  active,
  priority,
  query,
}: {
  farm: Farmhouse;
  /** "free" | "booked" when dates are chosen */
  availability?: "free" | "booked" | null;
  onHover?: (slug: string | null) => void;
  active?: boolean;
  priority?: boolean;
  /** search params to carry into the farmhouse page (dates, guests) */
  query?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const area = getArea(farm.city, farm.area);
  const price = fromPrice(farm);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 10}deg`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
    onHover?.(null);
  };

  return (
    <div className="[perspective:1200px]">
      <Link
        ref={ref}
        href={`/${farm.city}/${farm.slug}${query ? `?${query}` : ""}`}
        onPointerMove={onMove}
        onPointerEnter={() => onHover?.(farm.slug)}
        onPointerLeave={onLeave}
        onFocus={() => onHover?.(farm.slug)}
        onBlur={() => onHover?.(null)}
        data-cursor="View"
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border bg-card text-left shadow-soft transition-[transform,box-shadow,border-color] duration-[var(--dur-ui)] ease-[var(--ease-out)] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d] hover:shadow-lift",
          active ? "border-wheat" : "border-line",
          availability === "booked" && "opacity-70",
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-[var(--dur-ui)] group-hover:opacity-100"
          style={{ background: "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--wheat) 22%, transparent), transparent 60%)" }}
        />
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={farm.cover.src}
            alt={farm.cover.alt}
            fill
            preload={priority}
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw"
            className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04]"
          />
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
            {farm.sample && site.previewMode && <span className="eyebrow rounded-full bg-ink/80 px-2.5 py-1 text-[0.66rem] text-cream backdrop-blur">Sample</span>}
            {availability === "free" && <span className="eyebrow rounded-full bg-sage px-2.5 py-1 text-[0.66rem] text-cream">Free on your dates</span>}
            {availability === "booked" && <span className="eyebrow rounded-full bg-terra px-2.5 py-1 text-[0.66rem] text-cream">Booked on your dates</span>}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <p className="eyebrow text-sage">
              {area?.name} · {farm.driveTime} from city
            </p>
            <h3 className="display mt-1.5 text-[1.85rem] leading-none">{farm.name}</h3>
            <p className="mt-2 line-clamp-2 text-[0.95rem] text-muted">{farm.tagline}</p>
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <li className="inline-flex items-center gap-1.5">
              <Users className="size-4" strokeWidth={1.5} aria-hidden="true" /> {farm.capacity.eventGuests} guests
            </li>
            <li className="inline-flex items-center gap-1.5">
              <BedDouble className="size-4" strokeWidth={1.5} aria-hidden="true" /> sleeps {farm.capacity.sleeps}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Car className="size-4" strokeWidth={1.5} aria-hidden="true" /> {farm.kmFromCentre} km
            </li>
          </ul>
          <div className="mt-auto flex items-end justify-between border-t border-line pt-3">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted">
              from <span className="text-lg font-medium text-ink">{formatPrice(price.amount)}</span> / {price.unit}
            </p>
            <span className="grid size-11 place-items-center rounded-full bg-wheat text-on-wheat transition-transform duration-[var(--dur-ui)] group-hover:rotate-45">
              <ArrowUpRight className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
