import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FarmGallery } from "@/components/farm/FarmGallery";
import { FarmHero } from "@/components/farm/FarmHero";
import { FarmOverview } from "@/components/farm/FarmOverview";
import { FarmRules } from "@/components/farm/FarmRules";
import { SimilarFarms } from "@/components/farm/SimilarFarms";
import { Booking } from "@/components/sections/Booking";
import { Footer } from "@/components/sections/Footer";
import { Location } from "@/components/sections/Location";
import { Packages } from "@/components/sections/Packages";
import { Spaces } from "@/components/sections/Spaces";
import { getArea, getCity } from "@/content/cities";
import { site } from "@/content/site";
import { getFarm, getFarms } from "@/lib/farms/server";
import { farmJsonLd, JsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  const farms = await getFarms();
  // Cache Components needs at least one entry; "_" resolves to a 404
  return farms.length ? farms.map((f) => ({ city: f.city, slug: f.slug })) : [{ city: "bhopal", slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/[city]/[slug]">): Promise<Metadata> {
  const { city, slug } = await params;
  const f = await getFarm(slug);
  if (!f || f.city !== city) return {};
  const area = getArea(f.city, f.area);
  return {
    title: `${f.name}, ${area?.name} · Farmhouse in ${getCity(f.city)?.name}`,
    description: [f.tagline, `Up to ${f.capacity.eventGuests} guests${f.capacity.sleeps ? `, sleeps ${f.capacity.sleeps}` : ""}.`, f.highlights.length ? `${f.highlights.join(" · ")}.` : ""].filter(Boolean).join(" "),
    alternates: { canonical: `/${f.city}/${f.slug}` },
    openGraph: { images: [f.cover.src] },
  };
}

export default async function FarmPage({ params }: PageProps<"/[city]/[slug]">) {
  const { city, slug } = await params;
  const farm = await getFarm(slug);
  if (!farm || farm.city !== city) notFound();
  if (!site.launched) redirect("/#book");
  return (
    <>
      <main id="main">
        <FarmHero farm={farm} />
        <FarmOverview farm={farm} />
        {farm.spaces.length > 0 && <Spaces farm={farm} />}
        <Packages farm={farm} />
        <FarmGallery farm={farm} />
        <Booking farm={farm} />
        <FarmRules farm={farm} />
        <Location farm={farm} />
        <SimilarFarms farm={farm} />
      </main>
      <Footer />
      <JsonLd data={farmJsonLd(farm)} />
    </>
  );
}
