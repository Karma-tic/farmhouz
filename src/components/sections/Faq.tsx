"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Accordion } from "radix-ui";
import { Reveal, SectionHeading } from "@/components/ui/reveal";
import { site, type Faq as FaqItem } from "@/content/site";


export function Faq() {
  const faqs = site.faqs as FaqItem[];
  const groups = [...new Set(faqs.map((f) => f.group))];
  return (
    <section
      id="faq"
      data-daylight="0.93"
      aria-labelledby="faq-title"
      className="theme-night relative bg-[color-mix(in_oklab,var(--night)_88%,transparent)] py-[clamp(5rem,12vw,9rem)]"
    >
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <SectionHeading
            id="faq-title"
            eyebrow="Good to know · 10:15 PM"
            title={
              <>
                Questions, <span className="italic-soft text-wheat">answered.</span>
              </>
            }
            intro={
              <>
                Still curious? Read the full{" "}
                <Link href="/policies" className="link-draw text-wheat">
                  booking terms & cancellation policy
                </Link>
                .
              </>
            }
          />
        </div>
        <div className="flex flex-col gap-10">
          {groups.map((g) => (
            <Reveal key={g}>
              <h3 className="eyebrow mb-3 text-wheat">{g}</h3>
              <Accordion.Root type="multiple" className="border-t border-line">
                {faqs
                  .filter((f) => f.group === g)
                  .map((f, i) => (
                    <Accordion.Item key={f.q} value={`${g}-${i}`} className="border-b border-line">
                      <Accordion.Header>
                        <Accordion.Trigger className="group flex min-h-16 w-full items-center justify-between gap-6 py-4 text-left text-lg font-medium text-moon">
                          {f.q}
                          <Plus
                            aria-hidden="true"
                            strokeWidth={1.5}
                            className="size-5 shrink-0 text-wheat transition-transform duration-[var(--dur-ui)] ease-[var(--ease-out)] group-data-[state=open]:rotate-45"
                          />
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Content className="faq-content overflow-hidden text-night-muted">
                        <p className="max-w-[60ch] pb-5">{f.a}</p>
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
              </Accordion.Root>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
