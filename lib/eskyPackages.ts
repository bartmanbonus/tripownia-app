import type { Offer } from "@/lib/offers";
import { buildEskyPackagesUrl } from "@/lib/partners";
import { eskyArrival, eskyInventoryUrl, eskyNights, eskySearchUrl, type EskySearch } from "@/lib/eskySearch";

export type EskyPackage = Offer & {
  provider: "esky"; modifiedAt: number; sourceKey: string;
  startDateISO: string; endDateISO: string;
};
const AIRPORTS: Record<string, string> = { WAW: "Warszawa Chopina", WMI: "Warszawa Modlin", KRK: "Kraków", KTW: "Katowice", GDN: "Gdańsk", WRO: "Wrocław", POZ: "Poznań", RZE: "Rzeszów", LUZ: "Lublin", SZZ: "Szczecin", LCJ: "Łódź", BZG: "Bydgoszcz", SZY: "Olsztyn", IEG: "Zielona Góra", RDO: "Radom" };
const ESKY_BLOCK_COOLDOWN_MS = 5 * 60 * 1000;
const ESKY_LAST_GOOD_TTL_MS = 30 * 60 * 1000;
let eskyBlockedUntil = 0;
const eskyLastGood = new Map<string, { at: number; offers: EskyPackage[]; hasMore: boolean }>();

function eskyCacheKey(search: EskySearch) {
  return JSON.stringify({
    query: search.query || "",
    departure: search.departure || "",
    cityBreak: Boolean(search.cityBreak),
    nights: search.nights || "",
    minNights: search.minNights || "",
    maxNights: search.maxNights || "",
    start: search.start || "",
    end: search.end || "",
    minPrice: search.minPrice || "",
    maxPrice: search.maxPrice || "",
  });
}

function lastGoodEsky(search: EskySearch) {
  const cached = eskyLastGood.get(eskyCacheKey(search));
  if (!cached || Date.now() - cached.at > ESKY_LAST_GOOD_TTL_MS) return null;
  return cached;
}

function hash(value: string) { let n = 0; for (const c of value) n = (Math.imul(n, 31) + c.charCodeAt(0)) | 0; return n >>> 0; }

export function normalizeEskyPackage(row: any): EskyPackage | null {
  const price = Number(row?.pricePerPax?.amount);
  const airportCode = String(row?.departureAirportCode || "");
  const start = String(row?.stayInformation?.checkInDate || "");
  const end = String(row?.stayInformation?.checkOutDate || "");
  const nights = Number(row?.stayInformation?.nights);
  if (row?.pricePerPax?.currency !== "PLN" || !Number.isFinite(price) || price <= 0 || !AIRPORTS[airportCode]) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || !Number.isInteger(nights) || nights <= 0) return null;
  if (Date.parse(end) - Date.parse(start) !== nights * 86400000 || start < new Date().toISOString().slice(0, 10)) return null;
  let url: URL;
  try { url = new URL(row.variantsUrl); } catch { return null; }
  if (url.protocol !== "https:" || !["www2.esky.pl", "www.esky.pl"].includes(url.hostname)
    || !url.pathname.startsWith("/lot+hotel/portfolio/details/") || !url.searchParams.get("packageId")) return null;
  if (url.searchParams.get("checkInDate") !== start || url.searchParams.get("checkOutDate") !== end || url.searchParams.get("departureCode") !== airportCode) return null;
  const sourceKey = `${url.searchParams.get("packageId")}:${row.hotel?.metaCode}:${airportCode}:${start}:${end}:${row.mealPlan}`;
  const board = String(row.mealPlan || "Wyżywienie wg oferty");
  const city = String(row.hotel?.locationBreadcrumbs?.at(-1) || row.hotel?.regionName || "");
  const country = String(row.hotel?.countryName || "");
  if (!city || !country || !row.hotel?.name) return null;
  return {
    id: 900_000_000 + hash(sourceKey) % 800_000_000,
    city, country, flag: "", price, departure: AIRPORTS[airportCode], airportCode, nights,
    weather: "sprawdź", score: Math.min(10, Math.max(0, Number(row.hotel.rating) * 2 || 0)),
    tag: price <= 1600 ? "BIERZEMY" : "DOBRA OPCJA",
    reason: `${nights} nocy · lot + hotel · ${board}`,
    hotel: String(row.hotel.name), image: String(row.hotel.photoUrl || "/images/destinations/malta.jpg"),
    board, dates: `${start}–${end}`, partner: "esky", provider: "esky",
    affiliateUrl: buildEskyPackagesUrl(url.toString()), linkType: "exact", linkMatch: "exact",
    category: [...(nights <= 5 ? ["city", "weekend"] : ["wakacje"]), ...(/all[ -]?inclusive/i.test(board) ? ["allinclusive"] : [])],
    priceCheckedAt: new Date().toISOString(), availabilityStatus: "available",
    modifiedAt: Date.now(), sourceKey, startDateISO: start, endDateISO: end,
  };
}

