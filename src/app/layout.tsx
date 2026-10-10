import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense, ViewTransition } from "react";
import { Cursor } from "@/components/chrome/Cursor";
import { Header } from "@/components/chrome/Header";
import { Loader, loaderScript } from "@/components/chrome/Loader";
import { MobileBookingBar } from "@/components/chrome/MobileBookingBar";
import { SunClock } from "@/components/chrome/SunClock";
import { EnquiryProvider } from "@/components/enquiry/EnquiryContext";
import { EnquirySheet } from "@/components/enquiry/EnquirySheet";
import { DaylightProvider } from "@/components/providers/DaylightProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { LazyToaster as Toaster } from "@/components/ui/lazy-toaster";
import { site } from "@/content/site";
import "./globals.css";

/*
 * Fonts are self-hosted (Fraunces, Karla, JetBrains Mono from Google Fonts via
 * Fontsource) through next/font/local: same files, no third-party request,
 * and builds work without network access to Google.
 */
// Fraunces is pre-instanced at SOFT 50 / WONK 0 (weights 300–600, opsz variable) and
// subset to Latin to keep it small; see README › Fonts.
const fraunces = localFont({
  src: "../fonts/fraunces-normal.woff2",
  weight: "300 600",
  style: "normal",
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Georgia", "serif"],
});
const frauncesItalic = localFont({
  src: "../fonts/fraunces-italic.woff2",
  weight: "300 600",
  style: "italic",
  variable: "--font-fraunces-italic",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});
const karla = localFont({
  src: "../fonts/karla-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-karla",
  display: "swap",
});
const jetbrains = localFont({
  src: "../fonts/jetbrains-mono-latin-wght-normal.woff2",
  weight: "100 800",
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Farmhouses in Bhopal for stays, parties & weddings`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: `${site.name} at golden hour` }],
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4EEE1" },
    { media: "(prefers-color-scheme: dark)", color: "#14130F" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      className={`${fraunces.variable} ${frauncesItalic.variable} ${karla.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: loaderScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only-focusable fixed left-4 top-4 z-[110] rounded-full bg-ink px-5 py-3 text-cream"
        >
          Skip to content
        </a>
        <DaylightProvider />
        <SmoothScroll />
        <EnquiryProvider>
          <Loader />
          <Header />
          <ViewTransition>{children}</ViewTransition>
          <EnquirySheet />
          <Suspense fallback={null}>
            <MobileBookingBar />
          </Suspense>
        </EnquiryProvider>
        <SunClock />
        <Cursor />
        <Toaster />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
