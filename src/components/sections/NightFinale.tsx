"use client";

import { MessageCircle } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { defaultWhatsappText, whatsappLink } from "@/content/site";
import { useIsDesktop, usePrefersReducedMotion } from "@/lib/motion/useReducedMotion";
import { mulberry32 } from "@/lib/utils";

// Three.js only loads when the night section is close (see IntersectionObserver below)
const Embers = dynamic(() => import("@/components/three/Embers"), { ssr: false });

const rand = mulberry32(2024);
const STARS = Array.from({ length: 60 }, () => ({
  x: rand() * 100,
  y: rand() * 70,
  s: 1 + rand() * 2,
  o: 0.25 + rand() * 0.75,
  d: 2 + rand() * 5,
  delay: rand() * 5,
}));

/** Supporting moment — bonfire night: stars, rising embers, firelight glow, last call to book. */
export function NightFinale() {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduce = usePrefersReducedMotion();
  const desktop = useIsDesktop();
  const count = reduce ? 0 : desktop ? 300 : 120;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nearIO = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px 0px" });
    const visIO = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    nearIO.observe(el);
    visIO.observe(el);
    return () => {
      nearIO.disconnect();
      visIO.disconnect();
    };
  }, []);

  return (
    <section
      ref={ref}
      id="night"
      data-daylight="1"
      aria-labelledby="night-title"
      className="theme-night relative isolate flex min-h-[110svh] items-center overflow-hidden bg-night"
    >
      {/* stars */}
      <div aria-hidden="true" className="absolute inset-0">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-moon"
            style={
              {
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.s,
                height: s.s,
                "--o": s.o,
                opacity: s.o,
                animation: `twinkle ${s.d}s ease-in-out ${s.delay}s infinite`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* firelight glow (static fallback for reduced motion keeps the warm light) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[-30%] mx-auto aspect-square w-[min(140vw,1400px)] rounded-full"
        style={{
          background: "radial-gradient(closest-side, color-mix(in oklab, var(--ember) 55%, transparent), color-mix(in oklab, var(--ember) 14%, transparent) 55%, transparent)",
          animation: "firelight 4s ease-in-out infinite",
        }}
      />

      {near && count > 0 && (
        <div aria-hidden="true" className="absolute inset-0">
          <Embers count={count} active={visible} />
        </div>
      )}

      <div className="container-x relative z-10 py-32 text-center">
        <Reveal>
          <p className="eyebrow mb-6 text-ember">Bonfire · 11:30 PM</p>
          <h2 id="night-title" className="display mx-auto max-w-[12ch] text-[clamp(3.5rem,11vw,10rem)] text-moon">
            Stay for the <span className="italic-soft text-wheat">night.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-night-muted">
            The fire&apos;s lit, the music&apos;s low and there&apos;s nowhere you need to drive back to. Tell us your dates — we&apos;ll find the farm.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/bhopal" data-cursor="Book">
                Find your farmhouse
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-moon">
              <a href={whatsappLink(defaultWhatsappText)} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> WhatsApp us
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
