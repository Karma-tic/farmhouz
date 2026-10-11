import { z } from "zod";
import { bad, handle, readJson } from "@/lib/api";
import { isAdmin, unauthorized } from "@/lib/admin-auth";
import { listWaitlist, setWaitlistStatus } from "@/lib/booking/repo";
import { dbConfigured } from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  if (!dbConfigured()) return Response.json({ ok: true, people: [] });
  return handle(async () => Response.json({ ok: true, people: await listWaitlist() }, { headers: { "Cache-Control": "no-store" } }));
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const p = z.object({ id: z.string().uuid(), status: z.enum(["new", "contacted", "booked", "not-interested"]) }).safeParse(await readJson(req));
  if (!p.success) return bad("Check the request", 422);
  return handle(async () => {
    await setWaitlistStatus(p.data.id, p.data.status);
    return Response.json({ ok: true });
  });
}
