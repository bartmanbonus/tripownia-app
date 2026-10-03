import type { Offer } from "@/lib/offers";
import { buildEskyPackagesUrl } from "@/lib/partners";
import {
  eskyArrivals,
  eskyDepartures,
  eskyInventoryUrl,
  eskyNights,
  eskySearchUrl,
  type EskySearch,
} from "@/lib/eskySearch";

export type BrowserEskySearch = EskySearch & {
  board?: string;
  weekendOnly?: boolean;
  lastMinuteOnly?: boolean;
};

export type BrowserEskyPackage = Offer & {
  provider: "esky";
  modifiedAt: number;
  sourceKey: string;
  startDateISO: string;
  endDateISO: string;
};

const AIRPORTS: Record<string, string> = {
  WAW: "Warszawa Chopina",
  WMI: "Warszawa Modlin",
  KRK: "Kraków",
  KTW: "Katowice",
  GDN: "Gdańsk",
  WRO: "Wrocław",
  POZ: "Poznań",
  RZE: "Rzeszów",
  LUZ: "Lublin",
  SZZ: "Szczecin",
  LCJ: "Łódź",
  BZG: "Bydgoszcz",
  SZY: "Olsztyn",
  IEG: "Zielona Góra",
  RDO: "Radom",
};

const DEFAULT_CITY_BREAK_ARRIVALS = [
  "ci-ROM",
  "ci-MIL",
  "ci-BCN",
  "ci-LIS",
  "ci-PRG",
  "ci-BUD",
  "ci-VIE",
  "ci-PAR",
  "ci-LON",
  "ci-ATH",
  "ci-BRI",
  "ci-NAP",
  "ci-OPO",
  "ci-PFO",
  "co-MT",
];

function hash(value: string) {
  let result = 0;
  for (const char of value) result = (Math.imul(result, 31) + char.charCodeAt(0)) | 0;
  return result >>> 0;
}

function normalizeText(value = "") {
  return value
    .toLocaleLowerCase("pl")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function boardMatches(board: string, requested?: string) {
  if (!requested || requested === "all") return true;
  const value = normalizeText(board);
  const tests: Record<string, RegExp> = {
    allinclusive: /all inclusive/,
    ultraallinclusive: /ultra all inclusive/,
    breakfast: /sniad|breakfast/,
    halfboard: /half board|obiadokolac/,
    fullboard: /full board|pelne wyzywienie|trzy posilki/,
    roomonly: /bez wyzywienia|room only|self catering/,
  };
  return tests[requested]?.test(value) ?? true;
}

function normalizeEskyPackage(row: any): BrowserEskyPackage | null {
  const price = Number(row?.pricePerPax?.amount);
  const airportCode = String(row?.departureAirportCode || "").toUpperCase();
  const start = String(row?.stayInformation?.checkInDate || "");
  const end = String(row?.stayInformation?.checkOutDate || "");
  const nights = Number(row?.stayInformation?.nights);

  if (row?.pricePerPax?.currency !== "PLN" || !Number.isFinite(price) || price <= 0 || !AIRPORTS[airportCode]) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || !Number.isInteger(nights) || nights <= 0) return null;
  if (Date.parse(end) - Date.parse(start) !== nights * 86_400_000 || start < new Date().toISOString().slice(0, 10)) return null;

  let url: URL;
  try {
    url = new URL(String(row?.variantsUrl || ""));
  } catch {
    return null;
  }
  if (
    url.protocol !== "https:" ||
    !["www2.esky.pl", "www.esky.pl"].includes(url.hostname) ||
    !url.pathname.startsWith("/lot+hotel/portfolio/details/") ||
    !url.searchParams.get("packageId")
  ) return null;
  if (
    url.searchParams.get("checkInDate") !== start ||
    url.searchParams.get("checkOutDate") !== end ||
    url.searchParams.get("departureCode") !== airportCode
  ) return null;

  const hotel = String(row?.hotel?.name || "");
  const city = String(row?.hotel?.locationBreadcrumbs?.at?.(-1) || row?.hotel?.regionName || "");
  const country = String(row?.hotel?.countryName || "");
  if (!hotel || !city || !country) return null;

  const board = String(row?.mealPlan || "Wyżywienie wg oferty");
  const sourceKey = [
    url.searchParams.get("packageId"),
    row?.hotel?.metaCode,
    airportCode,
    start,
    end,
    board,
  ].join(":");

  return {
    id: 900_000_000 + (hash(sourceKey) % 800_000_000),
    city,
    country,
    flag: "",
    price,
    departure: AIRPORTS[airportCode],
    airportCode,
    nights,
    weather: "sprawdź",
    score: Math.min(10, Math.max(0, Number(row?.hotel?.rating) * 2 || 0)),
    tag: price <= 1600 ? "BIERZEMY" : "DOBRA OPCJA",
    reason: `${nights} nocy · lot + hotel · ${board}`,
    hotel,
    image: String(row?.hotel?.photoUrl || "/images/destinations/malta.jpg"),
    board,
    dates: `${start}–${end}`,
    partner: "esky",
    provider: "esky",
    affiliateUrl: buildEskyPackagesUrl(url.toString()),
    linkType: "exact",
    linkMatch: "exact",
    category: [
      ...(nights <= 5 ? ["city", "weekend"] : ["wakacje"]),
      ...(/all[ -]?inclusive/i.test(board) ? ["allinclusive"] : []),
    ],
    priceCheckedAt: new Date().toISOString(),
    availabilityStatus: "available",
    modifiedAt: Date.now(),
    sourceKey,
    startDateISO: start,
    endDateISO: end,
  };
}

