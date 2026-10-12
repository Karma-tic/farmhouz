import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { WaitlistForm } from "@/components/enquiry/WaitlistForm";
import { FarmCard } from "@/components/farm/FarmCard";
import { Button } from "@/components/ui/button";
import { GUIDE_BASE, getGuide } from "@/content/guides";
import { site } from "@/content/site";
import type { Faq, Farmhouse } from "@/content/types";

/** "Book" block on a guide page: real listings once launched, the early-access form before. */
export function GuideBooking({ farms, occasion, title }: { farms: Farmhouse[]; occasion?: string; title: string }) {
  if (site.launched && farms.length)
    return (
      <section data-daylight="0.62" aria-labelledby="g-farms" className="mb-16">
        <h2 id="g-farms" className="display display-md mb-6">
          {title}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {farms.slice(0, 6).map((f) => (
            <FarmCard key={f.slug} farm={f} />
          ))}
        </div>
        <Button asChild variant="outline" className="mt-8 text-ink">
          <Link href="/bhopal">
            See all farmhouses on a map <ArrowRight />
          </Link>
        </Button>
      </section>
    );
  return (
    <section data-daylight="0.62" aria-labelledby="g-early" className="mb-16 overflow-hidden rounded-[28px] border border-line bg-card shadow-lift">
      <div className="grid lg:grid-cols-[1.3fr_1fr]">
        <div className="p-6 md:p-10">
          <p className="eyebrow mb-2 text-sage">Launching soon in Bhopal</p>
          <h2 id="g-early" className="display display-md mb-3">
            Get first pick of dates
          </h2>
          <p className="mb-8 max-w-[52ch] text-muted">We&apos;re visiting and signing farmhouses now. Tell us what you&apos;re planning and we&apos;ll WhatsApp you the day bookings open.</p>
          <WaitlistForm defaultOccasion={occasion} compact />
        </div>
        <aside className="flex flex-col justify-center gap-4 border-t border-line bg-cream/60 p-6 md:p-10 lg:border-l lg:border-t-0">
          <p className="font-medium">Own a farmhouse here?</p>
          <p className="text-sm text-muted">List it free. We handle the guests, the calls and the advance — you host.</p>
          <Button asChild variant="outline" className="self-start text-ink">
            <Link href="/list-your-farmhouse">
              List your farmhouse <ArrowRight />
            </Link>
          </Button>
        </aside>
      </div>
    </section>
  );
}

export function GuideChecklist({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section data-daylight="0.45" aria-labelledby="g-check" className="mb-16">
      <h2 id="g-check" className="display display-md mb-6">
        {title}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((c) => (
          <li key={c} className="flex gap-3 rounded-2xl border border-line bg-card p-4">
            <Check className="mt-0.5 size-5 shrink-0 text-sage" strokeWidth={1.5} aria-hidden="true" />
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GuideFaqs({ faqs }: { faqs: Faq[] }) {
  return (
    <section data-daylight="0.75" aria-labelledby="g-faq" className="mb-16">
      <h2 id="g-faq" className="display display-md mb-6">
        Questions people ask
      </h2>
      <div className="divide-y divide-line border-y border-line">
        {faqs.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {f.q}
              <span aria-hidden="true" className="text-sage transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function GuideRelated({ slugs }: { slugs: string[] }) {
  const items = slugs.map(getGuide).filter((g) => g != null);
  if (!items.length) return null;
  return (
    <nav aria-labelledby="g-rel" className="mb-8">
      <h2 id="g-rel" className="eyebrow mb-4 text-muted">
        Also popular
      </h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((g) => (
          <li key={g.slug}>
            <Link href={`${GUIDE_BASE}/${g.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm hover:border-sage">
              {g.kind === "area" ? `Farmhouses in ${g.h1[0].replace(/^Farmhouses in /, "").replace(/,$/, "")}` : g.h1.join(" ")}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
