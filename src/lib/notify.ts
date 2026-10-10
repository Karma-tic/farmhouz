import "server-only";
import { Resend } from "resend";
import { getFarmhouse } from "@/content/farmhouses";
import { formatPrice, site } from "@/content/site";
import { prettyRange } from "@/lib/booking/dates";
import { displayCode, statusLabel } from "@/lib/booking/messages";
import type { Booking } from "@/lib/booking/types";

/**
 * Email notifications via Resend (optional). Without RESEND_API_KEY they are logged.
 * WhatsApp updates are sent by you from the admin panel (one tap, prefilled).
 */
async function send(to: string | null | undefined, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!to) return;
  if (!key) {
    console.info(`[notify] (no RESEND_API_KEY) to=${to} · ${subject}\n${text}`);
    return;
  }
  try {
    const { error } = await new Resend(key).emails.send({
      from: process.env.EMAIL_FROM ?? `${site.name} <onboarding@resend.dev>`,
      to,
      subject,
      text,
    });
    if (error) console.error("[notify] resend error", error);
  } catch (e) {
    console.error("[notify] failed", e);
  }
}

const adminEmail = () => process.env.ADMIN_EMAIL ?? site.contact.email;

function summary(b: Booking) {
  const farm = getFarmhouse(b.farmSlug);
  return [
    `${farm?.name ?? b.farmSlug} · ${prettyRange(b.checkIn, b.checkOut, { weekday: true })}`,
    `${b.guests} guests${b.occasion ? ` · ${b.occasion}` : ""}`,
    `${b.name} · ${b.phone}${b.email ? ` · ${b.email}` : ""}`,
    b.message ? `Note: ${b.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function notifyAdmin(b: Booking, what: "new" | "payment" | "switch", origin: string) {
  const subject =
    what === "new" ? `New request ${displayCode(b.code)} · ${getFarmhouse(b.farmSlug)?.name}` : what === "payment" ? `Payment submitted ${displayCode(b.code)} · UTR ${b.paymentUtr}` : `Guest switched ${displayCode(b.code)}`;
  await send(adminEmail(), subject, `${summary(b)}\n\nOpen in admin: ${origin}/admin/bookings/${b.id}`);
}

export async function notifyGuest(b: Booking, origin: string) {
  if (!b.email) return;
  const link = `${origin}/booking/${b.code}`;
  const lines: Record<string, string> = {
    checking: `We've got your request and we're checking with the owner. You'll hear from us within ${site.booking.checkWithin}.`,
    available: `Good news, it's available! Quote ${formatPrice(b.quoteTotal)} · advance ${formatPrice(b.advance)}. Pay on your booking page to lock the dates.`,
    unavailable: "Those dates are taken. Your booking page has the nearest free dates and similar farmhouses — switch with one tap.",
    payment_review: "Thanks! We're verifying your payment.",
    confirmed: "You're booked! Your booking pass has the exact address and the caretaker's number.",
    expired: "The hold on your dates has lapsed. Tap 'Check again' on your booking page if you'd still like them.",
    cancelled: `Your booking has been cancelled. ${b.guestNote ?? ""}`,
  };
  await send(b.email, `${statusLabel[b.status]} · ${getFarmhouse(b.farmSlug)?.name} · ${displayCode(b.code)}`, `Hi ${b.name.split(/\s+/)[0]},\n\n${lines[b.status]}\n\n${summary(b)}\n\nYour booking page: ${link}\n\n— ${site.name}`);
}
