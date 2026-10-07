import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <section data-daylight="0.18" className="min-h-screen" />
      <section data-daylight="0.6" className="min-h-screen" />
      <section data-daylight="1" className="theme-night min-h-screen" />
    </main>
  );
}
