import { seoLandings as baseSeoLandings } from "@/lib/seoLandings";
import { seoGrowthLandings } from "@/lib/seoGrowthLandings";
import { seoAirportLandings } from "@/lib/seoAirportLandings";

export const allSeoLandings = [...baseSeoLandings, ...seoGrowthLandings, ...seoAirportLandings];

export function getAllSeoLanding(slug: string) {
  return allSeoLandings.find((item) => item.slug === slug);
}
