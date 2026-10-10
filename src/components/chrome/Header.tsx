"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { usePhase } from "@/lib/motion/useDaylight";
import { cn } from "@/lib/utils";
import { Wordmark } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { handleHashLink } from "./scrollLink";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const phase = usePhase();
  const night = phase === "dusk" || phase === "night";

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 80);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter,color] duration-[var(--dur-ui)] ease-[var(--ease-out)]",
        scrolled
          ? "border-b border-line bg-cream/70 backdrop-blur-[14px] backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
        night && "theme-night",
        scrolled && night && "bg-night/70",
      )}
    >
      <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" className="rounded-full text-ink" aria-label={`${site.name} home`}>
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {site.nav.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={(e) => handleHashLink(e, l.href)}
                  className="group/nav inline-flex min-h-11 items-center text-[0.95rem] font-medium text-ink"
                >
                  <span className="flip-link">
                    <span>{l.label}</span>
                    <span aria-hidden="true">{l.label}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="px-5">
            <Link href="/#book" onClick={(e) => handleHashLink(e, "/#book")} data-cursor="Book">
              Book
            </Link>
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
