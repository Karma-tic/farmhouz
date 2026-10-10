import type { MetadataRoute } from "next";
import { liveCities } from "@/content/cities";
import { published } from "@/content/farmhouses";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    ...liveCities.map((c) => ({ url: `${site.url}/${c.slug}`, changeFrequency: "daily" as const, priority: 0.9 })),
    ...published.map((f) => ({ url: `${site.url}/${f.city}/${f.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: `${site.url}/list-your-farmhouse`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/policies`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
