"use client";

import { useEffect, useMemo, useState } from "react";
import { staticBooked } from "@/lib/enquiry/availability";

/** Booked dates: instantly from availability.json, then merged with the live ICS feed. */
export function useBooked() {
  const [booked, setBooked] = useState<string[]>(staticBooked);
  useEffect(() => {
    let alive = true;
    fetch("/api/availability")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { booked?: string[] } | null) => {
        if (alive && d?.booked?.length) setBooked(d.booked);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const dates = useMemo(() => booked.map((s) => new Date(`${s}T00:00:00`)), [booked]);
  return { booked, dates };
}

export const toIso = (d?: Date) =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "";
export const fromIso = (s?: string) => (s ? new Date(`${s}T00:00:00`) : undefined);
