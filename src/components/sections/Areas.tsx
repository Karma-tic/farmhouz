"use client";

import Link from "next/link";
import { useState } from "react";
import { AreaMap } from "@/components/farm/AreaMap";
import { Reveal, SectionHeading } from "@/components/ui/reveal";
import { getCity } from "@/content/cities";
import { farmhousesIn } from "@/content/farmhouses";

/** Where the farmhouses are: stylised Bhopal map + area list. */
export function Areas() {
  const city = getCity("bhopal")!;
  const farms = farmhousesIn("bhopal");
  const [active, setActive] = useState<string | null>(null);
  return (
    <section id="areas" data-daylight="0.84" aria-labelledby="areas-title" className="theme-night relative bg-[color-mix(in_oklab,var(--night)_88%,transparent)] py-[clamp(5rem,12vw,9rem)]">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <SectionHeading
            id="areas-title"
            eyebrow="Where · 08:40 PM"
            title={
              <>
                Close enough. <span className="italic-soft text-wheat">Far enough.</span>
              </>
            }
            intro={city.tagline}
          />
          <Reveal delay={0.1} className="mt-8">
            <ul className="divide-y divide-line border-y border-line">
              {city.areas.map((a) => {
                const n = farms.filter((f) => f.area === a.slug).length;
                return (
                  <li key={a.slug}>
                    <Link
                      href={`/bhopal?area=${a.slug}`}
                      onPointerEnter={() => setActive(farms.find((f) => f.area === a.slug)?.slug ?? null)}
                      onPointerLeave={() => setActive(null)}
                      className="group flex min-h-14 items-center justify-between gap-4 py-3"
                    >
                      <span>
                        <span className="font-medium text-moon group-hover:text-wheat">{a.name}</span>
                        <span className="block text-sm text-night-muted">{a.blurb}</span>
                      </span>
                      <span className="eyebrow shrink-0 text-right text-night-muted">
                        {a.driveTime}
                        <br />
                        {n} farm{n === 1 ? "" : "s"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
        <Reveal className="overflow-hidden rounded-[28px] border border-line bg-card/60">
          <AreaMap farms={farms} activeSlug={active} onHover={setActive} />
        </Reveal>
      </div>
    </section>
  );
}
