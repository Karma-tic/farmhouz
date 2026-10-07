/**
 * Farmhouze — all editable site content lives here.
 *
 * Owner: change text, prices, photos and amenities in this file only.
 * Anything marked `OWNER TO FILL` is a placeholder that should be replaced
 * before launch. Photos marked `TODO-replace` are generated placeholders;
 * drop real photos into /public/media with the same file names (see ASSETS.md).
 */

export type Phase = "dawn" | "morning" | "noon" | "golden" | "dusk" | "night";

export type Media = {
  src: string;
  alt: string;
  /** true while the file is still a generated placeholder */
  placeholder?: boolean;
};

export type Space = {
  id: string;
  name: string;
  description: string;
  chips: [string, string, string];
  image: Media;
};

export type PackageId =
  | "day-out"
  | "night-stay"
  | "weekend-escape"
  | "celebrations"
  | "shoots"
  | "corporate";

export type Package = {
  id: PackageId;
  name: string;
  bestFor: string;
  timing: string;
  inclusions: string[];
  /** Price in rupees. `null` shows "from ₹—" until the owner sets it. */
  priceFrom: number | null;
  /** What the price is per, e.g. "night", "day", "event" */
  priceUnit: string;
  /** How nights are counted for the price summary in the enquiry form */
  pricing: "per-night" | "flat";
  image: Media;
};

export type GalleryCategory = "Stays" | "Parties" | "Weddings" | "Shoots" | "Nature";

export type GalleryPhoto = Media & {
  category: GalleryCategory;
  /** aspect ratio width / height, used to reserve space and avoid layout shift */
  ratio: number;
};

export type Celebration = {
  id: string;
  name: string;
  description: string;
  packageId: PackageId;
  image: Media;
};

export type Amenity = {
  id:
    | "pool"
    | "wifi"
    | "parking"
    | "caretaker"
    | "kitchen"
    | "music"
    | "bonfire"
    | "games"
    | "pets";
  label: string;
  /** Toggle off to hide an amenity everywhere on the site */
  enabled: boolean;
};

export type FaqGroup = "Booking" | "At the farm" | "Rules";

export type Faq = { group: FaqGroup; q: string; a: string };

export type Review = {
  name: string;
  occasion: string;
  /** ISO date, e.g. "2026-03-14" */
  date: string;
  text: string;
  photo?: string;
};

const P = "/media";

