"use client";

import { ArrowUpRight, Star } from "lucide-react";
import dynamic from "next/dynamic";
import { LazyMount } from "@/components/ui/lazy-mount";
import { Reveal, SectionHeading } from "@/components/ui/reveal";
import { site } from "@/content/site";

/** Conversion core: live availability on the left, the enquiry form on the right. */
const BookingPanel = dynamic(() => import("@/components/enquiry/BookingPanel"), {
  ssr: false,
  loading: () => <div className="min-h-[760px] lg:min-h-[640px]" aria-busy="true" />,
});

export function Booking() {

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

        <Reveal className="overflow-hidden rounded-[28px] border border-line bg-card shadow-lift">
          <LazyMount minHeight={700}>
            <BookingPanel />
          </LazyMount>
        </Reveal>
      </div>
    </section>
  );
}
