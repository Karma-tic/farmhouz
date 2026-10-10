import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Booking terms & cancellation policy",
  description: `How booking through ${site.name} works: free requests, a ${site.booking.advancePercent}% advance to confirm, and our cancellation policy.`,
  alternates: { canonical: "/policies" },
};

export default function PoliciesPage() {
  return (
    <>
      <main id="main" className="container-x max-w-4xl pb-24 pt-[calc(var(--header-h)+3rem)]">
        <header data-daylight="0.3" className="mb-14">
          <p className="eyebrow mb-4 text-sage">Policies</p>
          <h1 className="display display-lg">
            Booking terms & <span className="italic-soft text-terra">cancellations</span>
          </h1>
          <p className="mt-6 text-lg text-muted">Plain-language terms for booking a farmhouse through {site.name}.</p>
        </header>

        <section data-daylight="0.4" aria-labelledby="how" className="mb-14">
          <h2 id="how" className="display display-md mb-6">
            How it works
          </h2>
          <ol className="flex flex-col divide-y divide-line border-y border-line">
            {site.steps.map((s, i) => (
              <li key={s.id} className="flex gap-5 py-4">
                <span className="eyebrow pt-1 text-sage">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <strong className="font-medium">{s.title}.</strong> {s.body}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section data-daylight="0.5" aria-labelledby="terms" className="mb-14">
          <h2 id="terms" className="display display-md mb-6">
            Booking terms
          </h2>
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {site.platformRules.map((r) => (
              <li key={r} className="py-4">
                {r}
              </li>
            ))}
            <li className="py-4">
              The advance is {site.booking.advancePercent}% of the quote. Dates are held for {site.booking.holdHours} hours after we confirm availability; if the advance isn&apos;t received in that time, the hold lapses and the dates may be offered to others.
            </li>
          </ul>
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
                  <th scope="col" className="p-4 font-medium">
                    When you cancel
                  </th>
                  <th scope="col" className="p-4 font-medium">
                    What happens
                  </th>
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
          <p className="mt-4 text-sm text-muted">Each farmhouse&apos;s own house rules are listed on its page and apply during your stay.</p>
          <Button asChild size="lg" className="mt-10">
            <Link href="/bhopal">Find a farmhouse</Link>
          </Button>
        </section>
        <div data-daylight="1" className="h-12" />
      </main>
      <Footer />
    </>
  );
}
