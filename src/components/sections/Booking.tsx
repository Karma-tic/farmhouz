"use client";

import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LazyMount } from "@/components/ui/lazy-mount";
import { Reveal, SectionHeading } from "@/components/ui/reveal";
import { site } from "@/content/site";
import type { Farmhouse } from "@/content/types";

const BookingPanel = dynamic(() => import("@/components/enquiry/BookingPanel"), {
  ssr: false,
  loading: () => <div className="min-h-[760px] lg:min-h-[640px]" aria-busy="true" />,
});

const WaitlistForm = dynamic(() => import("@/components/enquiry/WaitlistForm").then((m) => m.WaitlistForm), {
  ssr: false,
  loading: () => <div className="min-h-[340px]" aria-busy="true" />,
});

/** Conversion core on a farmhouse page: availability + request to book. */
export function Booking({ farm }: { farm?: Farmhouse }) {
  if (!site.launched && !farm) return <EarlyAccess />;
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
            intro={`Send a free request${farm ? ` for ${farm.name}` : ""}. We check with the owner and get back to you within ${site.booking.checkWithin} — you only pay once it's confirmed.`}
          />
          <ol className="flex flex-wrap gap-2 md:max-w-sm md:justify-end" aria-label="How booking works">
            {site.steps.map((s, i) => (
              <li key={s.id} className="eyebrow rounded-full border border-line bg-card/70 px-3 py-1.5 text-muted">
                <span className="text-sage">{String(i + 1).padStart(2, "0")}</span> {s.title}
              </li>
            ))}
          </ol>
        </div>
        <Reveal className="overflow-hidden rounded-[28px] border border-line bg-card shadow-lift">
          <LazyMount minHeight={700}>
            <BookingPanel farmSlug={farm?.slug} />
          </LazyMount>
        </Reveal>
      </div>
    </section>
  );
}

/** Pre-launch: collect the guest waitlist where the booking calendar will be. */
function EarlyAccess() {
  return (
    <section id="book" data-daylight="0.7" aria-labelledby="book-title" className="relative py-[clamp(5rem,12vw,9rem)]">
      <div className="container-x">
        <div className="mb-10">
          <SectionHeading
            id="book-title"
            eyebrow="Early access · 07:00 PM"
            title={
              <>
                Be first to <span className="italic-soft text-terra">book</span>.
              </>
            }
            intro="We're visiting and signing Bhopal's best farmhouses right now. Tell us what you're planning — you'll hear from us on WhatsApp the day bookings open, with first pick of dates."
          />
        </div>
        <Reveal className="grid overflow-hidden rounded-[28px] border border-line bg-card shadow-lift lg:grid-cols-[1.4fr_1fr]">
          <div className="p-6 md:p-10">
            <WaitlistForm />
          </div>
          <aside className="flex flex-col gap-6 border-t border-line bg-cream/60 p-6 md:p-10 lg:border-l lg:border-t-0">
            <p className="eyebrow text-sage">How booking will work</p>
            <ol className="flex flex-col gap-5">
              {site.steps.map((s, i) => (
                <li key={s.id} className="flex gap-4">
                  <span className="font-mono text-sm text-sage">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block font-medium">{s.title}</span>
                    <span className="text-sm text-muted">{s.body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <Link href="/list-your-farmhouse" className="link-draw mt-auto inline-flex min-h-11 items-center gap-2 font-medium text-sage">
              Own a farmhouse? List it <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
