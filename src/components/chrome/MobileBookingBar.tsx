"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, lowestNightly } from "@/content/site";
import { cn } from "@/lib/utils";
import { handleHashLink } from "./scrollLink";

/** Mobile-only bar that appears after the hero; hides on scroll down, returns on scroll up. */
export function MobileBookingBar() {
  const [visible, setVisible] = useState(false);

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

  return (
    <div
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 transition-[transform,opacity] duration-[var(--dur-ui)] ease-[var(--ease-out)] md:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[130%] opacity-0",
      )}
      aria-hidden={!visible}
    >
      <Link
        href="/#book"
        tabIndex={visible ? 0 : -1}
        onClick={(e) => handleHashLink(e, "/#book")}
        className="flex min-h-14 items-center justify-between gap-3 rounded-full bg-ink px-5 text-cream shadow-lift"
      >
        <span className="text-sm">
          From <span className="font-mono font-medium tracking-wide">{formatPrice(lowestNightly())}</span> / night
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-wheat px-4 py-2 text-sm font-medium text-on-wheat">
          Check dates <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
