export type PartnerKey =
  | "esky"
  | "wakacje"
  | "exim"
  | "tui"
  | "getyourguide"
  | "seeplaces"
  | "holidaypark"
  | "fonia"
  | "parklot";

export type Partner = {
  key: PartnerKey;
  name: string;
  category: "travel" | "hotel" | "attractions" | "esim" | "parking";
  description: string;
  buildUrl: (targetUrl?: string) => string;
};

const encode = (url: string) => encodeURIComponent(url);

export const partners: Record<PartnerKey, Partner> = {
  esky: {
    key: "esky", name: "eSky", category: "travel", description: "Lot + hotel i city breaki",
    buildUrl: (targetUrl = "https://www2.esky.pl/lot+hotel/portfolio?context=pl-packages") => {
      const separator = targetUrl.includes("?") ? "&" : "?";
      return targetUrl.includes("partner_id=") ? targetUrl : `${targetUrl}${separator}partner_id=TRIPOWNIAPLPACKAGES`;
    },
  },
  wakacje: {
    key: "wakacje", name: "Wakacje.pl", category: "travel", description: "Pakiety wielu touroperatorów",
    buildUrl: () => "https://www.wakacje.pl/?utm_source=travellead&utm_medium=cps&utm_campaign=3212-tripownia.pl&a_cid=11111111&a_aid=3212",
  },
  exim: {
    key: "exim", name: "EXIM Tours", category: "travel", description: "Wakacje i czartery",
    buildUrl: (targetUrl = "https://www.exim.pl/") => `https://reklamy.exim.pl/click?p=334260&a=3487177&url=${encode(targetUrl)}`,
  },
  tui: {
    key: "tui", name: "TUI", category: "travel", description: "Wakacje i pakiety",
    buildUrl: (targetUrl = "https://www.tui.pl/") => `https://clk.tradedoubler.com/click?p=308388&a=3487177&url=${encode(targetUrl)}`,
  },
  getyourguide: {
    key: "getyourguide", name: "GetYourGuide", category: "attractions", description: "Atrakcje, bilety i wycieczki",
    buildUrl: (targetUrl = "https://www.getyourguide.pl/") => `https://clk.tradedoubler.com/click?p=356307&a=3487177&url=${encode(targetUrl)}`,
  },
  seeplaces: {
    key: "seeplaces", name: "SeePlaces", category: "attractions", description: "Atrakcje i aktywności lokalne",
    buildUrl: (targetUrl = "https://seeplaces.com/") => `https://ad.seeplaces.com/click?p=383711&a=3487177&url=${encode(targetUrl)}`,
  },
  holidaypark: {
    key: "holidaypark", name: "Holidaypark", category: "hotel", description: "Noclegi i pobyty",
    buildUrl: (targetUrl = "https://www.holidaypark.pl/") => `https://visit.holidaypark.pl/click?p=357058&a=3487177&url=${encode(targetUrl)}`,
  },
  fonia: {
    key: "fonia", name: "Fonia eSIM", category: "esim", description: "Internet w podróży",
    buildUrl: (targetUrl = "https://fonia.app/") => `https://clk.tradedoubler.com/click?p=373994&a=3487177&url=${encode(targetUrl)}`,
  },
  parklot: {
    key: "parklot", name: "Parklot.pl", category: "parking", description: "Parkingi przy lotniskach",
    buildUrl: () => "https://www.parklot.pl/?utm_source=travellead&utm_medium=cps&utm_campaign=3212-tripownia.pl&a_cid=a988c2f2&a_aid=3212",
  },
};

export const partnerList = Object.values(partners);
