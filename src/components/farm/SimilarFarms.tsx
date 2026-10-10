import { FarmCard } from "@/components/farm/FarmCard";
import { Reveal, SectionHeading } from "@/components/ui/reveal";
import { farmhousesIn } from "@/content/farmhouses";
import type { Farmhouse } from "@/content/types";

export function SimilarFarms({ farm }: { farm: Farmhouse }) {
  const others = farmhousesIn(farm.city)
    .filter((f) => f.slug !== farm.slug)
    .map((f) => ({ f, score: (f.area === farm.area ? 3 : 0) + f.occasions.filter((o) => farm.occasions.includes(o)).length - Math.abs(f.capacity.eventGuests - farm.capacity.eventGuests) / 100 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.f);
  return (
    <section data-daylight="0.92" aria-labelledby="similar-title" className="theme-night bg-[color-mix(in_oklab,var(--night)_92%,transparent)] py-[clamp(5rem,12vw,8rem)]">
      <div className="container-x">
        <SectionHeading id="similar-title" eyebrow="Also around Bhopal · 10:30 PM" title="You might also like" />
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {others.map((f, i) => (
            <Reveal as="li" key={f.slug} amount={0.05} delay={i * 0.06} className="theme-day">
              <FarmCard farm={f} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