export const site = {
  name: "Farmhouze",
  tagline: "Slow days. Long nights. Your own farm.",
  url: "https://farmhouze.example.com", // OWNER TO FILL: final domain
  description:
    "A private farmhouse for day outs, weekend stays, birthdays, haldi & mehendi, small weddings, shoots and offsites. Pool, lawn, orchard and a bonfire under the stars.",

  hero: {
    headline: ["Your own farm,", "for a day", "or a weekend."],
    sequence: {
      /** Number of frames in /public/media/hero-seq (0001.webp … ) */
      frames: 120,
      path: `${P}/hero-seq`,
    },
    poster: { src: `${P}/hero-poster.webp`, alt: "Aerial view of Farmhouze: green fields, a gate and the lawn in front of the house", placeholder: true },
    mobileVideo: `${P}/hero-mobile.mp4`,
  },

  location: {
    area: "Area name", // OWNER TO FILL
    city: "Indore", // OWNER TO FILL
    state: "Madhya Pradesh",
    country: "IN",
    postalCode: "000000", // OWNER TO FILL
    streetAddress: "Farm road, village name", // OWNER TO FILL
    kmFromCity: 25, // OWNER TO FILL
    driveTime: "45 min", // OWNER TO FILL
    lat: 22.7196, // OWNER TO FILL
    lng: 75.8577, // OWNER TO FILL
    mapsUrl: "https://maps.google.com/?q=22.7196,75.8577", // OWNER TO FILL: your Google Maps share link
    landmarks: [
      { name: "City centre", detail: "25 km · 45 min" },
      { name: "Nearest highway exit", detail: "6 km" },
      { name: "Petrol pump & ATM", detail: "4 km" },
      { name: "Railway station", detail: "28 km" },
    ], // OWNER TO FILL
  },

  capacity: {
    bedrooms: 4, // OWNER TO FILL
    sleeps: 12, // OWNER TO FILL
    eventGuests: 150, // OWNER TO FILL
    acres: 3, // OWNER TO FILL
  },

  contact: {
    /** Digits only with country code, no + or spaces. OWNER TO FILL */
    whatsapp: "919999999999",
    phone: "+91 99999 99999", // OWNER TO FILL
    email: "hello@farmhouze.example.com", // OWNER TO FILL
    instagram: "https://instagram.com/farmhouze", // OWNER TO FILL
    instagramHandle: "@farmhouze", // OWNER TO FILL
    googleProfile: "https://g.page/farmhouze", // OWNER TO FILL
    responseTime: "We'll call you within 2 hours",
  },

  times: {
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    dayOut: "9:00 AM – 6:00 PM",
    musicCutoff: "10:00 PM",
  },

  numbers: [
    { value: 3, suffix: "", label: "acres of farm, all yours" },
    { value: 25, suffix: " km", label: "from the city centre" },
    { value: 150, suffix: "", label: "guests for celebrations" },
    { value: 365, suffix: "", label: "sunsets a year, give or take a monsoon" },
  ], // OWNER TO FILL: keep in sync with capacity & location

  spaces: [
    {
      id: "lawn",
      name: "The Lawn",
      description:
        "A wide, soft lawn under old neem trees. Breakfast in the morning, a dance floor at night.",
      chips: ["Seats 150", "String lights", "Shaded corners"],
      image: { src: `${P}/spaces/lawn.webp`, alt: "Green lawn with string lights and neem trees at the farm", placeholder: true },
    },
    {
      id: "pool",
      name: "The Pool",
      description:
        "Cool water, sun loungers and a view of the fields. Kids' depth at one end.",
      chips: ["Private", "Loungers", "Changing room"],
      image: { src: `${P}/spaces/pool.webp`, alt: "Blue swimming pool with loungers beside the fields", placeholder: true },
    },
    {
      id: "rooms",
      name: "The Rooms",
      description:
        "Four airy bedrooms with linen, fans and AC. Wake up to birds instead of traffic.",
      chips: ["4 bedrooms", "Sleeps 12", "Attached baths"],
      image: { src: `${P}/spaces/rooms.webp`, alt: "Bright bedroom with white linen and a window onto the garden", placeholder: true },
    },
    {
      id: "orchard",
      name: "The Orchard",
      description:
        "Mango, guava and chikoo trees. Walk the rows, pick what's in season, find a hammock.",
      chips: ["Seasonal fruit", "Hammocks", "Morning walks"],
      image: { src: `${P}/spaces/orchard.webp`, alt: "Rows of fruit trees in the orchard in soft morning light", placeholder: true },
    },
    {
      id: "bonfire",
      name: "The Bonfire Pit",
      description:
        "A stone fire ring under an open sky. Stories, songs and too many marshmallows.",
      chips: ["Wood included", "Seats 30", "Starry sky"],
      image: { src: `${P}/spaces/bonfire.webp`, alt: "Bonfire glowing at night with chairs around it", placeholder: true },
    },
  ] satisfies Space[],

  packages: [
    {
      id: "day-out",
      name: "Day Out",
      bestFor: "Families and friends who want one slow day",
      timing: "9:00 AM – 6:00 PM",
      inclusions: ["Pool, lawn & orchard", "Indoor games", "Kitchen access"],
      priceFrom: null, // OWNER TO FILL
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
      priceFrom: null, // OWNER TO FILL
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
      priceFrom: null, // OWNER TO FILL
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
      priceFrom: null, // OWNER TO FILL
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
      priceFrom: null, // OWNER TO FILL
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
      priceFrom: null, // OWNER TO FILL
      priceUnit: "day",
      pricing: "flat",
      image: { src: `${P}/packages/corporate.webp`, alt: "Team sitting in a circle on the lawn for an outdoor session", placeholder: true },
    },
  ] satisfies Package[],

  celebrations: {
    rotatingWords: ["Birthdays", "Haldis", "Offsites", "Anniversaries"],
    items: [
      {
        id: "birthday",
        name: "Birthday",
        description: "Pool by day, cake and a bonfire by night. Bring the playlist; we'll handle the lights.",
        packageId: "celebrations",
        image: { src: `${P}/celebrations/birthday.webp`, alt: "Birthday table on the lawn with balloons and fairy lights", placeholder: true },
      },
      {
        id: "haldi",
        name: "Haldi & Mehendi",
        description: "Yellow, marigold and open sky. Space for the dhol, the decorators and the whole family.",
        packageId: "celebrations",
        image: { src: `${P}/celebrations/haldi.webp`, alt: "Haldi ceremony with marigold decor under a canopy", placeholder: true },
      },
      {
        id: "wedding",
        name: "Small Wedding",
        description: "An intimate wedding for up to 150 guests, with rooms for close family to stay over.",
        packageId: "celebrations",
        image: { src: `${P}/celebrations/wedding.webp`, alt: "Small wedding mandap set up on the lawn at dusk", placeholder: true },
      },
      {
        id: "prewedding",
        name: "Pre-wedding Shoot",
        description: "Orchard rows, an old gate, poolside and that golden hour. Five looks without leaving the farm.",
        packageId: "shoots",
        image: { src: `${P}/celebrations/prewedding.webp`, alt: "Couple posing at the farm gate in golden light", placeholder: true },
      },
      {
        id: "offsite",
        name: "Corporate Offsite",
        description: "Strategy on the lawn, cricket after lunch, dinner by the fire. Better than a hotel ballroom.",
        packageId: "corporate",
        image: { src: `${P}/celebrations/offsite.webp`, alt: "Team offsite session on the lawn with a whiteboard", placeholder: true },
      },
    ] satisfies Celebration[],
    decorPartners: ["Decor partner one", "Decor partner two", "Caterer of your choice"], // OWNER TO FILL
  },

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

  amenities: [
    { id: "pool", label: "Private pool", enabled: true },
    { id: "wifi", label: "Wi-Fi", enabled: true },
    { id: "parking", label: "Parking for 20 cars", enabled: true },
    { id: "caretaker", label: "Caretaker on site", enabled: true },
    { id: "kitchen", label: "Kitchen · cook on request", enabled: true },
    { id: "music", label: "Music system", enabled: true },
    { id: "bonfire", label: "Bonfire", enabled: true },
    { id: "games", label: "Indoor games", enabled: true },
    { id: "pets", label: "Pet-friendly", enabled: true },
  ] satisfies Amenity[],

  rules: [
    "Check-in from 12:00 PM, check-out by 11:00 AM. Day outs run 9:00 AM – 6:00 PM.",
    "Outdoor music stops at 10:00 PM as per local rules. Indoor music can continue at low volume.",
    "Guest count must match the booking. Extra guests are charged and need prior approval.",
    "No smoking inside the rooms. Use the porch or the lawn.",
    "Pets are welcome on a leash in common areas; please keep them off the beds.",
    "Children must be supervised at the pool at all times. No glass near the pool.",
    "Government ID is required for every adult staying overnight.",
    "Any damage to the property is charged at actual cost.",
  ],

  cancellation: [
    { when: "15+ days before check-in", refund: "Full refund of advance" },
    { when: "7–14 days before", refund: "50% refund, or free date change once" },
    { when: "Under 7 days", refund: "No refund; one date change within 3 months" },
    { when: "Weather or government restrictions", refund: "Free date change" },
  ], // OWNER TO FILL: confirm your policy

  faqs: [
    { group: "Booking", q: "How do I book?", a: "Pick your dates in the calendar and send an enquiry, or message us on WhatsApp. We'll call you within 2 hours with a final quote. Nothing is charged on the website." },
    { group: "Booking", q: "How much advance do I pay?", a: "A 30% advance confirms your dates. The balance is due at check-in. We accept UPI and bank transfer." },
    { group: "Booking", q: "Can I change my dates?", a: "Yes. Date changes are free up to 15 days before check-in, and allowed once within 3 months after that. See the full cancellation policy." },
    { group: "At the farm", q: "How do we reach the farm?", a: "It's about 45 minutes from the city centre by car. Use the 'Get directions' button for a Google Maps route. The last 1 km is a smooth farm road; any car can manage it." },
    { group: "At the farm", q: "Is there power backup?", a: "Yes. A generator covers lights, fans, the pool pump and the music system. Air-conditioning runs on mains power." },
    { group: "At the farm", q: "Can we bring outside food or a caterer?", a: "Absolutely. Use the kitchen yourselves, bring your own caterer, or ask us to arrange a cook." },
    { group: "At the farm", q: "Can we bring our own decorators?", a: "Yes. Decorators can set up from the morning of your booking. We can also recommend partners who know the space." },
    { group: "Rules", q: "Is alcohol allowed?", a: "Yes, for guests above the legal age, consumed responsibly on the property. Please follow local excise rules." },
    { group: "Rules", q: "Until when can we play music?", a: "Outdoor music stops at 10:00 PM as per local rules. After that, move the party indoors or to the bonfire." },
    { group: "Rules", q: "Are pets allowed?", a: "Yes, Farmhouze is pet-friendly. Keep pets on a leash in common areas and off the beds." },
  ] satisfies Faq[],

  /**
   * Only real guest reviews. Never invent reviews.
   * The Reviews section stays hidden until this list has entries.
   * Example entry:
   * { name: "Priya S.", occasion: "Birthday weekend", date: "2026-03-14", text: "…", photo: "/media/reviews/priya.webp" }
   */
  reviews: [] as Review[],

  nav: [
    { label: "Stay", href: "/stay" },
    { label: "Spaces", href: "/#spaces" },
    { label: "Celebrations", href: "/#celebrations" },
    { label: "Gallery", href: "/#gallery" },
    { label: "Location", href: "/#location" },
    { label: "FAQ", href: "/#faq" },
  ],

  /** Nav link photos for the mobile menu (crossfade on hover/focus) */
  navPhotos: {
    Stay: `${P}/spaces/rooms.webp`,
    Spaces: `${P}/spaces/lawn.webp`,
    Celebrations: `${P}/celebrations/haldi.webp`,
    Gallery: `${P}/gallery/12.webp`,
    Location: `${P}/gallery/01.webp`,
    FAQ: `${P}/spaces/bonfire.webp`,
  } as Record<string, string>,

  ogImage: `${P}/og.jpg`,
};

export type Site = typeof site;

export const enabledAmenities = site.amenities.filter((a) => a.enabled);

export function formatPrice(p: number | null) {
  return p == null ? "₹—" : `₹${p.toLocaleString("en-IN")}`;
}

export function whatsappLink(text: string) {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const defaultWhatsappText =
  "Hi Farmhouze! I'd like to check availability. Dates: __ · Guests: __ · Occasion: __";

/** Cheapest configured "per-night" price, used in the mobile booking bar */
export function lowestNightly() {
  const prices = (site.packages as Package[]).flatMap((p) =>
    p.pricing === "per-night" && p.priceFrom != null ? [p.priceFrom] : [],
  );
  return prices.length ? Math.min(...prices) : null;
}
