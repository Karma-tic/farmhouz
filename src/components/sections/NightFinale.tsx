"use client";

import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { handleHashLink } from "@/components/chrome/scrollLink";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { photos } from "@/content/photos";
import { defaultWhatsappText, whatsappLink } from "@/content/site";
import { useIsDesktop, usePrefersReducedMotion } from "@/lib/motion/useReducedMotion";
import { mulberry32 } from "@/lib/utils";

const rand = mulberry32(2024);
const STARS = Array.from({ length: 60 }, () => ({
  x: rand() * 100,
  y: rand() * 70,
  s: 1 + rand() * 2,
  o: 0.25 + rand() * 0.75,
  d: 2 + rand() * 5,
  delay: rand() * 5,
}));
// sparks rise from the fire at the bottom of the frame; CSS only, no WebGL
const SPARKS = Array.from({ length: 28 }, () => ({
  x: 30 + rand() * 40,
  dx: `${(rand() - 0.5) * 18}vw`,
  s: 2 + rand() * 2.5,
  d: 3.5 + rand() * 4,
  delay: rand() * 7,
}));

/** Supporting moment — bonfire night: a real fire, stars, rising sparks, firelight glow, last call to book. */
export function NightFinale() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const reduce = usePrefersReducedMotion();
  const desktop = useIsDesktop();
  const sparks = reduce ? 0 : desktop ? SPARKS.length : 14;

  // sparks only animate while the section is on screen
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="night"
      data-daylight="1"
      aria-labelledby="night-title"
      className="theme-night relative isolate flex min-h-[110svh] items-center overflow-hidden bg-night"
    >
      {/* the fire itself: a real photograph, fading up into the night sky */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[72%] [mask-image:linear-gradient(to_top,black_35%,transparent)]"
      >
        <Image
          src={photos.fire.src}
          alt=""
          fill
          sizes="100vw"
          quality={70}
          className="object-cover object-[50%_70%] opacity-70 saturate-[1.1]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,transparent_20%,var(--night)_78%)]" />
      </div>

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

      {sparks > 0 && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {SPARKS.slice(0, sparks).map((p, i) => (
            <span
              key={i}
              className="absolute bottom-[8%] rounded-full bg-[color-mix(in_oklab,var(--ember)_70%,white)] shadow-[0_0_6px_var(--ember)]"
              style={
                {
                  left: `${p.x}%`,
                  width: p.s,
                  height: p.s,
                  opacity: 0,
                  "--dx": p.dx,
                  animation: `spark ${p.d}s ease-out ${p.delay}s infinite`,
                  animationPlayState: visible ? "running" : "paused",
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div className="container-x relative z-10 py-32 text-center">
        <Reveal>
          <p className="eyebrow mb-6 text-ember">Bonfire · 11:30 PM</p>
          <h2 id="night-title" className="display mx-auto max-w-[12ch] text-[clamp(3.5rem,11vw,10rem)] text-moon">
            Stay for the <span className="italic-soft text-wheat">night.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-night-muted">
            The fire&apos;s lit, the music&apos;s low and there&apos;s nowhere you need to drive back to.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/#book" onClick={(e) => handleHashLink(e, "/#book")} data-cursor="Book">
                Check availability
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
