import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FarmCard } from "@/components/farm/FarmCard";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/ui/reveal";
import { farmhousesIn } from "@/content/farmhouses";

export function FeaturedFarms() {
  const farms = farmhousesIn("bhopal").slice(0, 6);
  return (
    <section id="farmhouses" data-daylight="0.42" aria-labelledby="featured-title" className="relative py-[clamp(5rem,12vw,9rem)]">
      <div className="container-x mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          id="featured-title"
          eyebrow="The farmhouses · 01:00 PM"
          title={
            <>
              Handpicked around <span className="italic-soft text-terra">Bhopal</span>.
            </>
          }
          intro="Every farmhouse is visited before it's listed: we check the pool, the power backup and that the photos are honest."
        />
        <Button asChild variant="outline" className="self-start text-ink md:self-end">
          <Link href="/bhopal">
            See all farmhouses <ArrowRight />
          </Link>
        </Button>
      </div>
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter)] pb-6 md:container-x md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
        {farms.map((f, i) => (
          <Reveal as="li" key={f.slug} amount={0.02} delay={(i % 3) * 0.06} className="w-[82vw] shrink-0 snap-center sm:w-[60vw] md:w-auto">
            <FarmCard farm={f} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
