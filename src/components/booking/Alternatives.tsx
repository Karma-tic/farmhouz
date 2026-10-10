"use client";

import { ArrowRight, CalendarDays, Loader2 } from "lucide-react";
import Image from "next/image";
import { Popover } from "radix-ui";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { AvailabilityCalendar } from "@/components/enquiry/AvailabilityCalendar";
import { toIso, useBooked } from "@/components/enquiry/useBooked";
import { Button } from "@/components/ui/button";
import { getArea } from "@/content/cities";
import { fromPrice, getFarmhouse } from "@/content/farmhouses";
import { formatPrice } from "@/content/site";
import { prettyRange } from "@/lib/booking/dates";
import type { PublicBooking } from "@/lib/booking/types";

/** When the farm isn't free: tap a nearby free date, or a similar farm on the same dates. */
export function Alternatives({ booking, onUpdate, sameDatesLabel = "Same dates, similar farmhouses" }: { booking: PublicBooking; onUpdate: (b: PublicBooking) => void; sameDatesLabel?: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();
  const [open, setOpen] = useState(false);
  const { dates: booked } = useBooked(booking.farmSlug);
  const farm = getFarmhouse(booking.farmSlug);

  const sw = async (key: string, body: { farmSlug?: string; from: string; to: string | null }) => {
    setBusy(key);
    setErr("");
    try {
      const res = await fetch(`/api/bookings/${booking.code}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "switch", ...body }) });
      const json = (await res.json()) as { ok: boolean; booking?: PublicBooking; error?: string };
      if (!res.ok || !json.booking) setErr(json.error ?? "Couldn't switch. Try another option.");
      else onUpdate(json.booking);
    } catch {
      setErr("We couldn't reach the server.");
    } finally {
      setBusy(null);
    }
  };

  const { dates, farms } = booking.suggestions;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="eyebrow mb-3 text-sage">Free dates at {farm?.name}</h3>
        <div className="flex flex-wrap gap-2">
          {dates.map((d) => (
            <Button key={d.from} variant="outline" className="text-ink" disabled={!!busy} onClick={() => sw(`d-${d.from}`, { from: d.from, to: d.to })}>
              {busy === `d-${d.from}` ? <Loader2 className="animate-spin" /> : <CalendarDays />} {prettyRange(d.from, d.to, { weekday: true })}
            </Button>
          ))}
          <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
              <Button variant="ghost" className="text-ink">
                Pick other dates…
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content sideOffset={8} collisionPadding={12} className="z-[95] rounded-[var(--radius-card)] border border-line bg-card p-4 text-ink shadow-lift">
                <AvailabilityCalendar range={range} onChange={setRange} booked={booked} months={1} />
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    variant="sage"
                    disabled={!range?.from || !!busy}
                    onClick={() => {
                      const to = range?.to && toIso(range.to) !== toIso(range.from) ? toIso(range.to) : null;
                      setOpen(false);
                      sw("custom", { from: toIso(range?.from), to });
                    }}
                  >
                    Check these dates
                  </Button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>

      {farms.length > 0 && (
        <div>
          <h3 className="eyebrow mb-3 text-sage">{sameDatesLabel}</h3>
          <ul className="grid gap-4 sm:grid-cols-3">
            {farms.map((slug) => {
              const f = getFarmhouse(slug);
              if (!f) return null;
              const p = fromPrice(f);
              return (
                <li key={slug} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
                  <div className="relative aspect-[4/3]">
                    <Image src={f.cover.src} alt={f.cover.alt} fill sizes="(min-width: 640px) 30vw, 90vw" className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <p className="eyebrow text-muted">{getArea(f.city, f.area)?.name}</p>
                    <p className="display text-[1.5rem] leading-none">{f.name}</p>
                    <p className="font-mono text-sm uppercase tracking-[0.1em] text-muted">
                      from {formatPrice(p.amount)} / {p.unit}
                    </p>
                    <Button size="sm" disabled={!!busy} onClick={() => sw(`f-${slug}`, { farmSlug: slug, from: booking.checkIn, to: booking.checkOut })}>
                      {busy === `f-${slug}` ? <Loader2 className="animate-spin" /> : null} Check this one <ArrowRight />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {err && (
        <p role="alert" className="text-sm text-terra">
          {err}
        </p>
      )}
    </div>
  );
}
