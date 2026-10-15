import { z } from "zod";

export const PACKAGE_IDS = ["day-out", "night-stay", "weekend-escape", "celebrations", "shoots", "corporate"] as const;

/** Indian mobile: optional +91 / 0, then 10 digits starting 6–9; spaces and dashes allowed */
export const INDIAN_PHONE = /^(?:\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}$/;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const requestSchema = z
  .object({
    farmSlug: z.string().min(1).max(80),
    name: z.string().trim().min(2, "Please tell us your name").max(80),
    phone: z.string().trim().regex(INDIAN_PHONE, "Enter a 10-digit mobile number, e.g. 98765 43210"),
    email: z.string().trim().email("Check your email address").max(120).optional().or(z.literal("")),
    from: isoDate,
    to: isoDate.optional().or(z.literal("")),
    packageId: z.enum(PACKAGE_IDS, { error: "Choose what you're planning" }),
    guests: z.number({ error: "How many guests?" }).int().min(1, "At least 1 guest").max(1000, "Call us for groups over 1000"),
    occasion: optionalText(80),
    message: optionalText(1000),
    /** honeypot: must stay empty */
    company: z.string().max(0).optional().or(z.literal("")),
  })
  .refine((v) => !v.to || v.to > v.from, { path: ["to"], message: "Check-out must be after check-in" });

export type RequestInput = z.input<typeof requestSchema>;
export type RequestData = z.output<typeof requestSchema>;

export const paymentSchema = z.object({
  action: z.literal("payment"),
  utr: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{6,30}$/, "Enter the UPI reference / UTR from your payment app (6–30 letters or digits)"),
  payerName: optionalText(80),
});

export const switchSchema = z
  .object({
    action: z.literal("switch"),
    farmSlug: z.string().min(1).max(80).optional(),
    from: isoDate,
    to: isoDate.nullable().optional(),
  })
  .refine((v) => !v.to || v.to > v.from, { path: ["to"], message: "Check-out must be after check-in" });

export const guestCancelSchema = z.object({ action: z.literal("cancel") });

export const guestActionSchema = z.union([paymentSchema, switchSchema, guestCancelSchema]);

export const adminActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("available"),
    quoteTotal: z.number().int().min(1).max(10_000_000),
    advance: z.number().int().min(0).max(10_000_000),
    holdHours: z.number().int().min(1).max(168),
    guestNote: optionalText(600),
  }),
  z.object({
    action: z.literal("unavailable"),
    altDates: z.array(z.object({ from: isoDate, to: isoDate.nullable() })).max(6),
    altFarms: z.array(z.string().max(80)).max(4),
    blockDates: z.boolean(),
    guestNote: optionalText(600),
  }),
  z.object({ action: z.literal("confirm"), guestNote: optionalText(600) }),
  z.object({ action: z.literal("reject_payment"), guestNote: z.string().trim().min(3).max(600) }),
  z.object({ action: z.literal("recheck") }),
  z.object({ action: z.literal("cancel"), guestNote: optionalText(600) }),
  z.object({ action: z.literal("note"), adminNote: z.string().trim().max(2000) }),
]);
export type AdminAction = z.infer<typeof adminActionSchema>;

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Your name, please").max(80),
  phone: z.string().trim().regex(INDIAN_PHONE, "Enter a 10-digit mobile number"),
  farmName: z.string().trim().min(2, "What's the farmhouse called?").max(120),
  area: optionalText(80),
  guests: z.number().int().min(1).max(2000).optional(),
  hasPool: z.boolean().optional(),
  photosLink: z.string().trim().url("Paste a link (Google Drive, Instagram…)").max(400).optional().or(z.literal("")),
  notes: optionalText(1000),
  source: optionalText(40),
  ref: optionalText(60),
  company: z.string().max(0).optional().or(z.literal("")),
});
export type LeadInput = z.input<typeof leadSchema>;

export const waitlistSchema = z.object({
  name: z.string().trim().min(2, "Your name, please").max(80),
  phone: z.string().trim().regex(INDIAN_PHONE, "Enter a 10-digit mobile number"),
  occasion: optionalText(40),
  when: optionalText(80),
  guests: z.number().int().min(1).max(2000).optional(),
  notes: optionalText(600),
  source: optionalText(40),
  ref: optionalText(60),
  company: z.string().max(0).optional().or(z.literal("")),
});
export type WaitlistInput = z.input<typeof waitlistSchema>;

/** "How did you hear about us?" options shown on both forms */
export const SOURCES = ["Instagram", "WhatsApp", "Google search", "Facebook", "Friend or family", "Poster or flyer", "Someone from Farmhouze called me", "Other"] as const;
