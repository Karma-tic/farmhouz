import { after } from "next/server";
import { getFarmhouse } from "@/content/farmhouses";
import { bad, handle, originOf, readJson } from "@/lib/api";
import { occupiedDays, todayIST } from "@/lib/booking/dates";
import { blockedDays, createBooking } from "@/lib/booking/repo";
import { requestSchema } from "@/lib/booking/schema";
import { notifyAdmin, notifyGuest } from "@/lib/notify";

/** Guest sends a booking request → status "checking". */
export async function POST(req: Request) {
  return handle(async () => {
    const parsed = requestSchema.safeParse(await readJson(req));
    if (!parsed.success) return bad("Please check the highlighted fields.", 422, { errors: parsed.error.flatten().fieldErrors });
    const data = parsed.data;
    if (data.company) return Response.json({ ok: true, code: null }); // honeypot
    const farm = getFarmhouse(data.farmSlug);
    if (!farm) return bad("That farmhouse isn't available for booking.", 404);
    if (data.from < todayIST()) return bad("Please pick a date from today onwards.", 422, { errors: { from: ["Pick a future date"] } });
    if (data.guests > Math.max(farm.capacity.eventGuests, farm.capacity.sleeps))
      return bad(`${farm.name} hosts up to ${farm.capacity.eventGuests} guests.`, 422, { errors: { guests: [`Up to ${farm.capacity.eventGuests} guests here`] } });
    const booked = new Set(await blockedDays(farm.slug));
    if (occupiedDays(data.from, data.to || null).some((d) => booked.has(d)))
      return bad("Some of those dates are already booked. Please pick other dates.", 409, { errors: { from: ["Those dates are booked"] } });

    const booking = await createBooking(data);
    const origin = originOf(req);
    after(() => Promise.all([notifyAdmin(booking, "new", origin), notifyGuest(booking, origin)]));
    return Response.json({ ok: true, code: booking.code });
  });
}
