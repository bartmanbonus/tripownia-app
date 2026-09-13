import { seoLandings as baseSeoLandings, type SeoLanding } from "@/lib/seoLandings";
import { seoGrowthLandings } from "@/lib/seoGrowthLandings";
import { seoAirportLandings } from "@/lib/seoAirportLandings";
import { seoSeasonalLandings } from "@/lib/seoSeasonalLandings";
import { seoRegionalLandings } from "@/lib/seoRegionalLandings";
import { seoAirportWave10 } from "@/lib/seoAirportWave10";
import { seoLegacyMigrationWave11 } from "@/lib/seoLegacyMigrationWave11";
import { seoAirportWave20 } from "@/lib/seoAirportWave20";

type SeasonalSeoLanding = SeoLanding & {
  startDate?: string;
  endDate?: string;
};

const seasonalLandings = seoSeasonalLandings as unknown as SeasonalSeoLanding[];

const baseLandings = [
  ...baseSeoLandings,
  ...seoGrowthLandings,
  ...seoAirportLandings,
  ...seoRegionalLandings,
  ...seoAirportWave10,
  ...seoLegacyMigrationWave11,
  ...seasonalLandings,
];

const wave20Overrides = new Map(seoAirportWave20.map((item) => [item.slug, item]));
const baseSlugs = new Set(baseLandings.map((item) => item.slug));

export const allSeoLandings = [
  ...baseLandings.map((item) => wave20Overrides.get(item.slug) || item),
  ...seoAirportWave20.filter((item) => !baseSlugs.has(item.slug)),
];

export function getAllSeoLanding(slug: string) {
  return allSeoLandings.find((item) => item.slug === slug);
}
