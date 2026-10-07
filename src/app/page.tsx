import { Booking } from "@/components/sections/Booking";
import { Celebrations } from "@/components/sections/Celebrations";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Numbers } from "@/components/sections/Numbers";
import { Packages } from "@/components/sections/Packages";
import { Spaces } from "@/components/sections/Spaces";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Numbers />
      <Spaces />
      <Packages />
      <Gallery />
      <Celebrations />
      <Booking />
      <section data-daylight="1" className="theme-night min-h-screen" />
    </main>
  );
}
