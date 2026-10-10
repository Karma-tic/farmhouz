import { handle } from "@/lib/api";
import { isAdmin, unauthorized } from "@/lib/admin-auth";
import { listBookings } from "@/lib/booking/repo";
import { dbConfigured } from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  if (!dbConfigured()) return Response.json({ ok: true, bookings: [], dbConfigured: false });
  return handle(async () => Response.json({ ok: true, bookings: await listBookings(), dbConfigured: true }, { headers: { "Cache-Control": "no-store" } }));
}
