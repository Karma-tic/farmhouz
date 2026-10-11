import { after } from "next/server";
import { bad, handle, originOf, readJson } from "@/lib/api";
import { createWaitlist } from "@/lib/booking/repo";
import { waitlistSchema } from "@/lib/booking/schema";
import { notifyAdminNote } from "@/lib/notify";

/** Pre-launch: guests leave their number to hear first when bookings open. */
export async function POST(req: Request) {
  return handle(async () => {
    const parsed = waitlistSchema.safeParse(await readJson(req));
    if (!parsed.success) return bad("Please check the highlighted fields.", 422, { errors: parsed.error.flatten().fieldErrors });
    const w = parsed.data;
    if (w.company) return Response.json({ ok: true });
    await createWaitlist(w);
    const origin = originOf(req);
    after(() =>
      notifyAdminNote(
        `Waitlist: ${w.name}${w.occasion ? ` · ${w.occasion}` : ""}`,
        [`${w.name} · ${w.phone}`, w.occasion && `Occasion: ${w.occasion}`, w.when && `When: ${w.when}`, w.guests && `Guests: ${w.guests}`, w.notes && `Note: ${w.notes}`, `\n${origin}/admin/waitlist`].filter(Boolean).join("\n"),
      ),
    );
    return Response.json({ ok: true });
  });
}
