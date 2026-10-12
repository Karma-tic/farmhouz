import { bad, handle, readJson } from "@/lib/api";
import { isAdmin, unauthorized } from "@/lib/admin-auth";
import { dbConfigured } from "@/lib/db";
import { saveFarmSchema } from "@/lib/farms/schema";
import { deleteFarm, listAllFarms, saveFarm, slugTaken } from "@/lib/farms/server";
import type { Farmhouse } from "@/content/types";

/** Admin: list every farmhouse (drafts included, with private owner details). */
export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  if (!dbConfigured()) return Response.json({ ok: true, farms: [] });
  return handle(async () => Response.json({ ok: true, farms: await listAllFarms() }, { headers: { "Cache-Control": "no-store" } }));
}

/** Admin: create or update a farmhouse. Publishing refreshes the public pages at once. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const parsed = saveFarmSchema.safeParse(await readJson(req));
  if (!parsed.success) return bad("Please check the highlighted fields.", 422, { issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
  const { farm, owner, previousSlug } = parsed.data;
  return handle(async () => {
    if (farm.slug !== previousSlug && (await slugTaken(farm.slug))) return bad("Another farmhouse already uses that link. Change the name or link.", 409, { issues: [{ path: "slug", message: "Already taken" }] });
    const full: Farmhouse = { ...farm, sample: false, cover: { ...farm.cover }, spaces: farm.spaces as Farmhouse["spaces"] };
    await saveFarm(full, owner, previousSlug);
    return Response.json({ ok: true, slug: farm.slug });
  });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  return handle(async () => {
    try {
      await deleteFarm(slug);
    } catch (e) {
      if (e instanceof Error && e.message === "HAS_BOOKINGS") return bad("This farmhouse has bookings, so it can't be deleted. Unpublish it instead.", 409);
      throw e;
    }
    return Response.json({ ok: true });
  });
}
