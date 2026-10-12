"use client";

import { MapPin, MessageCircle, Sprout } from "lucide-react";
import { getImageProps } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { handleHashLink } from "@/components/chrome/scrollLink";
import { Button } from "@/components/ui/button";
import { useFarms } from "@/lib/farms/client";
import { defaultWhatsappText, site, whatsappLink } from "@/content/site";
import { mq } from "@/lib/motion/gsap";
import { usePinTimeline } from "@/lib/motion/usePinTimeline";
import { useMagnetic } from "@/lib/motion/useMagnetic";

const { frames, path, hdPath } = site.hero.sequence;
const frameSrc = (i: number, base: string = path) => `${base}/${String(i + 1).padStart(4, "0")}.webp`;

/** Full-HD frames only where they show (big or high-DPI canvas) and the connection can take them. */
function pickFramePath(canvas: HTMLCanvasElement) {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const slow = c?.saveData || (c?.effectiveType && c.effectiveType !== "4g");
  return !slow && canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 1.5) > 1300 ? hdPath : path;
}

/**
 * Signature moment — the drone arrival. On desktop a 120-frame image sequence is
 * scrubbed on a canvas while the hero is pinned for 200vh; the transparent sky in
 * the frames lets the page's dawn→morning sky show through. Mobile gets a short
 * silent loop; reduced motion gets the landed (final) frame.
 */
