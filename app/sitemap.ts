import type { MetadataRoute } from "next";
import { offers } from "@/lib/offers";
import { seoLandings } from "@/lib/seoLandings";

const BASE_URL = "https://tripownia.pl";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/okazje`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE_URL}/city-break-2`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/last-minute`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/kierunki`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/podroze`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/podroze-po-przezycia`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/poradniki`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE_URL}/parkingi`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/islandia-zorza-polarna`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/japonia-kwitnienie-wisni`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/norwegia-fiordy`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/nowa-zelandia-najlepszy-czas`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/jarmarki-bozonarodzeniowe`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/holandia-tulipany`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/safari-kenia-tanzania`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/egzotyka-zima`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
  ];

  const landingPages: MetadataRoute.Sitemap = seoLandings.map((page) => ({
    url: `${BASE_URL}/podroze/${page.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const offerPages: MetadataRoute.Sitemap = offers
    .filter((offer) => offer.availabilityStatus !== "expired")
    .map((offer) => ({
      url: `${BASE_URL}/oferta/${offer.id}`,
      lastModified: offer.priceCheckedAt ? new Date(offer.priceCheckedAt) : now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    }));

  return [...staticPages, ...landingPages, ...offerPages];
}
