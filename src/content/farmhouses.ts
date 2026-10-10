import type { AmenityId, Farmhouse, Media, OccasionId, Package, Space } from "./types";

/**
 * The farmhouses Farmhouze books. One object per property.
 *
 * ⚠ These are SAMPLE listings (sample: true) so the site has something to show.
 * Replace each with a real, visited property: real name, photos, prices and
 * capacity, then set `sample: false`. Owner phone numbers and exact addresses
 * do NOT go here — they live in owners.server.ts, which never reaches the browser.
 */

const P = "/media";
const img = (src: string, alt: string): Media => ({ src: `${P}/${src}`, alt, placeholder: true });

/* Reusable space blocks (customise per farmhouse with overrides) */
const S = {
  lawn: (o: Partial<Space> = {}): Space => ({
    id: "lawn",
    name: "The Lawn",
    description: "A wide, soft lawn under old trees. Breakfast in the morning, a dance floor at night.",
    chips: ["Seats 150", "String lights", "Shaded corners"],
    image: img("spaces/lawn.webp", "Green lawn with string lights and trees"),
    ...o,
  }),
  pool: (o: Partial<Space> = {}): Space => ({
    id: "pool",
    name: "The Pool",
    description: "Cool water, sun loungers and a view of the fields. Kids' depth at one end.",
    chips: ["Private", "Loungers", "Changing room"],
    image: img("spaces/pool.webp", "Blue swimming pool with loungers"),
    ...o,
  }),
  rooms: (o: Partial<Space> = {}): Space => ({
    id: "rooms",
    name: "The Rooms",
    description: "Airy bedrooms with fresh linen and AC. Wake up to birds instead of traffic.",
    chips: ["AC rooms", "Attached baths", "Fresh linen"],
    image: img("spaces/rooms.webp", "Bright bedroom with white linen and a garden window"),
    ...o,
  }),
  orchard: (o: Partial<Space> = {}): Space => ({
    id: "orchard",
    name: "The Orchard",
    description: "Rows of fruit trees to wander through. Pick what's in season, find a hammock.",
    chips: ["Seasonal fruit", "Hammocks", "Morning walks"],
    image: img("spaces/orchard.webp", "Rows of fruit trees in soft morning light"),
    ...o,
  }),
  bonfire: (o: Partial<Space> = {}): Space => ({
    id: "bonfire",
    name: "The Bonfire Pit",
    description: "A stone fire ring under an open sky. Stories, songs and too many marshmallows.",
    chips: ["Wood included", "Seats 30", "Starry sky"],
    image: img("spaces/bonfire.webp", "Bonfire glowing at night with chairs around it"),
    ...o,
  }),
  hall: (o: Partial<Space> = {}): Space => ({
    id: "hall",
    name: "The Party Hall",
    description: "A covered hall for dinner, games or a rain backup. Sound system included.",
    chips: ["Seats 80", "Sound system", "Rain backup"],
    image: img("gallery/17.webp", "Indoor hall with a long table and board games"),
    ...o,
  }),
};

const galleryA = [
  img("gallery/01.webp", "Morning mist over the fields"),
  img("gallery/02.webp", "Feet dangling in the pool"),
  img("gallery/03.webp", "Birthday dinner under string lights"),
  img("gallery/07.webp", "Bonfire with friends at night"),
  img("gallery/12.webp", "Sunset over the fields"),
  img("gallery/18.webp", "Stars over the farmhouse"),
];
const galleryB = [
  img("gallery/06.webp", "Chai on the porch at sunrise"),
  img("gallery/04.webp", "Haldi ceremony with marigolds"),
  img("gallery/09.webp", "Wedding mandap on the lawn"),
  img("gallery/14.webp", "Mehendi hands with fairy lights"),
  img("gallery/13.webp", "Dance floor on the lawn"),
  img("gallery/08.webp", "Mango trees heavy with fruit"),
];
const galleryC = [
  img("gallery/05.webp", "Couple in the orchard at golden hour"),
  img("gallery/16.webp", "Pre-wedding shoot at the gate"),
  img("gallery/11.webp", "Brand shoot by the pool"),
  img("gallery/15.webp", "Peacock in the orchard"),
  img("gallery/10.webp", "Bedroom with morning light"),
  img("gallery/12.webp", "Sunset over the fields"),
];

