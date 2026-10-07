# Assets — what to shoot and where it goes

Every file below currently exists as a **generated placeholder** (flat illustrations tagged "TODO-replace"). Replace each one with a real file of the **same name and format** in `public/media/` — no code changes needed. Alt text for each image is in `src/content/site.ts`; update it if the photo shows something different.

Photography direction: warm grade, real moments — feet in the pool, chai on the porch, string lights at dusk, marigolds at a haldi. Natural light; avoid heavy filters and HDR.

## 1. Hero drone flight (desktop)

| File | Spec |
|---|---|
| `hero-seq/0001.webp … hero-seq/0120.webp` | 120 frames, 1920×1080, WebP, ~60–90 KB each (≤ 8 MB total). Frames are lazy-loaded in batches. |
| `hero-poster.webp` | 1920×1080, the **final** frame (landed on the lawn). Used for reduced motion. |

**The shot:** a 6–8 second drone flight — high over the fields, gliding forward through the gate, and gently touching down on the lawn facing the house. Keep it steady and slow (no fast pans). If you can, shoot so the top of the first frames shows sky: the page's dawn sky will show through if you mask it to transparent (optional).

```bash
# 120 frames at 15 fps from an 8s clip → public/media/hero-seq/0001.webp …
ffmpeg -i drone.mp4 -vf "fps=15,scale=1920:-1" -q:v 75 public/media/hero-seq/%04d.webp
```

If your clip is a different length, adjust `fps` so you end up with 120 frames, or change `hero.sequence.frames` in `site.ts`.

## 2. Hero loop (mobile)

| File | Spec |
|---|---|
| `hero-mobile.mp4` | 1080×1920 vertical, 6–8 s, silent, loops, ≤ 2.5 MB, H.264 (optionally add an AV1 version) |
| `hero-mobile-poster.webp` | 1080×1920, first frame of the loop — this is the mobile LCP image, keep it ≤ 120 KB |

```bash
ffmpeg -i drone.mp4 -vf "scale=1080:-2" -c:v libx264 -crf 26 -an -movflags +faststart public/media/hero-mobile.mp4
ffmpeg -i public/media/hero-mobile.mp4 -frames:v 1 -vf "scale=720:-2" -q:v 70 public/media/hero-mobile-poster.webp
```

## 3. Spaces — 5 photos, 2400 px wide (3:2)

`spaces/lawn.webp` · `spaces/pool.webp` · `spaces/rooms.webp` · `spaces/orchard.webp` · `spaces/bonfire.webp`

## 4. Packages — 6 photos, 1600×1200 (4:3)

`packages/day-out.webp` · `packages/night-stay.webp` · `packages/weekend-escape.webp` · `packages/celebrations.webp` · `packages/shoots.webp` · `packages/corporate.webp`

## 5. Celebrations — 5 photos, 1400×1800 (portrait)

`celebrations/birthday.webp` · `celebrations/haldi.webp` · `celebrations/wedding.webp` · `celebrations/prewedding.webp` · `celebrations/offsite.webp`

## 6. Gallery — 18–30 photos, long edge 1600–2400 px

`gallery/01.webp … gallery/18.webp`. For each photo, set its `category` (Stays · Parties · Weddings · Shoots · Nature), `ratio` (width ÷ height, e.g. 1.5 for landscape, 0.8 for portrait) and `alt` in `site.gallery.photos`. To add more, add files `19.webp`, `20.webp` … and matching entries.

## 7. Sharing & brand

| File | Spec |
|---|---|
| `og.jpg` | 1200×630 JPEG, the image shown when the link is shared on WhatsApp/Instagram |
| `src/app/icon.svg`, `src/app/favicon.ico`, `src/app/apple-icon.png` | logo mark (sun over a roofline) — replace with your own |
| Wordmark | set in Fraunces in `src/components/chrome/Logo.tsx`; swap for an SVG logo if you have one |

## Converting photos to WebP

```bash
# one file
ffmpeg -i IMG_1234.jpg -vf "scale=2400:-2" -q:v 80 public/media/spaces/lawn.webp
# a whole folder (macOS/Linux)
for f in *.jpg; do ffmpeg -i "$f" -vf "scale=2400:-2" -q:v 80 "${f%.jpg}.webp"; done
```

Next.js serves resized AVIF/WebP versions automatically; just keep originals reasonably sized (≤ 2400 px, ≤ 600 KB).
