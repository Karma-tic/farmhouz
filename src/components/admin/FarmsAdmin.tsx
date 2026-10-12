"use client";

import { ExternalLink, Pencil, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getArea } from "@/content/cities";
import { site } from "@/content/site";
import type { Farmhouse } from "@/content/types";
import type { OwnerInfo } from "@/lib/farms/types";
import { cn } from "@/lib/utils";
import { AdminShell } from "./AdminShell";
import { useAdminData } from "./useAdmin";

export type AdminFarmRow = { farm: Farmhouse; owner: OwnerInfo; updatedAt: string };

/** All farmhouses, drafts included. */
export function FarmsAdmin() {
  const { data, needsLogin, reload, error } = useAdminData<{ farms: AdminFarmRow[] }>("/api/admin/farms", 0);
  const live = data?.farms.filter((f) => f.farm.published).length ?? 0;
  return (
    <AdminShell needsLogin={needsLogin} onLogin={reload}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display display-md mb-2">Farmhouses</h1>
          <p className="text-muted">
            {data ? `${data.farms.length} in total · ${live} published` : "Your listings"}
            {!site.launched && " · the site is in pre-launch, so published farmhouses show once you launch"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/farms/edit">
            <Plus /> Add farmhouse
          </Link>
        </Button>
      </div>
      {error && <p className="text-terra">{error}</p>}
      {!data ? (
        <p className="text-muted">Loading…</p>
      ) : data.farms.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center">
          <p className="display mb-2 text-[1.6rem]">No farmhouses yet</p>
          <p className="mb-6 text-muted">Visited one? Add it with its photos, prices and the owner&apos;s details. Save it as a draft until it&apos;s ready.</p>
          <Button asChild>
            <Link href="/admin/farms/edit">
              <Plus /> Add your first farmhouse
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.farms.map(({ farm: f, updatedAt }) => (
            <li key={f.slug} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
              <div className="relative aspect-[16/10] bg-ink/5">
                {f.cover?.src && <Image src={f.cover.src} alt="" fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />}
                <span className={cn("eyebrow absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.66rem]", f.published ? "bg-sage text-cream" : "bg-ink/80 text-cream")}>{f.published ? "Published" : "Draft"}</span>
              </div>
              <div className="p-5">
                <p className="display text-[1.5rem] leading-tight">{f.name}</p>
                <p className="mb-4 text-sm text-muted">
                  {getArea(f.city, f.area)?.name} · {f.capacity.eventGuests} guests · {f.gallery.length} photos · edited {new Date(updatedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/admin/farms/edit?slug=${f.slug}`}>
                      <Pencil /> Edit
                    </Link>
                  </Button>
                  {f.published && site.launched && (
                    <Button asChild size="sm" variant="ghost" className="text-ink">
                      <a href={`/${f.city}/${f.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink /> View
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
