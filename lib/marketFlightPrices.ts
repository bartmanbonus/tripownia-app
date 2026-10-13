/**
 * Display only actual priced results returned by Tripownia's flight-calendar API.
 * Cached indicative fares must always be rechecked at the provider.
 */
export type MarketFlightPrice = {
  price: number;
  departDate: string;
  returnDate: string;
  affiliateUrl: string;
  outboundStops: number;
  returnStops: number;
};

type FlightCalendarRawRow = Partial<MarketFlightPrice> & {
  destinationCode?: string;
};

export type MarketPriceWindow = {
  from: string;
  to: string;
  minNights: number;
  maxNights: number;
};

const ISO_DATE = /^20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function validDate(value: string) {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function elapsedNights(outbound: string, inbound: string) {
  return Math.round((new Date(inbound + "T00:00:00Z").getTime() -
    new Date(outbound + "T00:00:00Z").getTime()) / 86400000);
}

/**
 * The search API itself returns /go/live links with eSky attribution.
 * Accept only that internal tracking route, and never trust a third-party URL.
 */
function safeFlightAffiliate(url: string) {
  if (!url.startsWith("/go/live?")) return false;
  const params = new URLSearchParams(url.slice("/go/live?".length));
  if (params.get("partner") !== "esky_flights") return false;
  try {
    const target = new URL(params.get("target") || "");
    return target.protocol === "https:" && ["www2.esky.pl", "www.esky.pl"].includes(target.hostname)
      && target.pathname.startsWith("/flights/");
  } catch {
    return false;
  }
}

export function parseMarketFlightPrices(payload: unknown, window: MarketPriceWindow): MarketFlightPrice[] {
  if (!payload || typeof payload !== "object") return [];
  const response = payload as { ok?: boolean; results?: FlightCalendarRawRow[] };
  if (!response.ok || !Array.isArray(response.results)) return [];

  const dedup = new Map<string, MarketFlightPrice>();
  for (const raw of response.results) {
    const outbound = String(raw.departDate || "");
    const inbound = String(raw.returnDate || "");
    const price = Number(raw.price);
    const link = String(raw.affiliateUrl || "");
    if (!validDate(outbound) || !validDate(inbound)
      || outbound < window.from || outbound > window.to || inbound > window.to
      || outbound > inbound || !Number.isFinite(price) || price <= 0
      || Number(raw.outboundStops) !== 0 || Number(raw.returnStops) !== 0
      || !safeFlightAffiliate(link)) continue;

    const nights = elapsedNights(outbound, inbound);
    if (nights < window.minNights || nights > window.maxNights) continue;
    const key = outbound + "|" + inbound;
    const current = dedup.get(key);
    if (!current || current.price > price) {
      dedup.set(key, {
        departDate: outbound,
        returnDate: inbound,
        price: Math.round(price),
        outboundStops: 0,
        returnStops: 0,
        affiliateUrl: link,
      });
    }
  }
  return [...dedup.values()]
    .sort((a, b) => a.price - b.price || a.departDate.localeCompare(b.departDate));
}

export function marketFlightPriceDateLabel(offer: MarketFlightPrice) {
  const formatter = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", timeZone: "UTC" });
  return formatter.format(new Date(offer.departDate + "T00:00:00Z")) +
    " – " + formatter.format(new Date(offer.returnDate + "T00:00:00Z"));
}
