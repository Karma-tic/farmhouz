import { after } from "next/server";
import { site } from "@/content/site";
import { bad, handle, readJson } from "@/lib/api";
import { createLead } from "@/lib/booking/repo";
import { leadSchema } from "@/lib/booking/schema";

export async function POST(req: Request) {
  return handle(async () => {
    const parsed = leadSchema.safeParse(await readJson(req));
    if (!parsed.success) return bad("Please check the highlighted fields.", 422, { errors: parsed.error.flatten().fieldErrors });
    if (parsed.data.company) return Response.json({ ok: true });
    await createLead(parsed.data);
    after(() => console.info(`[lead] ${parsed.data.farmName} · ${parsed.data.name} · ${parsed.data.phone} → ${site.contact.email}`));
    return Response.json({ ok: true });
  });
}
