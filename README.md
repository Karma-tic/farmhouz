# Farmhouze

**Bhopal's farmhouses, checked and booked for you.** Farmhouze is a booking agent: guests pick a farmhouse and send a free request, you confirm with the owner, the guest pays an advance by UPI, and they get a booking pass.

Scrolling the site is still "a day at the farm" — the sky moves from dawn to bonfire night — and each booking's tracking page is lit by its status: dawn when requested, golden hour when it's free, night when it's booked.

Built with Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, Postgres (`postgres`), GSAP, Lenis, Motion, React Three Fiber, react-day-picker, react-hook-form + zod, Radix and Resend.

---

## How a booking works

| Step | Guest sees (`/booking/<code>`) | You do (`/admin`) |
|---|---|---|
| 1 · **Request** | Picks farmhouse + dates + guests → "We're checking with the owner" (page updates by itself) | Get an email (if Resend is set up) and see it under **Needs you** |
| 2 · **Check** | — | Tap **Ask owner if free** (prefilled WhatsApp to the owner) |
| 3a · **Available** | Quote, 30% advance, 24-hour hold countdown, UPI QR / app link, "I've paid" form | Enter the quote → **Send quote & hold dates**; tap **WhatsApp guest** to nudge them |
| 3b · **Not available** | Nearest free dates + similar free farmhouses; switch with one tap (goes back to step 1) | **Not available** → pick dates/farms to suggest (auto-suggestions pre-selected) |
| 4 · **Paid** | "Verifying your payment" | Check the UTR in your bank app → **Received — confirm booking** (or **Can't find it**) |
| 5 · **Booked** | Booking pass: exact address, caretaker, times, balance, add-to-calendar | **Send booking to owner** (prefilled WhatsApp); dates are blocked automatically |

A lapsed hold shows as **expired**; the guest can tap "Check again". Exact addresses and owner numbers never reach the browser until a booking is confirmed (they live in `src/content/owners.server.ts`).

## Setup (one time)

1. **Database (required for bookings).** In Vercel → your project → **Storage** → create a **Neon** Postgres database and connect it to the project. That adds `DATABASE_URL` automatically. Tables are created on first use.
   *Without a database the site still works; the request form shows a "Send on WhatsApp" fallback.*
2. **Admin password.** Vercel → Settings → Environment Variables:
   - `ADMIN_PASSWORD` — your admin password (choose a long one)
   - `ADMIN_SECRET` — any long random string (signs your login cookie)
3. **Payments.** `NEXT_PUBLIC_UPI_ID` (e.g. `yourname@okhdfcbank`) and `NEXT_PUBLIC_UPI_NAME` (the name guests see).
4. **Emails (optional).** `RESEND_API_KEY`, `ADMIN_EMAIL` (where new requests go), `EMAIL_FROM` (a verified sender).
5. **Domain.** `NEXT_PUBLIC_SITE_URL` once you have one (used in links, sitemap, Open Graph).
6. Redeploy. Open `/admin` and sign in.

See `.env.example` for the full list.

## Editing content

| What | File |
|---|---|
| Farmhouses (name, area, capacity, prices, photos, spaces, amenities, rules) | `src/content/farmhouses.ts` |
| **Private** owner/caretaker contacts and exact addresses | `src/content/owners.server.ts` |
| Cities and areas (add Indore later by setting `live: true` and adding areas) | `src/content/cities.ts` |
| Brand, WhatsApp/phone, advance %, hold hours, FAQ, cancellation policy | `src/content/site.ts` |

**Add a farmhouse:** copy one object in `farmhouses.ts`, give it a new `slug`, set `sample: false`, add its photos to `public/media/farms/<slug>/`, and add the owner in `owners.server.ts` with the same slug. It appears on `/bhopal`, the map and the sitemap.

**Before launch:** all 8 listings are **samples** (marked "Sample"). Replace them with real, visited properties, then set `previewMode: false` in `site.ts`. Replace every `OWNER TO FILL`.

**Block dates** (owner's own bookings, maintenance): `/admin/calendar`.

**Reviews:** only real ones, in `site.reviews`. The section stays hidden until there's at least one.

## Run locally

```bash
npm install
cp .env.example .env.local      # set DATABASE_URL to any Postgres, plus ADMIN_PASSWORD
npm run dev                     # http://localhost:3000  ·  admin at /admin
```

`npm run build`, `npm run lint`. Regenerate placeholder media: `node scripts/generate-placeholders.mjs` (needs ffmpeg).

## Project structure

```
src/app/
  page.tsx                       home: drone hero, pinned farmhouse walk-through, packages, zoom gallery, celebrations, booking calendar, route map, FAQ, bonfire
  [city]/page.tsx                /bhopal — filters, results, map
  [city]/[slug]/page.tsx         a farmhouse: spaces walk-through, packages, gallery, calendar + request form
  booking/[code]/page.tsx        guest's live tracker
  admin/…                        inbox, booking detail, calendar, owner leads
  list-your-farmhouse/           owner applications
  api/bookings …                 create / status / guest actions (payment, switch, withdraw)
  api/admin/…                    login, bookings, actions, blocks, leads
src/lib/booking/                 schema (zod), repo (SQL), dates, WhatsApp/email messages
src/lib/db.ts                    Postgres client + schema
src/components/{booking,farm,search,admin,sections,…}
```

Status machine: `checking → available → payment_review → confirmed`, with `unavailable`, `expired` and `cancelled` branches (see `src/lib/booking/types.ts`).

## Deploy

Pushing to `main` deploys on Vercel automatically.
