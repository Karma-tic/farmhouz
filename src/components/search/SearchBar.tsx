"use client";

import { format } from "date-fns";
import { CalendarDays, Minus, Plus, Search, Sparkles, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { Popover } from "radix-ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { fromIso, toIso } from "@/components/enquiry/useBooked";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import type { OccasionId } from "@/content/types";
import { cn } from "@/lib/utils";

const AvailabilityCalendar = dynamic(() => import("@/components/enquiry/AvailabilityCalendar").then((m) => m.AvailabilityCalendar), {
  ssr: false,
  loading: () => <div className="h-[360px] w-[320px]" aria-busy="true" />,
});

export type SearchValue = { from?: string; to?: string; guests?: number; occasion?: OccasionId | "" };

export const searchToQuery = (v: SearchValue) => {
  const q = new URLSearchParams();
  if (v.from) q.set("from", v.from);
  if (v.to) q.set("to", v.to);
  if (v.guests) q.set("guests", String(v.guests));
  if (v.occasion) q.set("occasion", v.occasion);
  return q.toString();
};

const occasionOptions = Object.entries(site.occasionLabels) as [OccasionId, string][];

/**
 * Dates · guests · occasion. On the homepage it navigates to the city page;
 * on the city page it updates the filters live (onChange).
 */
export function SearchBar({
  value,
  onChange,
  tone = "light",
  city = "bhopal",
  className,
}: {
  value?: SearchValue;
  onChange?: (v: SearchValue) => void;
  tone?: "light" | "glass";
  city?: string;
  className?: string;
}) {
  const router = useRouter();
  const [local, setLocal] = useState<SearchValue>(value ?? { guests: 20 });
  const [calOpen, setCalOpen] = useState(false);
  const live = onChange !== undefined;
  // live mode is fully controlled by the URL; otherwise keep local state until submit
  const v = live ? (value ?? {}) : local;

  const update = (patch: Partial<SearchValue>) => {
    const next = { ...v, ...patch };
    if (live) onChange?.(next);
    else setLocal(next);
  };
  const range: DateRange | undefined = v.from ? { from: fromIso(v.from), to: fromIso(v.to) } : undefined;
  const dateLabel = v.from ? `${format(fromIso(v.from) as Date, "d MMM")}${v.to ? ` → ${format(fromIso(v.to) as Date, "d MMM")}` : " · day"}` : "Any dates";

  const glass = tone === "glass";
  const cell = cn(
    "flex min-h-14 flex-1 items-center gap-3 rounded-full px-5 text-left transition-colors",
    glass ? "text-moon hover:bg-moon/10" : "text-ink hover:bg-ink/[0.04]",
  );
  const label = cn("eyebrow block text-[0.66rem]", glass ? "text-moon/75" : "text-muted");

  return (
    <form
      role="search"
      aria-label="Find a farmhouse"
      onSubmit={(e) => {
        e.preventDefault();
        if (!live) router.push(`/${city}${searchToQuery(v) ? `?${searchToQuery(v)}` : ""}`);
      }}
      className={cn(
        "flex w-full max-w-3xl flex-col gap-1 rounded-[28px] p-1.5 sm:flex-row sm:items-center sm:rounded-full",
        glass ? "border border-moon/25 bg-night/35 backdrop-blur-md" : "border border-line bg-card shadow-soft",
        className,
      )}
    >
      <Popover.Root open={calOpen} onOpenChange={setCalOpen}>
        <Popover.Trigger asChild>
          <button type="button" className={cell} aria-label={`Dates: ${dateLabel}`}>
            <CalendarDays className="size-5 shrink-0 opacity-80" strokeWidth={1.5} aria-hidden="true" />
            <span>
              <span className={label}>When</span>
              <span className="block text-[0.95rem] font-medium">{dateLabel}</span>
            </span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content sideOffset={10} align="start" collisionPadding={12} className="z-[95] rounded-[var(--radius-card)] border border-line bg-card p-4 text-ink shadow-lift">
            <AvailabilityCalendar
              range={range}
              onChange={(r) => update({ from: toIso(r?.from), to: r?.to && toIso(r.to) !== toIso(r.from) ? toIso(r.to) : "" })}
              booked={[]}
              months={1}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <button type="button" className="link-draw text-sm text-muted" onClick={() => update({ from: "", to: "" })}>
                Clear dates
              </button>
              <Button size="sm" variant="sage" type="button" onClick={() => setCalOpen(false)}>
                Done
              </Button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <span aria-hidden="true" className={cn("hidden h-8 w-px sm:block", glass ? "bg-moon/20" : "bg-line")} />

      <div className={cn(cell, "justify-between hover:bg-transparent")}>
        <span className="flex items-center gap-3">
          <Users className="size-5 shrink-0 opacity-80" strokeWidth={1.5} aria-hidden="true" />
          <span>
            <span className={label} id="sb-guests">
              Guests
            </span>
            <span className="block font-mono text-[0.95rem] font-medium" aria-live="polite" aria-labelledby="sb-guests">
              {v.guests ?? "Any"}
            </span>
          </span>
        </span>
        <span className="flex gap-1">
          <button type="button" aria-label="Fewer guests" onClick={() => update({ guests: Math.max(1, (v.guests ?? 1) - (v.guests && v.guests > 20 ? 10 : 2)) })} className={cn("grid size-11 place-items-center rounded-full border", glass ? "border-moon/30" : "border-line")}>
            <Minus className="size-4" strokeWidth={1.5} />
          </button>
          <button type="button" aria-label="More guests" onClick={() => update({ guests: (v.guests ?? 0) + ((v.guests ?? 0) >= 20 ? 10 : 2) })} className={cn("grid size-11 place-items-center rounded-full border", glass ? "border-moon/30" : "border-line")}>
            <Plus className="size-4" strokeWidth={1.5} />
          </button>
        </span>
      </div>

      <span aria-hidden="true" className={cn("hidden h-8 w-px sm:block", glass ? "bg-moon/20" : "bg-line")} />

      <label className={cn(cell, "relative cursor-pointer")}>
        <Sparkles className="size-5 shrink-0 opacity-80" strokeWidth={1.5} aria-hidden="true" />
        <span className="flex-1">
          <span className={label}>Occasion</span>
          <select
            value={v.occasion ?? ""}
            onChange={(e) => update({ occasion: e.target.value as OccasionId | "" })}
            className={cn("block w-full appearance-none bg-transparent text-[0.95rem] font-medium outline-none", glass && "[&>option]:text-ink")}
          >
            <option value="">Anything</option>
            {occasionOptions.map(([id, l]) => (
              <option key={id} value={id}>
                {l}
              </option>
            ))}
          </select>
        </span>
      </label>

      {!live && (
        <Button type="submit" size="lg" className="h-14 shrink-0 px-6" data-cursor="Book">
          <Search /> Find farmhouses
        </Button>
      )}
    </form>
  );
}
