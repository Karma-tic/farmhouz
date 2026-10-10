import "server-only";

/**
 * PRIVATE: owner & caretaker contacts and exact addresses, keyed by farmhouse slug.
 * This file is imported only on the server (admin panel, confirmed-booking pass),
 * so none of it is sent to visitors' browsers. Replace every placeholder.
 */
export type OwnerInfo = {
  ownerName: string;
  /** digits with country code, e.g. 919876543210 */
  ownerWhatsapp: string;
  caretakerName: string;
  caretakerPhone: string;
  exactAddress: string;
  mapsUrl: string;
  /** your private notes: commission, payout terms, quirks */
  notes?: string;
};

const placeholder = (name: string): OwnerInfo => ({
  ownerName: `Owner of ${name}`, // OWNER TO FILL
  ownerWhatsapp: "919999999999", // OWNER TO FILL
  caretakerName: "Caretaker", // OWNER TO FILL
  caretakerPhone: "+91 99999 99999", // OWNER TO FILL
  exactAddress: "Exact address to be added", // OWNER TO FILL
  mapsUrl: "https://maps.google.com/?q=Bhopal", // OWNER TO FILL
});

export const owners: Record<string, OwnerInfo> = {
  "mango-grove-kerwa": placeholder("Mango Grove"),
  "neem-court-kolar": placeholder("Neem Court"),
  "lakeside-orchard-bhadbhada": placeholder("Lakeside Orchard"),
  "sundown-fields-bhojpur": placeholder("Sundown Fields"),
  "banyan-courtyard-raisen": placeholder("The Banyan Courtyard"),
  "peacock-hollow-neelbad": placeholder("Peacock Hollow"),
  "firefly-acres-kerwa": placeholder("Firefly Acres"),
  "wheatstone-farm-kolar": placeholder("Wheatstone Farm"),
};

export const ownerFor = (slug: string): OwnerInfo => owners[slug] ?? placeholder(slug);
