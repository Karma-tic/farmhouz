"use client";

import { ArrowUpRight, Check, Clock } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import { Reveal, SectionHeading } from "@/components/ui/reveal";
import { packagesFor } from "@/content/farmhouses";
import { formatPrice, site } from "@/content/site";
import type { Farmhouse, Package } from "@/content/types";

function PackageCard({ pkg, index, farmSlug }: { pkg: Package; index: number; farmSlug?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { openEnquiry, open, prefill } = useEnquiry();
  const morphId = `pkg-${farmSlug ?? "all"}-${pkg.id}`;
  const morphing = open && prefill.morphId === morphId;

  // 3D tilt (≤ 6°) + cursor spotlight, desktop fine pointers only
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - py) * 12}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 12}deg`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <Reveal as="li" amount={0.02} delay={(index % 3) * 0.06} className="w-[82vw] shrink-0 snap-center sm:w-[60vw] md:w-auto [perspective:1200px]">
      <button
        ref={ref}
        type="button"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={() => openEnquiry({ farmSlug, packageId: pkg.id, morphId })}
        data-cursor="Book"
        aria-label={`${pkg.name}: ${pkg.bestFor}. From ${formatPrice(pkg.priceFrom)} per ${pkg.priceUnit}. Request to book this package`}
        className="group relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-card text-left shadow-soft transition-[transform,box-shadow] duration-[var(--dur-ui)] ease-[var(--ease-out)] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d] hover:shadow-lift"
      >
        {/* spotlight */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-[var(--dur-ui)] group-hover:opacity-100"
          style={{
            background: "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--wheat) 26%, transparent), transparent 60%)",
          }}
        />
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={pkg.image.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 31vw, (min-width: 768px) 46vw, 82vw"
            className="object-cover transition-transform duration-[var(--dur-ui)] ease-[var(--ease-out)] group-hover:scale-[1.04]"
          />
          {!morphing && (
            <motion.div layoutId={morphId} className="absolute inset-0" transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <Image src={pkg.image.src} alt="" fill sizes="(min-width: 1024px) 31vw, (min-width: 768px) 46vw, 82vw" className="object-cover transition-transform duration-[var(--dur-ui)] ease-[var(--ease-out)] group-hover:scale-[1.04]" />
            </motion.div>
          )}
          <span className="eyebrow absolute left-4 top-4 z-10 rounded-full bg-card/85 px-3 py-1.5 text-ink backdrop-blur">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div>
            <h3 className="display text-[2rem] leading-none">{pkg.name}</h3>
            <p className="mt-2 text-muted">{pkg.bestFor}</p>
          </div>
          <p className="eyebrow flex items-center gap-2 text-sage">
            <Clock className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
            {pkg.timing}
          </p>
          <ul className="flex flex-col gap-1.5 text-[0.95rem]">
            {pkg.inclusions.map((inc) => (
              <li key={inc} className="flex items-center gap-2">
                <Check className="size-4 text-sage" strokeWidth={1.5} aria-hidden="true" />
                {inc}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-end justify-between border-t border-line pt-4">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted">
              from <span className="text-lg font-medium text-ink">{formatPrice(pkg.priceFrom)}</span> / {pkg.priceUnit}
            </p>
            <span className="grid size-11 place-items-center rounded-full bg-wheat text-on-wheat transition-transform duration-[var(--dur-ui)] group-hover:rotate-45">
              <ArrowUpRight className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </span>
          </div>
        </div>
      </button>
    </Reveal>
  );
}

export function Packages({ farm }: { farm?: Farmhouse }) {
  const packages = farm ? packagesFor(farm) : (site.packages as Package[]);
  return (
    <section id="packages" data-daylight="0.46" aria-labelledby="packages-title" className="relative py-[clamp(5rem,12vw,9rem)]">
      <div className="container-x mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          id="packages-title"
          eyebrow="Packages · 02:00 PM"
          title={
            <>
              Choose <span className="italic-soft text-terra">your</span> day.
            </>
          }
          intro={farm ? `Every booking is the whole of ${farm.name}, just for your group. Pick a starting point; we confirm the exact quote with the owner.` : "Every booking is a whole farm, just for your group. Pick how you want to spend it — we'll match the farmhouse and confirm with the owner."}
        />
        <p className="eyebrow text-muted md:text-right">Indicative prices · exact quote after we check</p>
      </div>
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter)] pb-6 md:container-x md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
        {packages.map((p, i) => (
          <PackageCard key={p.id} pkg={p} index={i} farmSlug={farm?.slug} />
        ))}
      </ul>
    </section>
  );
}
