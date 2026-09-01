declare const process: { env: Record<string, string | undefined> };

export type PartnerKey =
  | "esky"
  | "wakacje"
  | "exim"
  | "tui"
  | "getyourguide"
  | "seeplaces"
  | "holidaypark"
  | "fonia"
  | "parklot"
  | "kiwi"
  | "booking";

export type Partner = {
  key: PartnerKey;
  name: string;
  category: "travel" | "hotel" | "attractions" | "esim" | "parking";
  description: string;
  commissionType?: "cps" | "cpl" | "unknown";
  commissionValue?: number;
  trackingId?: string;
  buildUrl: (destinationUrl?: string) => string;
};

/**
 * Affiliate tracking is intentionally separated from the destination URL.
 * That keeps deep links readable and avoids accidentally encoding the full
 * tracker URL as the advertiser destination.
 */
function buildTradeDoublerDeepLink({
  host = "https://clk.tradedoubler.com/click",
  programId,
  siteId,
  destinationUrl,
}: {
  host?: string;
  programId: string;
  siteId: string;
  destinationUrl: string;
}) {
  const params = new URLSearchParams({
    p: programId,
    a: siteId,
    url: destinationUrl,
  });
  return `${host}?${params.toString()}`;
}


export function buildEskyFlightsUrl(destinationUrl = "https://www.esky.pl/tanie-loty/") {
  const url = new URL(destinationUrl);
  url.searchParams.set("partner_id", "TRIPOWNIAPL");
  return url.toString();
}

export function buildEskyPackagesUrl(destinationUrl = "https://www2.esky.pl/lot+hotel/portfolio?context=pl-packages") {
  const url = new URL(destinationUrl);
  url.searchParams.set("partner_id", "TRIPOWNIAPLPACKAGES");
  if (!url.searchParams.has("context")) url.searchParams.set("context", "pl-packages");
  if (!url.searchParams.has("sort[TotalPrice]")) url.searchParams.set("sort[TotalPrice]", "asc");
  return url.toString();
}

