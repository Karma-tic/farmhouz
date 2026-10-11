/**
 * Farmhouze — platform-wide content (brand, contact, payments, FAQ, policies).
 * Farmhouses live in farmhouses.ts, cities & areas in cities.ts.
 * Anything marked `OWNER TO FILL` is a placeholder to replace before launch.
 */
import type { Faq, GalleryCategory, GalleryPhoto, Media, OccasionId, Package, PackageId, Review } from "./types";

export type { Faq, GalleryCategory, GalleryPhoto, Media, Phase, Review } from "./types";

const P = "/media";

export type Occasion = {
  id: OccasionId;
  name: string;
  description: string;
  /** package preselected in the request form */
  packageId: PackageId;
  image: Media;
};

export const site = {
  name: "Farmhouze",
  tagline: "Bhopal's best farmhouses, checked and booked for you.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://farmhouze.in",
  description:
    "Handpicked farmhouses around Bhopal for day outs, weekend stays, birthdays, haldi & mehendi, small weddings, shoots and offsites. Tell us your dates — we check with the owner and confirm within 2 hours.",

  /** Shows a "Preview · sample listings" note while listings are still samples */
  previewMode: true,

  /**
   * false = pre-launch: sample farmhouses are hidden, "book" buttons collect a
   * guest waitlist instead, and the farmhouse pages redirect home.
   * Turn on (NEXT_PUBLIC_LAUNCHED=true in Vercel, or here) once real farmhouses are listed.
   */
  launched: process.env.NEXT_PUBLIC_LAUNCHED === "true",

  prelaunch: {
    heroLine: "Bhopal · launching soon · every farmhouse visited before it's listed",
    numbers: [
      { value: 6, suffix: "", label: "areas, from Kerwa to Raisen Road" },
      { value: 100, suffix: "%", label: "of farmhouses visited before they're listed" },
      { value: 2, suffix: " hrs", label: "to hear back on availability" },
      { value: 0, suffix: "", label: "booking fees for you" },
    ],
    owners: [
      { id: "apply", name: "Tell us about it", description: "Fill a two-minute form or WhatsApp us a few photos and the location. Listing is free.", chips: ["2 minutes", "Free to list"], image: { src: `${P}/spaces/lawn.webp`, alt: "Wide green lawn in front of a farmhouse" } },
      { id: "visit", name: "We visit and set it up", description: "We see it in person, agree prices and rules with you, and build its page — with a name and identity if it doesn't have one yet.", chips: ["We visit", "Its own page"], image: { src: `${P}/spaces/orchard.webp`, alt: "Mango orchard rows at golden hour" } },
      { id: "enquiries", name: "We handle every enquiry", description: "Calls, WhatsApps, questions, payments — we deal with guests. You only get a message when dates are booked.", chips: ["No calls for you", "Advance collected"], image: { src: `${P}/spaces/pool.webp`, alt: "Private pool by the farmhouse" } },
      { id: "host", name: "You host and get paid", description: "Guests arrive with a booking pass and the balance. Need dates for yourself? Tell us and we block them.", chips: ["Your calendar", "Your rules"], image: { src: `${P}/spaces/bonfire.webp`, alt: "Bonfire on the lawn at night" } },
    ],
  },

  hero: {
    headline: ["Your own farm,", "for a day", "or a weekend."],
    sequence: { frames: 120, path: `${P}/hero-flight-hd`, hdPath: `${P}/hero-flight-fhd` },
    poster: { src: `${P}/hero-poster-farmhouse-fhd.webp`, alt: "A whitewashed farmhouse with a terracotta roof and verandah, seen from the lawn after flying in over wheat fields and through the gate at sunrise" },
    mobileVideo: `${P}/hero-mobile-farmhouse-fhd.mp4`,
  },

  contact: {
    /** Digits only with country code, no + or spaces. OWNER TO FILL */
    whatsapp: "919999999999",
    phone: "+91 99999 99999", // OWNER TO FILL
    email: "hello@farmhouze.in", // OWNER TO FILL
    instagram: "https://instagram.com/farmhouze", // OWNER TO FILL
    instagramHandle: "@farmhouze", // OWNER TO FILL
    hours: "9 AM – 9 PM, every day",
  },

  booking: {
    /** Promise shown on the request form and tracker */
    checkWithin: "2 hours",
    /** % of the quote asked as advance to lock the dates */
    advancePercent: 30,
    /** How long dates are held after we confirm availability */
    holdHours: 24,
    /** Shown in the payment step. OWNER TO FILL */
    upiId: process.env.NEXT_PUBLIC_UPI_ID ?? "farmhouze@upi",
    payeeName: process.env.NEXT_PUBLIC_UPI_NAME ?? "Farmhouze",
    bankNote: "Prefer bank transfer? WhatsApp us for account details.",
  },

  numbers: [
    { value: 8, suffix: "", label: "handpicked farmhouses around Bhopal" },
    { value: 6, suffix: "", label: "areas, from Kerwa to Raisen Road" },
    { value: 2, suffix: " hrs", label: "to hear back on availability" },
    { value: 0, suffix: "", label: "booking fees for you" },
  ],

  steps: [
    { id: "request", time: "06:30 AM", title: "Send a request", body: "Pick a farmhouse, your dates and guest count. No payment, no account." },
    { id: "checking", time: "10:00 AM", title: "We check with the owner", body: "We call the owner and confirm availability, usually within 2 hours." },
    { id: "pay", time: "04:30 PM", title: "Pay the advance", body: "Dates are free? We hold them for 24 hours while you pay a 30% advance by UPI." },
    { id: "booked", time: "09:00 PM", title: "It's booked", body: "You get your booking pass with the exact address, check-in time and caretaker's number." },
  ],

  /** "Choose your day" — the six ways to book, shown on the homepage */
  packages: [
    {
      id: "day-out",
      name: "Day Out",
      bestFor: "Families and friends who want one slow day",
      timing: "9:00 AM – 6:00 PM",
      inclusions: ["Pool, lawn & orchard", "Indoor games", "Kitchen access"],
      priceFrom: null, // shown as "from ₹—"; or set your lowest price across farmhouses
      priceUnit: "day",
      pricing: "flat",
      image: { src: `${P}/packages/day-out.webp`, alt: "Friends relaxing by the pool on a sunny afternoon", placeholder: true },
    },
    {
      id: "night-stay",
      name: "Night Stay",
      bestFor: "Couples and small groups escaping for a night",
      timing: "Check-in 12 PM · Check-out 11 AM",
      inclusions: ["4 bedrooms", "Bonfire night", "Breakfast on request"],
      priceFrom: null, // shown as "from ₹—"; or set your lowest price across farmhouses
      priceUnit: "night",
      pricing: "per-night",
      image: { src: `${P}/packages/night-stay.webp`, alt: "The farmhouse lit up at night under the stars", placeholder: true },
    },
    {
      id: "weekend-escape",
      name: "Weekend Escape",
      bestFor: "Two full nights to actually switch off",
      timing: "Friday or Saturday check-in · 2 nights",
      inclusions: ["Whole property", "Two bonfire nights", "Cook on request"],
      priceFrom: null, // shown as "from ₹—"; or set your lowest price across farmhouses
      priceUnit: "night",
      pricing: "per-night",
      image: { src: `${P}/packages/weekend-escape.webp`, alt: "Chai on the porch with fields stretching to the horizon", placeholder: true },
    },
    {
      id: "celebrations",
      name: "Celebrations",
      bestFor: "Birthdays, haldi & mehendi, small weddings",
      timing: "Day or overnight · up to 150 guests",
      inclusions: ["Lawn & party hall", "Decorator access", "Power backup"],
      priceFrom: null, // shown as "from ₹—"; or set your lowest price across farmhouses
      priceUnit: "event",
      pricing: "flat",
      image: { src: `${P}/packages/celebrations.webp`, alt: "Marigold decor and fairy lights set up on the lawn", placeholder: true },
    },
    {
      id: "shoots",
      name: "Shoots",
      bestFor: "Pre-wedding, fashion and brand shoots",
      timing: "Golden-hour slots available",
      inclusions: ["All locations", "Changing room", "Power points"],
      priceFrom: null, // shown as "from ₹—"; or set your lowest price across farmhouses
      priceUnit: "shoot",
      pricing: "flat",
      image: { src: `${P}/packages/shoots.webp`, alt: "Couple walking through the orchard at golden hour", placeholder: true },
    },
    {
      id: "corporate",
      name: "Corporate Offsite",
      bestFor: "Teams who think better outdoors",
      timing: "Day or overnight · up to 60 people",
      inclusions: ["Wi-Fi & projector", "Lawn sessions", "Meals arranged"],
      priceFrom: null, // shown as "from ₹—"; or set your lowest price across farmhouses
      priceUnit: "day",
      pricing: "flat",
      image: { src: `${P}/packages/corporate.webp`, alt: "Team sitting in a circle on the lawn for an outdoor session", placeholder: true },
    },
  ] satisfies Package[],

  occasions: [
    { id: "birthday", name: "Birthday", description: "Pool by day, cake and a bonfire by night. Bring the playlist; the farm handles the lights.", packageId: "celebrations", image: { src: `${P}/celebrations/birthday.webp`, alt: "Birthday table on the lawn with balloons and fairy lights", placeholder: true } },
    { id: "haldi-mehendi", name: "Haldi & Mehendi", description: "Yellow, marigold and open sky. Space for the dhol, the decorators and the whole family.", packageId: "celebrations", image: { src: `${P}/celebrations/haldi.webp`, alt: "Haldi ceremony with marigold decor under a canopy", placeholder: true } },
    { id: "wedding", name: "Small Wedding", description: "Intimate weddings for up to 300 guests, with rooms for close family to stay over.", packageId: "celebrations", image: { src: `${P}/celebrations/wedding.webp`, alt: "Small wedding mandap set up on the lawn at dusk", placeholder: true } },
    { id: "shoot", name: "Pre-wedding Shoot", description: "Orchard rows, old gates, poolside and that golden hour. Five looks without leaving the farm.", packageId: "shoots", image: { src: `${P}/celebrations/prewedding.webp`, alt: "Couple posing at a farm gate in golden light", placeholder: true } },
    { id: "corporate", name: "Corporate Offsite", description: "Strategy on the lawn, cricket after lunch, dinner by the fire. Better than a hotel ballroom.", packageId: "corporate", image: { src: `${P}/celebrations/offsite.webp`, alt: "Team offsite session on the lawn with a whiteboard", placeholder: true } },
  ] satisfies Occasion[],

  occasionLabels: {
    "day-out": "Day out",
    "night-stay": "Night stay",
    weekend: "Weekend",
    birthday: "Birthday",
    "haldi-mehendi": "Haldi & Mehendi",
    wedding: "Small wedding",
    shoot: "Shoot",
    corporate: "Offsite",
  } as Record<OccasionId, string>,

  amenityLabels: {
    pool: "Private pool",
    wifi: "Wi-Fi",
    parking: "Parking",
    caretaker: "Caretaker on site",
    kitchen: "Kitchen",
    cook: "Cook on request",
    music: "Music system",
    bonfire: "Bonfire",
    games: "Indoor games",
    pets: "Pet-friendly",
    ac: "AC rooms",
    "power-backup": "Power backup",
    lawn: "Lawn",
    hall: "Party hall",
  } as Record<string, string>,

  rotatingWords: ["Birthdays", "Haldis", "Offsites", "Anniversaries"],

  gallery: {
    categories: ["Stays", "Parties", "Weddings", "Shoots", "Nature"] as GalleryCategory[],
    photos: [
      { src: `${P}/gallery/01.webp`, alt: "Morning mist over the fields", category: "Nature", ratio: 1.5, placeholder: true },
      { src: `${P}/gallery/02.webp`, alt: "Feet dangling in the pool", category: "Stays", ratio: 0.8, placeholder: true },
      { src: `${P}/gallery/03.webp`, alt: "Birthday dinner under string lights", category: "Parties", ratio: 1.33, placeholder: true },
      { src: `${P}/gallery/04.webp`, alt: "Haldi ceremony with marigolds", category: "Weddings", ratio: 0.75, placeholder: true },
      { src: `${P}/gallery/05.webp`, alt: "Couple in the orchard at golden hour", category: "Shoots", ratio: 0.8, placeholder: true },
      { src: `${P}/gallery/06.webp`, alt: "Chai on the porch at sunrise", category: "Stays", ratio: 1.5, placeholder: true },
      { src: `${P}/gallery/07.webp`, alt: "Bonfire with friends at night", category: "Parties", ratio: 1, placeholder: true },
      { src: `${P}/gallery/08.webp`, alt: "Mango trees heavy with fruit", category: "Nature", ratio: 0.75, placeholder: true },
      { src: `${P}/gallery/09.webp`, alt: "Wedding mandap on the lawn", category: "Weddings", ratio: 1.33, placeholder: true },
      { src: `${P}/gallery/10.webp`, alt: "Bedroom with morning light", category: "Stays", ratio: 1, placeholder: true },
      { src: `${P}/gallery/11.webp`, alt: "Brand shoot by the pool", category: "Shoots", ratio: 1.5, placeholder: true },
      { src: `${P}/gallery/12.webp`, alt: "Sunset over the fields", category: "Nature", ratio: 1.5, placeholder: true },
      { src: `${P}/gallery/13.webp`, alt: "Dance floor on the lawn", category: "Parties", ratio: 0.8, placeholder: true },
      { src: `${P}/gallery/14.webp`, alt: "Mehendi hands with fairy lights", category: "Weddings", ratio: 1, placeholder: true },
      { src: `${P}/gallery/15.webp`, alt: "Peacock in the orchard", category: "Nature", ratio: 0.8, placeholder: true },
      { src: `${P}/gallery/16.webp`, alt: "Pre-wedding shoot at the gate", category: "Shoots", ratio: 0.75, placeholder: true },
      { src: `${P}/gallery/17.webp`, alt: "Board games in the hall", category: "Stays", ratio: 1.33, placeholder: true },
      { src: `${P}/gallery/18.webp`, alt: "Stars over the farmhouse", category: "Nature", ratio: 1.5, placeholder: true },
    ] satisfies GalleryPhoto[],
  },

  faqs: [
    { group: "Booking", q: "How does booking work?", a: "Send a request for a farmhouse and dates. We check with the owner (usually within 2 hours) and update your booking page. If it's free, we hold the dates for 24 hours while you pay the advance. Once we receive it, you get your booking pass." },
    { group: "Booking", q: "Do I pay anything to send a request?", a: "No. Requests are free and don't commit you to anything. You only pay once we've confirmed the farmhouse is available and you're happy with the quote." },
    { group: "Booking", q: "What if my dates aren't available?", a: "Your booking page will show the nearest free dates at the same farmhouse and similar farmhouses that are free on your dates. Switch with one tap and we'll check again." },
    { group: "Payments", q: "How much advance do I pay, and how?", a: "30% of the quote, by UPI (scan the QR or tap to open your UPI app) or bank transfer. The balance is paid at check-in. Enter your UPI transaction ID on the booking page and we'll verify it." },
    { group: "Payments", q: "Do you charge a booking fee?", a: "No. The price you're quoted is the price of the farmhouse. We're paid by the owner." },
    { group: "Payments", q: "Is the advance refundable?", a: "Yes, fully, if you cancel 15+ days before check-in; 50% between 7 and 14 days. See the full cancellation policy." },
    { group: "At the farm", q: "Are the farmhouses verified?", a: "We visit every farmhouse before listing it and check the photos, capacity, power backup and pool." },
    { group: "At the farm", q: "Can we bring our own food, decorators or DJ?", a: "Almost always, yes. Each farmhouse page lists its rules. Outdoor music stops at 10 PM across Bhopal." },
    { group: "At the farm", q: "When do I get the exact address?", a: "With your booking pass, as soon as your advance is confirmed. Until then we show the area and drive time." },
  ] satisfies Faq[],

  cancellation: [
    { when: "15+ days before check-in", refund: "Full refund of advance" },
    { when: "7–14 days before", refund: "50% refund, or one free date change" },
    { when: "Under 7 days", refund: "No refund; one date change within 3 months, subject to availability" },
    { when: "Weather or government restrictions", refund: "Free date change" },
  ], // OWNER TO FILL: confirm your policy

  platformRules: [
    "Farmhouze is a booking agent: we arrange your booking with the property owner, who hosts you.",
    "Your booking is confirmed only once the advance is received and your booking pass is issued.",
    "The balance is paid at check-in, directly as instructed on your booking pass.",
    "Each farmhouse's own house rules apply and are listed on its page.",
    "Guest count must match the booking. Extra guests need prior approval and may be charged.",
    "Damage to the property is charged at actual cost by the owner.",
  ],

  /** Only real guest reviews. The section stays hidden until this list has entries. */
  reviews: [] as Review[],

  nav: [
    { label: "Farmhouses", href: "/#farmhouses" },
    { label: "Packages", href: "/#packages" },
    { label: "Celebrations", href: "/#celebrations" },
    { label: "Gallery", href: "/#gallery" },
    { label: "Location", href: "/#location" },
    { label: "FAQ", href: "/#faq" },
  ],

  navPhotos: {
    Farmhouses: `${P}/packages/day-out.webp`,
    "For owners": `${P}/spaces/lawn.webp`,
    Packages: `${P}/spaces/lawn.webp`,
    Celebrations: `${P}/celebrations/haldi.webp`,
    Gallery: `${P}/gallery/12.webp`,
    Location: `${P}/gallery/01.webp`,
    FAQ: `${P}/spaces/bonfire.webp`,
  } as Record<string, string>,

  ogImage: `${P}/og.jpg`,
};

export type Site = typeof site;

/** Main navigation; before launch the farmhouse walk-through becomes the owners' pitch. */
export function navItems() {
  return site.launched ? site.nav : site.nav.map((n) => (n.href === "/#farmhouses" ? { label: "For owners", href: n.href } : n));
}

export function formatPrice(p: number | null | undefined) {
  return p == null ? "₹—" : `₹${p.toLocaleString("en-IN")}`;
}

export function whatsappLink(text: string, to: string = site.contact.whatsapp) {
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}

export const defaultWhatsappText = "Hi Farmhouze! I'm looking for a farmhouse in Bhopal. Dates: __ · Guests: __ · Occasion: __";