export function Hero() {
  const { farms: published } = useFarms();
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  useMagnetic(ctaRef, 6);

  // Art-directed LCP image: first drone frame on desktop, vertical poster on mobile
  const common = { alt: site.hero.poster.alt, sizes: "100vw", fetchPriority: "high", loading: "eager" } as const;
  const { props: mobileImg } = getImageProps({ ...common, src: "/media/hero-mobile-poster-farmhouse-fhd.webp", width: 900, height: 1600, quality: 80 });
  const { props: { srcSet: desktopSet, ...desktopImg } } = getImageProps({ ...common, src: frameSrc(0), width: 1152, height: 648, quality: 80 });
  const { props: { srcSet: reducedSet } } = getImageProps({ ...common, src: site.hero.poster.src, width: 1920, height: 1080, quality: 80 });

  /* ---------------------------------------------------- image sequence */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!matchMedia(mq.desktop).matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgs: (HTMLImageElement | null)[] = new Array(frames).fill(null);
    let current = 0;
    let cancelled = false;
    const base = pickFramePath(canvas);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw(current);
    };

    const nearestLoaded = (i: number) => {
      for (let d = 0; d < frames; d++) {
        if (imgs[i - d]) return imgs[i - d];
        if (imgs[i + d]) return imgs[i + d];
      }
      return null;
    };

    const draw = (i: number) => {
      const img = nearestLoaded(i);
      if (!img) return;
      const cw = canvas.width, ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const im = new Image();
        im.decoding = "async";
        im.onload = () => {
          imgs[i] = im;
          resolve();
        };
        im.onerror = () => resolve();
        im.src = frameSrc(i, base);
      });

    (async () => {
      await load(0);
      if (cancelled) return;
      resize();
      setCanvasReady(true);
      // lazy-load the rest in batches, sparse first so scrubbing looks right early
      const order = [
        ...Array.from({ length: frames }, (_, i) => i).filter((i) => i % 8 === 0),
        ...Array.from({ length: frames }, (_, i) => i).filter((i) => i % 8 !== 0),
      ];
      for (let b = 0; b < order.length; b += 12) {
        if (cancelled) return;
        await Promise.all(order.slice(b, b + 12).filter((i) => !imgs[i]).map(load));
        draw(current);
      }
    })();

    const onFrame = (e: Event) => {
      current = (e as CustomEvent<number>).detail;
      draw(current);
    };
    canvas.addEventListener("frame", onFrame);
    window.addEventListener("resize", resize);
    return () => {
      cancelled = true;
      canvas.removeEventListener("frame", onFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ------------------------------------------------- scroll choreography */
  // Desktop: pin for 200vh, scrub the frames, lift the headline out at 70–100%.
  usePinTimeline(
    root,
    ({ tl }) => {
      const state = { f: 0 };
      tl.to(state, {
        f: frames - 1,
        duration: 1,
        onUpdate: () => canvasRef.current?.dispatchEvent(new CustomEvent("frame", { detail: Math.round(state.f) })),
      }).to(textRef.current, { autoAlpha: 0, yPercent: -18, ease: "power2.in", duration: 0.3 }, 0.7);
    },
    { length: "+=200%", scrub: 0.5 },
  );

  /* ---------------------------------------------- mobile video (lazy) */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !matchMedia(mq.mobile).matches) return;
    // start after the page has settled so the poster stays the LCP and the main thread is free
    const start = () => {
      // WebM (VP9) where supported, H.264 MP4 everywhere else (iOS Safari)
      v.src = v.canPlayType('video/webm; codecs="vp9"') ? site.hero.mobileVideo.replace(/\.mp4$/, ".webm") : site.hero.mobileVideo;
      v.load();
      v.play().catch(() => {});
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const kick = () => idle(start);
    if (document.readyState === "complete") kick();
    else window.addEventListener("load", kick, { once: true });
  }, []);

  return (
    <section ref={root} id="top" data-daylight="0.02" aria-labelledby="hero-title" className="relative h-svh min-h-[560px] overflow-hidden">
      {/* LCP image: renders before any JavaScript */}
      <picture className="absolute inset-0 transition-opacity duration-300" style={{ opacity: canvasReady ? 0 : 1 }}>
        <source media="(prefers-reduced-motion: reduce) and (min-width: 768px)" srcSet={reducedSet} sizes="100vw" />
        <source media="(max-width: 767px)" srcSet={mobileImg.srcSet} sizes="100vw" />
        <source media="(min-width: 768px)" srcSet={desktopSet} sizes="100vw" />
        <img {...desktopImg} className="h-full w-full object-cover" alt={site.hero.poster.alt} />
      </picture>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full transition-opacity duration-300 md:block motion-reduce:!hidden"
        style={{ opacity: canvasReady ? 1 : 0 }}
      />

      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 md:hidden motion-reduce:hidden"
        style={{ opacity: videoPlaying ? 1 : 0 }}
        onPlaying={() => setVideoPlaying(true)}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      />

      {/* scrim keeps text ≥ 4.5:1 over any frame */}
      <div aria-hidden="true" className="scrim-bottom absolute inset-x-0 bottom-0 h-[86%]" />

      <div ref={textRef} className="theme-night absolute inset-x-0 bottom-0 pb-[max(2.5rem,7vh)] md:pb-[max(5.5rem,11vh)]">
        <div className="container-x">
          <p style={{ "--i": 3 } as React.CSSProperties} className="hero-fade eyebrow mb-5 flex items-center gap-2 text-moon/90">
            <MapPin className="size-4" strokeWidth={1.5} aria-hidden="true" />
            {site.launched ? `Bhopal · ${published.length} handpicked farmhouses · availability checked for you` : site.prelaunch.heroLine}
          </p>
          <h1 id="hero-title" className="display display-xl max-w-[14ch] text-moon">
            {site.hero.headline.map((l, i) => (
              <span key={i} className="block overflow-hidden pb-[0.08em]">
                <span className={i === 1 ? "hero-line italic-soft block" : "hero-line block"} style={{ "--i": i } as React.CSSProperties}>
                  {l}
                </span>
              </span>
            ))}
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="hero-fade" style={{ "--i": 4 } as React.CSSProperties}>
              <Link ref={ctaRef} href="/#book" onClick={(e) => handleHashLink(e, "/#book")} data-cursor="Book">
                {site.launched ? "Check availability" : "Get early access"}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="hero-fade text-moon" style={{ "--i": 5 } as React.CSSProperties}>
              {site.launched ? (
                <a href={whatsappLink(defaultWhatsappText)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> WhatsApp us
                </a>
              ) : (
                <Link href="/list-your-farmhouse">
                  <Sprout /> List your farmhouse
                </Link>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
