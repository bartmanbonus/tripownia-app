import type { Offer } from "@/lib/offers";
import { buildEskyPackagesUrl } from "@/lib/partners";

export type EskyPackage = Offer & {
  provider: "esky"; modifiedAt: number; sourceKey: string;
  startDateISO: string; endDateISO: string;
};
const AIRPORTS: Record<string, string> = { WAW: "Warszawa Chopina", WMI: "Warszawa Modlin", KRK: "Kraków", KTW: "Katowice", GDN: "Gdańsk", WRO: "Wrocław", POZ: "Poznań", RZE: "Rzeszów", LUZ: "Lublin", SZZ: "Szczecin", LCJ: "Łódź", BZG: "Bydgoszcz", SZY: "Olsztyn", IEG: "Zielona Góra", RDO: "Radom" };
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
  const city = String(row.hotel?.regionName || row.hotel?.locationBreadcrumbs?.at(-1) || "");
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
export async function fetchEskyPackages(): Promise<{ offers: EskyPackage[]; partial: boolean }> {
  const offers: EskyPackage[] = [];
  const cursors = new Set<string>();
  let cursor = "";
  for (let page = 0; page < 4; page++) {
    const url = new URL("https://hotelsapi.esky.com/gateway/minilisting/packages");
    url.searchParams.set("partnerCode", "TRIPOWNIAPLPACKAGES");
    url.searchParams.set("limit", "15");
    if (cursor) url.searchParams.set("cursor", cursor);
    try {
      const response = await fetch(url, { headers: { "x-via": "minilisting-widget-TRIPOWNIAPLPACKAGES" }, next: { revalidate: 300 }, signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error("eSky packages unavailable");
      const data = await response.json();
      if (!Array.isArray(data.offers)) throw new Error("Invalid eSky packages response");
      for (const row of data.offers) { const offer = normalizeEskyPackage(row); if (offer) offers.push(offer); }
      cursor = String(data.paging?.cursor || "");
      if (!cursor || !data.offers.length) return { offers, partial: false };
      if (cursors.has(cursor)) return { offers, partial: true };
      cursors.add(cursor);
    } catch { return { offers, partial: true }; }
  }
  return { offers, partial: Boolean(cursor) };
}
