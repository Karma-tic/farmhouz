import { cacheLife } from "next/cache";
import { expandRanges, parseIcs, staticBooked } from "@/lib/enquiry/availability";

/** Fetches the optional public Google Calendar ICS feed; cached for 15 minutes. */
async function icsBooked(url: string) {
  "use cache";
  cacheLife({ stale: 900, revalidate: 900, expire: 3600 });
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return expandRanges(parseIcs(await res.text()));
  } catch {
    return [];
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_ICS_URL;
  const fromIcs = url ? await icsBooked(url) : [];
  const booked = [...new Set([...staticBooked, ...fromIcs])].sort();
  return Response.json({ booked, source: url ? "json+ics" : "json" });
}
