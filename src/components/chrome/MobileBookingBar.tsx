"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import { handleHashLink } from "@/components/chrome/scrollLink";
import { farmhousesIn, fromPrice, getFarmhouse } from "@/content/farmhouses";
import { formatPrice } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Mobile-only bar that appears after the hero; hides on scroll down, returns on
 * scroll up. On a farmhouse page it opens "Request to book"; elsewhere it links to search.
 */
export function MobileBookingBar() {
  const [visible, setVisible] = useState(false);
  const path = usePathname();
  const { openEnquiry } = useEnquiry();
  const farmSlug = path.split("/")[2];
  const farm = farmSlug ? getFarmhouse(farmSlug) : undefined;
  const hidden = path.startsWith("/booking") || path.startsWith("/admin") || path === "/bhopal" || path === "/list-your-farmhouse";

  useEffect(() => {
    let lastY = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      const pastHero = y > window.innerHeight * 0.85;
      const nearEnd = y + window.innerHeight > document.documentElement.scrollHeight - 200;
      const book = document.getElementById("book")?.getBoundingClientRect();
      const inBook = book ? book.top < window.innerHeight && book.bottom > 0 : false;
      setVisible(pastHero && !nearEnd && !inBook && (y < lastY || y - lastY < 2));
      lastY = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  if (hidden) return null;
  const show = visible;
  const price = farm ? fromPrice(farm) : null;
  const nights = farmhousesIn("bhopal").flatMap((f) => (f.price.night != null ? [f.price.night] : []));
  const lowestNight = nights.length ? Math.min(...nights) : null;
  const inner = (
    <>
      <span className="text-sm">
        {farm ? (
          <>
            From <span className="font-mono font-medium tracking-wide">{formatPrice(price?.amount)}</span> / {price?.unit}
          </>
        ) : (
          <>
            From <span className="font-mono font-medium tracking-wide">{formatPrice(lowestNight)}</span> / night
          </>
        )}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-wheat px-4 py-2 text-sm font-medium text-on-wheat">
        {farm ? "Request to book" : "Check dates"} <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
      </span>
    </>
  );
  const cls = "flex min-h-14 w-full items-center justify-between gap-3 rounded-full bg-ink px-5 text-left text-cream shadow-lift";
  return (
    <div
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 transition-[transform,opacity] duration-[var(--dur-ui)] ease-[var(--ease-out)] md:hidden",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[130%] opacity-0",
      )}
      aria-hidden={!show}
    >
      {farm ? (
        <button type="button" tabIndex={show ? 0 : -1} onClick={() => openEnquiry({ farmSlug: farm.slug })} className={cls}>
          {inner}
        </button>
      ) : (
        <Link href="/#book" onClick={(e) => handleHashLink(e, "/#book")} tabIndex={show ? 0 : -1} className={cls}>
          {inner}
        </Link>
      )}
    </div>
  );
}
