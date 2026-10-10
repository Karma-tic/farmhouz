"use client";

import { Lock, Navigation } from "lucide-react";
import { AreaMap } from "@/components/farm/AreaMap";
import { Reveal, SectionHeading } from "@/components/ui/reveal";
import { getArea, getCity } from "@/content/cities";
import type { Farmhouse } from "@/content/types";

/** Farmhouse page: where it is (area-level). The exact address comes with the booking pass. */
export function Location({ farm }: { farm: Farmhouse }) {
  const city = getCity(farm.city);
  const area = getArea(farm.city, farm.area);
  return (
    <section id="location" data-daylight="0.84" aria-labelledby="location-title" className="theme-night relative bg-[color-mix(in_oklab,var(--night)_88%,transparent)] py-[clamp(5rem,12vw,9rem)]">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeading
            id="location-title"
            eyebrow="How to reach · 08:40 PM"
            title={
              <>
                {area?.name}, <span className="italic-soft text-wheat">{farm.driveTime}</span> out.
              </>
            }
            intro={`${farm.kmFromCentre} km from ${city?.centre.name}, ${city?.name}. ${area?.blurb ?? ""}`}
          />
          <Reveal delay={0.1} className="mt-8 flex flex-col gap-5">
            <ul className="divide-y divide-line border-y border-line">
              <li className="flex items-center justify-between gap-4 py-3">
                <span>From {city?.centre.name}</span>
                <span className="eyebrow text-night-muted">
                  {farm.kmFromCentre} km · {farm.driveTime}
                </span>
              </li>
              <li className="flex items-center justify-between gap-4 py-3">
                <span>Check-in · check-out</span>
                <span className="eyebrow text-night-muted">
                  {farm.times.checkIn} · {farm.times.checkOut}
                </span>
              </li>
              <li className="flex items-center justify-between gap-4 py-3">
                <span>Day out</span>
                <span className="eyebrow text-night-muted">{farm.times.dayOut}</span>
              </li>
            </ul>
            <p className="flex items-start gap-3 rounded-2xl border border-line p-4 text-night-muted">
              <Lock className="mt-0.5 size-4 shrink-0 text-wheat" strokeWidth={1.5} aria-hidden="true" />
              The exact address, directions and the caretaker&apos;s number come with your booking pass, as soon as your advance is confirmed.
            </p>
            <p className="flex items-center gap-2 text-sm text-night-muted">
              <Navigation className="size-4 text-wheat" strokeWidth={1.5} aria-hidden="true" /> Smooth roads to the gate; any car can manage it.
            </p>
          </Reveal>
        </div>
        <Reveal className="overflow-hidden rounded-[28px] border border-line bg-card/60">
          <AreaMap city={farm.city} farms={[farm]} activeSlug={farm.slug} focusArea={farm.area} linkPins={false} />
        </Reveal>
      </div>
    </section>
  );
}
