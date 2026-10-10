import { Bath, BedDouble, Car, ChefHat, Flame, Gamepad2, Music, PawPrint, ShieldCheck, Snowflake, Trees, Users, Warehouse, Waves, Wifi, Zap, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/content/site";
import type { AmenityId, Farmhouse } from "@/content/types";

const icons: Record<AmenityId, LucideIcon> = {
  pool: Waves,
  wifi: Wifi,
  parking: Car,
  caretaker: ShieldCheck,
  kitchen: ChefHat,
  cook: ChefHat,
  music: Music,
  bonfire: Flame,
  games: Gamepad2,
  pets: PawPrint,
  ac: Snowflake,
  "power-backup": Zap,
  lawn: Trees,
  hall: Warehouse,
};

export function FarmOverview({ farm }: { farm: Farmhouse }) {
  const facts = [
    { icon: Users, value: farm.capacity.eventGuests, label: "guests for events" },
    { icon: BedDouble, value: farm.capacity.bedrooms, label: "bedrooms" },
    { icon: Bath, value: farm.capacity.sleeps, label: "sleep over" },
    { icon: Trees, value: farm.acres, label: "acres" },
  ];
  return (
    <section data-daylight="0.18" aria-labelledby="overview-title" className="py-[clamp(4rem,10vw,8rem)]">
      <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <p className="eyebrow mb-4 text-sage">About the farm · 07:30 AM</p>
          <h2 id="overview-title" className="display display-md mb-6 max-w-[20ch]">
            {farm.description.split(". ")[0]}.
          </h2>
          <p className="max-w-xl text-lg text-muted">{farm.description.split(". ").slice(1).join(". ")}</p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {farm.highlights.map((h) => (
              <li key={h} className="eyebrow rounded-full border border-line bg-card/70 px-3.5 py-2 text-ink">
                {h}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.08}>
          <dl className="grid grid-cols-2 gap-4">
            {facts.map((f) => (
              <div key={f.label} className="rounded-[var(--radius-card)] border border-line bg-card p-5">
                <f.icon className="mb-3 size-5 text-sage" strokeWidth={1.5} aria-hidden="true" />
                <dd className="display text-[2.6rem] leading-none tabular-nums">{f.value}</dd>
                <dt className="mt-1 text-sm text-muted">{f.label}</dt>
              </div>
            ))}
          </dl>
          <h3 className="eyebrow mb-3 mt-8 text-muted">What&apos;s here</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
            {farm.amenities.map((a) => {
              const Icon = icons[a];
              return (
                <li key={a} className="flex items-center gap-2 text-[0.95rem]">
                  <Icon className="size-4 shrink-0 text-sage" strokeWidth={1.5} aria-hidden="true" />
                  {site.amenityLabels[a]}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
