import type { MetadataRoute } from "next";
import { offers } from "@/lib/offers";
import { seoLandings } from "@/lib/seoLandings";
const BASE_URL = "https://tripownia.pl";
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url:`${BASE_URL}/`,lastModified:now,changeFrequency:"daily",priority:1 },
    { url:`${BASE_URL}/okazje`,lastModified:now,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/city-break`,lastModified:now,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/wakacje`,lastModified:now,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/last-minute`,lastModified:now,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/magazyn-podrozniczy/city-break-2026`,lastModified:now,changeFrequency:"monthly",priority:.75 },
    { url:`${BASE_URL}/magazyn-podrozniczy/last-minute-2026`,lastModified:now,changeFrequency:"monthly",priority:.75 },
    { url:`${BASE_URL}/kierunki`,lastModified:now,changeFrequency:"weekly",priority:.9 },
    { url:`${BASE_URL}/wydarzenia`,lastModified:now,changeFrequency:"daily",priority:.9 },
    { url:`${BASE_URL}/polska`,lastModified:now,changeFrequency:"weekly",priority:.85 },
    { url:`${BASE_URL}/podroze`,lastModified:now,changeFrequency:"weekly",priority:.9 },
    { url:`${BASE_URL}/podroze-po-przezycia`,lastModified:now,changeFrequency:"weekly",priority:.8 },
    { url:`${BASE_URL}/magazyn-podrozniczy`,lastModified:now,changeFrequency:"weekly",priority:.8 },
    { url:`${BASE_URL}/poradniki`,lastModified:now,changeFrequency:"weekly",priority:.75 },
    { url:`${BASE_URL}/jarmarki-bozonarodzeniowe`,lastModified:now,changeFrequency:"daily",priority:.9 },
    { url:`${BASE_URL}/sylwester`,lastModified:now,changeFrequency:"daily",priority:.9 },
    { url:`${BASE_URL}/parkingi`,lastModified:now,changeFrequency:"weekly",priority:.7 },
    { url:`${BASE_URL}/informacja-afiliacyjna`,lastModified:now,changeFrequency:"monthly",priority:.4 },
  ];
  const landingPages: MetadataRoute.Sitemap = seoLandings.map(page=>({url:`${BASE_URL}/podroze/${page.slug}`,lastModified:now,changeFrequency:"daily" as const,priority:.8}));
  const offerPages: MetadataRoute.Sitemap = offers.filter(o=>o.availabilityStatus!=="expired").map(o=>({url:`${BASE_URL}/oferta/${o.id}`,lastModified:o.priceCheckedAt?new Date(o.priceCheckedAt):now,changeFrequency:"daily" as const,priority:.85}));
  return [...staticPages,...landingPages,...offerPages];
}
