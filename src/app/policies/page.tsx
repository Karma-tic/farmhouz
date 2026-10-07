import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "House rules & cancellation policy",
  description: `Check-in ${site.times.checkIn}, check-out ${site.times.checkOut}, music until ${site.times.musicCutoff}, and the ${site.name} cancellation policy.`,
  alternates: { canonical: "/policies" },
};

export default function PoliciesPage() {
  return (
    <>
      <main id="main" className="container-x max-w-4xl pb-24 pt-[calc(var(--header-h)+3rem)]">
        <header data-daylight="0.3" className="mb-14">
          <p className="eyebrow mb-4 text-sage">Policies</p>
          <h1 className="display display-lg">
            House rules & <span className="italic-soft text-terra">cancellations</span>
          </h1>
          <p className="mt-6 text-lg text-muted">Simple rules so everyone, including the neighbours, has a good time.</p>
        </header>

        <section data-daylight="0.4" aria-labelledby="times" className="mb-14">
          <h2 id="times" className="display display-md mb-6">
            Times
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Check-in", site.times.checkIn],
              ["Check-out", site.times.checkOut],
              ["Day out", site.times.dayOut],
              ["Outdoor music until", site.times.musicCutoff],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[var(--radius-card)] border border-line bg-card p-5">
                <dt className="eyebrow text-muted">{k}</dt>
                <dd className="display mt-1 text-[1.6rem]">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section data-daylight="0.5" aria-labelledby="rules" className="mb-14">
          <h2 id="rules" className="display display-md mb-6">
            House rules
          </h2>
          <ol className="flex flex-col divide-y divide-line border-y border-line">
            {site.rules.map((r, i) => (
              <li key={r} className="flex gap-5 py-4">
                <span className="eyebrow pt-1 text-sage">{String(i + 1).padStart(2, "0")}</span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </section>

        <section data-daylight="0.6" aria-labelledby="cancel">
          <h2 id="cancel" className="display display-md mb-6">
            Cancellation policy
          </h2>
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
            <table className="w-full text-left">
              <caption className="sr-only">Refunds by time before check-in</caption>
              <thead className="eyebrow text-muted">
                <tr>
                  <th scope="col" className="p-4 font-medium">When you cancel</th>
                  <th scope="col" className="p-4 font-medium">What happens</th>
                </tr>
              </thead>
              <tbody>
                {site.cancellation.map((c) => (
                  <tr key={c.when} className="border-t border-line">
                    <td className="p-4">{c.when}</td>
                    <td className="p-4 text-muted">{c.refund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button asChild size="lg" className="mt-10">
            <Link href="/#book">Check availability</Link>
          </Button>
        </section>
        <div data-daylight="1" className="h-12" />
      </main>
      <Footer />
    </>
  );
}
