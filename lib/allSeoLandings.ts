import { seoLandings as baseSeoLandings } from "@/lib/seoLandings";
import { seoGrowthLandings } from "@/lib/seoGrowthLandings";

export const allSeoLandings = [...baseSeoLandings, ...seoGrowthLandings];

export function getAllSeoLanding(slug: string) {
  return allSeoLandings.find((item) => item.slug === slug);
}
