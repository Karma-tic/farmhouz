"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { DayPath } from "@/components/booking/DayPath";
import { SectionHeading } from "@/components/ui/reveal";
import { site } from "@/content/site";

/** "We check, you celebrate" — the booking flow told as a day; the sun moves as you scroll. */
export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 45%"] });
  const [p, setP] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setP(Math.round(v * 3 * 20) / 20));
  return (
    <section id="how" data-daylight="0.24" aria-labelledby="how-title" className="py-[clamp(5rem,12vw,9rem)]">
      <div className="container-x">
        <SectionHeading
          id="how-title"
          eyebrow="How booking works · 08:00 AM"
          title={
            <>
              You pick the farm. <span className="italic-soft text-terra">We do the calls.</span>
            </>
          }
          intro={`No more forwarding WhatsApp photos to five owners. Send one free request, we confirm availability within ${site.booking.checkWithin}, and you only pay once your dates are held.`}
        />
        <div ref={ref} className="mt-14 md:mt-20">
          <DayPath progress={p} />
        </div>
      </div>
    </section>
  );
}
