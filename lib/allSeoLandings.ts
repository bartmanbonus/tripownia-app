import { seoLandings as baseSeoLandings } from "@/lib/seoLandings";
import { seoGrowthLandings } from "@/lib/seoGrowthLandings";
import { seoAirportLandings } from "@/lib/seoAirportLandings";
import { seoSeasonalLandings } from "@/lib/seoSeasonalLandings";

export const allSeoLandings = [...baseSeoLandings, ...seoGrowthLandings, ...seoAirportLandings, ...seoSeasonalLandings];

export function getAllSeoLanding(slug: string) {
  return allSeoLandings.find((item) => item.slug === slug);
}