export function matchesEskyBrowserSearch(offer: BrowserEskyPackage, search: BrowserEskySearch) {
  const departures = eskyDepartures(search.departure);
  if (departures.length && !departures.includes(offer.airportCode)) return false;

  const nights = eskyNights(search);
  if (offer.nights < nights.from || offer.nights > nights.to) return false;

  if (search.start && offer.startDateISO < search.start) return false;
  if (search.end && offer.startDateISO > search.end) return false;
  if (search.minPrice && offer.price < search.minPrice) return false;
  if (search.maxPrice && offer.price > search.maxPrice) return false;
  if (!boardMatches(offer.board, search.board)) return false;

  if (search.weekendOnly) {
    const weekday = new Date(`${offer.startDateISO}T12:00:00Z`).getUTCDay();
    if (![5, 6].includes(weekday) || offer.nights > 4) return false;
  }

  if (search.lastMinuteOnly) {
    const today = new Date();
    const floor = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const start = Date.parse(`${offer.startDateISO}T00:00:00Z`);
    if (start < floor || start > floor + 45 * 86_400_000) return false;
  }

  return true;
}

export async function fetchEskyBrowserPackages(
  search: BrowserEskySearch = {},
  signal?: AbortSignal
): Promise<{
  offers: BrowserEskyPackage[];
  partial: boolean;
  hasMore: boolean;
  searchUrl: string;
  error?: string;
}> {
  const searchUrl = eskySearchUrl(search);
  const mapped = eskyArrivals(search.query);
  if (search.query && mapped.length === 0) {
    return { offers: [], partial: true, hasMore: false, searchUrl, error: "unmapped_destination" };
  }

  const arrivals = mapped.length
    ? mapped
    : search.cityBreak
      ? DEFAULT_CITY_BREAK_ARRIVALS
      : [""];

  const offers: BrowserEskyPackage[] = [];
  let partial = false;
  let hasMore = false;
  let error: string | undefined;
  const deadline = Date.now() + 30_000;

  const scan = async (arrival: string) => {
    const seenCursors = new Set<string>();
    let cursor = "";
    const maxPages = search.query ? 4 : 2;

    for (let page = 0; page < maxPages; page += 1) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      if (Date.now() >= deadline) {
        partial = true;
        hasMore = true;
        error ||= "timeout";
        return;
      }

      const requestController = new AbortController();
      const abort = () => requestController.abort();
      signal?.addEventListener("abort", abort, { once: true });
      const remaining = Math.max(1, deadline - Date.now());
      const timer = window.setTimeout(abort, Math.min(8_000, remaining));

      try {
        const response = await fetch(eskyInventoryUrl(search, arrival, cursor), {
          cache: "no-store",
          credentials: "omit",
          signal: requestController.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data?.offers)) throw new Error("invalid_response");

        for (const row of data.offers) {
          const offer = normalizeEskyPackage(row);
          if (offer && matchesEskyBrowserSearch(offer, search)) offers.push(offer);
        }

        cursor = String(data?.paging?.cursor || "");
        if (!cursor || !data.offers.length) return;
        if (seenCursors.has(cursor)) {
          hasMore = true;
          return;
        }
        seenCursors.add(cursor);
      } catch (cause) {
        if (signal?.aborted) throw cause;
        partial = true;
        error = cause instanceof Error
          ? (cause.name === "AbortError" ? "timeout" : cause.message.slice(0, 120))
          : "source_unavailable";
        return;
      } finally {
        window.clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
      }
    }
    hasMore = Boolean(cursor) || hasMore;
  };

  for (let index = 0; index < arrivals.length; index += 3) {
    await Promise.all(arrivals.slice(index, index + 3).map(scan));
    if (search.query && offers.length >= 24) break;
    if (!search.query && offers.length >= 45) break;
  }

  const unique = [...new Map(
    offers.map((offer) => [offer.sourceKey, offer] as const)
  ).values()]
    .sort((a, b) => a.price - b.price || b.score - a.score);

  return {
    offers: unique,
    partial,
    hasMore,
    searchUrl,
    ...(error ? { error } : {}),
  };
}
