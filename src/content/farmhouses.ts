import type { Farmhouse, Media, Package } from "./types";

/**
 * Farmhouses are stored in the database and edited in the admin panel
 * (/admin/farms). This file holds the shared helpers and the defaults the
 * editor starts a new farmhouse with.
 */

const img = (src: string, alt: string): Media => ({ src: `/media/${src}`, alt, placeholder: true });

export const defaultRules = [
  "Outdoor music stops at 10:00 PM as per local rules.",
  "Guest count must match the booking; extra guests need prior approval.",
  "Government ID is required for every adult staying overnight.",
  "No smoking inside the rooms.",
];

export const defaultTimes = { checkIn: "12:00 PM", checkOut: "11:00 AM", dayOut: "9:00 AM – 6:00 PM", musicCutoff: "10:00 PM" };

/** Packages shown on a farmhouse page, derived from its prices and occasions. */
export function packagesFor(f: Farmhouse): Package[] {
  const list: Package[] = [];
  if (f.price.dayOut != null || f.occasions.includes("day-out"))
    list.push({ id: "day-out", name: "Day Out", bestFor: "One slow day with family or friends", timing: f.times.dayOut, inclusions: ["Whole property", "Pool & lawn", "Kitchen access"], priceFrom: f.price.dayOut, priceUnit: "day", pricing: "flat", image: img("packages/day-out.webp", "") });
  if (f.price.night != null)
    list.push({ id: "night-stay", name: "Night Stay", bestFor: "An overnight escape", timing: `Check-in ${f.times.checkIn} · Check-out ${f.times.checkOut}`, inclusions: [`${f.capacity.bedrooms} bedrooms`, "Bonfire night", "Breakfast on request"], priceFrom: f.price.night, priceUnit: "night", pricing: "per-night", image: img("packages/night-stay.webp", "") });
  if (f.price.night != null && f.occasions.includes("weekend"))
    list.push({ id: "weekend-escape", name: "Weekend Escape", bestFor: "Two full nights to switch off", timing: "Fri or Sat check-in · 2 nights", inclusions: ["Whole property", "Two bonfire nights", "Cook on request"], priceFrom: f.price.night, priceUnit: "night", pricing: "per-night", image: img("packages/weekend-escape.webp", "") });
  if (f.price.event != null && f.occasions.some((o) => ["birthday", "haldi-mehendi", "wedding"].includes(o)))
    list.push({ id: "celebrations", name: "Celebrations", bestFor: "Birthdays, haldi & mehendi, small weddings", timing: `Up to ${f.capacity.eventGuests} guests`, inclusions: ["Lawn & lights", "Decorator access", "Power backup"], priceFrom: f.price.event, priceUnit: "event", pricing: "flat", image: img("packages/celebrations.webp", "") });
  if (f.occasions.includes("shoot"))
    list.push({ id: "shoots", name: "Shoots", bestFor: "Pre-wedding and brand shoots", timing: "Golden-hour slots", inclusions: ["All locations", "Changing room", "Power points"], priceFrom: f.price.dayOut, priceUnit: "shoot", pricing: "flat", image: img("packages/shoots.webp", "") });
  if (f.occasions.includes("corporate"))
    list.push({ id: "corporate", name: "Corporate Offsite", bestFor: "Teams who think better outdoors", timing: `Day or overnight · up to ${Math.min(f.capacity.eventGuests, 120)} people`, inclusions: ["Wi-Fi", "Lawn sessions", "Meals arranged"], priceFrom: f.price.dayOut, priceUnit: "day", pricing: "flat", image: img("packages/corporate.webp", "") });
  // each card uses the farmhouse's own photos
  const pics = [f.cover, ...f.spaces.map((s) => s.image), ...f.gallery];
  return list.map((p, i) => ({ ...p, image: { ...pics[i % pics.length], alt: "" } }));
}

/** Lowest indicative price, for cards ("from ₹…") */
export function fromPrice(f: Farmhouse): { amount: number | null; unit: string } {
  const opts = [
    f.price.dayOut != null ? { amount: f.price.dayOut, unit: "day" } : null,
    f.price.night != null ? { amount: f.price.night, unit: "night" } : null,
  ].filter(Boolean) as { amount: number; unit: string }[];
  if (!opts.length) return { amount: f.price.event, unit: "event" };
  return opts.sort((a, b) => a.amount - b.amount)[0];
}
