import { after } from "next/server";
import { bad, handle, originOf, readJson } from "@/lib/api";
import { createLead } from "@/lib/booking/repo";
import { leadSchema } from "@/lib/booking/schema";
import { notifyAdminNote } from "@/lib/notify";

export async function POST(req: Request) {
  return handle(async () => {
    const parsed = leadSchema.safeParse(await readJson(req));
    if (!parsed.success) return bad("Please check the highlighted fields.", 422, { errors: parsed.error.flatten().fieldErrors });
    if (parsed.data.company) return Response.json({ ok: true });
    await createLead(parsed.data);
    const l = parsed.data;
    const origin = originOf(req);
    after(() =>
      notifyAdminNote(
        `New owner: ${l.farmName}${l.area ? ` · ${l.area}` : ""}`,
        [`${l.name} · ${l.phone}`, l.guests && `Guests: ${l.guests}`, l.hasPool && "Has a pool", l.photosLink && `Photos: ${l.photosLink}`, l.notes && `Note: ${l.notes}`, `\n${origin}/admin/leads`].filter(Boolean).join("\n"),
      ),
    );
    return Response.json({ ok: true });
  });
}