const commonRules = [
  "Outdoor music stops at 10:00 PM as per local rules.",
  "Guest count must match the booking; extra guests need prior approval.",
  "Government ID is required for every adult staying overnight.",
  "No smoking inside the rooms.",
];
const times = { checkIn: "12:00 PM", checkOut: "11:00 AM", dayOut: "9:00 AM – 6:00 PM", musicCutoff: "10:00 PM" };

const all = (...a: AmenityId[]) => a;
const occ = (...o: OccasionId[]) => o;

export const farmhouses: Farmhouse[] = [
  {
    slug: "mango-grove-kerwa",
    name: "Mango Grove",
    sample: true,
    published: true,
    city: "bhopal",
    area: "kerwa",
    tagline: "A mango orchard with a pool, five minutes from the Kerwa forest.",
    description:
      "Three acres of mango trees around a whitewashed farmhouse, with a pool that looks out over the fields. Cool even in May, quiet at night, and big enough for a 100-guest birthday.",
    highlights: ["Private pool", "Mango orchard", "4 AC bedrooms", "Bonfire pit"],
    capacity: { bedrooms: 4, sleeps: 12, eventGuests: 100 },
    acres: 3,
    approx: { lat: 23.172, lng: 77.345 },
    kmFromCentre: 16,
    driveTime: "35 min",
    price: { dayOut: 14000, night: 22000, event: 45000 },
    occasions: occ("day-out", "night-stay", "weekend", "birthday", "shoot"),
    amenities: all("pool", "wifi", "parking", "caretaker", "kitchen", "cook", "music", "bonfire", "games", "pets", "ac", "power-backup", "lawn"),
    spaces: [S.orchard({ name: "The Mango Orchard" }), S.pool(), S.rooms({ chips: ["4 AC rooms", "Sleeps 12", "Attached baths"] }), S.bonfire()],
    cover: img("packages/day-out.webp", "Pool with loungers beside the mango orchard"),
    gallery: galleryA,
    times,
    rules: [...commonRules, "Pets welcome on a leash in common areas."],
  },
  {
    slug: "neem-court-kolar",
    name: "Neem Court",
    sample: true,
    published: true,
    city: "bhopal",
    area: "kolar-road",
    tagline: "A big lawn and a party hall, built for celebrations.",
    description:
      "A courtyard farmhouse under three old neem trees, with a lawn that seats 200 and a covered hall for the rain. Decorators love the space; families love that it's 30 minutes from home.",
    highlights: ["Lawn for 200", "Covered party hall", "Generator backup", "Parking for 40 cars"],
    capacity: { bedrooms: 3, sleeps: 10, eventGuests: 200 },
    acres: 2.5,
    approx: { lat: 23.152, lng: 77.425 },
    kmFromCentre: 12,
    driveTime: "30 min",
    price: { dayOut: 18000, night: 20000, event: 55000 },
    occasions: occ("birthday", "haldi-mehendi", "wedding", "corporate", "day-out"),
    amenities: all("wifi", "parking", "caretaker", "kitchen", "cook", "music", "bonfire", "ac", "power-backup", "lawn", "hall"),
    spaces: [S.lawn({ name: "The Neem Lawn", chips: ["Seats 200", "String lights", "Stage area"] }), S.hall(), S.rooms({ chips: ["3 AC rooms", "Sleeps 10", "Bridal room"] }), S.bonfire()],
    cover: img("packages/celebrations.webp", "Marigold decor and fairy lights on the lawn"),
    gallery: galleryB,
    times,
    rules: [...commonRules, "Decorators can set up from 8:00 AM on the booking day."],
  },
  {
    slug: "lakeside-orchard-bhadbhada",
    name: "Lakeside Orchard",
    sample: true,
    published: true,
    city: "bhopal",
    area: "bhadbhada",
    tagline: "Guava trees, golden-hour light and the Upper Lake nearby.",
    description:
      "A small, photogenic orchard farm 20 minutes from the city. The light here at 5 PM is why photographers keep coming back, and the cottage sleeps a small family.",
    highlights: ["20 min from city", "Golden-hour orchard", "Cottage for 6", "Great for shoots"],
    capacity: { bedrooms: 2, sleeps: 6, eventGuests: 40 },
    acres: 1.5,
    approx: { lat: 23.21, lng: 77.37 },
    kmFromCentre: 8,
    driveTime: "20 min",
    price: { dayOut: 9000, night: 14000, event: 25000 },
    occasions: occ("shoot", "day-out", "night-stay", "birthday"),
    amenities: all("wifi", "parking", "caretaker", "kitchen", "bonfire", "pets", "ac", "lawn"),
    spaces: [S.orchard({ name: "The Guava Rows", chips: ["Golden hour", "Old gate", "Hammocks"] }), S.lawn({ chips: ["Seats 40", "Fairy lights", "Lake breeze"] }), S.rooms({ name: "The Cottage", chips: ["2 rooms", "Sleeps 6", "Verandah"] })],
    cover: img("packages/shoots.webp", "Couple walking through the orchard at golden hour"),
    gallery: galleryC,
    times,
    rules: [...commonRules, "Shoot crews: please share your crew size when you book."],
  },
  {
    slug: "sundown-fields-bhojpur",
    name: "Sundown Fields",
    sample: true,
    published: true,
    city: "bhopal",
    area: "bhojpur-road",
    tagline: "Wheat fields to the horizon and the best sunsets on this side of Bhopal.",
    description:
      "A low stone house in the middle of working fields on Bhojpur Road. Two nights here and you'll forget your phone. The pool is small, the sky is huge.",
    highlights: ["Plunge pool", "Field views", "Stargazing", "2-night weekends"],
    capacity: { bedrooms: 4, sleeps: 14, eventGuests: 60 },
    acres: 5,
    approx: { lat: 23.14, lng: 77.522 },
    kmFromCentre: 20,
    driveTime: "40 min",
    price: { dayOut: 12000, night: 18000, event: 35000 },
    occasions: occ("weekend", "night-stay", "corporate", "day-out"),
    amenities: all("pool", "wifi", "parking", "caretaker", "kitchen", "cook", "bonfire", "games", "pets", "power-backup", "lawn"),
    spaces: [S.lawn({ name: "The Field Lawn", chips: ["Seats 60", "Sunset view", "Hammocks"] }), S.pool({ name: "The Plunge Pool", chips: ["Private", "Heated in winter", "Deck"] }), S.rooms({ chips: ["4 rooms", "Sleeps 14", "Bunk room"] }), S.bonfire({ chips: ["Wood included", "Telescope", "Starry sky"] })],
    cover: img("packages/weekend-escape.webp", "Chai on the porch with fields stretching to the horizon"),
    gallery: galleryA,
    times,
    rules: [...commonRules],
  },
  {
    slug: "banyan-courtyard-raisen",
    name: "The Banyan Courtyard",
    sample: true,
    published: true,
    city: "bhopal",
    area: "raisen-road",
    tagline: "A wedding-sized farm with rooms for the whole family.",
    description:
      "Built around a 60-year-old banyan, with a lawn for 300, eight rooms for close family and a kitchen that caterers actually like. Our pick for small weddings and haldi–mehendi weekends.",
    highlights: ["Lawn for 300", "8 rooms", "Caterer's kitchen", "Bridal suite"],
    capacity: { bedrooms: 8, sleeps: 24, eventGuests: 300 },
    acres: 6,
    approx: { lat: 23.282, lng: 77.508 },
    kmFromCentre: 14,
    driveTime: "30 min",
    price: { dayOut: 25000, night: 40000, event: 90000 },
    occasions: occ("wedding", "haldi-mehendi", "birthday", "corporate", "weekend"),
    amenities: all("pool", "wifi", "parking", "caretaker", "kitchen", "cook", "music", "bonfire", "ac", "power-backup", "lawn", "hall"),
    spaces: [S.lawn({ name: "The Banyan Lawn", chips: ["Seats 300", "Mandap space", "Stage"] }), S.rooms({ chips: ["8 AC rooms", "Sleeps 24", "Bridal suite"] }), S.pool(), S.hall({ chips: ["Seats 120", "Sound system", "Rain backup"] }), S.bonfire()],
    cover: img("celebrations/wedding.webp", "Small wedding mandap on the lawn at dusk"),
    gallery: galleryB,
    times: { ...times, checkIn: "2:00 PM" },
    rules: [...commonRules, "Fireworks only with prior permission."],
  },
  {
    slug: "peacock-hollow-neelbad",
    name: "Peacock Hollow",
    sample: true,
    published: true,
    city: "bhopal",
    area: "neelbad",
    tagline: "Peacocks at breakfast and a pool under the trees.",
    description:
      "A leafy family farm on the Sehore Road side where peacocks wander the lawn every morning. Shaded pool, indoor games for the kids, and a cook who makes a very good dal baati.",
    highlights: ["Shaded pool", "Peacocks on the lawn", "Cook on request", "Kid-friendly"],
    capacity: { bedrooms: 3, sleeps: 10, eventGuests: 80 },
    acres: 2,
    approx: { lat: 23.2, lng: 77.305 },
    kmFromCentre: 13,
    driveTime: "30 min",
    price: { dayOut: 11000, night: 17000, event: 32000 },
    occasions: occ("day-out", "night-stay", "birthday", "weekend"),
    amenities: all("pool", "wifi", "parking", "caretaker", "kitchen", "cook", "music", "bonfire", "games", "ac", "lawn"),
    spaces: [S.pool({ chips: ["Shaded", "Kids' end", "Loungers"] }), S.lawn({ chips: ["Seats 80", "Peacocks", "Swings"] }), S.rooms({ chips: ["3 AC rooms", "Sleeps 10", "Family room"] }), S.bonfire()],
    cover: img("gallery/15.webp", "Peacock in the orchard"),
    gallery: galleryC,
    times,
    rules: [...commonRules, "Children must be supervised at the pool."],
  },
  {
    slug: "firefly-acres-kerwa",
    name: "Firefly Acres",
    sample: true,
    published: true,
    city: "bhopal",
    area: "kerwa",
    tagline: "A forest-edge hideaway for couples and small groups.",
    description:
      "Two cottages at the edge of the Kerwa woods, a fire pit and not much else — which is the point. Fireflies after the monsoon, owls at night, silence in the morning.",
    highlights: ["Forest edge", "2 cottages", "Fire pit", "Pet-friendly"],
    capacity: { bedrooms: 2, sleeps: 6, eventGuests: 25 },
    acres: 1,
    approx: { lat: 23.16, lng: 77.328 },
    kmFromCentre: 18,
    driveTime: "40 min",
    price: { dayOut: 7000, night: 12000, event: null },
    occasions: occ("night-stay", "weekend", "shoot"),
    amenities: all("wifi", "parking", "caretaker", "kitchen", "bonfire", "pets", "power-backup"),
    spaces: [S.bonfire({ name: "The Fire Pit", chips: ["Wood included", "Seats 12", "Owls at night"] }), S.rooms({ name: "The Cottages", chips: ["2 cottages", "Sleeps 6", "Verandahs"] }), S.orchard({ name: "The Woods Walk", chips: ["Forest trail", "Birding", "Fireflies"] })],
    cover: img("packages/night-stay.webp", "Farmhouse lit up at night under the stars"),
    gallery: galleryA,
    times,
    rules: [...commonRules, "Quiet hours after 10:00 PM — it's a forest."],
  },
  {
    slug: "wheatstone-farm-kolar",
    name: "Wheatstone Farm",
    sample: true,
    published: true,
    city: "bhopal",
    area: "kolar-road",
    tagline: "Offsites, cricket and a long lunch under the trees.",
    description:
      "A working farm with a big lawn, a covered hall with a projector and fast Wi-Fi. Teams come for strategy days and stay for the cricket match after lunch.",
    highlights: ["Projector & Wi-Fi", "Cricket pitch", "Hall for 80", "Meals arranged"],
    capacity: { bedrooms: 4, sleeps: 12, eventGuests: 120 },
    acres: 4,
    approx: { lat: 23.145, lng: 77.41 },
    kmFromCentre: 14,
    driveTime: "35 min",
    price: { dayOut: 15000, night: 21000, event: 40000 },
    occasions: occ("corporate", "day-out", "birthday", "weekend"),
    amenities: all("pool", "wifi", "parking", "caretaker", "kitchen", "cook", "music", "bonfire", "games", "ac", "power-backup", "lawn", "hall"),
    spaces: [S.lawn({ name: "The Cricket Lawn", chips: ["Seats 120", "Cricket pitch", "Shade tents"] }), S.hall({ chips: ["Seats 80", "Projector", "Fast Wi-Fi"] }), S.pool(), S.rooms({ chips: ["4 AC rooms", "Sleeps 12", "Work desks"] })],
    cover: img("packages/corporate.webp", "Team sitting in a circle on the lawn"),
    gallery: galleryB,
    times,
    rules: [...commonRules],
  },
];

