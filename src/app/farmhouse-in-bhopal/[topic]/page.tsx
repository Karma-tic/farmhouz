import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideBooking, GuideChecklist, GuideFaqs, GuideRelated } from "@/components/guides/GuideParts";
import { Footer } from "@/components/sections/Footer";
import { GUIDE_BASE, getGuide, guides } from "@/content/guides";
import { site } from "@/content/site";
import { farmsIn } from "@/lib/farms/server";
import { breadcrumbJsonLd, faqJsonLd, JsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return guides.map((g) => ({ topic: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/farmhouse-in-bhopal/[topic]">): Promise<Metadata> {
  const g = getGuide((await params).topic);
  if (!g) return {};
  return {
    title: { absolute: `${g.metaTitle} · ${site.name}` },
    description: g.metaDescription,
    alternates: { canonical: `${GUIDE_BASE}/${g.slug}` },
    openGraph: { title: g.metaTitle, description: g.metaDescription, url: `${GUIDE_BASE}/${g.slug}` },
  };
}

export default async function GuidePage({ params }: PageProps<"/farmhouse-in-bhopal/[topic]">) {
  const g = getGuide((await params).topic);
  if (!g) notFound();
  const farms = (await farmsIn("bhopal")).filter((f) => (g.area ? f.area === g.area : true) && (g.occasion ? f.occasions.includes(g.occasion) : true));
  return (
    <>
      <main id="main" className="container-x max-w-5xl pb-16 pt-[calc(var(--header-h)+2.5rem)]">
        <nav aria-label="Breadcrumb" className="eyebrow mb-6 text-muted">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>{" "}
          /{" "}
          <Link href={GUIDE_BASE} className="hover:text-ink">
            Farmhouses in Bhopal
          </Link>{" "}
          / <span aria-current="page">{g.eyebrow.split(" · ")[0]}</span>
        </nav>

        <header data-daylight="0.25" className="mb-12">
          <p className="eyebrow mb-4 text-sage">{g.eyebrow}</p>
          <h1 className="display display-lg max-w-[18ch]">
            {g.h1[0]} <span className="italic-soft text-terra">{g.h1[1]}</span>
          </h1>
          <div className="mt-6 flex max-w-[64ch] flex-col gap-4 text-lg text-muted">
            {g.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </header>

        <GuideChecklist title={g.checklistTitle} items={g.checklist} />

        {g.tips.length > 0 && (
          <section data-daylight="0.55" aria-labelledby="g-tips" className="mb-16">
            <h2 id="g-tips" className="display display-md mb-6">
              Tips from us
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {g.tips.map((t) => (
                <div key={t.title} className="rounded-[var(--radius-card)] border border-line p-5">
                  <p className="mb-2 font-medium">{t.title}</p>
                  <p className="text-sm text-muted">{t.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <GuideBooking farms={farms} occasion={g.waitlistOccasion} title={g.kind === "area" ? `Farmhouses in ${g.h1[0].replace(/^Farmhouses in /, "").replace(/,$/, "")}` : "Farmhouses that suit this"} />

        <section data-daylight="0.68" aria-labelledby="g-how" className="mb-16">
          <h2 id="g-how" className="display display-md mb-6">
            How booking works
          </h2>
          <ol className="grid gap-4 md:grid-cols-4">
            {site.steps.map((s, i) => (
              <li key={s.id} className="rounded-[var(--radius-card)] border border-line p-5">
                <span className="font-mono text-sm text-sage">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-2 font-medium">{s.title}</p>
                <p className="mt-1 text-sm text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <GuideFaqs faqs={g.faqs} />
        <GuideRelated slugs={g.related} />
      </main>
      <Footer />
      <JsonLd data={faqJsonLd(g.faqs)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Farmhouses in Bhopal", path: GUIDE_BASE }, { name: g.metaTitle.split(" — ")[0], path: `${GUIDE_BASE}/${g.slug}` }])} />
    </>
  );
}
