"use client";

import { useEffect, useMemo, useState } from "react";

type Map = Record<string, string[]>;
let cache: Promise<Map> | null = null;
let cacheAt = 0;

/** Fetches booked days for every farmhouse once (refreshed after a minute). */
export function loadBooked(force = false): Promise<Map> {
  if (!cache || force || Date.now() - cacheAt > 60_000) {
    cacheAt = Date.now();
    cache = fetch("/api/availability", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { booked: {} }))
      .then((d: { booked?: Map }) => d.booked ?? {})
      .catch(() => ({}));
  }
  return cache;
}

/** Booked days for every farmhouse (map) — used by search filters. */
export function useBookedMap() {
  const [map, setMap] = useState<Map | null>(null);
  useEffect(() => {
    let alive = true;
    loadBooked().then((m) => alive && setMap(m));
    return () => {
      alive = false;
    };
  }, []);
  return map;
}

/** Booked days for one farmhouse, as strings and Date objects for the calendar. */
export function useBooked(farmSlug?: string) {
  const map = useBookedMap();
  const booked = useMemo(() => (farmSlug && map ? map[farmSlug] ?? [] : []), [farmSlug, map]);
  const dates = useMemo(() => booked.map((s) => new Date(`${s}T00:00:00`)), [booked]);
  return { booked, dates, loaded: map !== null };
}

export const toIso = (d?: Date) =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "";
export const fromIso = (s?: string | null) => (s ? new Date(`${s}T00:00:00`) : undefined);
