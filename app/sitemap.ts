import type { MetadataRoute } from "next";
import { legacyItems } from "@/lib/legacy";
import { internalAliasPaths } from "@/lib/internalAliases";
import { offers } from "@/lib/offers";

const baseUrl = "https://tripownia.pl";

function isIndexableAlias(path: string) {
  return !path.startsWith("/produkt/") &&
    path !== "/tripownia-pl/sklep" &&
    path !== "/indywidualne-planowanie-podrozy-bez-ukrytych-kosztow";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/okazje`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/poradniki`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/parkingi`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/atrakcje`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/esim`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/ubezpieczenia`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/transfery`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/wynajem-auta`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const offerPages: MetadataRoute.Sitemap = offers.map((offer) => ({
    url: `${baseUrl}/oferta/${offer.id}`,
    lastModified: offer.priceCheckedAt ? new Date(offer.priceCheckedAt) : now,
    changeFrequency: "daily" as const,
    priority: offer.availabilityStatus === "expired" ? 0.35 : 0.85,
  }));

  const articlePages: MetadataRoute.Sitemap = legacyItems
    .filter(item => isIndexableAlias(item.path))
    .map(item => ({
      url: `${baseUrl}${item.path}`,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));

  const aliasPages: MetadataRoute.Sitemap = [...internalAliasPaths]
    .filter(isIndexableAlias)
    .map(path => ({
      url: `${baseUrl}${path}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

  const unique = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const item of [...core, ...offerPages, ...articlePages, ...aliasPages]) {
    unique.set(item.url, item);
  }
  return [...unique.values()];
}
