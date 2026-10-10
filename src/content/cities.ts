import type { City } from "./types";

/**
 * Cities and their areas. Add a city here (live: false shows it as "coming soon").
 * Coordinates are approximate area centres used for the stylised map.
 */
export const cities: City[] = [
  {
    slug: "bhopal",
    name: "Bhopal",
    state: "Madhya Pradesh",
    live: true,
    tagline: "Lakes, forest edges and wide open farms, all within an hour of New Market.",
    centre: { name: "New Market", lat: 23.2335, lng: 77.4005 },
    areas: [
      { slug: "kerwa", name: "Kerwa", blurb: "Forest edges and the dam reservoir. Cool evenings, quiet roads.", lat: 23.168, lng: 77.338, kmFromCentre: 16, driveTime: "35 min" },
      { slug: "kolar-road", name: "Kolar Road", blurb: "Easy to reach from the city, plenty of space for big parties.", lat: 23.158, lng: 77.418, kmFromCentre: 12, driveTime: "30 min" },
      { slug: "bhadbhada", name: "Bhadbhada", blurb: "Close to the Upper Lake. Sunsets over the water.", lat: 23.214, lng: 77.365, kmFromCentre: 8, driveTime: "20 min" },
      { slug: "neelbad", name: "Neelbad & Sehore Road", blurb: "Mango orchards and farm lanes on the western side.", lat: 23.205, lng: 77.31, kmFromCentre: 13, driveTime: "30 min" },
      { slug: "bhojpur-road", name: "Bhojpur Road", blurb: "Open fields towards the old Bhojpur temple. Big skies.", lat: 23.142, lng: 77.515, kmFromCentre: 20, driveTime: "40 min" },
      { slug: "raisen-road", name: "Raisen Road", blurb: "Green belts on the eastern edge, good for weddings.", lat: 23.278, lng: 77.5, kmFromCentre: 14, driveTime: "30 min" },
    ],
  },
  {
    slug: "indore",
    name: "Indore",
    state: "Madhya Pradesh",
    live: false,
    tagline: "Coming soon.",
    centre: { name: "Rajwada", lat: 22.7196, lng: 75.8577 },
    areas: [],
  },
];

export const liveCities = cities.filter((c) => c.live);
export const getCity = (slug: string) => cities.find((c) => c.slug === slug);
export const getArea = (city: string, area: string) => getCity(city)?.areas.find((a) => a.slug === area);
