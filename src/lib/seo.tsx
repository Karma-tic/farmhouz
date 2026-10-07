import { enabledAmenities, site, type Faq, type Package } from "@/content/site";

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function venueJsonLd() {
  const prices = (site.packages as Package[]).flatMap((p) => (p.priceFrom != null ? [p.priceFrom] : []));
  return {
    "@context": "https://schema.org",
    "@type": ["LodgingBusiness", "EventVenue"],
    name: site.name,
    description: site.description,
    url: site.url,
    image: [`${site.url}${site.ogImage}`, ...site.spaces.map((s) => `${site.url}${s.image.src}`)],
    telephone: site.contact.phone,
    email: site.contact.email,
    sameAs: [site.contact.instagram, site.contact.googleProfile],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.location.streetAddress,
      addressLocality: site.location.city,
      addressRegion: site.location.state,
      postalCode: site.location.postalCode,
      addressCountry: site.location.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.location.lat, longitude: site.location.lng },
    checkinTime: "12:00",
    checkoutTime: "11:00",
    numberOfRooms: site.capacity.bedrooms,
    maximumAttendeeCapacity: site.capacity.eventGuests,
    petsAllowed: enabledAmenities.some((a) => a.id === "pets"),
    priceRange: prices.length ? `₹${Math.min(...prices).toLocaleString("en-IN")} – ₹${Math.max(...prices).toLocaleString("en-IN")}` : "₹₹",
    amenityFeature: enabledAmenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a.label, value: true })),
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (site.faqs as Faq[]).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
