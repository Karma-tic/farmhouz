import { z } from "zod";

export const PACKAGE_IDS = ["day-out", "night-stay", "weekend-escape", "celebrations", "shoots", "corporate"] as const;

/** Indian mobile: optional +91 / 0, then 10 digits starting 6–9; spaces and dashes allowed */
export const INDIAN_PHONE = /^(?:\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}$/;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");

export const enquirySchema = z
  .object({
    name: z.string().trim().min(2, "Please tell us your name").max(80),
    phone: z.string().trim().regex(INDIAN_PHONE, "Enter a 10-digit mobile number, e.g. 98765 43210"),
    from: isoDate,
    to: isoDate.optional().or(z.literal("")),
    packageId: z.enum(PACKAGE_IDS, { error: "Choose a package" }),
    guests: z.number({ error: "How many guests?" }).int().min(1, "At least 1 guest").max(500, "Call us for groups over 500"),
    occasion: z.string().trim().max(80).optional().or(z.literal("")),
    message: z.string().trim().max(1000, "Keep it under 1000 characters").optional().or(z.literal("")),
    /** honeypot: must stay empty */
    company: z.string().max(0).optional().or(z.literal("")),
  })
  .refine((v) => !v.to || v.to >= v.from, { path: ["to"], message: "Check-out must be after check-in" });

export type EnquiryInput = z.input<typeof enquirySchema>;
export type Enquiry = z.output<typeof enquirySchema>;

export function nightsBetween(from?: string, to?: string) {
  if (!from || !to) return 0;
  const ms = new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}
