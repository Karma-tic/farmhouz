"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { AvailabilityCalendar } from "@/components/enquiry/AvailabilityCalendar";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import { useBooked } from "@/components/enquiry/useBooked";

/** Calendar + request form for one farmhouse, in its own chunk. */
export default function BookingPanel({ farmSlug }: { farmSlug: string }) {
  const [range, setRange] = useState<DateRange | undefined>();
  const { dates } = useBooked(farmSlug);
  return (
    <div className="grid lg:grid-cols-[1.15fr_1fr]">
      <div className="border-b border-line p-5 sm:p-8 lg:border-b-0 lg:border-r">
        <p className="eyebrow mb-5 text-muted">Availability</p>
        <AvailabilityCalendar range={range} onChange={setRange} booked={dates} />
        <p className="mx-auto mt-4 max-w-sm text-center text-sm text-muted">Tap one date for a day out, or check-in and check-out for a stay. Struck-through dates are booked.</p>
      </div>
      <div className="p-5 sm:p-8">
        <p className="eyebrow mb-5 text-muted">Request to book</p>
        <EnquiryForm farmSlug={farmSlug} range={range} onRangeChange={setRange} />
      </div>
    </div>
  );
}
