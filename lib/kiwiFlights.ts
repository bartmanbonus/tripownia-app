/**
 * Kiwi.com search deep links use IATA codes and ISO dates. The visitor-facing
 * URL stays on Tripownia; only the server attaches the Travelpayouts tracking.
 * https://support.travelpayouts.com/hc/en-us/articles/360010109719
 */
export type KiwiFlightSearch = {
  origin: string;
  destination?: string;
  departure?: string;
  returnDate?: string;
};

export function kiwiIata(value: string | null | undefined) {
  const code = String(value || "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : "";
}

export function kiwiDate(value: string | null | undefined) {
  const date = String(value || "").trim();
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(date)) return "";
  const parsed = new Date(date + "T12:00:00Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date ? date : "";
}

export function kiwiFlightDeepUrl({ origin, destination, departure, returnDate }: KiwiFlightSearch) {
  const from = kiwiIata(origin);
  if (!from) throw new Error("Invalid departure IATA code");
  const to = destination === "anywhere" || !destination ? "anywhere" : kiwiIata(destination);
  if (!to) throw new Error("Invalid destination IATA code");

  const outbound = kiwiDate(departure);
  const inbound = kiwiDate(returnDate);
  const url = new URL("https://www.kiwi.com/deep");
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);
  if (outbound) url.searchParams.set("departure", outbound);
  if (outbound && inbound && inbound >= outbound) url.searchParams.set("return", inbound);
  url.searchParams.set("lang", "pl");
  url.searchParams.set("currency", "PLN");
  return url.toString();
}

export function kiwiFlightExitHref(
  search: KiwiFlightSearch & { source?: string; offer?: string; destinationName?: string; price?: number | string },
) {
  const params = new URLSearchParams({
    from: search.origin,
    to: search.destination || "anywhere",
    source: search.source || "flight_search",
  });
  if (search.departure) params.set("departure", search.departure);
  if (search.returnDate) params.set("return", search.returnDate);
  if (search.offer) params.set("offer", search.offer);
  if (search.destinationName) params.set("destination", search.destinationName);
  if (search.price !== undefined && search.price !== "") params.set("price", String(search.price));
  return "/go/flight?" + params.toString();
}
