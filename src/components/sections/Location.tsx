"use client";

import { Lock } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { project } from "@/components/farm/AreaMap";
import { Reveal, SectionHeading } from "@/components/ui/reveal";
import { getArea, getCity } from "@/content/cities";
import { farmhousesIn } from "@/content/farmhouses";
import { site } from "@/content/site";
import type { Area, Farmhouse } from "@/content/types";

/** A gently curved road from the city to an area, in the map's 700×460 frame */
function road(from: { x: number; y: number }, to: { x: number; y: number }, i: number) {
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  const bend = (i % 2 ? 1 : -1) * 0.22;
  const cx = mx + (to.y - from.y) * bend, cy = my - (to.x - from.x) * bend;
  return `M${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

function Route({ d, area, draw, pin, reduce, delay, label }: { d: string; area: Area; draw: MotionValue<number>; pin: MotionValue<number>; reduce: boolean | null; delay: number; label?: boolean }) {
  const p = project(area.lat, area.lng);
  const len = useTransform(draw, (v) => Math.min(1, Math.max(0, (v - delay) / (1 - delay))));
  const show = useTransform(pin, (v) => Math.min(1, Math.max(0, (v - delay) / (1 - delay))));
  return (
    <g>
      <path d={d} fill="none" stroke="var(--night-muted)" strokeOpacity=".3" strokeWidth="2.5" strokeDasharray="2 8" strokeLinecap="round" />
      <motion.path d={d} fill="none" stroke="var(--wheat)" strokeWidth="3.5" strokeLinecap="round" style={{ pathLength: reduce ? 1 : len }} />
      <motion.g style={{ opacity: reduce ? 1 : show }}>
        <circle cx={p.x} cy={p.y} r="18" fill="var(--ember)" opacity=".22" />
        <circle cx={p.x} cy={p.y} r="8" fill="var(--wheat)" />
        <text x={p.x} y={p.y - 16} textAnchor="middle" className="font-mono" fontSize="11.5" letterSpacing="1.4" fill="var(--moon)" stroke="var(--night)" strokeWidth="4" paintOrder="stroke">
          {area.name.toUpperCase()}
        </text>
        {label && (
          <text x={p.x} y={p.y + 26} textAnchor="middle" className="font-mono" fontSize="11" letterSpacing="1.4" fill="var(--wheat)" stroke="var(--night)" strokeWidth="4" paintOrder="stroke">
            {area.kmFromCentre} KM · {area.driveTime.toUpperCase()}
          </text>
        )}
      </motion.g>
    </g>
  );
}

/**
 * "How to reach" — the route map draws itself on scroll, from the city centre out to
 * each area (homepage) or to this farmhouse's area (farmhouse page).
 */
export function Location({ farm }: { farm?: Farmhouse }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 45%"] });
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const pin = useTransform(scrollYProgress, [0.5, 1], [0, 1]);
  const city = getCity(farm?.city ?? "bhopal")!;
  const centre = project(city.centre.lat, city.centre.lng);
  const area = farm ? getArea(farm.city, farm.area) : undefined;
  const areas = area ? [area] : city.areas;
  const farms = farmhousesIn(city.slug);

  return (
    <section id="location" data-daylight="0.84" aria-labelledby="location-title" className="theme-night relative bg-[color-mix(in_oklab,var(--night)_88%,transparent)] py-[clamp(5rem,12vw,9rem)]">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeading
            id="location-title"
            eyebrow="How to reach · 08:40 PM"
            title={
              farm ? (
                <>
                  {area?.name}, <span className="italic-soft text-wheat">{farm.driveTime}</span> out.
                </>
              ) : (
                <>
                  Close enough. <span className="italic-soft text-wheat">Far enough.</span>
                </>
              )
            }
            intro={farm ? `${farm.kmFromCentre} km from ${city.centre.name}, ${city.name}. ${area?.blurb ?? ""}` : `${city.tagline} Smooth roads all the way to the gate.`}
          />
          <Reveal delay={0.1} className="mt-8">
            <ul className="mb-8 divide-y divide-line border-y border-line">
              {farm ? (
                <>
                  <li className="flex items-center justify-between gap-4 py-3">
                    <span>From {city.centre.name}</span>
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
                </>
              ) : (
                city.areas.map((a) => {
                  const n = farms.filter((f) => f.area === a.slug).length;
                  if (!site.launched)
                    return (
                      <li key={a.slug} className="flex min-h-12 items-center justify-between gap-4 py-3">
                        <span>{a.name}</span>
                        <span className="eyebrow text-night-muted">
                          {a.kmFromCentre} km · {a.driveTime}
                        </span>
                      </li>
                    );
                  return (
                    <li key={a.slug}>
                      <Link href={`/bhopal?area=${a.slug}`} className="group flex min-h-12 items-center justify-between gap-4 py-3">
                        <span className="group-hover:text-wheat">{a.name}</span>
                        <span className="eyebrow text-night-muted">
                          {a.kmFromCentre} km · {a.driveTime} · {n} farm{n === 1 ? "" : "s"}
                        </span>
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
            <p className="flex items-start gap-3 rounded-2xl border border-line p-4 text-night-muted">
              <Lock className="mt-0.5 size-4 shrink-0 text-wheat" strokeWidth={1.5} aria-hidden="true" />
              The exact address, directions and the caretaker&apos;s number come with your booking pass, as soon as your advance is confirmed.
            </p>
          </Reveal>
        </div>

        <div ref={ref} className="relative overflow-hidden rounded-[28px] border border-line bg-card/60">
          <svg viewBox="0 0 700 460" className="h-auto w-full" role="img" aria-label={`Route map from ${city.centre.name}, ${city.name} to ${farm ? area?.name : "the farmhouse areas"} (approximate)`}>
            <defs>
              <pattern id="loc-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0H0V28" fill="none" stroke="var(--line)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="700" height="460" fill="url(#loc-grid)" />
            {/* abstract fields */}
            <g fill="var(--sage)" opacity=".16">
              <rect x="470" y="30" width="120" height="70" rx="10" />
              <rect x="560" y="300" width="110" height="80" rx="10" />
              <rect x="60" y="330" width="140" height="80" rx="10" />
              <rect x="40" y="40" width="110" height="70" rx="10" />
            </g>
            {/* Upper Lake */}
            <path
              d={`M${project(23.255, 77.315).x} ${project(23.255, 77.315).y} C ${project(23.275, 77.33).x} ${project(23.275, 77.33).y}, ${project(23.262, 77.37).x} ${project(23.262, 77.37).y}, ${project(23.252, 77.392).x} ${project(23.252, 77.392).y} C ${project(23.238, 77.38).x} ${project(23.238, 77.38).y}, ${project(23.232, 77.35).x} ${project(23.232, 77.35).y}, ${project(23.255, 77.315).x} ${project(23.255, 77.315).y}Z`}
              fill="var(--night-muted)"
              opacity=".18"
            />
            {areas.map((a, i) => (
              <Route key={a.slug} d={road(centre, project(a.lat, a.lng), i)} area={a} draw={draw} pin={pin} reduce={reduce} delay={farm ? 0 : i * 0.08} label={!!farm} />
            ))}
            <g>
              <circle cx={centre.x} cy={centre.y} r="9" fill="var(--moon)" />
              <text x={centre.x + 16} y={centre.y + 4} className="font-mono" fontSize="12.5" letterSpacing="1.5" fill="var(--moon)" stroke="var(--night)" strokeWidth="4" paintOrder="stroke">
                {city.centre.name.toUpperCase()}
              </text>
            </g>
            <text x="688" y="448" textAnchor="end" className="font-mono" fontSize="10" letterSpacing="1.2" fill="var(--night-muted)">
              APPROXIMATE · NOT TO SCALE
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