// Official minilisting data, consumed as inventory (no embedded widget).
// Never repeat the widget's unfiltered fallback. All results pass our own filters.
export async function fetchEskyPackages(search: EskySearch = {}): Promise<{ offers: EskyPackage[]; partial: boolean; hasMore: boolean; searchUrl: string; error?: string }> {
  const offers: EskyPackage[] = [];
  const searchUrl = eskySearchUrl(search);
  const cached = lastGoodEsky(search);
  if (Date.now() < eskyBlockedUntil) {
    return cached
      ? { offers: cached.offers, partial: true, hasMore: cached.hasMore, searchUrl, error: "HTTP 403 (using last good results)" }
      : { offers, partial: true, hasMore: false, searchUrl, error: "HTTP 403 (cooldown)" };
  }
  const nights = eskyNights(search);
  if (nights.from > nights.to) return { offers, partial: false, hasMore: false, searchUrl };
  // Country slices prevent the default portfolio (often Malta-heavy) from hiding
  // cheaper city breaks elsewhere. A specific query gets deeper cursor paging.
  const arrival = eskyArrival(search.query);
  const arrivals = arrival ? [arrival] : search.query ? [""] : search.cityBreak
    ? ["ci-ROM", "ci-MIL", "ci-BCN", "ci-LIS", "co-MT", "co-CY", "ci-PRG", "ci-BUD", "ci-VIE", "ci-PAR", "ci-LON", "ci-ATH"]
    : ["co-IT", "co-ES", "co-MT", "co-CY", "co-PT", "co-GR", "co-FR", "co-CZ", "co-HU", "co-AL", "co-GB", "co-AT"];
  const deadline = Date.now() + Math.max(3_000, Math.min(38_000, search.timeoutMs || 38_000));
  let partial = false;
  let hasMore = false;
  let error: string | undefined;
  let sourceBlocked = false;
  const scan = async (place: string) => {
    if (sourceBlocked) return;
    const cursors = new Set<string>();
    let cursor = "";
    for (let page = 0; page < (search.query ? 8 : 2); page++) {
      if (Date.now() >= deadline) { partial = true; return; }
      try {
        const requestTimeout = Math.min(search.timeoutMs ? 4_000 : 12_000, Math.max(1, deadline - Date.now()));
        const response = await fetch(eskyInventoryUrl(search, place, cursor), {
          headers: { "x-via": "minilisting-widget-TRIPOWNIAPLPACKAGES", Accept: "application/json" },
          next: { revalidate: 300 }, signal: AbortSignal.timeout(requestTimeout),
        });
        if (response.status === 401 || response.status === 403) {
          sourceBlocked = true;
          eskyBlockedUntil = Date.now() + ESKY_BLOCK_COOLDOWN_MS;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        eskyBlockedUntil = 0;
        const data = await response.json();
        if (!Array.isArray(data.offers)) throw new Error("invalid_response");
        for (const row of data.offers) { const offer = normalizeEskyPackage(row); if (offer) offers.push(offer); }
        cursor = String(data.paging?.cursor || "");
        if (!cursor || !data.offers.length) return;
        if (cursors.has(cursor)) { hasMore = true; return; }
        cursors.add(cursor);
      } catch (cause) {
        partial = true;
        error = cause instanceof Error ? cause.message.slice(0, 120) : "source_unavailable";
        console.warn("[esky_inventory]", error);
        return;
      }
    }
    hasMore = Boolean(cursor) || hasMore;
  };
  // Probe the source once before fanning out. When eSky returns 401/403,
  // this avoids multiplying the same blocked request across every destination.
  if (arrivals.length) await scan(arrivals[0]);
  for (let index = 1; index < arrivals.length; index += 2) {
    if (sourceBlocked || Date.now() >= deadline) break;
    await Promise.all(arrivals.slice(index, index + 2).map(scan));
  }

  if (offers.length) {
    eskyLastGood.set(eskyCacheKey(search), {
      at: Date.now(),
      offers: offers.slice(),
      hasMore,
    });
  } else if (partial && cached) {
    return {
      offers: cached.offers,
      partial: true,
      hasMore: cached.hasMore,
      searchUrl,
      error: error ? `${error} (using last good results)` : "using last good results",
    };
  }

  return { offers, partial, hasMore, searchUrl, ...(error ? { error } : {}) };
}
