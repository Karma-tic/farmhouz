"use client";

import { ArrowUpRight, Star } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { AvailabilityCalendar } from "@/components/enquiry/AvailabilityCalendar";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import { useBooked } from "@/components/enquiry/useBooked";
import { Reveal, SectionHeading } from "@/components/ui/reveal";
import { site } from "@/content/site";

/** Conversion core: live availability on the left, the enquiry form on the right. */
export function Booking() {
  const [range, setRange] = useState<DateRange | undefined>();
  const { dates } = useBooked();

  return (
    <section id="book" data-daylight="0.7" aria-labelledby="book-title" className="relative py-[clamp(5rem,12vw,9rem)]">
      <div className="container-x">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            id="book-title"
            eyebrow="Availability · 07:00 PM"
            title={
              <>
                Pick your <span className="italic-soft text-terra">dates</span>.
              </>
            }
            intro="Struck-through dates are taken. Send an enquiry and we'll confirm availability and a final quote on a call."
          />
          {site.reviews.length === 0 && (
            <a
              href={site.contact.googleProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="link-draw inline-flex min-h-11 items-center gap-2 self-start font-medium text-sage md:self-end"
            >
              <Star className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Rated on Google
              <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </a>
          )}
        </div>

        <Reveal className="grid overflow-hidden rounded-[28px] border border-line bg-card shadow-lift lg:grid-cols-[1.15fr_1fr]">
          <div className="border-b border-line p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="eyebrow mb-5 text-muted">Live availability</p>
            <AvailabilityCalendar range={range} onChange={setRange} booked={dates} />
          </div>
          <div className="p-5 sm:p-8">
            <p className="eyebrow mb-5 text-muted">Send an enquiry</p>
            <EnquiryForm range={range} onRangeChange={setRange} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
