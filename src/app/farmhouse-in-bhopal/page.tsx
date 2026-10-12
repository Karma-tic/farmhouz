import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { GuideBooking, GuideFaqs } from "@/components/guides/GuideParts";
import { Footer } from "@/components/sections/Footer";
import { GUIDE_BASE, areaGuides, occasionGuides } from "@/content/guides";
import { site } from "@/content/site";
import { farmsIn } from "@/lib/farms/server";
import { breadcrumbJsonLd, faqJsonLd, JsonLd } from "@/lib/seo";

const title = "Farmhouse in Bhopal for Parties, Day Outs, Stays & Weddings";
const description =
  "Find a private farmhouse in Bhopal for a birthday, day picnic, night stay, haldi, small wedding, pre-wedding shoot or offsite — in Kerwa, Kolar Road, Bhadbhada, Neelbad, Bhojpur Road and Raisen Road. Free requests; we confirm with the owner.";

export const metadata: Metadata = {
  title: { absolute: `${title} · ${site.name}` },
  description,
  alternates: { canonical: GUIDE_BASE },
  openGraph: { title, description, url: GUIDE_BASE },
};

const faqs = site.faqs.filter((f) => f.group !== "Payments").slice(0, 5);

export default async function FarmhousesInBhopal() {
  const farms = await farmsIn("bhopal");
  return (
    <>
      <main id="main" className="container-x max-w-5xl pb-16 pt-[calc(var(--header-h)+2.5rem)]">
        <header data-daylight="0.25" className="mb-12">
          <p className="eyebrow mb-4 text-sage">Bhopal · Madhya Pradesh</p>
          <h1 className="display display-lg max-w-[16ch]">
            Farmhouses in <span className="italic-soft text-terra">Bhopal</span>
          </h1>
          <p className="mt-6 max-w-[64ch] text-lg text-muted">
            A whole farm for your group — for a day, a night or a weekend. Farmhouze visits farmhouses around Bhopal, checks your date with the owner and sends you a real quote. You only pay once it&apos;s confirmed, and there&apos;s no booking fee.
          </p>
        </header>

        <section data-daylight="0.4" aria-labelledby="by-occasion" className="mb-16">
          <h2 id="by-occasion" className="display display-md mb-6">
            By occasion
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {occasionGuides.map((g) => (
              <li key={g.slug}>
                <Link href={`${GUIDE_BASE}/${g.slug}`} className="group flex h-full flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-card p-5 hover:border-sage">
                  <span className="eyebrow text-sage">{g.eyebrow}</span>
                  <span className="display text-[1.35rem] leading-tight">
                    {g.h1[0]} {g.h1[1]}
                  </span>
                  <ArrowUpRight className="mt-auto size-5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section data-daylight="0.52" aria-labelledby="by-area" className="mb-16">
          <h2 id="by-area" className="display display-md mb-6">
            By area
          </h2>
          <ul className="divide-y divide-line border-y border-line">
            {areaGuides.map((g) => (
              <li key={g.slug}>
                <Link href={`${GUIDE_BASE}/${g.slug}`} className="group flex min-h-14 flex-wrap items-center justify-between gap-2 py-3">
                  <span className="font-medium group-hover:text-terra">{g.h1[0].replace(/,$/, "")}</span>
                  <span className="eyebrow text-muted">{g.eyebrow.split(" · ").slice(1).join(" · ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <GuideBooking farms={farms} title="Farmhouses around Bhopal" />
        <GuideFaqs faqs={faqs} />
      </main>
      <Footer />
      <JsonLd data={faqJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Farmhouses in Bhopal", path: GUIDE_BASE }])} />
    </>
  );
}
