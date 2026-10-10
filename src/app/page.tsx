import { Booking } from "@/components/sections/Booking";
import { Celebrations } from "@/components/sections/Celebrations";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Location } from "@/components/sections/Location";
import { NightFinale } from "@/components/sections/NightFinale";
import { Numbers } from "@/components/sections/Numbers";
import { Packages } from "@/components/sections/Packages";
import { Reviews } from "@/components/sections/Reviews";
import { FarmWalk } from "@/components/sections/FarmWalk";
import { faqJsonLd, JsonLd, orgJsonLd } from "@/lib/seo";

/** "A Day at Farmhouze": scrolling the page is living one day at the farm. */
export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Numbers />
        <FarmWalk />
        <Packages />
        <Gallery />
        <Celebrations />
        <Booking />
        <Reviews />
        <Location />
        <Faq />
        <NightFinale />
      </main>
      <Footer />
      <JsonLd data={orgJsonLd()} />
      <JsonLd data={faqJsonLd()} />
    </>
  );
}
