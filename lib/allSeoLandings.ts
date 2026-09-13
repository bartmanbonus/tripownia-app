import { seoLandings as baseSeoLandings, type SeoLanding } from "@/lib/seoLandings";
import { seoGrowthLandings } from "@/lib/seoGrowthLandings";
import { seoAirportLandings } from "@/lib/seoAirportLandings";
import { seoSeasonalLandings } from "@/lib/seoSeasonalLandings";
import { seoRegionalLandings } from "@/lib/seoRegionalLandings";

type SeasonalSeoLanding = SeoLanding & {
  startDate?: string;
  endDate?: string;
};

const seasonalLandings = seoSeasonalLandings as unknown as SeasonalSeoLanding[];

export const allSeoLandings = [
  ...baseSeoLandings,
  ...seoGrowthLandings,
  ...seoAirportLandings,
  ...seoRegionalLandings,
  ...seasonalLandings,
];

export function getAllSeoLanding(slug: string) {
  return allSeoLandings.find((item) => item.slug === slug);
}
