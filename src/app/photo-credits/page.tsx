import type { Metadata } from "next";
import { Footer } from "@/components/sections/Footer";
import { photoCredits } from "@/content/photos";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Photo credits",
  description: `The photographers whose work stands in on ${site.name} until our farmhouses are photographed.`,
  alternates: { canonical: "/photo-credits" },
  robots: { index: false },
};

export default function PhotoCreditsPage() {
  return (
    <>
      <main id="main" className="container-x max-w-3xl pb-24 pt-[calc(var(--header-h)+3rem)]">
        <header data-daylight="0.3" className="mb-12">
          <p className="eyebrow mb-4 text-sage">Photo credits</p>
          <h1 className="display display-lg">
            Thank you, <span className="italic-soft text-terra">photographers</span>
          </h1>
          <p className="mt-6 text-lg text-muted">
            Until we&apos;ve photographed the farmhouses we list, some pictures on this site are stand-ins that show the kind of place and moment we mean. They are not photos of a {site.name} farmhouse. All are from{" "}
            <a href="https://unsplash.com/?utm_source=farmhouze&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="link-draw">
              Unsplash
            </a>{" "}
            and used under the Unsplash License.
          </p>
        </header>
        <ul data-daylight="0.5" className="grid gap-x-8 border-t border-line sm:grid-cols-2">
          {photoCredits.map((name) => (
            <li key={name} className="border-b border-line py-3">
              {name}
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
