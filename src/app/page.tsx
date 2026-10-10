import { Areas } from "@/components/sections/Areas";
import { Celebrations } from "@/components/sections/Celebrations";
import { Faq } from "@/components/sections/Faq";
import { FeaturedFarms } from "@/components/sections/FeaturedFarms";
import { Footer } from "@/components/sections/Footer";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { NightFinale } from "@/components/sections/NightFinale";
import { Numbers } from "@/components/sections/Numbers";
import { Reviews } from "@/components/sections/Reviews";
import { faqJsonLd, JsonLd, orgJsonLd } from "@/lib/seo";

/** "A Day at Farmhouze" — scroll from dawn to bonfire while you find your farm. */
export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Numbers />
        <HowItWorks />
        <FeaturedFarms />
        <Gallery />
        <Celebrations />
        <Reviews />
        <Areas />
        <Faq />
        <NightFinale />
      </main>
      <Footer />
      <JsonLd data={orgJsonLd()} />
      <JsonLd data={faqJsonLd()} />
    </>
  );
}
