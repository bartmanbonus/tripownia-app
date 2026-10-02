import { buildEskyPackagesUrl } from "@/lib/partners";

export type EskySearch = {
  query?: string; departure?: string; cityBreak?: boolean;
  minNights?: number; maxNights?: number; nights?: string;
  start?: string; end?: string; minPrice?: number; maxPrice?: number;
  timeoutMs?: number;
};

const PL_AIRPORTS = new Set(["WAW", "WMI", "KRK", "KTW", "GDN", "WRO", "POZ", "RZE", "LUZ", "SZZ", "LCJ", "BZG", "SZY", "IEG", "RDO"]);
const DESTINATIONS: Record<string, string> = {
  malta: "co-MT", cypr: "co-CY", wlochy: "co-IT", hiszpania: "co-ES", grecja: "co-GR", portugalia: "co-PT",
  francja: "co-FR", albania: "co-AL", czechy: "co-CZ", wegry: "co-HU", austria: "co-AT", niemcy: "co-DE",
  holandia: "co-NL", chorwacja: "co-HR", bulgaria: "co-BG", turcja: "co-TR", tunezja: "co-TN", egipt: "co-EG",
  maroko: "co-MA", wielka_brytania: "co-GB", irlandia: "co-IE", dania: "co-DK", szwecja: "co-SE",
  rzym: "ci-ROM", rome: "ci-ROM", mediolan: "ci-MIL", milan: "ci-MIL", bergamo: "ci-MIL",
  praga: "ci-PRG", prague: "ci-PRG", paryz: "ci-PAR", paris: "ci-PAR", londyn: "ci-LON", london: "ci-LON",
  wieden: "ci-VIE", budapeszt: "ci-BUD", lizbona: "ci-LIS", lisbon: "ci-LIS", neapol: "ci-NAP",
  sewilla: "ci-SVQ", amsterdam: "ci-AMS", kopenhaga: "ci-CPH", malaga: "ci-AGP", split: "ci-SPU",
  barcelona: "ci-BCN", madryt: "ci-MAD", ateny: "ci-ATH", porto: "ci-OPO", wenecja: "ci-VCE",
  alicante: "ci-ALC", walencja: "ci-VLC", nicea: "ci-NCE", berlin: "ci-BER", dublin: "ci-DUB",
};

export function eskyArrival(query = "") {
  const primary = query.split(",")[0].trim().toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s+/g, "_");
  return DESTINATIONS[primary] || "";
}

export function eskyDepartures(departure = "") {
  return [...new Set(departure.toUpperCase().split(",").flatMap(code => code.trim() === "WAWA" ? ["WAW", "WMI"] : [code.trim()]).filter(code => PL_AIRPORTS.has(code)))];
}

export function eskyNights(search: EskySearch) {
  const match = /^(\d+)(?:-(\d+)|(\+))?$/.exec(search.nights || "");
  const from = Math.max(search.cityBreak ? 2 : 1, search.minNights || (match ? Number(match[1]) : search.cityBreak ? 2 : 1));
  const to = Math.min(search.cityBreak ? 5 : 30, search.maxNights || (match ? Number(match[2] || (match[3] ? 30 : match[1])) : search.cityBreak ? 5 : 14));
  return { from, to };
}

export function eskyInventoryUrl(search: EskySearch, arrival = eskyArrival(search.query), cursor = "") {
  const url = new URL("https://hotelsapi.esky.com/gateway/minilisting/packages");
  const p = url.searchParams;
  p.set("orientation", "vertical"); p.set("branding", "false"); p.set("limit", "15");
  p.set("partnerCode", "TRIPOWNIAPLPACKAGES");
  if (arrival) p.set("arrivals[0]", arrival);
  eskyDepartures(search.departure).forEach((code, i) => p.set(`departures[${i}]`, `ap-${code}`));
  const nights = eskyNights(search);
  p.set("lengthRange[from]", String(nights.from)); p.set("lengthRange[to]", String(nights.to));
  if (search.start) p.set("dateRange[from]", search.start);
  if (search.end) p.set("dateRange[to]", search.end);
  if (search.minPrice) p.set("priceRange[from]", String(search.minPrice));
  const ceiling = search.cityBreak ? Math.min(search.maxPrice || 2000, 2000) : search.maxPrice;
  if (ceiling) p.set("priceRange[to]", String(ceiling));
  if (cursor) p.set("cursor", cursor);
  return url;
}

export function eskySearchUrl(search: EskySearch) {
  const url = new URL(buildEskyPackagesUrl());
  url.searchParams.set("rooms[0][adults]", "2");
  url.searchParams.set("datesTab", "flexDates");
  const arrival = eskyArrival(search.query);
  if (arrival) url.searchParams.set("arrivalPlaces", arrival);
  const departures = eskyDepartures(search.departure);
  if (departures.length) url.searchParams.set("departurePlaces", departures.map(code => `ap-${code}`).join(","));
  const nights = eskyNights(search);
  url.searchParams.set("stayLength", `${nights.from}:${nights.to}`);
  if (search.start) url.searchParams.set("departureDate", search.start);
  if (search.end) url.searchParams.set("returnDate", search.end);
  return url.toString();
}
