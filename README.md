# Farmhouze

Website for **Farmhouze** — a private farmhouse for day outs, weekend stays, birthdays, haldi & mehendi, small weddings, shoots and offsites.

Scrolling the homepage is living one day at the farm: the sky, light and shadows move from misty dawn to bonfire night, and a small sun-clock in the corner tells the time. Every section leads to one thing — a booking enquiry.

Built with Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, GSAP + ScrollTrigger, Lenis, Motion, React Three Fiber, react-day-picker, react-hook-form + zod, Radix primitives and Resend.

---

## Run it locally

```bash
npm install
cp .env.example .env.local   # optional — see "Enquiry emails" below
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`.
Regenerate placeholder media: `node scripts/generate-placeholders.mjs` (needs `ffmpeg`).

## Editing content (no code needed)

Everything a visitor reads lives in **`src/content/site.ts`**. Search for `OWNER TO FILL` and replace each placeholder.

| What | Where in `site.ts` |
|---|---|
| Address, distance, drive time, Google Maps link, lat/lng, landmarks | `location` |
| Bedrooms, guests, acres | `capacity` |
| WhatsApp (digits only, with 91), phone, email, Instagram, Google profile | `contact` |
| Package names, timings, inclusions and **prices** (`priceFrom`: a number in ₹, or `null` to show "₹—") | `packages` |
| Spaces walk-through (Lawn, Pool, Rooms, Orchard, Bonfire) | `spaces` |
| Amenities — set `enabled: false` to hide one everywhere | `amenities` |
| Gallery photos and their categories | `gallery.photos` |
| Celebrations, rotating headline words, decor partners | `celebrations` |
| House rules, cancellation policy, check-in/out, music cut-off | `rules`, `cancellation`, `times` |
| FAQ (grouped Booking / At the farm / Rules) | `faqs` |
| Guest reviews | `reviews` |

**Reviews:** add only real guest reviews. The Reviews section stays hidden until the list has at least one entry; until then a "Rated on Google" link (to `contact.googleProfile`) is shown instead.

**Booked dates:** edit `src/content/availability.json` (inclusive `from`/`to` ranges), or set `NEXT_PUBLIC_ICS_URL` to a public Google Calendar iCal link — every event on that calendar blocks those dates. The feed is cached for 15 minutes.

**Photos & video:** drop real files into `public/media/` using the exact same file names (see **[ASSETS.md](./ASSETS.md)**). Every current image is a generated placeholder with a small "TODO-replace" tag.

## Enquiry emails

The form posts to `/api/enquiry`, which validates the data (same zod schema as the browser) and:

- emails it with **Resend** when `RESEND_API_KEY` is set (`ENQUIRY_TO` = recipient, `ENQUIRY_FROM` = verified sender), or
- logs it on the server when no key is set.

After sending, guests can also forward the same enquiry on WhatsApp. There is no account creation or payment on the site.

## How it's built

```
src/
  app/                    routes: / , /stay, /celebrations, /policies, /api/enquiry, /api/availability, sitemap, robots
  content/                site.ts (all copy) · availability.json
  components/
    sections/             one component per homepage section (Hero, Numbers, Spaces, Packages, Gallery, …, Footer)
    chrome/               header, mobile menu, sun-clock, cursor, intro loader, mobile booking bar
    enquiry/              calendar, form, enquiry sheet
    providers/            DaylightProvider (scroll → time of day), SmoothScroll (Lenis + ScrollTrigger)
    three/                Embers — WebGL ember/firefly field (loaded only near the night section)
  lib/motion/             useDaylight, useMagnetic, usePinTimeline, daylight maths, lazy GSAP loader
  fonts/                  self-hosted Fraunces / Karla / JetBrains Mono
```

- **Daylight:** each section declares `data-daylight="0…1"`. `DaylightProvider` interpolates between sections by scroll position and writes the sky gradient, light tint and shadow angle as CSS variables. Colours are tokens in `src/app/globals.css` — components never hard-code hex values.
- **Motion:** desktop gets pinned scenes (hero drone flight, Spaces walk-through), smooth scrolling, a magnetic CTA and a companion cursor. GSAP and Lenis are loaded on demand, so phones never download them. Every animation has a static equivalent under `prefers-reduced-motion`.
- **Fonts:** self-hosted via `next/font/local` (no request to Google). Fraunces is pre-instanced at `SOFT 50` with weights 300–600 and subset to Latin to keep it small.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project → import `farmhouze`** (framework is detected automatically), or run `npx vercel --prod` from this folder.
3. Add the environment variables from `.env.example` in **Project → Settings → Environment Variables**.
4. Point your domain at the project and update `site.url` in `site.ts` (used for canonical URLs, sitemap and Open Graph).

## Quality checks

Before launch, with real photos in place:

- `npm run lint` and `npm run build` pass (TypeScript strict).
- Lighthouse (mobile) for Performance, Accessibility, Best Practices, SEO.
- Toggle the OS "Reduce motion" setting and scroll the whole page.
- Check widths 375, 768, 1024, 1440, 1920.
