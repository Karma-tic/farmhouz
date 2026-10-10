/**
 * Booking lifecycle (Farmhouze is the booking agent):
 *
 *   checking ──► available ──► payment_review ──► confirmed
 *      │  ▲          │  └─► expired (hold lapsed) ─┐
 *      ▼  └──────────┼──────────────────────────────┘ (guest asks again / switches)
 *   unavailable ◄────┘
 *   any open state ──► cancelled
 */
export const STATUSES = ["checking", "available", "unavailable", "payment_review", "confirmed", "expired", "cancelled"] as const;
export type BookingStatus = (typeof STATUSES)[number];

export type DateRange = { from: string; to: string | null };

export type Booking = {
  id: string;
  code: string;
  status: BookingStatus;
  farmSlug: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string | null; // null = day visit
  guests: number;
  occasion: string | null;
  packageId: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  quoteTotal: number | null;
  advance: number | null;
  holdUntil: string | null; // ISO
  paymentUtr: string | null;
  paymentName: string | null;
  altDates: DateRange[];
  altFarms: string[];
  guestNote: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
};

export type BookingEvent = {
  id: number;
  at: string;
  type: string;
  actor: "guest" | "admin" | "system";
  data: Record<string, unknown>;
};

/** What the guest's tracking page receives (no internal notes). */
export type PublicBooking = {
  code: string;
  status: BookingStatus;
  farmSlug: string;
  checkIn: string;
  checkOut: string | null;
  guests: number;
  occasion: string | null;
  packageId: string | null;
  firstName: string;
  phoneMasked: string;
  quoteTotal: number | null;
  advance: number | null;
  holdUntil: string | null;
  paymentUtr: string | null;
  guestNote: string | null;
  createdAt: string;
  updatedAt: string;
  /** dates & farmhouses offered when unavailable (admin picks + automatic) */
  suggestions: { dates: DateRange[]; farms: string[] };
  /** only once confirmed */
  pass: null | {
    exactAddress: string;
    mapsUrl: string;
    caretakerName: string;
    caretakerPhone: string;
    checkInTime: string;
    checkOutTime: string;
  };
  timeline: { type: string; at: string }[];
};
