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
import { seoAirportWave24 } from "@/lib/seoAirportWave24";
import { seoAirportWave25 } from "@/lib/seoAirportWave25";
import { seoAirportWave26 } from "@/lib/seoAirportWave26";
import { seoAirportWave27 } from "@/lib/seoAirportWave27";
import { seoDestinationAirportLandings } from "@/lib/seoDestinationAirportLandings";
import { seoCommercialIntentLandings } from "@/lib/seoCommercialIntentLandings";
import { seoSeasonalCommercialLandings } from "@/lib/seoSeasonalCommercialLandings";
import { seoSeasonalCommercialWave2 } from "@/lib/seoSeasonalCommercialWave2";
import { seoSearchConsoleWave28 } from "@/lib/seoSearchConsoleWave28";
import { seoSalesWave29 } from "@/lib/seoSalesWave29";
import { seoSalesWave32 } from "@/lib/seoSalesWave32";
import { seoSalesWave33 } from "@/lib/seoSalesWave33";

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

const overrideLandings = [...seoAirportWave20, ...seoAirportWave22, ...seoAirportWave23, ...seoAirportWave24, ...seoAirportWave25, ...seoAirportWave26, ...seoAirportWave27];
const seoOverrides = new Map(overrideLandings.map((item) => [item.slug, item]));
const baseSlugs = new Set(baseLandings.map((item) => item.slug));
const supplementalOverrides = overrideLandings.filter((item) => !baseSlugs.has(item.slug));

const combinedSeoLandings = [
  ...baseLandings.map((item) => seoOverrides.get(item.slug) || item),
  ...supplementalOverrides,
  ...seoDestinationAirportLandings,
  ...seoCommercialIntentLandings,
  ...seoSeasonalCommercialLandings,
  ...seoSeasonalCommercialWave2,
  ...seoSearchConsoleWave28,
  ...seoSalesWave29,
  ...seoSalesWave32,
  ...seoSalesWave33,
];

// Keep one canonical definition per slug. Later waves intentionally override
// earlier SEO definitions so fresh Search Console work is not shadowed by
// legacy copies and generateStaticParams stays duplicate-free.
export const allSeoLandings = Array.from(
  new Map(combinedSeoLandings.map((item) => [item.slug, item])).values()
);

export function getAllSeoLanding(slug: string) {
  return allSeoLandings.find((item) => item.slug === slug);
}
