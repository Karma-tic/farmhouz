"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { AvailabilityCalendar } from "@/components/enquiry/AvailabilityCalendar";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import { useBooked } from "@/components/enquiry/useBooked";

/** Calendar + form, kept in its own chunk (loaded as the section approaches). */
export default function BookingPanel() {
  const [range, setRange] = useState<DateRange | undefined>();
  const { dates } = useBooked();
  return (
    <div className="grid lg:grid-cols-[1.15fr_1fr]">
      <div className="border-b border-line p-5 sm:p-8 lg:border-b-0 lg:border-r">
        <p className="eyebrow mb-5 text-muted">Live availability</p>
        <AvailabilityCalendar range={range} onChange={setRange} booked={dates} />
      </div>
      <div className="p-5 sm:p-8">
        <p className="eyebrow mb-5 text-muted">Send an enquiry</p>
        <EnquiryForm range={range} onRangeChange={setRange} />
      </div>
    </div>
  );
}
