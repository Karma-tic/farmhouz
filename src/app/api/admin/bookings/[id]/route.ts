import { after } from "next/server";
import { getFarmhouse } from "@/content/farmhouses";
import { ownerFor } from "@/content/owners.server";
import { site } from "@/content/site";
import { bad, handle, originOf, readJson } from "@/lib/api";
import { isAdmin, unauthorized } from "@/lib/admin-auth";
import { occupiedDays } from "@/lib/booking/dates";
import { guestMessage, ownerAskMessage, ownerConfirmMessage, waNumber } from "@/lib/booking/messages";
import { blockDays, getBookingById, getEvents, suggestionsFor, updateBooking } from "@/lib/booking/repo";
import { adminActionSchema } from "@/lib/booking/schema";
import type { Booking, BookingStatus } from "@/lib/booking/types";
import { notifyGuest } from "@/lib/notify";

type Ctx = { params: Promise<{ id: string }> };

async function detail(b: Booking, origin: string) {
  const owner = ownerFor(b.farmSlug);
  const link = `${origin}/booking/${b.code}`;
  return {
    booking: b,
    events: await getEvents(b.id),
    owner,
    suggestions: await suggestionsFor(b),
    links: {
      tracking: link,
      waGuest: `https://wa.me/${waNumber(b.phone)}?text=${encodeURIComponent(guestMessage(b, link))}`,
      waOwnerAsk: `https://wa.me/${owner.ownerWhatsapp}?text=${encodeURIComponent(ownerAskMessage(b))}`,
      waOwnerConfirm: `https://wa.me/${owner.ownerWhatsapp}?text=${encodeURIComponent(ownerConfirmMessage(b))}`,
    },
  };
}

export async function GET(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  return handle(async () => {
    const b = await getBookingById((await params).id);
    if (!b) return bad("Booking not found", 404);
    return Response.json({ ok: true, ...(await detail(b, originOf(req))) }, { headers: { "Cache-Control": "no-store" } });
  });
}

const allowed: Record<string, BookingStatus[]> = {
  available: ["checking", "unavailable", "expired", "available"],
  unavailable: ["checking", "available", "expired"],
  confirm: ["payment_review", "available", "expired"],
  reject_payment: ["payment_review"],
  recheck: ["unavailable", "expired", "cancelled"],
  cancel: ["checking", "available", "unavailable", "payment_review", "confirmed", "expired"],
  note: [...(["checking", "available", "unavailable", "payment_review", "confirmed", "expired", "cancelled"] as BookingStatus[])],
};

export async function POST(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  return handle(async () => {
    const b = await getBookingById((await params).id);
    if (!b) return bad("Booking not found", 404);
    const parsed = adminActionSchema.safeParse(await readJson(req));
    if (!parsed.success) return bad("Check the form", 422, { errors: parsed.error.flatten().fieldErrors });
    const a = parsed.data;
    if (!allowed[a.action].includes(b.status)) return bad(`Can't do "${a.action}" while the booking is ${b.status}.`, 409);

    let next: Booking;
    switch (a.action) {
      case "available": {
        const hold = new Date(Date.now() + a.holdHours * 3600_000).toISOString();
        next = await updateBooking(b.id, { status: "available", quote_total: a.quoteTotal, advance: a.advance, hold_until: hold, guest_note: a.guestNote || null }, { type: "marked_available", actor: "admin", data: { quoteTotal: a.quoteTotal, advance: a.advance, holdHours: a.holdHours } });
        break;
      }
      case "unavailable": {
        if (a.blockDates) await blockDays(b.farmSlug, occupiedDays(b.checkIn, b.checkOut), "owner said booked");
        const farms = a.altFarms.filter((s) => getFarmhouse(s));
        next = await updateBooking(b.id, { status: "unavailable", alt_dates: a.altDates, alt_farms: farms, guest_note: a.guestNote || null, hold_until: null }, { type: "marked_unavailable", actor: "admin", data: { altDates: a.altDates, altFarms: farms } });
        break;
      }
      case "confirm":
        next = await updateBooking(b.id, { status: "confirmed", confirmed_at: new Date().toISOString(), guest_note: a.guestNote || b.guestNote }, { type: "confirmed", actor: "admin" });
        break;
      case "reject_payment":
        next = await updateBooking(b.id, { status: "available", payment_utr: null, guest_note: a.guestNote, hold_until: new Date(Date.now() + site.booking.holdHours * 3600_000).toISOString() }, { type: "payment_not_found", actor: "admin", data: { utr: b.paymentUtr } });
        break;
      case "recheck":
        next = await updateBooking(b.id, { status: "checking", hold_until: null }, { type: "rechecking", actor: "admin" });
        break;
      case "cancel":
        next = await updateBooking(b.id, { status: "cancelled", guest_note: a.guestNote || null, hold_until: null }, { type: "cancelled", actor: "admin" });
        break;
      case "note":
        next = await updateBooking(b.id, { admin_note: a.adminNote }, { type: "note", actor: "admin" });
        break;
    }
    const origin = originOf(req);
    if (a.action !== "note") after(() => notifyGuest(next, origin));
    return Response.json({ ok: true, ...(await detail(next, origin)) });
  });
}
