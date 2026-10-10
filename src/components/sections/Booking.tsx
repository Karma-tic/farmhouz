"use client";

import dynamic from "next/dynamic";
import { LazyMount } from "@/components/ui/lazy-mount";
import { Reveal, SectionHeading } from "@/components/ui/reveal";
import { site } from "@/content/site";
import type { Farmhouse } from "@/content/types";

const BookingPanel = dynamic(() => import("@/components/enquiry/BookingPanel"), {
  ssr: false,
  loading: () => <div className="min-h-[760px] lg:min-h-[640px]" aria-busy="true" />,
});

/** Conversion core on a farmhouse page: availability + request to book. */
export function Booking({ farm }: { farm: Farmhouse }) {
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
            intro={`Send a free request for ${farm.name}. We check with the owner and get back to you within ${site.booking.checkWithin} — you only pay once it's confirmed.`}
          />
        </div>
        <Reveal className="overflow-hidden rounded-[28px] border border-line bg-card shadow-lift">
          <LazyMount minHeight={700}>
            <BookingPanel farmSlug={farm.slug} />
          </LazyMount>
        </Reveal>
      </div>
    </section>
  );
}
