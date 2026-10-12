"use client";

import { Map as MapIcon, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useBookedMap } from "@/components/enquiry/useBooked";
import { AreaMap } from "@/components/farm/AreaMap";
import { FarmCard } from "@/components/farm/FarmCard";
import { Button } from "@/components/ui/button";
import { getCity } from "@/content/cities";
import { fromPrice } from "@/content/farmhouses";
import { useFarms } from "@/lib/farms/client";
import { site } from "@/content/site";
import type { AmenityId, OccasionId } from "@/content/types";
import { occupiedDays } from "@/lib/booking/dates";
import { cn } from "@/lib/utils";
import { SearchBar, searchToQuery, type SearchValue } from "./SearchBar";

const AMENITY_FILTERS: AmenityId[] = ["pool", "pets", "ac", "hall", "cook"];
const SORTS = [
  { id: "recommended", label: "Recommended" },
  { id: "price", label: "Price: low to high" },
  { id: "near", label: "Closest to city" },
  { id: "big", label: "Biggest groups" },
] as const;

/** City page: live filters (URL-synced), results grid and a sticky area map. */
export function Explorer({ city }: { city: string }) {
  const { inCity: farmhousesIn } = useFarms();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const booked = useBookedMap();
  const [hover, setHover] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const c = getCity(city)!;

  const q = {
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
    guests: Number(params.get("guests")) || undefined,
    occasion: (params.get("occasion") ?? "") as OccasionId | "",
    area: params.get("area") ?? "",
    amenities: (params.get("has") ?? "").split(",").filter(Boolean) as AmenityId[],
    sort: (params.get("sort") ?? "recommended") as (typeof SORTS)[number]["id"],
  };

  const setParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };
  const onSearch = (v: SearchValue) => setParams({ from: v.from, to: v.to, guests: v.guests ? String(v.guests) : undefined, occasion: v.occasion || undefined });

  const wanted = q.from ? occupiedDays(q.from, q.to || null) : [];
  const availability = (slug: string): "free" | "booked" | null => {
    if (!wanted.length || !booked) return null;
    const days = booked[slug] ?? [];
    return wanted.some((d) => days.includes(d)) ? "booked" : "free";
  };

  const all = farmhousesIn(city);
  const results = useMemo(() => {
    let r = all.filter(
      (f) =>
        (!q.guests || f.capacity.eventGuests >= q.guests) &&
        (!q.occasion || f.occasions.includes(q.occasion)) &&
        (!q.area || f.area === q.area) &&
        q.amenities.every((a) => f.amenities.includes(a)),
    );
    const price = (f: (typeof r)[number]) => fromPrice(f).amount ?? 1e9;
    if (q.sort === "price") r = [...r].sort((a, b) => price(a) - price(b));
    if (q.sort === "near") r = [...r].sort((a, b) => a.kmFromCentre - b.kmFromCentre);
    if (q.sort === "big") r = [...r].sort((a, b) => b.capacity.eventGuests - a.capacity.eventGuests);
    // free on your dates first
    if (wanted.length && booked) r = [...r].sort((a, b) => Number(availability(a.slug) === "booked") - Number(availability(b.slug) === "booked"));
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, booked]);

  const carry = searchToQuery({ from: q.from, to: q.to, guests: q.guests });
  const activeFilters = Number(!!q.area) + q.amenities.length;
  const toggleAmenity = (a: AmenityId) => setParams({ has: (q.amenities.includes(a) ? q.amenities.filter((x) => x !== a) : [...q.amenities, a]).join(",") || undefined });

  const Filters = (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Area"
        value={q.area}
        onChange={(e) => setParams({ area: e.target.value || undefined })}
        className={cn("min-h-11 appearance-none rounded-full border bg-card bg-[length:14px] bg-[right_0.9rem_center] bg-no-repeat pl-4 pr-9 text-sm font-medium", q.area ? "border-ink" : "border-line")}
        style={{ backgroundImage: "var(--chevron)" }}
      >
        <option value="">All areas</option>
        {c.areas.map((a) => (
          <option key={a.slug} value={a.slug}>
            {a.name}
          </option>
        ))}
      </select>
      {AMENITY_FILTERS.map((a) => (
        <button
          key={a}
          type="button"
          aria-pressed={q.amenities.includes(a)}
          onClick={() => toggleAmenity(a)}
          className={cn("min-h-11 rounded-full border px-4 text-sm font-medium transition-colors", q.amenities.includes(a) ? "border-ink bg-ink text-cream" : "border-line bg-card text-ink hover:border-ink/40")}
        >
          {site.amenityLabels[a]}
        </button>
      ))}
      <select
        aria-label="Sort"
        value={q.sort}
        onChange={(e) => setParams({ sort: e.target.value === "recommended" ? undefined : e.target.value })}
        className="min-h-11 appearance-none rounded-full border border-line bg-card bg-[length:14px] bg-[right_0.9rem_center] bg-no-repeat pl-4 pr-9 text-sm font-medium"
        style={{ backgroundImage: "var(--chevron)" }}
      >
        {SORTS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      {(activeFilters > 0 || q.occasion || q.guests || q.from) && (
        <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="link-draw ml-1 min-h-11 text-sm text-muted">
          Clear all
        </button>
      )}
    </div>
  );

  return (
    <div className="container-x pb-24">
      <div className="sticky top-[calc(var(--header-h)+8px)] z-30 -mx-2 mb-8 flex flex-col gap-3 rounded-[30px] px-2 py-2 backdrop-blur-md">
        <SearchBar value={{ from: q.from, to: q.to, guests: q.guests, occasion: q.occasion }} onChange={onSearch} className="max-w-none" />
      </div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="eyebrow text-muted" aria-live="polite">
          <SlidersHorizontal className="mr-2 inline size-4 align-[-3px]" strokeWidth={1.5} aria-hidden="true" />
          {results.length} farmhouse{results.length === 1 ? "" : "s"}
          {q.from && booked ? ` · ${results.filter((f) => availability(f.slug) === "free").length} free on your dates` : ""}
        </p>
        {Filters}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(360px,0.8fr)]">
        <div>
          {results.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center">
              <p className="display display-md mb-3">Nothing matches — yet.</p>
              <p className="mx-auto mb-6 max-w-md text-muted">Try fewer filters, or tell us what you need on WhatsApp. We know a few farms that aren&apos;t listed here.</p>
              <Button variant="outline" className="text-ink" onClick={() => router.replace(pathname, { scroll: false })}>
                Clear filters
              </Button>
            </div>
          ) : (
            <motion.ul layout className="grid gap-6 sm:grid-cols-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((f, i) => (
                  <motion.li key={f.slug} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                    <FarmCard farm={f} availability={availability(f.slug)} onHover={setHover} active={hover === f.slug} priority={i < 2} query={carry} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>
        <aside aria-label="Map" className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+120px)] overflow-hidden rounded-[28px] border border-line bg-card shadow-soft">
            <AreaMap city={city} farms={results} activeSlug={hover} onHover={setHover} focusArea={q.area || undefined} />
          </div>
        </aside>
      </div>

      {/* mobile map */}
      <Button onClick={() => setMapOpen(true)} className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 shadow-lift lg:hidden" variant="sage">
        <MapIcon /> Map
      </Button>
      <AnimatePresence>
        {mapOpen && (
          <motion.div className="fixed inset-0 z-[80] flex flex-col bg-cream lg:hidden" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} role="dialog" aria-modal="true" aria-label="Map of farmhouses">
            <div className="container-x flex h-[var(--header-h)] items-center justify-between">
              <span className="eyebrow text-muted">{results.length} on the map</span>
              <Button variant="ghost" size="icon" aria-label="Close map" onClick={() => setMapOpen(false)}>
                <X />
              </Button>
            </div>
            <div className="container-x flex-1 overflow-auto pb-8">
              <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
                <AreaMap city={city} farms={results} activeSlug={hover} onHover={setHover} focusArea={q.area || undefined} />
              </div>
              <p className="mt-4 text-sm text-muted">Tap a pin to open the farmhouse. Pins are approximate.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
