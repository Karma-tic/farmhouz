import { connection } from "next/server";
import { handle } from "@/lib/api";
import { blockedByFarm } from "@/lib/booking/repo";
import { dbConfigured } from "@/lib/db";

/** Booked days per farmhouse: { "mango-grove-kerwa": ["2026-11-14", …], … } */
export async function GET(req: Request) {
  await connection();
  const city = new URL(req.url).searchParams.get("city") ?? "bhopal";
  if (!dbConfigured()) return Response.json({ ok: true, booked: {} });
  return handle(async () =>
    Response.json({ ok: true, booked: await blockedByFarm(city) }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }),
  );
}
