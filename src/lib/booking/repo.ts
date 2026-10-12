import "server-only";
import { randomInt } from "node:crypto";
import { farmsIn, getFarm, getOwner } from "@/lib/farms/server";
import { db } from "@/lib/db";
import { freeWindows, occupiedDays, todayIST } from "./dates";
import type { LeadInput, RequestData, WaitlistInput } from "./schema";
import type { Booking, BookingEvent, BookingStatus, DateRange, PublicBooking } from "./types";

/* ------------------------------------------------------------------ helpers */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export function newCode() {
  let s = "";
  for (let i = 0; i < 8; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}
/** Accepts "fz-7k3m-9qxa", "7K3M9QXA" … */
export const normaliseCode = (raw: string) => raw.toUpperCase().replace(/^FZ/, "").replace(/[^0-9A-Z]/g, "").slice(0, 8);

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : v == null ? null : String(v));
const day = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? null : String(v).slice(0, 10));

type Row = Record<string, unknown>;
function toBooking(r: Row): Booking {
  return {
    id: String(r.id),
    code: String(r.code),
    status: r.status as BookingStatus,
    farmSlug: String(r.farm_slug),
    checkIn: day(r.check_in) as string,
    checkOut: day(r.check_out),
    guests: Number(r.guests),
    occasion: (r.occasion as string) ?? null,
    packageId: (r.package_id as string) ?? null,
    name: String(r.name),
    phone: String(r.phone),
    email: (r.email as string) ?? null,
    message: (r.message as string) ?? null,
    quoteTotal: r.quote_total == null ? null : Number(r.quote_total),
    advance: r.advance == null ? null : Number(r.advance),
    holdUntil: iso(r.hold_until),
    paymentUtr: (r.payment_utr as string) ?? null,
    paymentName: (r.payment_name as string) ?? null,
    altDates: (r.alt_dates as DateRange[]) ?? [],
    altFarms: (r.alt_farms as string[]) ?? [],
    guestNote: (r.guest_note as string) ?? null,
    adminNote: (r.admin_note as string) ?? null,
    createdAt: iso(r.created_at) as string,
    updatedAt: iso(r.updated_at) as string,
    confirmedAt: iso(r.confirmed_at),
  };
}

/** A hold that has lapsed is treated as expired everywhere. */
function withDerivedStatus(b: Booking, now = Date.now()): Booking {
  if (b.status === "available" && b.holdUntil && new Date(b.holdUntil).getTime() < now) return { ...b, status: "expired" };
  return b;
}

async function logEvent(bookingId: string, type: string, actor: BookingEvent["actor"], data: object = {}) {
  const sql = await db();
  await sql`insert into booking_events (booking_id, type, actor, data) values (${bookingId}, ${type}, ${actor}, ${sql.json(data as never)})`;
}

/* ----------------------------------------------------------------- bookings */
export async function createBooking(input: RequestData): Promise<Booking> {
  const sql = await db();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newCode();
    const rows = await sql`
      insert into bookings (code, status, farm_slug, check_in, check_out, guests, occasion, package_id, name, phone, email, message)
      values (${code}, 'checking', ${input.farmSlug}, ${input.from}, ${input.to || null}, ${input.guests}, ${input.occasion || null},
              ${input.packageId}, ${input.name}, ${input.phone}, ${input.email || null}, ${input.message || null})
      on conflict (code) do nothing
      returning *`;
    if (rows.length) {
      const b = toBooking(rows[0]);
      await logEvent(b.id, "requested", "guest", { from: input.from, to: input.to || null, guests: input.guests });
      return b;
    }
  }
  throw new Error("Could not allocate a booking code");
}

export async function getBookingByCode(code: string): Promise<Booking | null> {
  const sql = await db();
  const rows = await sql`select * from bookings where code = ${normaliseCode(code)}`;
  return rows.length ? withDerivedStatus(toBooking(rows[0])) : null;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const sql = await db();
  const rows = await sql`select * from bookings where id = ${id}`;
  return rows.length ? withDerivedStatus(toBooking(rows[0])) : null;
}

export async function listBookings(): Promise<Booking[]> {
  const sql = await db();
  const rows = await sql`select * from bookings order by created_at desc limit 500`;
  return rows.map((r) => withDerivedStatus(toBooking(r)));
}

export async function getEvents(bookingId: string): Promise<BookingEvent[]> {
  const sql = await db();
  const rows = await sql`select * from booking_events where booking_id = ${bookingId} order by at asc, id asc`;
  return rows.map((r) => ({ id: Number(r.id), at: iso(r.at) as string, type: String(r.type), actor: r.actor as BookingEvent["actor"], data: (r.data as Record<string, unknown>) ?? {} }));
}

