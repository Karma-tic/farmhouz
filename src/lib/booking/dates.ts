/** Date helpers working on YYYY-MM-DD strings in UTC (no timezone drift). */

export const toDate = (s: string) => new Date(`${s}T00:00:00Z`);
export const fmt = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (s: string, n: number) => {
  const d = toDate(s);
  d.setUTCDate(d.getUTCDate() + n);
  return fmt(d);
};

/** Nights between check-in and check-out (0 for a day visit) */
export function nightsBetween(from?: string | null, to?: string | null) {
  if (!from || !to) return 0;
  return Math.max(0, Math.round((toDate(to).getTime() - toDate(from).getTime()) / 86_400_000));
}

/** The days a booking occupies: each night for stays, the single day for a day visit. */
export function occupiedDays(from: string, to: string | null): string[] {
  const n = nightsBetween(from, to);
  if (n === 0) return [from];
  return Array.from({ length: n }, (_, i) => addDays(from, i));
}

/** Today's date in India (YYYY-MM-DD) */
export function todayIST(now = new Date()) {
  return fmt(new Date(now.getTime() + 5.5 * 3600_000));
}

export function prettyRange(from: string, to: string | null, opts: { weekday?: boolean } = {}) {
  const f = (s: string) =>
    toDate(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: opts.weekday ? "short" : undefined, timeZone: "UTC" });
  if (!to) return `${f(from)} · day visit`;
  const n = nightsBetween(from, to);
  return `${f(from)} → ${f(to)} · ${n} night${n === 1 ? "" : "s"}`;
}

/**
 * Next free windows of the same length as [from, to) at one farmhouse,
 * searching around the requested dates (after first, then before).
 */
export function freeWindows(booked: Set<string>, from: string, to: string | null, count = 3, today = todayIST()): { from: string; to: string | null }[] {
  const len = Math.max(1, nightsBetween(from, to));
  const out: { from: string; to: string | null }[] = [];
  const fits = (start: string) => start >= today && occupiedDays(start, to ? addDays(start, len) : null).every((d) => !booked.has(d));
  for (let i = 1; i <= 75 && out.length < count; i++) {
    for (const s of [addDays(from, i), addDays(from, -i)]) {
      if (out.length >= count) break;
      if (fits(s) && !out.some((w) => w.from === s)) out.push({ from: s, to: to ? addDays(s, len) : null });
    }
  }
  return out.sort((a, b) => a.from.localeCompare(b.from));
}
