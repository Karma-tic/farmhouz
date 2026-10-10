import { z } from "zod";
import { bad, handle, readJson } from "@/lib/api";
import { isAdmin, unauthorized } from "@/lib/admin-auth";
import { listLeads, setLeadStatus } from "@/lib/booking/repo";
import { dbConfigured } from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  if (!dbConfigured()) return Response.json({ ok: true, leads: [] });
  return handle(async () => Response.json({ ok: true, leads: await listLeads() }, { headers: { "Cache-Control": "no-store" } }));
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const p = z.object({ id: z.string().uuid(), status: z.enum(["new", "contacted", "visited", "listed", "declined"]) }).safeParse(await readJson(req));
  if (!p.success) return bad("Check the request", 422);
  return handle(async () => {
    await setLeadStatus(p.data.id, p.data.status);
    return Response.json({ ok: true });
  });
}
