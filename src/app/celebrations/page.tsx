import type { Metadata } from "next";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/sections/Footer";
import { SubpageHeader } from "@/components/subpage/SubpageHeader";
import { Button } from "@/components/ui/button";
import { formatPrice, site, type Package } from "@/content/site";

export const metadata: Metadata = {
  title: "Celebrations & events",
  description: `Birthdays, haldi & mehendi, small weddings, shoots and offsites for up to ${site.capacity.eventGuests} guests at ${site.name}.`,
  alternates: { canonical: "/celebrations" },
  openGraph: { images: [site.celebrations.items[1].image.src] },
};

export default function CelebrationsPage() {
  const eventPkgs = (site.packages as Package[]).filter((p) => ["celebrations", "shoots", "corporate"].includes(p.id));
  return (
    <>
      <main id="main">
        <SubpageHeader
          eyebrow="Celebrations · Events & shoots"
          title={
            <>
              Make it <span className="italic-soft text-terra">yours.</span>
            </>
          }
          intro={`Up to ${site.capacity.eventGuests} guests on the lawn, rooms for family to stay over, power backup and space for your decorators and caterers.`}
          image={site.celebrations.items[1].image}
          transitionName="celebrations-hero"
        />

        <section data-daylight="0.4" aria-labelledby="occasions" className="container-x py-16">
          <h2 id="occasions" className="display display-md mb-10">
            Occasions we host
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.celebrations.items.map((c) => (
              <li key={c.id} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
                <div className="relative aspect-[4/3]">
                  <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 100vw" className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="display mb-2 text-[1.8rem] leading-none">{c.name}</h3>
                  <p className="text-muted">{c.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section data-daylight="0.55" aria-labelledby="event-pkgs" className="container-x py-16">
          <h2 id="event-pkgs" className="display display-md mb-10">
            Packages & capacity
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {eventPkgs.map((p) => (
              <div key={p.id} className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-card p-6">
                <h3 className="display text-[1.8rem] leading-none">{p.name}</h3>
                <p className="eyebrow text-muted">{p.timing}</p>
                <ul className="flex flex-col gap-1.5">
                  {p.inclusions.map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="size-4 text-sage" strokeWidth={1.5} aria-hidden="true" /> {i}
                    </li>
                  ))}
                </ul>
                <p className="mt-auto font-mono text-sm uppercase tracking-[0.12em] text-muted">
                  from <span className="text-base text-ink">{formatPrice(p.priceFrom)}</span> / {p.priceUnit}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section data-daylight="0.65" aria-labelledby="partners" className="container-x py-16">
          <h2 id="partners" className="display display-md mb-6">
            Decor & food partners
          </h2>
          <p className="mb-6 max-w-xl text-muted">Bring your own, or ask us to introduce people who know the space well.</p>
          <ul className="flex flex-wrap gap-3">
            {site.celebrations.decorPartners.map((d) => (
              <li key={d} className="eyebrow rounded-full border border-line bg-card px-4 py-2 text-muted">
                {d}
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="mt-10">
            <Link href="/#book">Check availability</Link>
          </Button>
        </section>
        <div data-daylight="1" className="h-24" />
      </main>
      <Footer />
    </>
  );
}
