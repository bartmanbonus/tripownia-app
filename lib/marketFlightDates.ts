/**
 * Safe flight SEARCH suggestions for seasonal routes when the external cached-price
 * feed is empty. These are departure/return search dates, NOT verified fares.
 * The final provider checks live flight availability and displays the price.
 */
export type FlightDatePair = { departure: string; returnDate: string };

function dateUtc(date: string) {
  return new Date(date + "T00:00:00Z");
}

function iso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function later(a: string, b: string) {
  return a > b ? a : b;
}

function earlier(a: string, b: string) {
  return a < b ? a : b;
}

/**
 * Prefer Friday departures for a city break, then try other days when the
 * remaining market window is too short. Never propose dates after closing.
 */
export function marketFlightDateSuggestions({
  month, from, to, minNights = 2, maxNights = 4, limit = 3, today = new Date(),
}: {
  month: string;
  from: string;
  to: string;
  minNights?: number;
  maxNights?: number;
  limit?: number;
  today?: Date;
}): FlightDatePair[] {
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)
    || !/^20\d{2}-\d{2}-\d{2}$/.test(from)
    || !/^20\d{2}-\d{2}-\d{2}$/.test(to)
    || from > to) return [];

  const [year, monthNum] = month.split("-").map(Number);
  const monthEnd = iso(new Date(Date.UTC(year, monthNum, 0)));
  const todayIso = iso(today);
  const start = later(later(month + "-01", from), todayIso);
  const lastDepart = earlier(monthEnd, to);
  const nights = Math.min(Math.max(1, Math.floor(minNights)), Math.max(1, Math.floor(maxNights)), 14);
  if (start > lastDepart) return [];

  const friday: FlightDatePair[] = [];
  const other: FlightDatePair[] = [];
  for (let stamp = dateUtc(start).getTime(); stamp <= dateUtc(lastDepart).getTime(); stamp += 86400000) {
    const outbound = new Date(stamp);
    const inbound = new Date(stamp + nights * 86400000);
    if (iso(inbound) > to) continue;

    const item = { departure: iso(outbound), returnDate: iso(inbound) };
    if (outbound.getUTCDay() === 5) friday.push(item);
    else if (outbound.getUTCDay() === 4 || outbound.getUTCDay() === 6) other.push(item);
  }

  return [...friday, ...other].slice(0, Math.min(Math.max(1, limit), 6));
}

export function marketFlightDateLabel(item: FlightDatePair) {
  const fmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", timeZone: "UTC" });
  return fmt.format(dateUtc(item.departure)) + " – " + fmt.format(dateUtc(item.returnDate));
}

/**
 * Direct flight-date search through Tripownia's existing click tracker.
 * /go/live adds Tripownia's configured Kiwi/Travelpayouts affiliate attribution
 * to an approved /deep link and then forwards the visitor to live search.
 */
export function marketKiwiFlightHref({
  origin, destination, city, dates, source = "christmas_markets_flight",
}: {
  origin: string;
  destination: string;
  city: string;
  dates: FlightDatePair;
  source?: string;
}) {
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) return "/loty";
  const target = new URL("https://www.kiwi.com/deep");
  target.searchParams.set("from", origin);
  target.searchParams.set("to", destination);
  target.searchParams.set("departure", dates.departure);
  target.searchParams.set("return", dates.returnDate);
  target.searchParams.set("lang", "pl");
  target.searchParams.set("currency", "PLN");

  return "/go/live?" + new URLSearchParams({
    partner: "kiwi",
    target: target.toString(),
    destination: city,
    source,
    offer: [origin, destination, dates.departure, dates.returnDate].join("_"),
    page: "/jarmarki-bozonarodzeniowe",
  }).toString();
}
