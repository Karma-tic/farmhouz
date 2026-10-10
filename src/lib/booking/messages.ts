import { getFarmhouse } from "@/content/farmhouses";
import { formatPrice, site } from "@/content/site";
import { prettyRange } from "./dates";
import type { Booking, BookingStatus } from "./types";

export const statusLabel: Record<BookingStatus, string> = {
  checking: "Checking with owner",
  available: "Available · awaiting payment",
  unavailable: "Not available",
  payment_review: "Verifying payment",
  confirmed: "Booked",
  expired: "Hold expired",
  cancelled: "Cancelled",
};

/** Booking-code helpers usable in the browser too */
export const displayCode = (code: string) => `FZ-${code.slice(0, 4)}-${code.slice(4)}`;
export const trackingPath = (code: string) => `/booking/${code}`;

const farmName = (slug: string) => getFarmhouse(slug)?.name ?? slug;

/** WhatsApp message to the guest for the booking's current status. */
export function guestMessage(b: Booking, link: string) {
  const first = b.name.split(/\s+/)[0];
  const when = prettyRange(b.checkIn, b.checkOut);
  const head = `Hi ${first}, this is ${site.name} about ${farmName(b.farmSlug)} (${when}, ${b.guests} guests).`;
  switch (b.status) {
    case "checking":
      return `${head}\n\nWe've got your request and we're checking with the owner now. You can follow it here: ${link}`;
    case "available":
      return `${head}\n\nGood news — it's available! Quote: ${formatPrice(b.quoteTotal)}. Pay the advance of ${formatPrice(b.advance)} to lock your dates${b.holdUntil ? ` (held until ${new Date(b.holdUntil).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })})` : ""}.\n\nPay & confirm here: ${link}`;
    case "unavailable":
      return `${head}\n\nSorry, those dates are taken. We've put the nearest free dates and similar farmhouses on your booking page — switch with one tap: ${link}`;
    case "payment_review":
      return `${head}\n\nThanks! We've got your payment details and we're verifying them now: ${link}`;
    case "confirmed":
      return `${head}\n\nYou're booked! 🔥 Your booking pass with the exact address and caretaker's number is here: ${link}`;
    case "expired":
      return `${head}\n\nThe hold on your dates has lapsed. If you'd still like them, tap "Check again" here: ${link}`;
    case "cancelled":
      return `${head}\n\nYour booking has been cancelled. ${b.guestNote ?? ""}`.trim();
  }
}

/** WhatsApp message to the owner asking about availability. */
export function ownerAskMessage(b: Booking) {
  return [
    `Namaste! ${site.name} here. Is ${farmName(b.farmSlug)} free on ${prettyRange(b.checkIn, b.checkOut, { weekday: true })}?`,
    `Guests: ${b.guests}${b.occasion ? ` · Occasion: ${b.occasion}` : ""}`,
    b.message ? `Guest's note: ${b.message}` : "",
    "Please confirm availability and your best price. Thank you!",
  ]
    .filter(Boolean)
    .join("\n");
}

export function ownerConfirmMessage(b: Booking) {
  return [
    `Booking confirmed via ${site.name} ✅`,
    `${farmName(b.farmSlug)} · ${prettyRange(b.checkIn, b.checkOut, { weekday: true })}`,
    `Guest: ${b.name} · ${b.phone} · ${b.guests} guests${b.occasion ? ` · ${b.occasion}` : ""}`,
    `Advance received: ${formatPrice(b.advance)} · Balance at check-in: ${formatPrice((b.quoteTotal ?? 0) - (b.advance ?? 0))}`,
    "Please block these dates. Thank you!",
  ].join("\n");
}

/** digits-only WhatsApp number for an Indian mobile */
export const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.length === 10 ? `91${d}` : d.replace(/^0/, "91");
};
