import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Footer } from "@/components/sections/Footer";
import { Explorer } from "@/components/search/Explorer";
import { getCity, liveCities } from "@/content/cities";
import { farmhousesIn } from "@/content/farmhouses";
import { site } from "@/content/site";

export function generateStaticParams() {
  return liveCities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[city]">): Promise<Metadata> {
  const c = getCity((await params).city);
  if (!c) return {};
  return {
    title: `Farmhouses in ${c.name} for parties, stays & weddings`,
    description: `${farmhousesIn(c.slug).length} handpicked farmhouses around ${c.name} — ${c.areas.map((a) => a.name).join(", ")}. Free requests; we confirm availability within ${site.booking.checkWithin}.`,
    alternates: { canonical: `/${c.slug}` },
  };
}

export default async function CityPage({ params }: PageProps<"/[city]">) {
  const c = getCity((await params).city);
  if (!c) notFound();
  if (!site.launched) redirect("/#book");
  return (
    <>
      <main id="main" className="pt-[calc(var(--header-h)+2.5rem)]" data-daylight="0.3">
        <header className="container-x mb-8">
          <p className="eyebrow mb-3 text-sage">
            {c.name} · {c.state}
          </p>
          <h1 className="display display-lg">
            Farmhouses in <span className="italic-soft text-terra">{c.name}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            {c.tagline} Pick one, send a free request, and we&apos;ll confirm with the owner within {site.booking.checkWithin}.
          </p>
          {site.previewMode && (
            <p className="eyebrow mt-4 inline-flex rounded-full border border-line bg-card px-3 py-1.5 text-muted">Preview · these are sample listings</p>
          )}
        </header>
        <Suspense fallback={<div className="container-x min-h-[60svh]" aria-busy="true" />}>
          <Explorer city={c.slug} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
