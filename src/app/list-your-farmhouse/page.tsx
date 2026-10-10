import type { Metadata } from "next";
import { BadgeIndianRupee, CalendarCheck, PhoneCall, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Footer } from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/content/site";
import { LeadForm } from "./LeadForm";

export const metadata: Metadata = {
  title: "List your farmhouse",
  description: `Own a farmhouse around Bhopal? ${site.name} finds you guests, handles the calls and only sends confirmed, paid bookings.`,
  alternates: { canonical: "/list-your-farmhouse" },
};

const points = [
  { icon: PhoneCall, title: "We handle the calls", body: "Guests come to us. We only call you to check dates and confirm." },
  { icon: BadgeIndianRupee, title: "Paid bookings only", body: "Guests pay an advance before a booking is confirmed. No time-wasters." },
  { icon: CalendarCheck, title: "Your calendar, your rules", body: "Block dates any time. Your house rules are shown on your page." },
  { icon: ShieldCheck, title: "Verified guests", body: "We collect names, phone numbers and ID details for overnight stays." },
];

export default function ListYourFarmhouse() {
  return (
    <>
      <main id="main" className="pb-24 pt-[calc(var(--header-h)+3rem)]">
        <section data-daylight="0.25" className="container-x grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <p className="eyebrow mb-4 text-sage">For farmhouse owners</p>
            <h1 className="display display-lg">
              Your farm, <span className="italic-soft text-terra">booked more often.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              {site.name} is a booking agent for the best farmhouses around Bhopal. We photograph your property, list it beautifully, answer every enquiry and send you confirmed bookings with the advance already paid.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] shadow-lift">
            <Image src="/media/packages/weekend-escape.webp" alt="Porch with chai and fields to the horizon" fill preload sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </Reveal>
        </section>

        <section data-daylight="0.45" aria-label="Why list with us" className="container-x py-20">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {points.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.05} className="rounded-[var(--radius-card)] border border-line bg-card p-6">
                <p.icon className="mb-4 size-6 text-sage" strokeWidth={1.5} aria-hidden="true" />
                <h2 className="display mb-2 text-[1.5rem] leading-tight">{p.title}</h2>
                <p className="text-muted">{p.body}</p>
              </Reveal>
            ))}
          </ul>
        </section>

        <section data-daylight="0.62" aria-labelledby="apply-title" className="container-x">
          <div className="grid gap-10 overflow-hidden rounded-[28px] border border-line bg-card p-6 shadow-lift sm:p-10 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="eyebrow mb-4 text-sage">Apply · takes 2 minutes</p>
              <h2 id="apply-title" className="display display-md mb-4">
                Tell us about your farmhouse
              </h2>
              <p className="text-muted">We&apos;ll call you within a couple of days to arrange a visit. There&apos;s no fee to list — we earn a commission only on confirmed bookings.</p>
            </div>
            <LeadForm />
          </div>
        </section>
        <div data-daylight="1" className="h-16" />
      </main>
      <Footer />
    </>
  );
}
