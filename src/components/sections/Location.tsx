"use client";

import { Navigation } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/ui/reveal";
import { site } from "@/content/site";

const ROUTE = "M70 330 C 150 320, 170 250, 240 240 S 330 270, 380 200 S 470 120, 520 140 S 600 110, 640 70";

export function Location() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 45%"] });
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const pin = useTransform(scrollYProgress, [0.85, 1], [0, 1]);
  const { lat, lng } = site.location;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <section
      id="location"
      data-daylight="0.84"
      aria-labelledby="location-title"
      className="theme-night relative bg-[color-mix(in_oklab,var(--night)_88%,transparent)] py-[clamp(5rem,12vw,9rem)]"
    >
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeading
            id="location-title"
            eyebrow="How to reach · 08:40 PM"
            title={
              <>
                Close enough. <span className="italic-soft text-wheat">Far enough.</span>
              </>
            }
            intro={`${site.location.kmFromCity} km and about ${site.location.driveTime} from ${site.location.city}. Smooth roads all the way to the gate.`}
          />
          <Reveal delay={0.1} className="mt-8">
            <address className="mb-6 not-italic text-night-muted">
              {site.location.streetAddress}, {site.location.area}
              <br />
              {site.location.city}, {site.location.state} {site.location.postalCode}
            </address>
            <ul className="mb-8 divide-y divide-line border-y border-line">
              {site.location.landmarks.map((l) => (
                <li key={l.name} className="flex items-center justify-between gap-4 py-3">
                  <span>{l.name}</span>
                  <span className="eyebrow text-night-muted">{l.detail}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={directions} target="_blank" rel="noopener noreferrer">
                  <Navigation /> Get directions
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-moon">
                <a href={site.location.mapsUrl} target="_blank" rel="noopener noreferrer">
                  Open in Google Maps
                </a>
              </Button>
            </div>
          </Reveal>
        </div>

        <div ref={ref} className="relative overflow-hidden rounded-[28px] border border-line bg-card/60">
          <svg viewBox="0 0 700 400" className="h-auto w-full" role="img" aria-label={`Route map: ${site.location.city} to ${site.name}, ${site.location.kmFromCity} km, about ${site.location.driveTime}`}>
            <defs>
              <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0H0V28" fill="none" stroke="var(--line)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="700" height="400" fill="url(#grid)" />
            {/* fields + river, very abstract */}
            <path d="M0 380 C 120 300, 260 380, 360 320 S 560 260, 700 300" fill="none" stroke="var(--night-muted)" strokeOpacity=".25" strokeWidth="14" strokeLinecap="round" />
            <g fill="var(--sage)" opacity=".18">
              <rect x="430" y="20" width="110" height="70" rx="10" />
              <rect x="560" y="140" width="120" height="80" rx="10" />
              <rect x="90" y="40" width="140" height="90" rx="10" />
            </g>
            <path d={ROUTE} fill="none" stroke="var(--night-muted)" strokeOpacity=".35" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
            <motion.path
              d={ROUTE}
              fill="none"
              stroke="var(--wheat)"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ pathLength: reduce ? 1 : draw }}
            />
            <g>
              <circle cx="70" cy="330" r="9" fill="var(--moon)" />
              <text x="88" y="356" className="font-mono" fontSize="13" letterSpacing="1.5" fill="var(--moon)">
                {site.location.city.toUpperCase()}
              </text>
            </g>
            <motion.g style={{ opacity: reduce ? 1 : pin }}>
              <circle cx="640" cy="70" r="22" fill="var(--ember)" opacity=".25" />
              <circle cx="640" cy="70" r="10" fill="var(--wheat)" />
              <text x="628" y="42" textAnchor="end" className="font-mono" fontSize="13" letterSpacing="1.5" fill="var(--moon)">
                {site.name.toUpperCase()}
              </text>
            </motion.g>
            <g className="font-mono" fontSize="12" letterSpacing="1.5" fill="var(--wheat)">
              <text x="300" y="300">{site.location.kmFromCity} KM</text>
              <text x="300" y="318" fill="var(--night-muted)">
                ~{site.location.driveTime.toUpperCase()} BY CAR
              </text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
