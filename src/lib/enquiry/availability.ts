import availability from "@/content/availability.json";

export type BookedRange = { from: string; to: string };

/** Expand inclusive YYYY-MM-DD ranges into a sorted list of booked dates. */
export function expandRanges(ranges: BookedRange[]): string[] {
  const out = new Set<string>();
  for (const r of ranges) {
    const d = new Date(`${r.from}T00:00:00Z`);
    const end = new Date(`${r.to}T00:00:00Z`);
    for (let i = 0; d <= end && i < 400; i++) {
      out.add(d.toISOString().slice(0, 10));
      d.setUTCDate(d.getUTCDate() + 1);
    }
  }
  return [...out].sort();
}

export const staticBooked = expandRanges(availability.booked);

const unfold = (s: string) => s.replace(/\r?\n[ \t]/g, "");
const toIso = (v: string) => `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;

/**
 * Minimal ICS parser for a public Google Calendar feed: every VEVENT blocks the
 * nights from DTSTART up to (not including) DTEND.
 */
export function parseIcs(text: string): BookedRange[] {
  const ranges: BookedRange[] = [];
  for (const block of unfold(text).split("BEGIN:VEVENT").slice(1)) {
    const start = /DTSTART[^:]*:(\d{8})/.exec(block)?.[1];
    const endRaw = /DTEND[^:]*:(\d{8})/.exec(block)?.[1];
    if (!start) continue;
    const from = toIso(start);
    let to = from;
    if (endRaw) {
      const e = new Date(`${toIso(endRaw)}T00:00:00Z`);
      e.setUTCDate(e.getUTCDate() - 1);
      to = e.toISOString().slice(0, 10);
      if (to < from) to = from;
    }
    ranges.push({ from, to });
  }
  return ranges;
}
