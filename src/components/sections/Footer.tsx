import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Wordmark } from "@/components/chrome/Logo";
import { site } from "@/content/site";
import { AmbientSound } from "./AmbientSound";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

/**
 * Night footer. On large screens it is revealed from beneath the content (the wrapper
 * clips a fixed footer); on mobile it simply flows.
 */
export function Footer() {
  const year = 2026;
  return (
    <div className="relative lg:h-[var(--footer-h)] lg:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]" style={{ "--footer-h": "560px" } as React.CSSProperties}>
      <footer className="theme-night bg-night lg:fixed lg:inset-x-0 lg:bottom-0 lg:h-[var(--footer-h)]">
        <div className="container-x flex h-full flex-col justify-between gap-12 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Wordmark className="text-moon" />
              <p className="mt-4 max-w-xs text-night-muted">{site.tagline}</p>
            </div>
            <div>
              <h2 className="eyebrow mb-4 text-wheat">Visit</h2>
              <address className="not-italic text-night-muted">
                {site.location.streetAddress}
                <br />
                {site.location.area}, {site.location.city}
                <br />
                {site.location.state} {site.location.postalCode}
              </address>
            </div>
            <div>
              <h2 className="eyebrow mb-4 text-wheat">Talk to us</h2>
              <ul className="flex flex-col gap-2">
                <li>
                  <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="link-draw inline-flex min-h-11 items-center gap-2 md:min-h-0">
                    <Phone className="size-4" strokeWidth={1.5} aria-hidden="true" /> {site.contact.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.contact.email}`} className="link-draw inline-flex min-h-11 items-center gap-2 break-all md:min-h-0">
                    <Mail className="size-4" strokeWidth={1.5} aria-hidden="true" /> {site.contact.email}
                  </a>
                </li>
                <li>
                  <a href={site.contact.instagram} target="_blank" rel="noopener noreferrer" className="link-draw inline-flex min-h-11 items-center gap-2 md:min-h-0">
                    <InstagramIcon /> {site.contact.instagramHandle}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="eyebrow mb-4 text-wheat">Explore</h2>
              <ul className="flex flex-col gap-2">
                {[
                  { href: "/stay", label: "Rooms & amenities" },
                  { href: "/celebrations", label: "Celebrations" },
                  { href: "/policies", label: "House rules & policies" },
                  { href: "/#faq", label: "FAQ" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-draw inline-flex min-h-11 items-center md:min-h-0">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            {/* decorative wordmark drawn via CSS content so it isn't read or contrast-checked as text */}
            <div
              aria-hidden="true"
              data-word={site.name}
              className="display select-none text-[clamp(4rem,17vw,16rem)] leading-[0.8] text-moon/[0.07] after:content-[attr(data-word)]"
            />
            <div className="mt-6 flex flex-col justify-between gap-4 border-t border-line bg-night pt-6 text-sm text-night-muted sm:flex-row sm:items-center">
              <p>
                © {year} {site.name} · Made with <span aria-label="love">♥</span> for slow weekends
              </p>
              <AmbientSound />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
