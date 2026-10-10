/** Shared content types. Edit content in site.ts, cities.ts and farmhouses.ts. */

export type Phase = "dawn" | "morning" | "noon" | "golden" | "dusk" | "night";

export type Media = {
  src: string;
  alt: string;
  /** true while the file is still a generated placeholder */
  placeholder?: boolean;
};

export type OccasionId =
  | "day-out"
  | "night-stay"
  | "weekend"
  | "birthday"
  | "haldi-mehendi"
  | "wedding"
  | "shoot"
  | "corporate";

export type AmenityId =
  | "pool"
  | "wifi"
  | "parking"
  | "caretaker"
  | "kitchen"
  | "cook"
  | "music"
  | "bonfire"
  | "games"
  | "pets"
  | "ac"
  | "power-backup"
  | "lawn"
  | "hall";

export type Space = {
  id: string;
  name: string;
  description: string;
  chips: [string, string, string];
  image: Media;
};

export type PackageId = "day-out" | "night-stay" | "weekend-escape" | "celebrations" | "shoots" | "corporate";

export type Package = {
  id: PackageId;
  name: string;
  bestFor: string;
  timing: string;
  inclusions: string[];
  /** Price in rupees. `null` shows "₹—" until set. */
  priceFrom: number | null;
  /** What the price is per, e.g. "night", "day", "event" */
  priceUnit: string;
  /** How nights are counted for the indicative price */
  pricing: "per-night" | "flat";
  image: Media;
};

export type GalleryCategory = "Stays" | "Parties" | "Weddings" | "Shoots" | "Nature";

export type GalleryPhoto = Media & {
  category: GalleryCategory;
  /** width / height, reserves space to avoid layout shift */
  ratio: number;
};

export type Faq = { group: string; q: string; a: string };

export type Review = {
  name: string;
  occasion: string;
  /** ISO date */
  date: string;
  text: string;
  photo?: string;
  /** farmhouse slug, if the review is about one property */
  farmhouse?: string;
};

export type Area = {
  slug: string;
  name: string;
  blurb: string;
  /** approximate centre of the area (public) */
  lat: number;
  lng: number;
  kmFromCentre: number;
  driveTime: string;
};

export type City = {
  slug: string;
  name: string;
  state: string;
  live: boolean;
  tagline: string;
  /** city centre used for the map and distances */
  centre: { name: string; lat: number; lng: number };
  areas: Area[];
};

export type Farmhouse = {
  slug: string;
  name: string;
  /** Sample listings show a "Sample" badge until replaced with a real, verified property */
  sample: boolean;
  /** Hide a listing without deleting it */
  published: boolean;
  city: string;
  area: string;
  tagline: string;
  description: string;
  highlights: string[];
  capacity: { bedrooms: number; sleeps: number; eventGuests: number };
  acres: number;
  /** Public pin. Keep it approximate (area-level); the exact address is only shared after booking. */
  approx: { lat: number; lng: number };
  kmFromCentre: number;
  driveTime: string;
  /** Indicative "from" prices in ₹ (null = on request) */
  price: { dayOut: number | null; night: number | null; event: number | null };
  occasions: OccasionId[];
  amenities: AmenityId[];
  spaces: Space[];
  cover: Media;
  gallery: Media[];
  times: { checkIn: string; checkOut: string; dayOut: string; musicCutoff: string };
  rules: string[];
};
