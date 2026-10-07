import { Resend } from "resend";
import { site } from "@/content/site";
import { enquirySchema, nightsBetween } from "@/lib/enquiry/schema";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const e = parsed.data;
  // honeypot filled → pretend success, drop silently
  if (e.company) return Response.json({ ok: true });

  const pkg = site.packages.find((p) => p.id === e.packageId);
  const nights = nightsBetween(e.from, e.to || undefined);
  const lines = [
    `New enquiry for ${site.name}`,
    "",
    `Name:      ${e.name}`,
    `Phone:     ${e.phone}`,
    `Dates:     ${e.from}${e.to ? ` → ${e.to} (${nights} night${nights === 1 ? "" : "s"})` : " (day)"}`,
    `Package:   ${pkg?.name ?? e.packageId}`,
    `Guests:    ${e.guests}`,
    `Occasion:  ${e.occasion || "—"}`,
    "",
    e.message || "(no message)",
  ];

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info("[enquiry] RESEND_API_KEY not set — logging instead:\n" + lines.join("\n"));
    return Response.json({ ok: true, delivered: "log" });
  }

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: process.env.ENQUIRY_FROM ?? `${site.name} <onboarding@resend.dev>`,
      to: process.env.ENQUIRY_TO ?? site.contact.email,
      subject: `Enquiry: ${pkg?.name ?? "Booking"} · ${e.from} · ${e.guests} guests · ${e.name}`,
      text: lines.join("\n"),
    });
    if (error) throw new Error(error.message);
    return Response.json({ ok: true, delivered: "email" });
  } catch (err) {
    console.error("[enquiry] email failed", err, "\n" + lines.join("\n"));
    return Response.json({ ok: false, error: "We couldn't send that just now. Please try WhatsApp." }, { status: 502 });
  }
}
