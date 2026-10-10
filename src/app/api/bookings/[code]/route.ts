import { after, connection } from "next/server";
import { getFarmhouse } from "@/content/farmhouses";
import { bad, handle, originOf, readJson } from "@/lib/api";
import { occupiedDays, todayIST } from "@/lib/booking/dates";
import { blockedDays, getBookingByCode, publicView, updateBooking } from "@/lib/booking/repo";
import { guestActionSchema } from "@/lib/booking/schema";
import { notifyAdmin } from "@/lib/notify";

type Ctx = { params: Promise<{ code: string }> };

/** Public status for the tracking page (polled while we're working on it). */
export async function GET(_req: Request, { params }: Ctx) {
  await connection();
  return handle(async () => {
    const b = await getBookingByCode((await params).code);
    if (!b) return bad("We couldn't find that booking. Check the link or your booking code.", 404);
    return Response.json({ ok: true, booking: await publicView(b) }, { headers: { "Cache-Control": "no-store" } });
  });
}

/** Guest actions: submit payment reference, switch dates/farmhouse, withdraw. */
export async function POST(req: Request, { params }: Ctx) {
  return handle(async () => {
    const b = await getBookingByCode((await params).code);
    if (!b) return bad("We couldn't find that booking.", 404);
    const parsed = guestActionSchema.safeParse(await readJson(req));
    if (!parsed.success) return bad("Please check the details.", 422, { errors: parsed.error.flatten().fieldErrors });
    const a = parsed.data;
    const origin = originOf(req);

    if (a.action === "payment") {
      if (b.status !== "available") return bad(b.status === "expired" ? "The hold on these dates has lapsed. Tap 'Check again'." : "This booking isn't waiting for a payment.", 409);
      const next = await updateBooking(b.id, { status: "payment_review", payment_utr: a.utr.toUpperCase(), payment_name: a.payerName || null }, { type: "payment_submitted", actor: "guest", data: { utr: a.utr } });
      after(() => notifyAdmin(next, "payment", origin));
      return Response.json({ ok: true, booking: await publicView(next) });
    }

    if (a.action === "switch") {
      if (!["unavailable", "expired", "checking"].includes(b.status)) return bad("You can change dates only before paying. Message us on WhatsApp.", 409);
      const farmSlug = a.farmSlug ?? b.farmSlug;
      const farm = getFarmhouse(farmSlug);
      if (!farm) return bad("That farmhouse isn't available.", 404);
      if (a.from < todayIST()) return bad("Please pick a date from today onwards.", 422);
      const booked = new Set(await blockedDays(farmSlug));
      if (occupiedDays(a.from, a.to ?? null).some((d) => booked.has(d))) return bad("Those dates are already booked there.", 409);
      const next = await updateBooking(
        b.id,
        { status: "checking", farm_slug: farmSlug, check_in: a.from, check_out: a.to ?? null, quote_total: null, advance: null, hold_until: null, alt_dates: [], alt_farms: [], guest_note: null },
        { type: farmSlug !== b.farmSlug ? "switched_farmhouse" : "switched_dates", actor: "guest", data: { farmSlug, from: a.from, to: a.to ?? null } },
      );
      after(() => notifyAdmin(next, "switch", origin));
      return Response.json({ ok: true, booking: await publicView(next) });
    }

    // withdraw
    if (!["checking", "available", "unavailable", "expired"].includes(b.status)) return bad("Please message us on WhatsApp to cancel a paid booking.", 409);
    const next = await updateBooking(b.id, { status: "cancelled", guest_note: "You withdrew this request." }, { type: "withdrawn", actor: "guest" });
    return Response.json({ ok: true, booking: await publicView(next) });
  });
}
