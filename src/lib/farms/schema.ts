import { z } from "zod";
import { cities } from "@/content/cities";

/** Validation for the admin farmhouse editor (used in the browser and on the server). */

export const OCCASIONS = ["day-out", "night-stay", "weekend", "birthday", "haldi-mehendi", "wedding", "shoot", "corporate"] as const;
export const AMENITIES = ["pool", "wifi", "parking", "caretaker", "kitchen", "cook", "music", "bonfire", "games", "pets", "ac", "power-backup", "lawn", "hall"] as const;

const areaSlugs = cities.flatMap((c) => c.areas.map((a) => a.slug));
const text = (max: number) => z.string().trim().max(max);
const price = z.number().int().min(0).max(10_000_000).nullable();
const media = z.object({
  src: z
    .string()
    .trim()
    .min(1, "Upload a photo")
    .max(600)
    .refine((s) => s.startsWith("https://") || s.startsWith("/"), "Upload a photo"),
  alt: text(200),
});

export const farmSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only")
      .min(3, "At least 3 characters")
      .max(60),
    name: text(60).min(2, "Name the farmhouse"),
    published: z.boolean(),
    city: z.enum(cities.map((c) => c.slug) as [string, ...string[]]),
    area: z.string().refine((a) => areaSlugs.includes(a), "Pick an area"),
    tagline: text(140).min(10, "One line that sells it (10+ characters)"),
    description: text(1500).min(30, "A few sentences about the place"),
    highlights: z.array(text(40)).max(4),
    capacity: z.object({
      bedrooms: z.number().int().min(0).max(60),
      sleeps: z.number().int().min(0).max(300),
      eventGuests: z.number().int().min(1, "How many guests for an event?").max(3000),
    }),
    acres: z.number().min(0).max(1000),
    approx: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
    kmFromCentre: z.number().min(0).max(300),
    driveTime: text(30).min(1),
    price: z.object({ dayOut: price, night: price, event: price }),
    occasions: z.array(z.enum(OCCASIONS)).min(1, "Tick at least one"),
    amenities: z.array(z.enum(AMENITIES)),
    spaces: z
      .array(
        z.object({
          id: text(40).min(1),
          name: text(40).min(2, "Name this space"),
          description: text(300),
          chips: z.tuple([text(24), text(24), text(24)]),
          image: media,
        }),
      )
      .max(6),
    cover: media,
    gallery: z.array(media).max(40),
    times: z.object({ checkIn: text(20), checkOut: text(20), dayOut: text(40), musicCutoff: text(20) }),
    rules: z.array(text(200)).max(20),
  })
  .superRefine((f, ctx) => {
    if (f.published && f.gallery.length < 3) ctx.addIssue({ code: "custom", path: ["gallery"], message: "Add at least 3 gallery photos before publishing" });
  });

export const ownerSchema = z.object({
  ownerName: text(80),
  ownerWhatsapp: z
    .string()
    .trim()
    .max(20)
    .transform((s) => {
      const d = s.replace(/\D/g, "");
      return d.length === 10 ? `91${d}` : d;
    }),
  caretakerName: text(80),
  caretakerPhone: text(20),
  exactAddress: text(400),
  mapsUrl: z.string().trim().max(500).url("Paste a Google Maps link").or(z.literal("")),
  notes: text(2000).optional(),
});

export const saveFarmSchema = z.object({ farm: farmSchema, owner: ownerSchema, previousSlug: z.string().max(60).optional() });
export type SaveFarmInput = z.input<typeof saveFarmSchema>;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
