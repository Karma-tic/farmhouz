import { Reveal } from "@/components/ui/reveal";
import type { Farmhouse } from "@/content/types";

export function FarmRules({ farm }: { farm: Farmhouse }) {
  return (
    <section data-daylight="0.76" aria-labelledby="rules-title" className="pb-[clamp(4rem,10vw,7rem)]">
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <p className="eyebrow mb-4 text-sage">Good to know</p>
          <h2 id="rules-title" className="display display-md">
            House rules
          </h2>
        </Reveal>
        <Reveal delay={0.06}>
          <ol className="divide-y divide-line border-y border-line">
            {farm.rules.map((r, i) => (
              <li key={r} className="flex gap-5 py-4">
                <span className="eyebrow pt-1 text-sage">{String(i + 1).padStart(2, "0")}</span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
