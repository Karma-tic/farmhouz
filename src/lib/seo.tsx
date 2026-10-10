import { getArea, getCity } from "@/content/cities";
import { fromPrice } from "@/content/farmhouses";
import { site } from "@/content/site";
import type { Faq, Farmhouse } from "@/content/types";

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: site.contact.phone,
    email: site.contact.email,
    sameAs: [site.contact.instagram],
    areaServed: { "@type": "City", name: "Bhopal" },
  };
}

/** Each farmhouse as a LodgingBusiness/EventVenue with an area-level address (exact address is private). */
export function farmJsonLd(f: Farmhouse) {
  const city = getCity(f.city);
  const area = getArea(f.city, f.area);
  const p = fromPrice(f);
  return {
    "@context": "https://schema.org",
    "@type": ["LodgingBusiness", "EventVenue"],
    name: f.name,
    description: f.description,
    url: `${site.url}/${f.city}/${f.slug}`,
    image: [f.cover, ...f.gallery].map((m) => `${site.url}${m.src}`),
    address: { "@type": "PostalAddress", addressLocality: `${area?.name ?? ""}, ${city?.name ?? ""}`, addressRegion: city?.state, addressCountry: "IN" },
    geo: { "@type": "GeoCoordinates", latitude: f.approx.lat, longitude: f.approx.lng },
    numberOfRooms: f.capacity.bedrooms,
    maximumAttendeeCapacity: f.capacity.eventGuests,
    petsAllowed: f.amenities.includes("pets"),
    priceRange: p.amount ? `From ₹${p.amount.toLocaleString("en-IN")} per ${p.unit}` : "₹₹",
    amenityFeature: f.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: site.amenityLabels[a] ?? a, value: true })),
    checkinTime: "12:00",
    checkoutTime: "11:00",
  };
}

export function faqJsonLd(faqs: Faq[] = site.faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