export const partners: Record<PartnerKey, Partner> = {
  esky: {
    key: "esky",
    name: "eSky",
    category: "travel",
    description: "Lot + hotel i city breaki",
    commissionType: "unknown",
    trackingId: "TRIPOWNIAPLPACKAGES",
    buildUrl: (destinationUrl = "https://www2.esky.pl/lot+hotel/portfolio?context=pl-packages") =>
      buildEskyPackagesUrl(destinationUrl),
  },
  wakacje: {
    key: "wakacje",
    name: "Wakacje.pl",
    category: "travel",
    description: "Pakiety wielu touroperatorów",
    commissionType: "cps",
    trackingId: "3212",
    buildUrl: (destinationUrl = "https://www.wakacje.pl/") => {
      const url = new URL(destinationUrl);

      // Zachowujemy konkretną ścieżkę oferty/hotelu i tylko dokładamy tracking.
      // Dzięki temu deep link nie wraca na homepage Wakacje.pl.
      url.searchParams.set("utm_source", "travellead");
      url.searchParams.set("utm_medium", "cps");
      url.searchParams.set("utm_campaign", "3212-tripownia.pl");
      url.searchParams.set("a_aid", "3212");

      if (!url.searchParams.has("a_cid")) {
        url.searchParams.set("a_cid", "tripownia");
      }

      return url.toString();
    },
  },
  exim: {
    key: "exim",
    name: "EXIM Tours",
    category: "travel",
    description: "Wakacje i czartery",
    commissionType: "cps",
    trackingId: "334260:3487177",
    buildUrl: (destinationUrl = "https://www.exim.pl/") =>
      buildTradeDoublerDeepLink({
        host: "https://reklamy.exim.pl/click",
        programId: "334260",
        siteId: "3487177",
        destinationUrl,
      }),
  },
  tui: {
    key: "tui",
    name: "TUI",
    category: "travel",
    description: "Wakacje i pakiety",
    commissionType: "cps",
    trackingId: "308388:3487177",
    buildUrl: (destinationUrl = "https://www.tui.pl/") =>
      buildTradeDoublerDeepLink({
        programId: "308388",
        siteId: "3487177",
        destinationUrl,
      }),
  },
  getyourguide: {
    key: "getyourguide",
    name: "GetYourGuide",
    category: "attractions",
    description: "Atrakcje, bilety i wycieczki",
    commissionType: "unknown",
    trackingId: "356307:3487177",
    buildUrl: (destinationUrl = "https://www.getyourguide.pl/") =>
      buildTradeDoublerDeepLink({
        programId: "356307",
        siteId: "3487177",
        destinationUrl,
      }),
  },
  seeplaces: {
    key: "seeplaces",
    name: "SeePlaces",
    category: "attractions",
    description: "Atrakcje i aktywności lokalne",
    commissionType: "unknown",
    trackingId: "383711:3487177",
    buildUrl: (destinationUrl = "https://seeplaces.com/") =>
      buildTradeDoublerDeepLink({
        host: "https://ad.seeplaces.com/click",
        programId: "383711",
        siteId: "3487177",
        destinationUrl,
      }),
  },
  holidaypark: {
    key: "holidaypark",
    name: "Holidaypark",
    category: "hotel",
    description: "Noclegi i pobyty",
    commissionType: "unknown",
    trackingId: "357058:3487177",
    buildUrl: (destinationUrl = "https://www.holidaypark.pl/") =>
      buildTradeDoublerDeepLink({
        host: "https://visit.holidaypark.pl/click",
        programId: "357058",
        siteId: "3487177",
        destinationUrl,
      }),
  },
  fonia: {
    key: "fonia",
    name: "Fonia eSIM",
    category: "esim",
    description: "Internet w podróży",
    commissionType: "unknown",
    trackingId: "373994:3487177",
    buildUrl: (destinationUrl = "https://fonia.app/") =>
      buildTradeDoublerDeepLink({
        programId: "373994",
        siteId: "3487177",
        destinationUrl,
      }),
  },
  kiwi: {
    key: "kiwi",
    name: "Kiwi.com",
    category: "travel",
    description: "Loty i elastyczne wyszukiwanie połączeń",
    commissionType: "unknown",
    trackingId: "7PnrR4dn",
    buildUrl: (destinationUrl) => {
      // 740301 pochodzi z działającej konfiguracji Travelpayouts Tripownii.
      // ENV może go nadpisać bez zmiany kodu.
      const shmarker = process.env.NEXT_PUBLIC_KIWI_SHMARKER || "740301";
      if (destinationUrl) {
        const params = new URLSearchParams({
          shmarker: `${shmarker}.TRIPOWNIAPL`,
          promo_id: "3791",
          source_type: "customlink",
          type: "click",
          custom_url: destinationUrl,
        });
        return `https://c111.travelpayouts.com/click?${params.toString()}`;
      }
      return "https://kiwi.tpk.lv/7PnrR4dn";
    },
  },
  booking: {
    key: "booking",
    name: "Booking.com",
    category: "hotel",
    description: "Noclegi i hotele",
    commissionType: "unknown",
    trackingId: "818288",
    buildUrl: (destinationUrl = "https://www.booking.com/") => {
      const url = new URL(destinationUrl);
      url.searchParams.set("aid", "818288");
      return url.toString();
    },
  },

  parklot: {
    key: "parklot",
    name: "Parklot.pl",
    category: "parking",
    description: "Parkingi przy lotniskach",
    commissionType: "cps",
    trackingId: "3212",
    buildUrl: () =>
      "https://www.parklot.pl/?utm_source=travellead&utm_medium=cps&utm_campaign=3212-tripownia.pl&a_cid=a988c2f2&a_aid=3212",
  },
};

export const partnerList = Object.values(partners);
