import { canonicalPublicPath, isPrivateAppPath } from "@/lib/seoRouting";
import { destinationGuidePaths } from "@/lib/destinationGuides";
import type { MetadataRoute } from "next";
import { allSeoLandings } from "@/lib/allSeoLandings";
import { legacyCanonicalPath, legacyPosts } from "@/lib/legacy";

const BASE_URL = "https://tripownia.pl";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const showMarkets = now.getTime() <= new Date("2027-01-07T22:59:59Z").getTime();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/planer-podrozy`, lastModified: new Date("2026-09-20T00:00:00Z"), changeFrequency: "monthly", priority: .9 },
    { url:`${BASE_URL}/`,changeFrequency:"daily",priority:1 },
    { url:`${BASE_URL}/okazje`,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/tanie-loty`,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/city-break`,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/wakacje`,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/wakacje-2027`,changeFrequency:"weekly",priority:.93 },
    { url:`${BASE_URL}/ferie-2027`,changeFrequency:"weekly",priority:.88 },
    { url:`${BASE_URL}/majowka-2027`,changeFrequency:"weekly",priority:.88 },
    { url:`${BASE_URL}/last-minute`,changeFrequency:"daily",priority:.95 },
    { url:`${BASE_URL}/magazyn-podrozniczy/city-break-2026`,changeFrequency:"monthly",priority:.75 },
    { url:`${BASE_URL}/magazyn-podrozniczy/last-minute-2026`,changeFrequency:"monthly",priority:.75 },
    { url:`${BASE_URL}/kierunki`,changeFrequency:"weekly",priority:.9 },
    { url:`${BASE_URL}/wydarzenia`,changeFrequency:"daily",priority:.9 },
    { url:`${BASE_URL}/polska`,changeFrequency:"weekly",priority:.85 },
    { url:`${BASE_URL}/podroze`,changeFrequency:"weekly",priority:.9 },
    { url:`${BASE_URL}/podroze-po-przezycia`,changeFrequency:"weekly",priority:.8 },
    { url:`${BASE_URL}/dalekie-podroze`,changeFrequency:"weekly",priority:.85 },
    { url:`${BASE_URL}/magazyn-podrozniczy`,changeFrequency:"weekly",priority:.8 },
    { url:`${BASE_URL}/poradniki`,changeFrequency:"weekly",priority:.75 },
    { url:`${BASE_URL}/faq`,changeFrequency:"monthly",priority:.65 },
    { url:`${BASE_URL}/przed-wyjazdem`,changeFrequency:"weekly",priority:.8 },
    { url:`${BASE_URL}/sylwester`,changeFrequency:"daily",priority:.9 },
    { url:`${BASE_URL}/parkingi`,changeFrequency:"weekly",priority:.7 },
    { url:`${BASE_URL}/atrakcje`,changeFrequency:"weekly",priority:.7 },
    { url:`${BASE_URL}/esim`,changeFrequency:"weekly",priority:.65 },
    { url:`${BASE_URL}/wynajem-auta`,changeFrequency:"weekly",priority:.65 },
    { url:`${BASE_URL}/transfery`,changeFrequency:"weekly",priority:.65 },
    { url:`${BASE_URL}/regulamin`,changeFrequency:"yearly",priority:.25 },
    { url:`${BASE_URL}/polityka-prywatnosci`,changeFrequency:"yearly",priority:.25 },
    { url:`${BASE_URL}/informacja-afiliacyjna`,changeFrequency:"yearly",priority:.4 },
  ];

  if (showMarkets) staticPages.push({ url:`${BASE_URL}/jarmarki-bozonarodzeniowe`,changeFrequency:"daily",priority:.9 });

  const legacyArticlePaths = [...new Set(legacyPosts.map(post => legacyCanonicalPath(post.path)))]
    .filter(path => path !== "/city-break-2" && path !== "/grecja-2");

  const legacyArticlePages: MetadataRoute.Sitemap = legacyArticlePaths.map(path => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: .72,
  }));

  const destinationPages: MetadataRoute.Sitemap = destinationGuidePaths.map(path => ({
    url: `${BASE_URL}${path}`, changeFrequency: "monthly", priority: .8,
  }));

  const landingPages: MetadataRoute.Sitemap = allSeoLandings.map(page => ({
    url: `${BASE_URL}/podroze/${page.slug}`,
    changeFrequency: "weekly" as const,
    priority: .82,
  }));

  // Transient /oferta/{id} pages intentionally stay out of the sitemap.
  // They can expire or carry an orientational price, while evergreen hubs and
  // SEO landings remain stable entry points for search engines.
  // Only canonical, public URLs. Omit lastmod when no reliable content date exists.
  const unique = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of [...staticPages, ...destinationPages, ...legacyArticlePages, ...landingPages]) {
    const pathname = new URL(entry.url).pathname;
    const canonical = canonicalPublicPath(pathname);
    if (canonical !== pathname || isPrivateAppPath(canonical)) continue;
    if (!unique.has(entry.url)) unique.set(entry.url, entry);
  }
  return [...unique.values()];
}

