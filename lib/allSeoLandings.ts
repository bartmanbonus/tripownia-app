import { seoLandings as baseSeoLandings, type SeoLanding } from "@/lib/seoLandings";
import { seoGrowthLandings } from "@/lib/seoGrowthLandings";
import { seoAirportLandings } from "@/lib/seoAirportLandings";
import { seoSeasonalLandings } from "@/lib/seoSeasonalLandings";
import { seoRegionalLandings } from "@/lib/seoRegionalLandings";
import { seoAirportWave10 } from "@/lib/seoAirportWave10";
import { seoLegacyMigrationWave11 } from "@/lib/seoLegacyMigrationWave11";
import { seoBudgetLandings } from "@/lib/seoBudgetLandings";
import { seoAirportWave20 } from "@/lib/seoAirportWave20";
import { seoAirportWave22 } from "@/lib/seoAirportWave22";
import { seoAirportWave23 } from "@/lib/seoAirportWave23";
import { seoCommercialOverrides } from "@/lib/seoCommercialOverrides";

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
  ...seoBudgetLandings,
  ...seasonalLandings,
];

const overrideLandings = [
  ...seoAirportWave20,
  ...seoAirportWave22,
  ...seoAirportWave23,
  ...seoCommercialOverrides,
];
const seoOverrides = new Map(overrideLandings.map((item) => [item.slug, item]));
const baseSlugs = new Set(baseLandings.map((item) => item.slug));
const supplementalOverrides = overrideLandings.filter((item) => !baseSlugs.has(item.slug));

export const allSeoLandings = [
  ...baseLandings.map((item) => seoOverrides.get(item.slug) || item),
  ...supplementalOverrides,
];

export function getAllSeoLanding(slug: string) {
  return allSeoLandings.find((item) => item.slug === slug);
}
