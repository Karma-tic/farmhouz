import "server-only";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import type { Farmhouse } from "@/content/types";
import { db, dbConfigured } from "@/lib/db";
import type { OwnerInfo } from "./types";

/**
 * Farmhouses live in the database (edited in /admin/farms).
 * Public pages read a cached list that is refreshed the moment you save.
 */
export const FARMS_TAG = "farms";

function toFarm(r: Record<string, unknown>): Farmhouse {
  return { ...(r.data as Farmhouse), slug: String(r.slug), published: Boolean(r.published), sample: false };
}

/** Published farmhouses, cached until an admin edit. */
export async function getFarms(): Promise<Farmhouse[]> {
  "use cache";
  cacheTag(FARMS_TAG);
  if (!dbConfigured()) {
    cacheLife("hours");
    return [];
  }
  try {
    const sql = await db();
    const rows = await sql`select slug, data, published from farms where published order by sort, created_at`;
    cacheLife("max");
    return rows.map((r) => toFarm(r));
  } catch (e) {
    // don't keep an empty list around if the database was briefly unreachable
    console.error("[farms] couldn't load", e);
    cacheLife("hours");
    return [];
  }
}

export async function getFarm(slug: string) {
  return (await getFarms()).find((f) => f.slug === slug);
}

export async function farmsIn(city: string) {
  return (await getFarms()).filter((f) => f.city === city);
}

/** Private owner details — only for the admin panel and a confirmed booking pass. */
export async function getOwner(slug: string): Promise<OwnerInfo> {
  const empty: OwnerInfo = { ownerName: "", ownerWhatsapp: "", caretakerName: "", caretakerPhone: "", exactAddress: "", mapsUrl: "" };
  if (!dbConfigured()) return empty;
  const sql = await db();
  const [r] = await sql`select private from farms where slug = ${slug}`;
  return { ...empty, ...((r?.private as OwnerInfo) ?? {}) };
}

/* ------------------------------------------------------------------ admin */
export type AdminFarm = { farm: Farmhouse; owner: OwnerInfo; updatedAt: string };

export async function listAllFarms(): Promise<AdminFarm[]> {
  const sql = await db();
  const rows = await sql`select slug, data, private, published, updated_at from farms order by sort, created_at`;
  return rows.map((r) => ({ farm: toFarm(r), owner: r.private as OwnerInfo, updatedAt: new Date(r.updated_at as string).toISOString() }));
}

export async function saveFarm(farm: Farmhouse, owner: OwnerInfo, previousSlug?: string) {
  const sql = await db();
  const { slug, published, ...data } = farm;
  await sql.begin(async (tx) => {
    if (previousSlug && previousSlug !== slug) {
      await tx`update farms set slug = ${slug} where slug = ${previousSlug}`;
      await tx`update bookings set farm_slug = ${slug} where farm_slug = ${previousSlug}`;
      await tx`update blocked_dates set farm_slug = ${slug} where farm_slug = ${previousSlug}`;
    }
    await tx`insert into farms (slug, data, private, published, sort)
             values (${slug}, ${tx.json(data as never)}, ${tx.json(owner as never)}, ${published}, (select coalesce(max(sort), 0) + 1 from farms))
             on conflict (slug) do update set data = excluded.data, private = excluded.private, published = excluded.published, updated_at = now()`;
  });
  revalidateTag(FARMS_TAG, "max");
}

export async function slugTaken(slug: string) {
  const sql = await db();
  const [r] = await sql`select 1 from farms where slug = ${slug}`;
  return Boolean(r);
}

export async function deleteFarm(slug: string) {
  const sql = await db();
  const [b] = await sql`select 1 from bookings where farm_slug = ${slug} limit 1`;
  if (b) throw new Error("HAS_BOOKINGS");
  await sql`delete from farms where slug = ${slug}`;
  revalidateTag(FARMS_TAG, "max");
}
