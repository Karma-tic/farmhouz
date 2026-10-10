"use client";

import Link from "next/link";
import { getCity } from "@/content/cities";
import type { Farmhouse } from "@/content/types";
import { cn } from "@/lib/utils";

const W = 700;
const H = 460;
const BOUNDS = { minLat: 23.11, maxLat: 23.31, minLng: 77.27, maxLng: 77.56 };
export const project = (lat: number, lng: number) => ({
  x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W,
  y: H - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H,
});

/**
 * Stylised (not-to-scale) map of the city: lakes, the centre, area labels and
 * farmhouse pins. Pins are approximate on purpose — exact locations are shared
 * after booking.
 */
export function AreaMap({
  city = "bhopal",
  farms = [],
  activeSlug,
  onHover,
  showAreas = true,
  focusArea,
  className,
  linkPins = true,
}: {
  city?: string;
  farms?: Farmhouse[];
  activeSlug?: string | null;
  onHover?: (slug: string | null) => void;
  showAreas?: boolean;
  focusArea?: string;
  className?: string;
  linkPins?: boolean;
}) {
  const c = getCity(city);
  if (!c) return null;
  const centre = project(c.centre.lat, c.centre.lng);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("h-auto w-full", className)} role="img" aria-label={`Map of farmhouse areas around ${c.name} (approximate, not to scale)`}>
      <defs>
        <pattern id="map-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="var(--line)" strokeWidth="1" />
        </pattern>
        <radialGradient id="map-glow">
          <stop offset="0" stopColor="var(--wheat)" stopOpacity=".35" />
          <stop offset="1" stopColor="var(--wheat)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#map-grid)" />
      {/* Upper Lake, Lower Lake, Kerwa reservoir — stylised */}
      <g fill="color-mix(in oklab, #7FB3C4 55%, var(--card))" opacity=".9">
        <path d={`M${project(23.255, 77.315).x} ${project(23.255, 77.315).y} C ${project(23.275, 77.33).x} ${project(23.275, 77.33).y}, ${project(23.262, 77.37).x} ${project(23.262, 77.37).y}, ${project(23.252, 77.392).x} ${project(23.252, 77.392).y} C ${project(23.238, 77.38).x} ${project(23.238, 77.38).y}, ${project(23.232, 77.35).x} ${project(23.232, 77.35).y}, ${project(23.255, 77.315).x} ${project(23.255, 77.315).y}Z`} />
        <ellipse cx={project(23.25, 77.408).x} cy={project(23.25, 77.408).y} rx="14" ry="8" />
        <ellipse cx={project(23.178, 77.33).x} cy={project(23.178, 77.33).y} rx="18" ry="10" transform={`rotate(-20 ${project(23.178, 77.33).x} ${project(23.178, 77.33).y})`} />
      </g>
      {/* roads out of the city, very abstract */}
      <g stroke="var(--muted)" strokeOpacity=".28" strokeWidth="2.5" fill="none" strokeLinecap="round">
        {c.areas.map((a) => {
          const p = project(a.lat, a.lng);
          return <path key={a.slug} d={`M${centre.x} ${centre.y} Q ${(centre.x + p.x) / 2 + 18} ${(centre.y + p.y) / 2 - 12} ${p.x} ${p.y}`} strokeDasharray="1 7" />;
        })}
      </g>
      {/* centre */}
      <g>
        <circle cx={centre.x} cy={centre.y} r="8" fill="var(--ink)" />
        <text x={centre.x + 14} y={centre.y + 4} className="font-mono" fontSize="12" letterSpacing="1.5" fill="var(--ink)">
          {c.centre.name.toUpperCase()}
        </text>
      </g>
      {showAreas &&
        focusArea &&
        c.areas
          .filter((a) => a.slug === focusArea)
          .map((a) => {
            const p = project(a.lat, a.lng);
            return <circle key={a.slug} cx={p.x} cy={p.y} r="70" fill="url(#map-glow)" />;
          })}
      {farms.map((f) => {
        const p = project(f.approx.lat, f.approx.lng);
        const active = activeSlug === f.slug;
        const pin = (
          <g
            transform={`translate(${p.x} ${p.y})`}
            onPointerEnter={() => onHover?.(f.slug)}
            onPointerLeave={() => onHover?.(null)}
            className="cursor-pointer"
            style={{ transition: "transform 280ms var(--ease-out)" }}
          >
            <circle r="24" fill="transparent" />
            <circle r={active ? 22 : 16} fill="var(--wheat)" opacity=".22" style={{ transition: "r 280ms" }} />
            <circle r={active ? 9 : 7} fill={active ? "var(--terra)" : "var(--wheat)"} stroke="var(--card)" strokeWidth="2.5" />
            {active && (
              <g transform="translate(0 -22)">
                <rect x={-f.name.length * 4 - 12} y="-20" width={f.name.length * 8 + 24} height="26" rx="13" fill="var(--wheat)" />
                <text textAnchor="middle" y="-3" fontSize="12" fill="var(--on-wheat)" className="font-sans" fontWeight="500">
                  {f.name}
                </text>
              </g>
            )}
          </g>
        );
        return linkPins ? (
          <Link key={f.slug} href={`/${f.city}/${f.slug}`} aria-label={`${f.name}, ${c.areas.find((a) => a.slug === f.area)?.name ?? ""}`} onFocus={() => onHover?.(f.slug)} onBlur={() => onHover?.(null)}>
            {pin}
          </Link>
        ) : (
          <g key={f.slug}>{pin}</g>
        );
      })}
      {showAreas &&
        c.areas.map((a) => {
          const p = project(a.lat, a.lng);
          const focus = focusArea === a.slug;
          return (
            <g key={a.slug} opacity={focusArea && !focus ? 0.45 : 1}>
              <text x={p.x} y={p.y + 34} textAnchor="middle" className="pointer-events-none font-mono" fontSize="11" letterSpacing="1.3" fill="var(--muted)" stroke="var(--card)" strokeWidth="4" paintOrder="stroke" strokeLinejoin="round">
                {a.name.toUpperCase()}
              </text>
            </g>
          );
        })}
      <text x={W - 12} y={H - 12} textAnchor="end" className="font-mono" fontSize="10" letterSpacing="1.2" fill="var(--muted)">
        APPROXIMATE · NOT TO SCALE
      </text>
    </svg>
  );
}
