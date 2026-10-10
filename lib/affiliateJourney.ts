export type AffiliatePartner =
  | "aviasales"
  | "wakacje"
  | "exim"
  | "esky"
  | "tui"
  | "getyourguide"
  | "seeplaces"
  | "holidaypark"
  | "fonia"
  | "parklot"
  | "kiwi"
  | "booking"
  | "rentacar"
  | "kiwitaxi"
  | "gettransfer"
  | "airhelp"
  | "zwrotzalot";

function tradeDoublerProgram(url: URL) {
  const queryProgram = url.searchParams.get("p");
  if (queryProgram) return queryProgram;
  return url.toString().match(/p\((\d+)\)/)?.[1] || "";
}

export function partnerFromUrl(value: string): AffiliatePartner | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (["www2.esky.pl", "www.esky.pl"].includes(host) && (url.pathname === "/lot+hotel/portfolio" || url.pathname.startsWith("/lot+hotel/portfolio/"))) return "esky";

    if (["aviasales.com", "www.aviasales.com"].includes(host)) return "aviasales";
    if (host === "reklamy.exim.pl" || host === "exim.pl" || host === "www.exim.pl") return "exim";
    if (host === "tui.pl" || host === "www.tui.pl") return "tui";
    if (host === "wakacje.pl" || host === "www.wakacje.pl") return "wakacje";
    if (host === "c111.travelpayouts.com" || host === "kiwi.tpk.lv" || host === "kiwi.com" || host === "www.kiwi.com") return "kiwi";
    if (host === "booking.com" || host === "www.booking.com") return "booking";
    if (host === "getyourguide.pl" || host === "www.getyourguide.pl" || host === "getyourguide.com" || host === "www.getyourguide.com") return "getyourguide";
    if (host === "ad.seeplaces.com" || host === "seeplaces.com" || host === "www.seeplaces.com") return "seeplaces";
    if (host === "visit.holidaypark.pl" || host === "holidaypark.pl" || host === "www.holidaypark.pl") return "holidaypark";
    if (host === "fonia.app" || host === "www.fonia.app") return "fonia";
    if (host === "parklot.pl" || host === "www.parklot.pl") return "parklot";
    if (host === "getrentacar.tpk.lv") return "rentacar";
    if (host === "kiwitaxi.tpk.lv") return "kiwitaxi";
    if (host === "gettransfer.tpk.lv") return "gettransfer";
    if (host === "airhelp.tpk.lv") return "airhelp";
    if (["visit.zwrotzalot.pl", "zwrotzalot.pl", "www.zwrotzalot.pl"].includes(host)) return "zwrotzalot";

    if (host === "clk.tradedoubler.com" || host === "pdt.tradedoubler.com") {
      const program = tradeDoublerProgram(url);
      if (program === "334260") return "exim";
      if (program === "308388") return "tui";
      if (program === "356307") return "getyourguide";
      if (program === "383711") return "seeplaces";
      if (program === "357058") return "holidaypark";
      if (program === "373994") return "fonia";
    }
  } catch {}
  return null;
}


export function isOfferDetailPath(path: string) {
  return path === "/okazja" || path === "/sprawdz-oferte" || path === "/loty/oferta" || /^\/(o|oferta)\/[^/]+\/?$/.test(path);
}

export function partnerReviewHref(target: string, context: Record<string, string> = {}) {
  const params = new URLSearchParams(context);
  params.set("target", target);
  return `/sprawdz-oferte?${params.toString()}`;
}
