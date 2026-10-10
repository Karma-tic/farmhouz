import type { Metadata } from "next";
import { Suspense } from "react";
import { Tracker } from "@/components/booking/Tracker";

export const metadata: Metadata = {
  title: "Your booking",
  robots: { index: false, follow: false },
};

/** Live booking tracker. Rendered in the browser and polled, so the shell stays static. */
export default function BookingPage({ params }: PageProps<"/booking/[code]">) {
  return (
    <main id="main">
      <Suspense fallback={<div className="min-h-[80svh]" aria-busy="true" />}>
        <Tracker params={params} />
      </Suspense>
    </main>
  );
}
