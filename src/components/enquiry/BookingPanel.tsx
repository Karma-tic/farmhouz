"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { AvailabilityCalendar } from "@/components/enquiry/AvailabilityCalendar";
import { EnquiryForm, fieldBase } from "@/components/enquiry/EnquiryForm";
import { useBooked } from "@/components/enquiry/useBooked";
import { farmhousesIn, fromPrice } from "@/content/farmhouses";
import { formatPrice } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Calendar + request form, in its own chunk. On a farmhouse page the farm is fixed;
 * on the homepage the guest picks one first and the calendar shows its booked dates.
 */
export default function BookingPanel({ farmSlug }: { farmSlug?: string }) {
  const farms = farmhousesIn("bhopal");
  const [chosen, setChosen] = useState(farmSlug ?? farms[0].slug);
  const slug = farmSlug ?? chosen;
  const [range, setRange] = useState<DateRange | undefined>();
  const { dates } = useBooked(slug);
  return (
    <div className="grid lg:grid-cols-[1.15fr_1fr]">
      <div className="border-b border-line p-5 sm:p-8 lg:border-b-0 lg:border-r">
        {!farmSlug && (
          <div className="mb-6">
            <label htmlFor="bp-farm" className="eyebrow mb-2 block text-muted">
              Which farmhouse?
            </label>
            <select
              id="bp-farm"
              value={chosen}
              onChange={(e) => {
                setChosen(e.target.value);
                setRange(undefined);
              }}
              className={cn(fieldBase, "appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10 font-medium")}
              style={{ backgroundImage: "var(--chevron)" }}
            >
              {farms.map((f) => {
                const p = fromPrice(f);
                return (
                  <option key={f.slug} value={f.slug}>
                    {f.name} · {f.capacity.eventGuests} guests · from {formatPrice(p.amount)}/{p.unit}
                  </option>
                );
              })}
            </select>
          </div>
        )}
        <p className="eyebrow mb-5 text-muted">Live availability</p>
        <AvailabilityCalendar range={range} onChange={setRange} booked={dates} />
      </div>
      <div className="p-5 sm:p-8">
        <p className="eyebrow mb-5 text-muted">Request to book</p>
        <EnquiryForm key={slug} farmSlug={slug} range={range} onRangeChange={setRange} />
      </div>
    </div>
  );
}