type Patch = Partial<{
  status: BookingStatus;
  farm_slug: string;
  check_in: string;
  check_out: string | null;
  quote_total: number | null;
  advance: number | null;
  hold_until: string | null;
  payment_utr: string | null;
  payment_name: string | null;
  alt_dates: DateRange[];
  alt_farms: string[];
  guest_note: string | null;
  admin_note: string | null;
  confirmed_at: string | null;
}>;

/** Updates a booking, appends a timeline event, and keeps blocked dates in sync with confirmations. */
export async function updateBooking(id: string, patch: Patch, event: { type: string; actor: BookingEvent["actor"]; data?: object }): Promise<Booking> {
  const sql = await db();
  const cols = Object.keys(patch) as (keyof Patch)[];
  const values: Record<string, unknown> = { ...patch };
  for (const k of ["alt_dates", "alt_farms"] as const) if (k in values) values[k] = sql.json(values[k] as never);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await sql`update bookings set ${sql(values as any, cols)}, updated_at = now() where id = ${id} returning *`;
  const b = toBooking(rows[0]);
  await logEvent(id, event.type, event.actor, event.data ?? {});
  if (patch.status === "confirmed") await blockForBooking(b);
  if (patch.status === "cancelled") await sql`delete from blocked_dates where booking_id = ${id}`;
  return withDerivedStatus(b);
}

/* ------------------------------------------------------------ availability */
export async function blockedDays(farmSlug: string): Promise<string[]> {
  const sql = await db();
  const rows = await sql`select day from blocked_dates where farm_slug = ${farmSlug} and day >= ${todayIST()} order by day`;
  return rows.map((r) => day(r.day) as string);
}

export async function blockedByFarm(city = "bhopal"): Promise<Record<string, string[]>> {
  const sql = await db();
  const slugs = (await farmsIn(city)).map((f) => f.slug);
  if (!slugs.length) return {};
  const rows = await sql`select farm_slug, day from blocked_dates where farm_slug in ${sql(slugs)} and day >= ${todayIST()} order by day`;
  const out: Record<string, string[]> = Object.fromEntries(slugs.map((s) => [s, []]));
  for (const r of rows) out[String(r.farm_slug)].push(day(r.day) as string);
  return out;
}

export async function blockDays(farmSlug: string, days: string[], reason = "manual", bookingId: string | null = null) {
  if (!days.length) return;
  const sql = await db();
  const rows = days.map((d) => ({ farm_slug: farmSlug, day: d, reason, booking_id: bookingId }));
  await sql`insert into blocked_dates ${sql(rows, "farm_slug", "day", "reason", "booking_id")} on conflict (farm_slug, day) do nothing`;
}

export async function unblockDays(farmSlug: string, days: string[]) {
  if (!days.length) return;
  const sql = await db();
  await sql`delete from blocked_dates where farm_slug = ${farmSlug} and day in ${sql(days)} and booking_id is null`;
}

export async function listBlocks(farmSlug: string) {
  const sql = await db();
  const rows = await sql`select day, reason, booking_id from blocked_dates where farm_slug = ${farmSlug} and day >= ${todayIST()} order by day`;
  return rows.map((r) => ({ day: day(r.day) as string, reason: String(r.reason), bookingId: (r.booking_id as string) ?? null }));
}

async function blockForBooking(b: Booking) {
  await blockDays(b.farmSlug, occupiedDays(b.checkIn, b.checkOut), "booking", b.id);
}

/** Automatic alternatives when a farmhouse isn't free: nearby dates here, and similar farmhouses free on the asked dates. */
export async function suggestionsFor(b: Booking): Promise<{ dates: DateRange[]; farms: string[] }> {
  const farm = await getFarm(b.farmSlug);
  const byFarm = await blockedByFarm(farm?.city ?? "bhopal");
  const own = new Set(byFarm[b.farmSlug] ?? []);
  // the requested dates are taken even if the owner hasn't told us which days are blocked
  occupiedDays(b.checkIn, b.checkOut).forEach((d) => own.add(d));
  const autoDates = freeWindows(own, b.checkIn, b.checkOut, 3);
  const wanted = occupiedDays(b.checkIn, b.checkOut);
  const autoFarms = (await farmsIn(farm?.city ?? "bhopal"))
    .filter((f) => f.slug !== b.farmSlug && f.capacity.eventGuests >= b.guests && wanted.every((d) => !(byFarm[f.slug] ?? []).includes(d)))
    .sort((x, y) => Number(y.area === farm?.area) - Number(x.area === farm?.area))
    .slice(0, 3)
    .map((f) => f.slug);
  const dates = [...b.altDates, ...autoDates.filter((a) => !b.altDates.some((d) => d.from === a.from))].slice(0, 4);
  const farms = [...new Set([...b.altFarms, ...autoFarms])].slice(0, 3);
  return { dates, farms };
}

