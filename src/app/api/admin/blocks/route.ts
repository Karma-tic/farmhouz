import { z } from "zod";
import { bad, handle, readJson } from "@/lib/api";
import { isAdmin, unauthorized } from "@/lib/admin-auth";
import { blockDays, listBlocks, unblockDays } from "@/lib/booking/repo";
import { getFarm } from "@/lib/farms/server";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const body = z.object({ farm: z.string(), block: z.array(day).max(120).default([]), unblock: z.array(day).max(120).default([]) });

export async function GET(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const farm = new URL(req.url).searchParams.get("farm") ?? "";
  if (!(await getFarm(farm))) return bad("Pick a published farmhouse", 404);
  return handle(async () => Response.json({ ok: true, blocks: await listBlocks(farm) }, { headers: { "Cache-Control": "no-store" } }));
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const parsed = body.safeParse(await readJson(req));
  if (!parsed.success || !(await getFarm(parsed.data.farm))) return bad("Check the request", 422);
  return handle(async () => {
    await blockDays(parsed.data.farm, parsed.data.block, "manual");
    await unblockDays(parsed.data.farm, parsed.data.unblock);
    return Response.json({ ok: true, blocks: await listBlocks(parsed.data.farm) });
  });
}
