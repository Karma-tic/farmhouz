import type { MetadataRoute } from "next";
import { liveCities } from "@/content/cities";
import { GUIDE_BASE, guides } from "@/content/guides";
import { site } from "@/content/site";
import { getFarms } from "@/lib/farms/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const published = await getFarms();
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    ...(site.launched ? liveCities : []).map((c) => ({ url: `${site.url}/${c.slug}`, changeFrequency: "daily" as const, priority: 0.9 })),
    ...(site.launched ? published : []).map((f) => ({ url: `${site.url}/${f.city}/${f.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: `${site.url}${GUIDE_BASE}`, changeFrequency: "weekly", priority: 0.9 },
    ...guides.map((g) => ({ url: `${site.url}${GUIDE_BASE}/${g.slug}`, changeFrequency: "monthly" as const, priority: g.kind === "occasion" ? 0.8 : 0.7 })),
    { url: `${site.url}/list-your-farmhouse`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/policies`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
