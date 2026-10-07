import type { Metadata } from "next";
import { BedDouble, Car, ChefHat, Flame, Gamepad2, Music, PawPrint, ShieldCheck, Waves, Wifi, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/sections/Footer";
import { SubpageHeader } from "@/components/subpage/SubpageHeader";
import { Button } from "@/components/ui/button";
import { enabledAmenities, formatPrice, site, type Amenity, type Package } from "@/content/site";

export const metadata: Metadata = {
  title: "Rooms & amenities",
  description: `${site.capacity.bedrooms} bedrooms, sleeps ${site.capacity.sleeps}. Private pool, lawn, orchard, bonfire and a caretaker on site at ${site.name}.`,
  alternates: { canonical: "/stay" },
  openGraph: { images: [site.spaces[2].image.src] },
};

const icons: Record<Amenity["id"], LucideIcon> = {
  pool: Waves,
  wifi: Wifi,
  parking: Car,
  caretaker: ShieldCheck,
  kitchen: ChefHat,
  music: Music,
  bonfire: Flame,
  games: Gamepad2,
  pets: PawPrint,
};

export default function StayPage() {
  const stays = (site.packages as Package[]).filter((p) => ["day-out", "night-stay", "weekend-escape"].includes(p.id));
  return (
    <>
      <main id="main">
        <SubpageHeader
          eyebrow="Stay · Rooms & amenities"
          title={
            <>
              Sleep in, <span className="italic-soft text-terra">slowly.</span>
            </>
          }
          intro={`${site.capacity.bedrooms} airy bedrooms that sleep ${site.capacity.sleeps}, with the whole farm to yourselves. Check-in ${site.times.checkIn}, check-out ${site.times.checkOut}.`}
          image={site.spaces[2].image}
          transitionName="stay-hero"
        />

        <section data-daylight="0.36" aria-labelledby="amenities-title" className="container-x py-16">
          <h2 id="amenities-title" className="display display-md mb-10">
            What&apos;s included
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enabledAmenities.map((a) => {
              const Icon = icons[a.id];
              return (
                <li key={a.id} className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-card p-5">
                  <span className="grid size-11 place-items-center rounded-full bg-sage/10 text-sage">
                    <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  {a.label}
                </li>
              );
            })}
          </ul>
        </section>

        <section data-daylight="0.45" aria-labelledby="rooms-title" className="container-x py-16">
          <h2 id="rooms-title" className="display display-md mb-10">
            The spaces
          </h2>
          <ul className="grid gap-8 md:grid-cols-2">
            {site.spaces.map((s) => (
              <li key={s.id}>
                <div className="relative mb-5 aspect-[3/2] overflow-hidden rounded-[var(--radius-card)]">
                  <Image src={s.image.src} alt={s.image.alt} fill sizes="(min-width: 768px) 46vw, 100vw" className="object-cover" />
                </div>
                <h3 className="display mb-2 text-[2rem] leading-none">{s.name}</h3>
                <p className="mb-3 text-muted">{s.description}</p>
                <p className="eyebrow text-sage">{s.chips.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </section>

        <section data-daylight="0.6" aria-labelledby="stay-pkgs" className="container-x py-16">
          <h2 id="stay-pkgs" className="display display-md mb-10">
            Ways to stay
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {stays.map((p) => (
              <div key={p.id} className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-card p-6">
                <BedDouble className="size-5 text-sage" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="display text-[1.8rem] leading-none">{p.name}</h3>
                <p className="eyebrow text-muted">{p.timing}</p>
                <p className="text-muted">{p.bestFor}</p>
                <p className="mt-auto font-mono text-sm uppercase tracking-[0.12em] text-muted">
                  from <span className="text-base text-ink">{formatPrice(p.priceFrom)}</span> / {p.priceUnit}
                </p>
              </div>
            ))}
          </div>
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
