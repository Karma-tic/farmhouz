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
import { Spaces } from "@/components/sections/Spaces";
import { faqJsonLd, JsonLd, venueJsonLd } from "@/lib/seo";

/** "A Day at Farmhouze": scrolling the page is living one day at the farm. */
export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Numbers />
        <Spaces />
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
      <JsonLd data={venueJsonLd()} />
      <JsonLd data={faqJsonLd()} />
    </>
  );
}
