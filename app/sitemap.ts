import type { MetadataRoute } from "next";
import { allSeoLandings } from "@/lib/allSeoLandings";
import { legacyCanonicalPath, legacyPosts } from "@/lib/legacy";

const BASE_URL = "https://tripownia.pl";
const STATIC_UPDATED = new Date("2026-09-16T00:00:00Z");
const EVERGREEN_UPDATED = new Date("2026-09-14T00:00:00Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const showMarkets = now.getTime() <= new Date("2027-01-07T22:59:59Z").getTime();
  const staticPages: MetadataRoute.Sitemap = [
    { url:`${BASE_URL}/`,lastModified:STATIC_UPDATED,changeFrequency:"daily",priority:1 },
    { url:`${BASE_URL}/okazje`,lastModified:STATIC_UPDATED,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/tanie-loty`,lastModified:STATIC_UPDATED,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/city-break`,lastModified:STATIC_UPDATED,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/wakacje`,lastModified:STATIC_UPDATED,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/last-minute`,lastModified:STATIC_UPDATED,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/magazyn-podrozniczy/city-break-2026`,lastModified:EVERGREEN_UPDATED,changeFrequency:"monthly",priority:.75 },
    { url:`${BASE_URL}/magazyn-podrozniczy/last-minute-2026`,lastModified:EVERGREEN_UPDATED,changeFrequency:"monthly",priority:.75 },
    { url:`${BASE_URL}/kierunki`,lastModified:STATIC_UPDATED,changeFrequency:"weekly",priority:.9 },
    { url:`${BASE_URL}/wydarzenia`,lastModified:STATIC_UPDATED,changeFrequency:"daily",priority:.9 },
    { url:`${BASE_URL}/polska`,lastModified:EVERGREEN_UPDATED,changeFrequency:"weekly",priority:.85 },
    { url:`${BASE_URL}/podroze`,lastModified:STATIC_UPDATED,changeFrequency:"weekly",priority:.9 },
    { url:`${BASE_URL}/podroze-po-przezycia`,lastModified:STATIC_UPDATED,changeFrequency:"weekly",priority:.8 },
    { url:`${BASE_URL}/dalekie-podroze`,lastModified:STATIC_UPDATED,changeFrequency:"weekly",priority:.85 },
    { url:`${BASE_URL}/magazyn-podrozniczy`,lastModified:EVERGREEN_UPDATED,changeFrequency:"weekly",priority:.8 },
    { url:`${BASE_URL}/poradniki`,lastModified:EVERGREEN_UPDATED,changeFrequency:"weekly",priority:.75 },
    { url:`${BASE_URL}/przed-wyjazdem`,lastModified:STATIC_UPDATED,changeFrequency:"weekly",priority:.8 },
    { url:`${BASE_URL}/sylwester`,lastModified:EVERGREEN_UPDATED,changeFrequency:"daily",priority:.9 },
    { url:`${BASE_URL}/parkingi`,lastModified:EVERGREEN_UPDATED,changeFrequency:"weekly",priority:.7 },
    { url:`${BASE_URL}/atrakcje`,lastModified:EVERGREEN_UPDATED,changeFrequency:"weekly",priority:.7 },
    { url:`${BASE_URL}/esim`,lastModified:EVERGREEN_UPDATED,changeFrequency:"weekly",priority:.65 },
    { url:`${BASE_URL}/wynajem-auta`,lastModified:EVERGREEN_UPDATED,changeFrequency:"weekly",priority:.65 },
    { url:`${BASE_URL}/transfery`,lastModified:EVERGREEN_UPDATED,changeFrequency:"weekly",priority:.65 },
    { url:`${BASE_URL}/regulamin`,lastModified:EVERGREEN_UPDATED,changeFrequency:"yearly",priority:.25 },
    { url:`${BASE_URL}/polityka-prywatnosci`,lastModified:EVERGREEN_UPDATED,changeFrequency:"yearly",priority:.25 },
    { url:`${BASE_URL}/informacja-afiliacyjna`,lastModified:EVERGREEN_UPDATED,changeFrequency:"yearly",priority:.4 },
  ];

  if (showMarkets) staticPages.push({ url:`${BASE_URL}/jarmarki-bozonarodzeniowe`,lastModified:EVERGREEN_UPDATED,changeFrequency:"daily",priority:.9 });

  const legacyArticlePaths = [...new Set(legacyPosts.map(post => legacyCanonicalPath(post.path)))]
    .filter(path => path !== "/city-break-2" && path !== "/grecja-2");

  const legacyArticlePages: MetadataRoute.Sitemap = legacyArticlePaths.map(path => ({
    url: `${BASE_URL}${path}`,
    lastModified: EVERGREEN_UPDATED,
    changeFrequency: "monthly" as const,
    priority: .72,
  }));

  const landingPages: MetadataRoute.Sitemap = allSeoLandings.map(page => ({
    url: `${BASE_URL}/podroze/${page.slug}`,
    lastModified: STATIC_UPDATED,
    changeFrequency: "weekly" as const,
    priority: .82,
  }));

  // Transient /oferta/{id} pages intentionally stay out of the sitemap.
  // They can expire or carry an orientational price, while evergreen hubs and
  // SEO landings remain stable entry points for search engines.
  return [...staticPages, ...legacyArticlePages, ...landingPages];
}
