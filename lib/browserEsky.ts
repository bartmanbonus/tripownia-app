"use client";

import type { Offer } from "@/lib/offers";
import { buildEskyPackagesUrl } from "@/lib/partners";
import { eskyArrival, eskyInventoryUrl, type EskySearch } from "@/lib/eskySearch";

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

const ATTEMPT_COOLDOWN_MS = 2 * 60 * 1000;
const lastAttempts = new Map<string, number>();

function hash(value: string) {
  let n = 0;
  for (const c of value) n = (Math.imul(n, 31) + c.charCodeAt(0)) | 0;
  return n >>> 0;
}

function normalizeRow(row: any): Offer | null {
  const price = Number(row?.pricePerPax?.amount);
  const airportCode = String(row?.departureAirportCode || "");
  const start = String(row?.stayInformation?.checkInDate || "");
  const end = String(row?.stayInformation?.checkOutDate || "");
  const nights = Number(row?.stayInformation?.nights);
  const board = String(row?.mealPlan || "Wyżywienie wg oferty");

  if (row?.pricePerPax?.currency !== "PLN" || !Number.isFinite(price) || price <= 0 || !AIRPORTS[airportCode]) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || !Number.isInteger(nights) || nights <= 0) return null;
  if (start < new Date().toISOString().slice(0, 10)) return null;

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

  const city = String(row?.hotel?.locationBreadcrumbs?.at?.(-1) || row?.hotel?.regionName || "");
  const country = String(row?.hotel?.countryName || "");
  const hotel = String(row?.hotel?.name || "");
  if (!city || !country || !hotel) return null;

  const sourceKey = `${url.searchParams.get("packageId")}:${row?.hotel?.metaCode || ""}:${airportCode}:${start}:${end}`;

  return {
    id: 1_700_000_000 + (hash(sourceKey) % 200_000_000),
    flag: "",
    city,
    country,
    price,
    priceCheckedAt: new Date().toISOString(),
    availabilityStatus: "available",
    departure: AIRPORTS[airportCode],
    airportCode,
    nights,
    weather: "sprawdź",
    score: Math.min(10, Math.max(0, Number(row?.hotel?.rating) * 2 || 0)),
    tag: price <= 1600 ? "BIERZEMY" : "DOBRA OPCJA",
    reason: `${nights} nocy · lot + hotel · ${board}`,
    image: String(row?.hotel?.photoUrl || "/images/destinations/malta.jpg"),
    category: [...(nights <= 5 ? ["city", "weekend"] : ["wakacje"]), ...(/all[ -]?inclusive/i.test(board) ? ["allinclusive"] : [])],
    hotel,
    board,
    dates: `${start}–${end}`,
    partner: "esky",
    affiliateUrl: buildEskyPackagesUrl(url.toString()),
    linkType: "exact",
    linkMatch: "exact",
  };
}

function searchFromEndpoint(endpoint: string): { search: EskySearch; arrivals: string[]; board: string } | null {
  if (typeof window === "undefined") return null;

  let url: URL;
  try {
    url = new URL(endpoint, window.location.origin);
  } catch {
    return null;
  }

  if (!["/api/deals", "/api/today-offers"].includes(url.pathname)) return null;
  if (url.searchParams.get("skipEsky") === "1") return null;

  const query = (url.searchParams.get("q") || url.searchParams.get("destination") || "").trim();
  const departure = (url.searchParams.get("from") || "").trim();
  const month = (url.searchParams.get("month") || "").trim();
  const year = (url.searchParams.get("year") || "").trim();
  let start = (url.searchParams.get("start") || "").trim();
  let end = (url.searchParams.get("end") || "").trim();
  const mode = (url.searchParams.get("mode") || "").trim();
  const type = (url.searchParams.get("type") || "").trim();
  const board = (url.searchParams.get("board") || "").trim();

  if (!query && !departure && !month && !year && !start && !end) return null;

  if (!start && /^20\d{2}$/.test(year) && /^(0[1-9]|1[0-2])$/.test(month)) {
    const lastDay = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
    start = `${year}-${month}-01`;
    end = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
  }

  const cityBreak = mode === "citybreak" || type === "citybreak";
  const minNights = Number(url.searchParams.get("minNights") || (cityBreak ? 2 : 1));
  const maxNights = Number(url.searchParams.get("maxNights") || (cityBreak ? 5 : 14));

  const search: EskySearch = {
    query,
    departure,
    cityBreak,
    minNights: Number.isFinite(minNights) ? minNights : undefined,
    maxNights: Number.isFinite(maxNights) ? maxNights : undefined,
    start: /^20\d{2}-\d{2}-\d{2}$/.test(start) ? start : undefined,
    end: /^20\d{2}-\d{2}-\d{2}$/.test(end) ? end : undefined,
  };

  const arrival = eskyArrival(query);
  const arrivals = arrival
    ? [arrival]
    : type === "allinclusive"
      ? ["co-EG", "co-TR", "co-GR", "co-ES"]
      : ["ci-ROM", "ci-MIL", "ci-BCN", "co-MT"];

  return { search, arrivals, board };
}

async function fetchOne(search: EskySearch, arrival: string) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5_500);
  try {
    const response = await fetch(eskyInventoryUrl(search, arrival).toString(), {
      cache: "no-store",
      credentials: "omit",
      mode: "cors",
      signal: controller.signal,
    });
    if (!response.ok) return [] as Offer[];
    const payload = await response.json();
    if (!Array.isArray(payload?.offers)) return [] as Offer[];
    return payload.offers.map(normalizeRow).filter((offer: Offer | null): offer is Offer => Boolean(offer));
  } catch {
    return [] as Offer[];
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function fetchBrowserEskyOffers(endpoint: string): Promise<Offer[]> {
  const config = searchFromEndpoint(endpoint);
  if (!config) return [];

  const attemptKey = endpoint;
  const lastAttempt = lastAttempts.get(attemptKey) || 0;
  if (Date.now() - lastAttempt < ATTEMPT_COOLDOWN_MS) return [];
  lastAttempts.set(attemptKey, Date.now());

  const settled = await Promise.allSettled(
    config.arrivals.slice(0, 4).map((arrival) => fetchOne(config.search, arrival))
  );

  const rows = settled.flatMap((item) => item.status === "fulfilled" ? item.value : []);
  const filtered = rows
    .filter((offer) => {
      if (!config.board) return true;
      const board = offer.board.toLowerCase();
      if (config.board === "allinclusive") return /all inclusive/.test(board) && !/ultra/.test(board);
      if (config.board === "ultraallinclusive") return /ultra all|ultraall/.test(board);
      if (config.board === "breakfast") return /śniad|sniad|breakfast|\bbb\b/.test(board);
      return true;
    })
    .sort((a, b) => a.price - b.price);

  const unique = new Map<string, Offer>();
  for (const offer of filtered) {
    const key = `${offer.city}|${offer.country}|${offer.airportCode}`.toLowerCase();
    if (!unique.has(key)) unique.set(key, offer);
  }

  return Array.from(unique.values()).slice(0, 20);
}
