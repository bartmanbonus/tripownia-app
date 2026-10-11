export type EskyFlightSearch = {
  origin: string;
  destination: string;
  departure?: string;
  returnDate?: string;
  adults?: number;
};

export function eskyIata(value: string | null | undefined) {
  const code = String(value || "").trim().toUpperCase().replace(/[^A-Z]/g, "");
  return /^[A-Z]{3}$/.test(code) ? code : "";
}

export function eskyDate(value: string | null | undefined) {
  const date = String(value || "").trim();
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(date)) return "";
  const parsed = new Date(date + "T12:00:00Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date ? date : "";
}

export function eskyFlightDeepUrl({ origin, destination, departure, returnDate, adults = 1 }: EskyFlightSearch) {
  const from = eskyIata(origin);
  const to = eskyIata(destination);
  if (!from || !to) throw new Error("Invalid flight IATA code");

  const outbound = eskyDate(departure);
  const inbound = eskyDate(returnDate);
  if (departure && !outbound) throw new Error("Invalid departure date");
  if (returnDate && (!inbound || !outbound || inbound < outbound)) throw new Error("Invalid return date");

  const originType = from === "WAW" ? "mp" : "ap";
  const originCode = from === "WAW" ? "WAWA" : from;
  const url = new URL(`https://www2.esky.pl/flights/search/${originType}/${originCode}/ap/${to}`);
  if (outbound) url.searchParams.set("departureDate", outbound);
  if (inbound) url.searchParams.set("returnDate", inbound);
  url.searchParams.set("pa", String(Math.max(1, Math.min(9, Number(adults) || 1))));
  url.searchParams.set("py", "0");
  url.searchParams.set("pc", "0");
  url.searchParams.set("pi", "0");
  url.searchParams.set("sc", "economy");
  url.searchParams.set("partner_id", "TRIPOWNIAPL");
  url.searchParams.set("flexDatesOffset", "0");
  return url.toString();
}

export function eskyFlightExitHref(search: EskyFlightSearch & {
  source?: string;
  offer?: string;
  destinationName?: string;
  price?: number | string;
}) {
  const target = eskyFlightDeepUrl(search);
  const params = new URLSearchParams({
    target,
    partner: "esky_flights",
    source: search.source || "flight_search",
    offer: search.offer || `${search.origin}-${search.destination}-${search.departure || ""}-${search.returnDate || ""}`,
    destination: search.destinationName || search.destination,
    page: "/loty",
  });
  if (search.price !== undefined && search.price !== "") params.set("price", String(search.price));
  return "/go/live?" + params.toString();
}