/** What the guest's tracking page is allowed to see. */
export async function publicView(b: Booking): Promise<PublicBooking> {
  const farm = await getFarm(b.farmSlug);
  const events = await getEvents(b.id);
  const o = await getOwner(b.farmSlug);
  const suggestions = b.status === "unavailable" || b.status === "expired" ? await suggestionsFor(b) : { dates: [], farms: [] };
  return {
    code: b.code,
    status: b.status,
    farmSlug: b.farmSlug,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    guests: b.guests,
    occasion: b.occasion,
    packageId: b.packageId,
    firstName: b.name.split(/\s+/)[0],
    phoneMasked: b.phone.replace(/\D/g, "").slice(-10).replace(/^(\d{2})\d{5}(\d{3})$/, "$1•••••$2"),
    quoteTotal: b.quoteTotal,
    advance: b.advance,
    holdUntil: b.holdUntil,
    paymentUtr: b.paymentUtr,
    guestNote: b.guestNote,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    suggestions,
    pass:
      b.status === "confirmed"
        ? {
            exactAddress: o.exactAddress,
            mapsUrl: o.mapsUrl,
            caretakerName: o.caretakerName,
            caretakerPhone: o.caretakerPhone,
            checkInTime: b.checkOut ? farm?.times.checkIn ?? "12:00 PM" : (farm?.times.dayOut.split("–")[0].trim() ?? "9:00 AM"),
            checkOutTime: b.checkOut ? farm?.times.checkOut ?? "11:00 AM" : (farm?.times.dayOut.split("–")[1]?.trim() ?? "6:00 PM"),
          }
        : null,
    timeline: events.map((e) => ({ type: e.type, at: e.at })),
  };
}

/* ------------------------------------------------------------- owner leads */
export async function createLead(l: LeadInput) {
  const sql = await db();
  await sql`insert into owner_leads (name, phone, farm_name, area, guests, has_pool, photos_link, notes)
            values (${l.name}, ${l.phone}, ${l.farmName}, ${l.area || null}, ${l.guests ?? null}, ${l.hasPool ?? null}, ${l.photosLink || null}, ${l.notes || null})`;
}

export async function listLeads() {
  const sql = await db();
  const rows = await sql`select * from owner_leads order by created_at desc limit 200`;
  return rows.map((r) => ({
    id: String(r.id),
    createdAt: iso(r.created_at) as string,
    name: String(r.name),
    phone: String(r.phone),
    farmName: String(r.farm_name),
    area: (r.area as string) ?? null,
    guests: r.guests == null ? null : Number(r.guests),
    hasPool: (r.has_pool as boolean) ?? null,
    photosLink: (r.photos_link as string) ?? null,
    notes: (r.notes as string) ?? null,
    status: String(r.status),
  }));
}

export async function setLeadStatus(id: string, status: string) {
  const sql = await db();
  await sql`update owner_leads set status = ${status} where id = ${id}`;
}

/* --------------------------------------------------------- guest waitlist */
export async function createWaitlist(w: WaitlistInput) {
  const sql = await db();
  await sql`insert into waitlist (name, phone, occasion, when_text, guests, notes)
            values (${w.name}, ${w.phone}, ${w.occasion || null}, ${w.when || null}, ${w.guests ?? null}, ${w.notes || null})`;
}

export async function listWaitlist() {
  const sql = await db();
  const rows = await sql`select * from waitlist order by created_at desc limit 500`;
  return rows.map((r) => ({
    id: String(r.id),
    createdAt: iso(r.created_at) as string,
    name: String(r.name),
    phone: String(r.phone),
    occasion: (r.occasion as string) ?? null,
    when: (r.when_text as string) ?? null,
    guests: r.guests == null ? null : Number(r.guests),
    notes: (r.notes as string) ?? null,
    status: String(r.status),
  }));
}

export async function setWaitlistStatus(id: string, status: string) {
  const sql = await db();
  await sql`update waitlist set status = ${status} where id = ${id}`;
}