export const published = farmhouses.filter((f) => f.published);
export const getFarmhouse = (slug: string) => farmhouses.find((f) => f.slug === slug && f.published);
export const farmhousesIn = (city: string) => published.filter((f) => f.city === city);

/** Packages shown on a farmhouse page, derived from its prices and occasions. */
export function packagesFor(f: Farmhouse): Package[] {
  const list: Package[] = [];
  if (f.price.dayOut != null || f.occasions.includes("day-out"))
    list.push({ id: "day-out", name: "Day Out", bestFor: "One slow day with family or friends", timing: f.times.dayOut, inclusions: ["Whole property", "Pool & lawn", "Kitchen access"], priceFrom: f.price.dayOut, priceUnit: "day", pricing: "flat", image: img("packages/day-out.webp", "") });
  if (f.price.night != null)
    list.push({ id: "night-stay", name: "Night Stay", bestFor: "An overnight escape", timing: `Check-in ${f.times.checkIn} · Check-out ${f.times.checkOut}`, inclusions: [`${f.capacity.bedrooms} bedrooms`, "Bonfire night", "Breakfast on request"], priceFrom: f.price.night, priceUnit: "night", pricing: "per-night", image: img("packages/night-stay.webp", "") });
  if (f.price.night != null && f.occasions.includes("weekend"))
    list.push({ id: "weekend-escape", name: "Weekend Escape", bestFor: "Two full nights to switch off", timing: "Fri or Sat check-in · 2 nights", inclusions: ["Whole property", "Two bonfire nights", "Cook on request"], priceFrom: f.price.night, priceUnit: "night", pricing: "per-night", image: img("packages/weekend-escape.webp", "") });
  if (f.price.event != null && f.occasions.some((o) => ["birthday", "haldi-mehendi", "wedding"].includes(o)))
    list.push({ id: "celebrations", name: "Celebrations", bestFor: "Birthdays, haldi & mehendi, small weddings", timing: `Up to ${f.capacity.eventGuests} guests`, inclusions: ["Lawn & lights", "Decorator access", "Power backup"], priceFrom: f.price.event, priceUnit: "event", pricing: "flat", image: img("packages/celebrations.webp", "") });
  if (f.occasions.includes("shoot"))
    list.push({ id: "shoots", name: "Shoots", bestFor: "Pre-wedding and brand shoots", timing: "Golden-hour slots", inclusions: ["All locations", "Changing room", "Power points"], priceFrom: f.price.dayOut, priceUnit: "shoot", pricing: "flat", image: img("packages/shoots.webp", "") });
  if (f.occasions.includes("corporate"))
    list.push({ id: "corporate", name: "Corporate Offsite", bestFor: "Teams who think better outdoors", timing: `Day or overnight · up to ${Math.min(f.capacity.eventGuests, 120)} people`, inclusions: ["Wi-Fi", "Lawn sessions", "Meals arranged"], priceFrom: f.price.dayOut, priceUnit: "day", pricing: "flat", image: img("packages/corporate.webp", "") });
  // each card uses the farmhouse's own photos
  const pics = [f.cover, ...f.spaces.map((s) => s.image), ...f.gallery];
  return list.map((p, i) => ({ ...p, image: { ...pics[i % pics.length], alt: "" } }));
}

/** Lowest indicative price, for cards ("from ₹…") */
export function fromPrice(f: Farmhouse): { amount: number | null; unit: string } {
  const opts = [
    f.price.dayOut != null ? { amount: f.price.dayOut, unit: "day" } : null,
    f.price.night != null ? { amount: f.price.night, unit: "night" } : null,
  ].filter(Boolean) as { amount: number; unit: string }[];
  if (!opts.length) return { amount: f.price.event, unit: "event" };
  return opts.sort((a, b) => a.amount - b.amount)[0];
}
