"use client";

import { BedDouble, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import { Button } from "@/components/ui/button";
import { getArea, getCity } from "@/content/cities";
import { fromPrice } from "@/content/farmhouses";
import { formatPrice, site } from "@/content/site";
import type { Farmhouse } from "@/content/types";

export function FarmHero({ farm }: { farm: Farmhouse }) {
  const { openEnquiry } = useEnquiry();
  const area = getArea(farm.city, farm.area);
  const city = getCity(farm.city);
  const price = fromPrice(farm);
  return (
    <section data-daylight="0.06" aria-labelledby="farm-title" className="relative h-[92svh] min-h-[560px] overflow-hidden">
      <ViewTransition name={`farm-${farm.slug}`} share="morph" default="none">
        <div className="absolute inset-0">
          <Image src={farm.cover.src} alt={farm.cover.alt} fill preload sizes="100vw" className="object-cover" />
        </div>
      </ViewTransition>
      <div aria-hidden="true" className="scrim-bottom absolute inset-x-0 bottom-0 h-[86%]" />
      <div className="theme-night absolute inset-x-0 bottom-0 pb-[max(2.5rem,7vh)]">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="hero-fade eyebrow mb-5 text-moon/85" style={{ "--i": 2 } as React.CSSProperties}>
            <Link href={`/${farm.city}`} className="link-draw">
              {city?.name}
            </Link>{" "}
            /{" "}
            <Link href={`/${farm.city}?area=${farm.area}`} className="link-draw">
              {area?.name}
            </Link>
            {farm.sample && site.previewMode && <span className="ml-3 rounded-full bg-moon/15 px-2.5 py-1">Sample listing</span>}
          </nav>
          <h1 id="farm-title" className="display display-xl max-w-[16ch] text-moon">
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="hero-line block">{farm.name}</span>
            </span>
          </h1>
          <p className="hero-fade mt-4 max-w-xl text-lg text-moon/90" style={{ "--i": 3 } as React.CSSProperties}>
            {farm.tagline}
          </p>
          <ul className="hero-fade eyebrow mt-5 flex flex-wrap gap-x-5 gap-y-2 text-moon/85" style={{ "--i": 4 } as React.CSSProperties}>
            <li className="flex items-center gap-2">
              <MapPin className="size-4" strokeWidth={1.5} aria-hidden="true" /> {farm.kmFromCentre} km · {farm.driveTime}
            </li>
            <li className="flex items-center gap-2">
              <Users className="size-4" strokeWidth={1.5} aria-hidden="true" /> up to {farm.capacity.eventGuests} guests
            </li>
            <li className="flex items-center gap-2">
              <BedDouble className="size-4" strokeWidth={1.5} aria-hidden="true" /> {farm.capacity.bedrooms} rooms · sleeps {farm.capacity.sleeps}
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" className="hero-fade" style={{ "--i": 5 } as React.CSSProperties} onClick={() => openEnquiry({ farmSlug: farm.slug })} data-cursor="Book">
              Request to book
            </Button>
            <Button asChild size="lg" variant="outline" className="hero-fade text-moon" style={{ "--i": 6 } as React.CSSProperties}>
              <a href="#book">Check dates</a>
            </Button>
            <p className="hero-fade font-mono text-sm uppercase tracking-[0.12em] text-moon/85" style={{ "--i": 7 } as React.CSSProperties}>
              from <span className="text-lg text-moon">{formatPrice(price.amount)}</span> / {price.unit}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
