import { NextRequest, NextResponse } from "next/server";
import { fetchEskyPackages } from "@/lib/eskyPackages";
import { isAffordableShortTrip, isPromotableOffer } from "@/lib/offerValuePolicy";
import { rankSearchOffers } from "@/lib/searchOfferRanking";

export const maxDuration = 60;

import { homepageFallbackOffers, isOfferExpired, type Offer } from "@/lib/offers";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import { touristDestinationKey } from "@/lib/destinationGrouping";
import { cheapestPerDestination as selectCheapestPerDestination } from "@/lib/offerEngine";

type TdField = { name?: string; value?: string };
type TdOffer = {
  productUrl?: string;
  legacyProductUrl?: string;
  modified?: number;
  sourceProductId?: string;
  programName?: string;
  priceHistory?: Array<{ price?: { value?: string; currency?: string } }>;
};
type TdProduct = {
  name?: string;
  description?: string;
  fields?: TdField[];
  offers?: TdOffer[];
  productImage?: { url?: string };
};

type Provider = "exim" | "tui" | "esky";

type LiveCandidate = Offer & {
  provider: Provider;
  modifiedAt: number;
  sourceKey: string;
  startDateISO?: string;
  endDateISO?: string;
};

const CITY_BREAK_TERMS = [
  "Rzym", "Mediolan", "Wenecja", "Neapol", "Barcelona", "Madryt", "Alicante", "Walencja", "Sewilla",
  "Lizbona", "Porto", "Paryż", "Amsterdam", "Praga", "Budapeszt", "Wiedeń", "Ateny", "Stambuł",
  "Malta", "Pafos", "Sycylia", "Bolonia", "Piza", "Turyn", "Bari", "Palermo", "Katania",
  "Nicea", "Marsylia", "Berlin", "Kopenhaga", "Sztokholm", "Londyn", "Edynburg", "Dublin", "Bruksela", "Dubrownik",
];

// Fast discovery endpoints should stay below TradeDoubler's burst-rate limit.
// These high-demand directions still cover the cheapest commercial city-break stock;
// typed searches continue to use the full alias/query logic.
const CITY_BREAK_FAST_TERMS = [
  "Rzym", "Mediolan", "Wenecja", "Neapol", "Bari",
  "Barcelona", "Madryt", "Alicante", "Lizbona", "Porto",
  "Paryż", "Amsterdam", "Praga", "Budapeszt", "Wiedeń",
  "Ateny", "Stambuł", "Malta", "Pafos", "Sycylia",
];

const SURPRISE_TERMS = {
  low: ["Malta", "Sycylia", "Alicante", "Pafos", "Stambuł", "Marrakesz"],
  mid: ["Djerba", "Marrakesz", "Teneryfa", "Fuerteventura", "Marsa Alam", "Hurghada"],
  high: ["Dubaj", "Zanzibar", "Dominikana", "Malediwy", "Kenia", "Meksyk", "Tajlandia", "Kuba"],
};

const EUROPE_SEARCH_TERMS = [
  "Grecja", "Hiszpania", "Cypr", "Malta", "Bułgaria", "Włochy", "Portugalia", "Albania",
  "Rodos", "Kreta", "Zakynthos", "Pafos", "Teneryfa", "Fuerteventura", "Majorka", "Sycylia",
];

const EXOTIC_SEARCH_TERMS = [
  "Maroko", "Egipt", "Tunezja", "Djerba", "Hurghada", "Marsa Alam",
  "Wietnam", "Bali", "Indonezja", "Tajlandia", "Sri Lanka", "Malediwy", "Japonia",
  "Zanzibar", "Kenia", "Mauritius", "Wyspy Zielonego Przylądka", "Gambia", "Seszele",
  "Dominikana", "Meksyk", "Kuba", "Jamajka", "USA", "Nowy Jork", "Floryda",
  "Brazylia", "Kolumbia", "Peru", "Kostaryka",
];

const SEARCH_TERMS = [...EUROPE_SEARCH_TERMS, ...EXOTIC_SEARCH_TERMS];

const BROAD_SEARCH_TERMS = [
  "Grecja", "Hiszpania", "Cypr", "Turcja", "Tunezja", "Egipt", "Bułgaria", "Albania",
  "Portugalia", "Włochy", "Maroko", "Malta", "Teneryfa", "Fuerteventura", "Gran Canaria", "Lanzarote",
  "Rodos", "Kreta", "Korfu", "Zakynthos", "Santorini", "Pafos", "Cypr Południowy", "Majorka", "Sycylia",
  "Madera", "Sardynia", "Djerba", "Hurghada", "Marsa Alam", "Sharm el Sheikh", "Marrakesz", "Marrakech",
  "Agadir", "Rzym", "Mediolan", "Neapol", "Barcelona", "Alicante", "Walencja", "Sewilla", "Lizbona",
  "Porto", "Ateny", "Stambuł", "Zanzibar", "Kenia", "Mauritius", "Sri Lanka", "Dominikana", "Meksyk",
  "Kuba", "Tajlandia", "Wietnam", "Bali", "Malediwy", "Dubaj", "Wyspy Zielonego Przylądka"
];

// A wide "Gdziekolwiek" search used to launch 100+ TradeDoubler requests at once.
// That intermittently exhausted the feed and collapsed broad searches to just a few
// results. Country/region queries already return large product pages, so a smaller
// core gives much better coverage with far fewer calls.
const BROAD_CORE_TERMS = [
  "Grecja", "Hiszpania", "Cypr", "Turcja", "Tunezja", "Egipt", "Bułgaria", "Albania",
  "Portugalia", "Włochy", "Maroko", "Malta", "Wyspy Kanaryjskie", "Djerba", "Hurghada",
  "Marsa Alam", "Dubaj", "Zanzibar", "Kenia", "Dominikana", "Tajlandia", "Malediwy"
];

// Curated commercial coverage for airport hub pages. A smaller, stable set of
// country queries gives much better departure-airport coverage than the generic
// daily pool without launching the full 50+ term rescue search.
const AIRPORT_HUB_TERMS = [
  "Turcja", "Hiszpania", "Włochy", "Albania", "Malta",
  "Grecja", "Cypr", "Egipt", "Tunezja", "Bułgaria",
  "Portugalia", "Maroko", "Wyspy Kanaryjskie"
];

const NEW_YEAR_SEARCH_TERMS = [
  "Rzym", "Praga", "Budapeszt", "Wiedeń", "Stambuł", "Malta", "Cypr",
  "Marrakesz", "Teneryfa", "Fuerteventura", "Egipt", "Hurghada", "Marsa Alam",
  "Dubaj", "Zanzibar", "Tajlandia", "Dominikana", "Meksyk", "Malediwy", "Mauritius",
];

const SEARCH_ALIASES: Record<string, string[]> = {
  rzym: ["Rzym", "Rome", "Włochy", "Italy"],
  paryz: ["Paryż", "Paris", "Francja", "France"],
  mediolan: ["Mediolan", "Milan", "Milano", "Bergamo", "Lombardia", "Lombardy"],
  wenecja: ["Wenecja", "Venice", "Włochy", "Italy"],
  barcelona: ["Barcelona", "Hiszpania", "Spain"],
  lizbona: ["Lizbona", "Lisbon", "Portugalia", "Portugal"],
  aten: ["Ateny", "Athens", "Grecja", "Greece"],
  nowy_jork: ["Nowy Jork", "New York", "USA"],
  tokio: ["Tokio", "Tokyo", "Japonia", "Japan"],
  bangkok: ["Bangkok", "Tajlandia", "Thailand"],
  marrakesz: ["Marrakesz", "Marrakech", "Maroko", "Morocco"],
  marrakech: ["Marrakech", "Marrakesz", "Maroko", "Morocco"],
  agadir: ["Agadir", "Maroko", "Morocco"],
  malta: ["Malta"],
  pafos: ["Pafos", "Paphos", "Cypr", "Cyprus"],
  cypr: ["Cypr", "Cyprus", "Pafos", "Paphos"],
  majorka: ["Majorka", "Mallorca", "Hiszpania", "Spain"],
  sycylia: ["Sycylia", "Sicily", "Włochy", "Italy"],
  korfu: ["Korfu", "Corfu", "Grecja", "Greece"],
  santorini: ["Santorini", "Grecja", "Greece"],
  maderа: ["Madera", "Madeira", "Portugalia", "Portugal"],
  madera: ["Madera", "Madeira", "Portugalia", "Portugal"],
  sardynia: ["Sardynia", "Sardinia", "Włochy", "Italy"],
  porto: ["Porto", "Portugalia", "Portugal"],
  neapol: ["Neapol", "Naples", "Włochy", "Italy"],
  alicante: ["Alicante", "Costa Blanca", "Hiszpania", "Spain"],
  walencja: ["Walencja", "Valencia", "Hiszpania", "Spain"],
  sewilla: ["Sewilla", "Seville", "Hiszpania", "Spain"],
  stambul: ["Stambuł", "Istanbul", "Turcja", "Turkey"],
  istanbul: ["Istanbul", "Stambuł", "Turcja", "Turkey"],
  djerba: ["Djerba", "Dżerba", "Tunezja", "Tunisia"],
  hammamet: ["Hammamet", "Tunezja", "Tunisia"],
  monastir: ["Monastir", "Tunezja", "Tunisia"],
  sousse: ["Sousse", "Tunezja", "Tunisia"],
  hurghada: ["Hurghada", "Egipt", "Egypt"],
  marsa_alam: ["Marsa Alam", "Egipt", "Egypt"],
  sharm_el_sheikh: ["Sharm el Sheikh", "Egipt", "Egypt"],
  kreta: ["Kreta", "Crete", "Grecja", "Greece"],
  rodos: ["Rodos", "Rhodes", "Grecja", "Greece"],
  zakynthos: ["Zakynthos", "Zante", "Grecja", "Greece"],
  teneryfa: ["Teneryfa", "Tenerife", "Hiszpania", "Spain"],
  fuerteventura: ["Fuerteventura", "Hiszpania", "Spain"],
  gran_canaria: ["Gran Canaria", "Hiszpania", "Spain"],
  zanzibar: ["Zanzibar", "Tanzania"],
  dubaj: ["Dubaj", "Dubai", "ZEA", "UAE", "United Arab Emirates"],
  bali: ["Bali", "Indonezja", "Indonesia"],
  gambia: ["Gambia", "The Gambia", "Banjul"],
  kenia: ["Kenia", "Kenya", "Mombasa", "Nairobi"],
  kenya: ["Kenya", "Kenia", "Mombasa", "Nairobi"],
  rpa: ["RPA", "Republika Południowej Afryki", "South Africa", "Kapsztad", "Cape Town"],
  republika_poludniowej_afryki: ["Republika Południowej Afryki", "South Africa", "RPA", "Kapsztad", "Cape Town"],
  south_africa: ["South Africa", "Republika Południowej Afryki", "RPA", "Cape Town", "Kapsztad"],
  oman: ["Oman", "Maskat", "Muscat"],
  maskat: ["Maskat", "Muscat", "Oman"],
  muscat: ["Muscat", "Maskat", "Oman"],
  malezja: ["Malezja", "Malaysia", "Kuala Lumpur", "Langkawi"],
  malaysia: ["Malaysia", "Malezja", "Kuala Lumpur", "Langkawi"],
  kuala_lumpur: ["Kuala Lumpur", "Malezja", "Malaysia"],
  langkawi: ["Langkawi", "Malezja", "Malaysia"],
};

function expandSearchTerms(rawTerms: string[]) {
  const expanded: string[] = [];
  for (const raw of rawTerms) {
    const key = normalize(raw).replace(/ /g, "_");
    expanded.push(raw);
    if (SEARCH_ALIASES[key]) expanded.push(...SEARCH_ALIASES[key]);
  }
  return Array.from(new Set(expanded)).slice(0, 40);
}

const FLAGS: Record<string, string> = {
  polska: "🇵🇱",
  egipt: "🇪🇬",
  tunezja: "🇹🇳",
  turcja: "🇹🇷",
  grecja: "🇬🇷",
  hiszpania: "🇪🇸",
  cypr: "🇨🇾",
  malta: "🇲🇹",
  bulgaria: "🇧🇬",
  bułgaria: "🇧🇬",
  maroko: "🇲🇦",
  portugalia: "🇵🇹",
  albania: "🇦🇱",
  wlochy: "🇮🇹",
  włochy: "🇮🇹",
  austria: "🇦🇹",
  wegry: "🇭🇺",
  węgry: "🇭🇺",
  czechy: "🇨🇿",
};

function normalize(value: string | undefined | null) {
  return (value || "")
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalCountryForDestination(city: string, rawCountry: string) {
  const destination = normalize(city);
  if (!destination) return rawCountry;

  const rules: Array<[RegExp, string]> = [
    [/\b(neapol|napoli|bergamo|rzym|roma|rome|bari|taormina|katania|catania|sycylia|sicilia|kalabria|calabria|mediolan|milan|milano|wenecja|venezia|florencja|firenze|bolonia|bologna|piza|pisa|rimini)\b/, "Włochy"],
    [/\b(alicante|malaga|barcelona|sewilla|sevilla|madryt|madrid|walencja|valencia|majorka|mallorca|teneryfa|tenerife|fuerteventura|gran canaria|lanzarote)\b/, "Hiszpania"],
    [/\b(wieden|vienna|salzburg|innsbruck)\b/, "Austria"],
    [/\b(porto|lizbona|lisboa|madera|madeira|funchal)\b/, "Portugalia"],
    [/\b(malta|valletta|sliema|st julian|saint julian)\b/, "Malta"],
    [/\b(ateny|athens|kreta|crete|rodos|rhodes|santorini|korfu|corfu|kos|zakynthos)\b/, "Grecja"],
    [/\b(pafos|paphos|larnaka|larnaca|protaras|ayia napa)\b/, "Cypr"],
    [/\b(budapeszt|budapest)\b/, "Węgry"],
    [/\b(praga|prague)\b/, "Czechy"],
    [/\b(marrakesz|marrakech|agadir)\b/, "Maroko"],
    [/\b(stambul|istanbul|antalya|alanya|side|bodrum|marmaris)\b/, "Turcja"],
  ];

  for (const [pattern, country] of rules) {
    if (pattern.test(destination)) return country;
  }
  return rawCountry;
}

function inferDepartureAirportCode(value: string | undefined | null) {
  const n = normalize(value);
  if (!n) return "";
  if (/\bwmi\b|modlin/.test(n)) return "WMI";
  if (/\brdo\b|radom/.test(n)) return "RDO";
  if (/\bwaw\b|chopin|okecie/.test(n)) return "WAW";
  if (/\bkrk\b|krakow|balice/.test(n)) return "KRK";
  if (/\bktw\b|katowice|pyrzowice/.test(n)) return "KTW";
  if (/\bgdn\b|gdansk|rebiechowo/.test(n)) return "GDN";
  if (/\bwro\b|wroclaw|strachowice/.test(n)) return "WRO";
  if (/\bpoz\b|poznan|lawica/.test(n)) return "POZ";
  if (/\brze\b|rzeszow|jasionka/.test(n)) return "RZE";
  if (/\bluz\b|lublin|swidnik/.test(n)) return "LUZ";
  if (/\bszz\b|szczecin|goleniow/.test(n)) return "SZZ";
  if (/\blcj\b|lodz|lublinek/.test(n)) return "LCJ";
  if (/\bbzg\b|bydgoszcz/.test(n)) return "BZG";
  if (/\bszy\b|olsztyn|mazury|szymany/.test(n)) return "SZY";
  if (/\bieg\b|zielona gora|babimost/.test(n)) return "IEG";
  if (/warszawa/.test(n)) return "WAW";
  return "";
}

function fieldMap(product: TdProduct) {
  return Object.fromEntries(
    (product.fields || [])
      .filter((field) => field.name)
      .map((field) => [field.name as string, field.value || ""])
  );
}

function dailyKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now).reduce<Record<string, string>>((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  const date = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  if (Number(parts.hour) < 6) date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function hash(text: string) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function shuffle<T>(items: T[], seedText: string) {
  let seed = hash(seedText) || 1;
  const out = [...items];
  const random = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function parseDate(value: string | undefined) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
  }
  const [day, month, year] = value.split(".").map(Number);
  if (!day || !month || !year) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function decodeTrackedDestination(tracked: string | undefined) {
  if (!tracked) return null;
  try {
    const url = new URL(tracked);
    const embedded = url.searchParams.get("url");
    if (embedded) return new URL(embedded);
    if (["www.exim.pl", "exim.pl"].includes(url.hostname)) return url;
  } catch { /* Legacy TradeDoubler url(...) wrapper below. */ }
  const match = tracked.match(/url\((.+)\)$/);
  if (!match?.[1]) return null;
  try {
    return new URL(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function boardFromEximUrl(url: string | undefined) {
  const destination = decodeTrackedDestination(url);
  const value = (destination?.searchParams.get("DI") || "").toUpperCase();
  if (value.includes("AI")) return "All Inclusive";
  if (value.includes("BB")) return "Śniadanie";
  if (value.includes("HB")) return "2 posiłki";
  if (value.includes("FB")) return "3 posiłki";
  if (value.includes("AO") || value.includes("RO")) return "Bez wyżywienia";
  return "Wyżywienie wg oferty";
}

function countryFlag(country: string) {
  return FLAGS[normalize(country)] || "🌍";
}

function tagFor(price: number, board: string): Offer["tag"] {
  if (price <= 1600) return "BIERZEMY";
  if (price <= 2300) return "OKAZJA";
  return "DOBRA OPCJA";
}

function scoreFor(price: number, rating: number, board: string, daysOut: number) {
  let score = 7.4;
  if (price <= 1500) score += 1.0;
  else if (price <= 2200) score += 0.6;
  else if (price <= 3000) score += 0.25;
  if (rating >= 4) score += 0.35;
  if (/all inclusive/i.test(board)) score += 0.25;
  if (daysOut <= 45) score += 0.2;
  return Math.min(9.8, Math.round(score * 10) / 10);
}

function reasonFor(provider: Provider, price: number, nights: number, board: string) {
  const boardText = /all inclusive/i.test(board) ? " z All Inclusive" : "";
  return `${nights} nocy${boardText} w cenie od ${price.toLocaleString("pl-PL")} zł/os.`;
}

async function fetchProducts(provider: "exim" | "tui", query: string, token: string, pages = 1) {
  const fid = provider === "exim" ? 103442 : 24864;
  // TradeDoubler's generated Product Feed endpoints use one-based page numbers.
  // Keep the matrix parameters aligned with the official API examples and sort at source.
  const results = await Promise.allSettled(Array.from({ length: pages }, async (_, pageIndex) => {
    const page = pageIndex + 1;
    const path = `https://api.tradedoubler.com/1.0/products.json;fid=${fid};q=${encodeURIComponent(query)};orderBy=priceAsc;page=${page};pageSize=100?token=${encodeURIComponent(token)}`;
    const response = await fetch(path, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error(`${provider.toUpperCase()} feed ${response.status}`);
    const data = await response.json();
    return Array.isArray(data?.products) ? (data.products as TdProduct[]) : [];
  }));
  if (results.every(result => result.status === "rejected")) {
    const firstFailure = results.find((result) => result.status === "rejected");
    if (firstFailure?.status === "rejected" && firstFailure.reason instanceof Error) throw firstFailure.reason;
    throw new Error(`${provider.toUpperCase()} feed unavailable`);
  }
  return results.flatMap(result => result.status === "fulfilled" ? result.value : []);
}

function fromExim(product: TdProduct): LiveCandidate | null {
  const fields = fieldMap(product);
  const offer = product.offers?.[0];
  const productUrl = offer?.productUrl || offer?.legacyProductUrl;
  if (!productUrl) return null;

  const rawTotal = Number(fields.BestPrice || fields.SalePrice || offer?.priceHistory?.[0]?.price?.value || 0);
  if (!Number.isFinite(rawTotal) || rawTotal <= 0) return null;

  const destinationUrl = decodeTrackedDestination(productUrl);
  const adults = Math.max(1, Number(destinationUrl?.searchParams.get("AC1") || 2));
  const nights = Math.max(1, Number(destinationUrl?.searchParams.get("NN") || 7));
  const price = Math.round(rawTotal / adults);
  if (!Number.isFinite(price) || price <= 0) return null;

  const destinationAddress = fields.DestinationAddress || product.description || "";
  const addressParts = destinationAddress.split(";").map((value) => value.trim()).filter(Boolean);
  const city = fields.DestinationName || addressParts[0] || product.name || "Wakacje";
  const rawCountry = addressParts.at(-1) || product.description?.split(",").at(0)?.trim() || "";
  const country = canonicalCountryForDestination(city, rawCountry);
  const board = boardFromEximUrl(productUrl);
  const departure = fields.Departue || fields.Departure || fields.DepartureCity || "Polska";
  const departureDate = destinationUrl?.searchParams.get("DD") ? new Date(`${destinationUrl.searchParams.get("DD")}T00:00:00Z`) : null;
  const returnDate = destinationUrl?.searchParams.get("RD") ? new Date(`${destinationUrl.searchParams.get("RD")}T00:00:00Z`) : null;
  const daysOut = departureDate ? Math.max(0, Math.round((departureDate.getTime() - Date.now()) / 86400000)) : 120;
  const rating = Number(fields.Stars || 0);
  const modifiedAt = Number(offer?.modified || 0);
  const sourceKey = `${offer?.sourceProductId || ""}:${productUrl}`;

  if (departureDate) {
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    if (departureDate.getTime() < todayUtc.getTime()) return null;
  }

  return {
    id: 1_000_000 + (hash(`exim:${sourceKey}`) % 800_000_000),
    flag: countryFlag(country),
    city,
    country,
    price,
    priceCheckedAt: new Date().toISOString(),
    availabilityStatus: "available",
    departure,
    airportCode: inferDepartureAirportCode(departure),
    nights,
    weather: "sprawdź",
    score: scoreFor(price, rating, board, daysOut),
    tag: tagFor(price, board),
    reason: reasonFor("exim", price, nights, board),
    image: product.productImage?.url || "/images/destinations/djerba.jpg",
    category: nights <= 5 ? ["city", "weekend", "exim", "transfer"] : ["wakacje", /all inclusive/i.test(board) ? "allinclusive" : "plaza"],
    hotel: product.name || "Hotel",
    board,
    dates: departureDate && returnDate ? `${formatDate(departureDate)}–${formatDate(returnDate)}` : "najbliższy dostępny termin",
    partner: "exim",
    affiliateUrl: productUrl,
    linkType: "exact",
    linkMatch: "exact",
    transferIncluded: true,
    provider: "exim",
    modifiedAt: modifiedAt || Date.now(),
    sourceKey,
    startDateISO: departureDate ? departureDate.toISOString().slice(0, 10) : undefined,
    endDateISO: returnDate ? returnDate.toISOString().slice(0, 10) : undefined,
  };
}

function fromTui(product: TdProduct): LiveCandidate | null {
  const fields = fieldMap(product);
  const offer = product.offers?.[0];
  const productUrl = offer?.productUrl || offer?.legacyProductUrl;
  if (!productUrl) return null;

  const rawPrice = Number(offer?.priceHistory?.[0]?.price?.value || 0);
  if (!Number.isFinite(rawPrice) || rawPrice <= 0) return null;
  const price = Math.round(rawPrice);
  if (!Number.isFinite(price) || price <= 0) return null;

  const city = fields.Region || fields.City || product.name || "Wakacje";
  const country = canonicalCountryForDestination(city, fields.Country || "");
  const nights = Math.max(1, Number(fields.Duration || 7));
  const board = fields.ServiceDescription || product.description || "Wyżywienie wg oferty";
  const departure = fields.DepartureCity || fields.DeparturePlace || "Polska";
  const departureDate = parseDate(fields.DepartureDate);
  const returnDate = departureDate ? addDays(departureDate, nights) : null;
  const daysOut = departureDate ? Math.max(0, Math.round((departureDate.getTime() - Date.now()) / 86400000)) : 120;
  const rating = Number(fields.Rating || 0);
  const modifiedAt = Number(offer?.modified || 0);
  const sourceKey = `${offer?.sourceProductId || ""}:${productUrl}`;

  if (departureDate) {
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    if (departureDate.getTime() < todayUtc.getTime()) return null;
  }

  return {
    id: 1_000_000 + (hash(`tui:${sourceKey}`) % 800_000_000),
    flag: countryFlag(country),
    city,
    country,
    price,
    priceCheckedAt: new Date().toISOString(),
    availabilityStatus: "available",
    departure,
    airportCode: inferDepartureAirportCode(fields.DeparturePlace || departure),
    nights,
    weather: "sprawdź",
    score: scoreFor(price, rating, board, daysOut),
    tag: tagFor(price, board),
    reason: reasonFor("tui", price, nights, board),
    image: product.productImage?.url || "/images/destinations/rodos.jpg",
    category: ["wakacje", /all inclusive/i.test(board) ? "allinclusive" : "plaza"],
    hotel: fields.HotelName || product.name || "Hotel",
    board,
    dates: departureDate && returnDate ? `${formatDate(departureDate)}–${formatDate(returnDate)}` : "najbliższy dostępny termin",
    partner: "tui",
    affiliateUrl: productUrl,
    linkType: "exact",
    linkMatch: "exact",
    provider: "tui",
    modifiedAt: modifiedAt || Date.now(),
    sourceKey,
    startDateISO: departureDate ? departureDate.toISOString().slice(0, 10) : undefined,
    endDateISO: returnDate ? returnDate.toISOString().slice(0, 10) : undefined,
  };
}

function departurePriority(offer: LiveCandidate) {
  const haystack = normalize(`${offer.departure} ${offer.airportCode}`);
  if (/\bwaw\b|warszawa|chopin/.test(haystack)) return 3;
  if (/\bwmi\b|modlin/.test(haystack)) return 3;
  if (/\bkrk\b|krakow|balice/.test(haystack)) return 3;
  return 0;
}

function destinationKey(offer: LiveCandidate) {
  return touristDestinationKey(offer);
}

function countryLimit(offer: LiveCandidate) {
  const country = normalize(offer.country);
  if (/^malta$/.test(country)) return 1;
  return 2;
}

function dealValue(offer: LiveCandidate) {
  let value = offer.score * 100 - offer.price / 20;
  value += departurePriority(offer) * 90;
  if (offer.nights >= 7) value += 35;
  if (/all inclusive/i.test(offer.board)) value += 30;
  if (offer.price <= 1800) value += 45;
  if (offer.price <= 1300) value += 30;
  return value;
}

function continentFor(offer: LiveCandidate) {
  const text = normalize(`${offer.country} ${offer.city}`);
  if (/wietnam|bali|indonez|tajland|sri lanka|malediw|japon|dubaj|zea|emiraty|azja/.test(text)) return "asia";
  if (/maroko|egipt|tunez|djerba|zanzibar|kenia|mauritius|gambia|seszel|zielonego przyladka|afryka/.test(text)) return "africa";
  if (/dominikan|meksyk|kuba|jamaj|usa|nowy jork|floryda|brazyl|kolumbi|peru|kostaryk|ameryk/.test(text)) return "americas";
  return "europe";
}

function hasConcreteDates(offer: LiveCandidate) {
  return Boolean(offer.dates && !/najbliższy dostępny termin/i.test(offer.dates));
}

function tripLengthMatches(offer: LiveCandidate) {
  const continent = continentFor(offer);
  if (continent === "europe") return offer.nights >= 2 && offer.nights <= 8;
  return offer.nights >= 7 && offer.nights <= 14;
}

function candidateMatchesSingleQuery(offer: LiveCandidate, query: string) {
  const primary = normalize(query);
  if (!primary) return true;

  const haystack = normalize(`${offer.city} ${offer.country} ${offer.hotel}`);
  if (haystack.includes(primary)) return true;

  // Milan city-break searches should also include the practical Milan gateway area.
  // Bergamo is a common low-cost airport/base for Milan trips, while broad "Italy"
  // matching produced unrelated destinations.
  if (primary === "mediolan" || primary === "milan" || primary === "milano") {
    return /\b(mediolan|milan|milano|bergamo|lombardi|lombardy)\b/.test(haystack);
  }

  const queryGroup = touristDestinationKey({ city: primary, country: "" });
  if (!queryGroup.includes("|") && queryGroup === touristDestinationKey(offer)) return true;

  return normalize(offer.country) === primary;
}

function candidateMatchesQuery(offer: LiveCandidate, query: string) {
  const parts = query
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!parts.length) return true;

  // Labels such as "Mediolan, Włochy" describe one destination, not two
  // independent alternatives. The previous OR logic let any offer from
  // Italy through, which is why searches for Milan/Bergamo returned Calabria.
  const [primary, ...context] = parts;
  if (!candidateMatchesSingleQuery(offer, primary)) return false;
  if (!context.length) return true;

  const haystack = normalize(`${offer.city} ${offer.country} ${offer.hotel}`);
  return context.every((item) => {
    const normalized = normalize(item);
    return !normalized || haystack.includes(normalized) || normalize(offer.country) === normalized;
  });
}

function safeIsoDate(value: string | null) {
  return value && /^20\d{2}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function offerEndDateISO(offer: LiveCandidate) {
  if (offer.endDateISO && /^20\d{2}-\d{2}-\d{2}$/.test(offer.endDateISO)) return offer.endDateISO;
  if (!offer.startDateISO || !/^20\d{2}-\d{2}-\d{2}$/.test(offer.startDateISO)) return "";
  const start = new Date(`${offer.startDateISO}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) return "";
  return addDays(start, Math.max(1, offer.nights || 1)).toISOString().slice(0, 10);
}

function dateWindowMatches(offer: LiveCandidate, start: string, end: string) {
  if (!start && !end) return true;
  if (!offer.startDateISO) return false;
  const offerEnd = offerEndDateISO(offer) || offer.startDateISO;
  if (start && offer.startDateISO < start) return false;
  if (end && offerEnd > end) return false;
  return true;
}

function dateWindowDistance(offer: LiveCandidate, start: string, end: string) {
  if (!start && !end) return 0;
  if (!offer.startDateISO) return Number.POSITIVE_INFINITY;
  const offerEnd = offerEndDateISO(offer) || offer.startDateISO;
  const dayMs = 86400000;
  if (start && offer.startDateISO < start) {
    return Math.round((Date.parse(`${start}T00:00:00Z`) - Date.parse(`${offer.startDateISO}T00:00:00Z`)) / dayMs);
  }
  if (end && offerEnd > end) {
    return Math.round((Date.parse(`${offerEnd}T00:00:00Z`) - Date.parse(`${end}T00:00:00Z`)) / dayMs);
  }
  return 0;
}

function selectDailyDiversified(candidates: LiveCandidate[], _key: string, limit = 36) {
  return cheapestPerDestination(candidates.filter(isPromotableOffer))
    .sort((a, b) => a.price - b.price || b.score - a.score).slice(0, limit);
}

function cheapestPerDestination(candidates: LiveCandidate[]) {
  return selectCheapestPerDestination(candidates, {
    mode: "live",
    tieBreak: (candidate, current) => departurePriority(candidate) - departurePriority(current),
  });
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key") || dailyKey();
  const requestedMode = request.nextUrl.searchParams.get("mode");
  const mode = requestedMode === "citybreak" ? "citybreak" : requestedMode === "search" ? "search" : requestedMode === "surprise" ? "surprise" : requestedMode === "newyear" ? "newyear" : "daily";
  const query = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 80);
  const budget = Math.max(500, Math.min(10000, Number(request.nextUrl.searchParams.get("budget") || 2500)));
  const destinationOverview = request.nextUrl.searchParams.get("view") === "destinations";
  const minNights = Math.max(0, Number(request.nextUrl.searchParams.get("minNights") || 0));
  const maxNights = Math.max(0, Number(request.nextUrl.searchParams.get("maxNights") || 0));
  const strictSearch = request.nextUrl.searchParams.get("strict") === "1";
  const broadSearch = request.nextUrl.searchParams.get("broad") === "1";
  const airportHub = request.nextUrl.searchParams.get("hub") === "1";
  const providerParam = request.nextUrl.searchParams.get("provider");
  const providerOnly: Provider | null = providerParam === "exim" || providerParam === "tui" || providerParam === "esky" ? providerParam : null;
  const departureFilter = (request.nextUrl.searchParams.get("from") || "").trim();
  const nightsFilter = (request.nextUrl.searchParams.get("nights") || "any").trim();
  const boardFilter = (request.nextUrl.searchParams.get("board") || "any").trim();
  const weekendOnly = request.nextUrl.searchParams.get("weekend") === "1";
  const lastMinuteOnly = request.nextUrl.searchParams.get("lastMinute") === "1";
  const minPrice = Math.max(0, Number(request.nextUrl.searchParams.get("minPrice") || 0));
  const maxPrice = Math.max(0, Number(request.nextUrl.searchParams.get("maxPrice") || 0));
  const startDateFilter = safeIsoDate(request.nextUrl.searchParams.get("start"));
  const endDateFilter = safeIsoDate(request.nextUrl.searchParams.get("end"));
  const dateKind = (request.nextUrl.searchParams.get("dateKind") || "").trim();
  const rescueMode = (request.nextUrl.searchParams.get("rescue") || "").trim();
  const fastMode = request.nextUrl.searchParams.get("fast") === "1";
  const skipEsky = request.nextUrl.searchParams.get("skipEsky") === "1";
  const eximToken = process.env.TRADEDOUBLER_EXIM_TOKEN || process.env.TRADEDOUBLER_TOKEN || process.env.TRADEDOUBLER_TUI_TOKEN;
  const tuiToken = process.env.TRADEDOUBLER_TUI_TOKEN || process.env.TRADEDOUBLER_TOKEN;
  let eskyStatus: { partial: boolean; error?: string; searchUrl?: string; hasMore?: boolean } = { partial: false };
  const feedStatus: Record<"exim" | "tui", { configured: boolean; attempted: number; succeeded: number; failed: number; error?: string }> = {
    exim: { configured: Boolean(eximToken), attempted: 0, succeeded: 0, failed: 0 },
    tui: { configured: Boolean(tuiToken), attempted: 0, succeeded: 0, failed: 0 },
  };

  try {
    const eskyPromise = !skipEsky && (!providerOnly || providerOnly === "esky")
      ? fetchEskyPackages({ query, departure: departureFilter, cityBreak: mode === "citybreak", nights: nightsFilter,
          minNights, maxNights, start: startDateFilter, end: endDateFilter, minPrice, maxPrice, timeoutMs: fastMode ? 7_000 : undefined })
      : Promise.resolve({ offers: [], partial: false });
    const searchTerms = query
      ? expandSearchTerms(
          query
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 6)
        )
      : [];
    const terms = rescueMode === "full"
      ? BROAD_SEARCH_TERMS
      : rescueMode === "1"
        ? BROAD_SEARCH_TERMS.slice(0, 18)
      : mode === "search" && query
      ? searchTerms
      : mode === "search" && airportHub
        ? AIRPORT_HUB_TERMS
      : mode === "search" && broadSearch
        ? BROAD_CORE_TERMS
      : mode === "citybreak"
        ? (query ? searchTerms : fastMode ? CITY_BREAK_FAST_TERMS : CITY_BREAK_TERMS)
        : mode === "surprise"
          ? shuffle(budget >= 3500 ? SURPRISE_TERMS.high : budget >= 1800 ? SURPRISE_TERMS.mid : SURPRISE_TERMS.low, `surprise:${key}:${budget}`).slice(0, 12)
          : mode === "newyear"
            ? NEW_YEAR_SEARCH_TERMS
          : mode === "search"
            ? BROAD_CORE_TERMS
            : BROAD_CORE_TERMS;
    const searchPages = fastMode ? 1 : mode === "search" || mode === "citybreak" ? (query ? 3 : 2) : 1;
    const jobs: Array<() => Promise<{ provider: Provider; products: TdProduct[] }>> = [];

    for (const term of terms) {
      if (eximToken && (!providerOnly || providerOnly === "exim")) {
        jobs.push(async () => {
          feedStatus.exim.attempted++;
          try {
            const products = await fetchProducts("exim", term, eximToken, searchPages);
            feedStatus.exim.succeeded++;
            return { provider: "exim" as const, products };
          } catch (error) {
            feedStatus.exim.failed++;
            if (!feedStatus.exim.error) feedStatus.exim.error = error instanceof Error ? error.message.slice(0, 120) : "feed_unavailable";
            throw error;
          }
        });
      }
      if (tuiToken && (!providerOnly || providerOnly === "tui")) {
        jobs.push(async () => {
          feedStatus.tui.attempted++;
          try {
            const products = await fetchProducts("tui", term, tuiToken, searchPages);
            feedStatus.tui.succeeded++;
            return { provider: "tui" as const, products };
          } catch (error) {
            feedStatus.tui.failed++;
            if (!feedStatus.tui.error) feedStatus.tui.error = error instanceof Error ? error.message.slice(0, 120) : "feed_unavailable";
            throw error;
          }
        });
      }
    }

    const candidates: LiveCandidate[] = [];
    const batchSize = mode === "citybreak" ? (fastMode ? 8 : 12) : 8;
    let successfulFeeds = 0;
    let failedFeeds = 0;
    const feedDeadline = Date.now() + (fastMode ? 9_000 : 42_000);
    for (let index = 0; index < jobs.length; index += batchSize) {
      if (Date.now() >= feedDeadline) { failedFeeds += jobs.length - index; break; }
      const settled = await Promise.allSettled(jobs.slice(index, index + batchSize).map((job) => job()));
      for (const item of settled) {
        if (item.status !== "fulfilled") { failedFeeds++; continue; }
        successfulFeeds++;
        for (const product of item.value.products) {
          for (const variant of product.offers || []) {
            try {
              const row = { ...product, offers: [variant] };
              const candidate = item.value.provider === "exim" ? fromExim(row) : fromTui(row);
              if (candidate) candidates.push(candidate);
            } catch {
              // A malformed variant must not discard the rest of the product.
            }
          }
        }
      }
    }

    const esky = await eskyPromise;
    eskyStatus = esky;
    candidates.push(...esky.offers);
    if (!successfulFeeds && !esky.offers.length && (esky.partial || skipEsky || providerOnly === "exim" || providerOnly === "tui")) throw new Error("Źródła ofert chwilowo nie odpowiadają. Spróbuj ponownie.");

    const unique = new Map<string, LiveCandidate>();
    for (const candidate of candidates) {
      const keyValue = `${candidate.provider}:${candidate.sourceKey}`;
      const previous = unique.get(keyValue);
      if (!previous || candidate.price < previous.price) unique.set(keyValue, candidate);
    }

    const rawCandidates = Array.from(unique.values()).filter(isAffordableShortTrip)
      .filter(offer => isTravelDestinationAllowed(offer.city, offer.country));
    const allCandidates = query && (mode === "search" || mode === "citybreak")
      ? rawCandidates.filter((offer) => candidateMatchesQuery(offer, query))
      : rawCandidates;

    const departureMatches = (offer: LiveCandidate) => {
      const haystack = normalize(`${offer.departure} ${offer.airportCode}`);
      if (!departureFilter) {
        return /polska|warszawa|chopin|okecie|modlin|radom|krakow|balice|katowice|pyrzowice|gdansk|rebiechowo|wroclaw|strachowice|poznan|lawica|rzeszow|jasionka|lodz|lublinek|lublin|swidnik|szczecin|goleniow|bydgoszcz|zielona gora|babimost|olsztyn|mazury|szymany|\bwaw\b|\bwmi\b|\brdo\b|\bkrk\b|\bktw\b|\bgdn\b|\bwro\b|\bpoz\b|\brze\b|\blcj\b|\bluz\b|\bszz\b|\bbzg\b|\bieg\b|\bszy\b/.test(haystack);
      }
      const codes = departureFilter
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean);

      return codes.some((code) => {
        if (code === "WAWA") return !/radom|\brdo\b/.test(haystack) && /warszawa|chopin|okecie|modlin|\bwaw\b|\bwmi\b/.test(haystack);
        if (code === "WAW") return /chopin|okecie|\bwaw\b/.test(haystack) || (/warszawa/.test(haystack) && !/modlin|radom|\bwmi\b|\brdo\b/.test(haystack));
        if (code === "WMI") return /modlin|\bwmi\b/.test(haystack);
        if (code === "KRK") return /krakow|balice|\bkrk\b/.test(haystack);
        if (code === "KTW") return /katowice|pyrzowice|\bktw\b/.test(haystack);
        if (code === "GDN") return /gdansk|rebiechowo|\bgdn\b/.test(haystack);
        if (code === "WRO") return /wroclaw|strachowice|\bwro\b/.test(haystack);
        if (code === "POZ") return /poznan|lawica|\bpoz\b/.test(haystack);
        if (code === "RZE") return /rzeszow|jasionka|\brze\b/.test(haystack);
        if (code === "LCJ") return /lodz|lublinek|\blcj\b/.test(haystack);
        if (code === "LUZ") return /lublin|swidnik|\bluz\b/.test(haystack);
        if (code === "SZZ") return /szczecin|goleniow|\bszz\b/.test(haystack);
        if (code === "BZG") return /bydgoszcz|\bbzg\b/.test(haystack);
        if (code === "IEG") return /zielona gora|babimost|\bieg\b/.test(haystack);
        return false;
      });
    };
    const nightsMatches = (offer: LiveCandidate) => {
      if (minNights && offer.nights < minNights) return false;
      if (maxNights && offer.nights > maxNights) return false;
      if (/^\d+$/.test(nightsFilter)) return offer.nights === Number(nightsFilter);
      const range = /^(\d+)-(\d+)$/.exec(nightsFilter);
      if (range) {
        const min = Math.min(Number(range[1]), Number(range[2]));
        const max = Math.max(Number(range[1]), Number(range[2]));
        return offer.nights >= min && offer.nights <= max;
      }
      if (nightsFilter === "15+") return offer.nights >= 15;
      return true;
    };
    const boardMatches = (offer: LiveCandidate) => {
      if (boardFilter === "any") return true;
      const value = normalize(offer.board);
      if (boardFilter === "allinclusive") return /all[ -]?inclusive/.test(value) && !/ultra/.test(value);
      if (boardFilter === "ultraallinclusive") return /ultra all|ultraall/.test(value);
      if (boardFilter === "breakfast") return /sniad|breakfast|\bbb\b/.test(value);
      if (boardFilter === "halfboard") return /half board|\bhb\b|2 posil|sniad.*obiad|sniad.*kolac/.test(value);
      if (boardFilter === "fullboard") return /full board|\bfb\b|3 posil|pelne wyzywienie/.test(value);
      if (boardFilter === "roomonly") return /bez wyzywienia|room only|self catering|no meals|wlasne|aneks/.test(value);
      return true;
    };

    const weekendMatches = (offer: LiveCandidate) => {
      if (!weekendOnly) return true;
      if (!offer.startDateISO || !offer.nights) return false;

      const start = new Date(`${offer.startDateISO}T00:00:00Z`);
      if (Number.isNaN(start.getTime())) return false;

      for (let offset = 0; offset < offer.nights; offset += 1) {
        const day = new Date(start);
        day.setUTCDate(start.getUTCDate() + offset);
        if (day.getUTCDay() === 6 && offset + 1 <= offer.nights) return true;
      }
      return false;
    };

    const withinBudget = (offer: LiveCandidate) => (!minPrice || offer.price >= minPrice) && (!maxPrice || offer.price <= maxPrice);
    const budgetCandidates = allCandidates.filter(withinBudget);
    const departureDateMatches = (offer: LiveCandidate) => {
      if (!startDateFilter && !endDateFilter) return true;
      if (!offer.startDateISO) return false;
      if (startDateFilter && offer.startDateISO < startDateFilter) return false;
      if (endDateFilter && offer.startDateISO > endDateFilter) return false;
      return true;
    };
    const dateCandidates = (startDateFilter || endDateFilter)
      ? budgetCandidates.filter((offer) =>
          dateKind === "departure"
            ? departureDateMatches(offer)
            : dateWindowMatches(offer, startDateFilter, endDateFilter)
        )
      : budgetCandidates;

    const lastMinuteMatches = (offer: LiveCandidate) => {
      if (!lastMinuteOnly) return true;
      if (!offer.startDateISO) return false;
      const start = new Date(offer.startDateISO + "T00:00:00Z").getTime();
      if (!Number.isFinite(start)) return false;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const daysOut = Math.round((start - today.getTime()) / 86400000);
      return daysOut >= 0 && daysOut <= 30;
    };

    const exactPool = dateCandidates.filter((offer) =>
          departureMatches(offer) &&
          nightsMatches(offer) &&
          boardMatches(offer) &&
          weekendMatches(offer) &&
          lastMinuteMatches(offer)
        );

    let pool = exactPool;
    let notice = rescueMode
      ? "Pokazujemy najlepsze aktualne oferty dostępne teraz w naszych feedach."
      : query && !allCandidates.length
        ? `Nie znaleźliśmy teraz potwierdzonej oferty dla: ${query}.`
        : (minPrice || maxPrice) && allCandidates.length > 0 && !budgetCandidates.length
          ? "Nie mamy teraz potwierdzonych ofert w wybranym budżecie. Zmień zakres ceny, żeby zobaczyć więcej opcji."
        : (startDateFilter || endDateFilter) && !dateCandidates.length
          ? dateKind === "departure"
            ? "Nie mamy teraz potwierdzonej oferty z wylotem w wybranym zakresie dat. Nie pokazujemy ofert z innych terminów jako rzekomego dopasowania."
            : "Nie mamy teraz potwierdzonej oferty mieszczącej się w całym wybranym zakresie dat. Nie pokazujemy ofert z innych miesięcy jako rzekomego dopasowania."
          : "";

    if (!strictSearch && (mode === "search" || mode === "citybreak")) {
      if (!pool.length && boardFilter !== "any") {
        pool = dateCandidates.filter((offer) =>
          departureMatches(offer) &&
          nightsMatches(offer) &&
          weekendMatches(offer) &&
          lastMinuteMatches(offer)
        );
        if (pool.length) notice = "Brak ofert z wybranym wyżywieniem — pokazujemy inne wyżywienie, ale nadal tylko w wybranym terminie.";
      }

      if (!pool.length && nightsFilter !== "any") {
        pool = dateCandidates.filter((offer) =>
          departureMatches(offer) &&
          weekendMatches(offer) &&
          lastMinuteMatches(offer)
        );
        if (pool.length) notice = "Brak ofert dla dokładnej długości pobytu — pokazujemy inne długości, ale nadal tylko w wybranym terminie.";
      }

      if (!pool.length && weekendOnly) {
        pool = dateCandidates.filter((offer) => departureMatches(offer) && lastMinuteMatches(offer));
        if (pool.length) notice = "Nie znaleźliśmy wyjazdu obejmującego weekend — pokazujemy dostępne opcje z tego samego zakresu dat.";
      }

      if (!pool.length && departureFilter) {
        notice = "Brak potwierdzonych ofert z wybranych lotnisk w tym terminie. Zmień lotnisko albo wybierz „Wszystkie lotniska”.";
      }
    }

    pool = rankSearchOffers(pool, Number.MAX_SAFE_INTEGER);
    const cheapestDestinations = cheapestPerDestination(pool);
    const dailyLengthPool = cheapestDestinations.filter((offer) => hasConcreteDates(offer) && isPromotableOffer(offer));

    // Short city breaks must remain affordable, even when a destination has only expensive stock.
    const cityBreakPool = pool.filter(offer => offer.nights >= 2 && offer.nights <= 5 && offer.price <= 2000 && hasConcreteDates(offer));
    const selected = mode === "newyear"
      ? cheapestPerDestination(
          pool.filter((offer) => {
            if (!offer.startDateISO || !isPromotableOffer(offer)) return false;
            const start = offer.startDateISO;
            return start >= "2026-12-26" && start <= "2027-01-02" && offer.nights >= 3 && offer.nights <= 12;
          })
        )
          .sort((a, b) => a.price - b.price)
          .slice(0, 30)
      : mode === "citybreak"
        ? (destinationOverview ? cheapestPerDestination(cityBreakPool) : cityBreakPool)
            .sort((a, b) => a.price - b.price || b.score - a.score)

      : mode === "search"
        ? [...pool]
            .sort((a,b) => a.price - b.price || b.score - a.score)
        : mode === "surprise"
          ? cheapestDestinations
              .filter((offer) => offer.price <= budget && isPromotableOffer(offer))
              .sort((a,b) => a.price - b.price || b.score - a.score)
              .slice(0, 12)
          : selectDailyDiversified(dailyLengthPool, key, 60);

    const validEmptySearch = true;

    return NextResponse.json(
      {
        ok: selected.length > 0 || validEmptySearch,
        key,
        mode,
        checkedAt: new Date().toISOString(),
        sourceCount: pool.length,
        partial: failedFeeds > 0 || esky.partial,
        sourceStatus: { esky: eskyStatus, exim: feedStatus.exim, tui: feedStatus.tui, feedsFailed: failedFeeds },
        providers: Array.from(new Set(pool.map(offer => offer.provider))),
        coverage: "available_feed_results",
        sourceType: "live",
        exactSourceCount: exactPool.length,
        destinationCount: cheapestDestinations.length,
        notice: [notice, (failedFeeds || esky.partial) ? "Pokazujemy dostępne wyniki źródeł; lista może nie obejmować całego katalogu partnerów." : ""].filter(Boolean).join(" "),
        offers: selected,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    const hasExactDateConstraint = Boolean(startDateFilter || endDateFilter || weekendOnly || lastMinuteOnly || mode === "newyear");

    const queryParts = query
      .split(",")
      .map((item) => normalize(item))
      .filter(Boolean);

    const queryMatches = (offer: Offer) => {
      if (!queryParts.length) return true;
      const haystack = normalize(`${offer.city} ${offer.country} ${offer.hotel}`);
      const [primary, ...context] = queryParts;
      const aliasKey = primary.replace(/ /g, "_");
      const aliases = SEARCH_ALIASES[aliasKey] || [primary];
      const primaryMatch = aliases.some((alias) => haystack.includes(normalize(alias)));
      if (!primaryMatch) return false;
      return context.every((part) => haystack.includes(part));
    };

    const departureMatchesFallback = (offer: Offer) => {
      if (!departureFilter) return true;
      const haystack = normalize(`${offer.departure} ${offer.airportCode}`);
      const codes = departureFilter.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean);
      return codes.some((code) => {
        if (code === "WAWA") return /warszawa|chopin|okecie|modlin|\bwaw\b|\bwmi\b/.test(haystack);
        if (code === "WAW") return /warszawa|chopin|okecie|\bwaw\b/.test(haystack) && !/modlin|\bwmi\b/.test(haystack);
        if (code === "WMI") return /modlin|\bwmi\b/.test(haystack);
        if (code === "KRK") return /krakow|balice|\bkrk\b/.test(haystack);
        if (code === "KTW") return /katowice|pyrzowice|\bktw\b/.test(haystack);
        if (code === "GDN") return /gdansk|rebiechowo|\bgdn\b/.test(haystack);
        if (code === "WRO") return /wroclaw|strachowice|\bwro\b/.test(haystack);
        if (code === "POZ") return /poznan|lawica|\bpoz\b/.test(haystack);
        if (code === "RZE") return /rzeszow|jasionka|\brze\b/.test(haystack);
        if (code === "LCJ") return /lodz|lublinek|\blcj\b/.test(haystack);
        if (code === "LUZ") return /lublin|swidnik|\bluz\b/.test(haystack);
        if (code === "SZZ") return /szczecin|goleniow|\bszz\b/.test(haystack);
        if (code === "BZG") return /bydgoszcz|\bbzg\b/.test(haystack);
        if (code === "IEG") return /zielona gora|babimost|\bieg\b/.test(haystack);
        return haystack.includes(normalize(code));
      });
    };

    const nightsMatchesFallback = (offer: Offer) => {
      if (minNights && offer.nights < minNights) return false;
      if (maxNights && offer.nights > maxNights) return false;
      if (/^\d+$/.test(nightsFilter)) return offer.nights === Number(nightsFilter);
      const range = /^(\d+)-(\d+)$/.exec(nightsFilter);
      if (range) {
        const min = Math.min(Number(range[1]), Number(range[2]));
        const max = Math.max(Number(range[1]), Number(range[2]));
        return offer.nights >= min && offer.nights <= max;
      }
      if (nightsFilter === "15+") return offer.nights >= 15;
      return true;
    };

    const boardMatchesFallback = (offer: Offer) => {
      if (boardFilter === "any") return true;
      const value = normalize(offer.board);
      if (boardFilter === "allinclusive") return /all inclusive/.test(value) && !/ultra/.test(value);
      if (boardFilter === "ultraallinclusive") return /ultra all|ultraall/.test(value);
      if (boardFilter === "breakfast") return /sniad|breakfast|\bbb\b/.test(value);
      if (boardFilter === "halfboard") return /half board|\bhb\b|2 posil/.test(value);
      if (boardFilter === "fullboard") return /full board|\bfb\b|3 posil|pelne wyzywienie/.test(value);
      if (boardFilter === "roomonly") return /bez wyzywienia|room only|self catering|no meals|wlasne|aneks/.test(value);
      return true;
    };

    let fallbackOffers = hasExactDateConstraint
      ? []
      : homepageFallbackOffers
          .filter((offer) => !isOfferExpired(offer))
          .filter(isAffordableShortTrip)
          .filter((offer) => Boolean(offer.affiliateUrl))
          .filter((offer) => offer.linkMatch !== "unsafe")
          .filter((offer) => isTravelDestinationAllowed(offer.city, offer.country))
          .filter((offer) => ["exim", "tui", "esky"].includes(String(offer.partner)))
          .filter((offer) => !skipEsky || offer.partner !== "esky")
          .filter((offer) => !providerOnly || offer.partner === providerOnly)
          .filter(offer => candidateMatchesQuery(offer as LiveCandidate, query))
          .filter(departureMatchesFallback)
          .filter(nightsMatchesFallback)
          .filter(boardMatchesFallback)
          .filter((offer) => (!minPrice || offer.price >= minPrice) && (!maxPrice || offer.price <= maxPrice));

    if (mode === "citybreak") {
      fallbackOffers = fallbackOffers.filter((offer) => offer.nights >= 2 && offer.nights <= 5 && offer.price <= 2000);
    }
    if (mode === "surprise") {
      fallbackOffers = fallbackOffers.filter((offer) => offer.price <= budget);
    }

    const fallbackLimit = mode === "surprise" ? 12 : mode === "daily" ? 36 : 60;
    const selectedFallback = (
      mode === "search" || (mode === "citybreak" && !destinationOverview)
        ? rankSearchOffers(fallbackOffers)
        : selectCheapestPerDestination(fallbackOffers, { mode: "fallback" })
    )
      .sort((a, b) => a.price - b.price || b.score - a.score)
      .slice(0, mode === "search" ? Number.MAX_SAFE_INTEGER : fallbackLimit);

    const fallbackNotice = hasExactDateConstraint
      ? "Źródła live chwilowo nie odpowiadają. Nie pokazujemy ofert z innych terminów jako dopasowanych do wybranej daty."
      : selectedFallback.length
        ? "Źródła live chwilowo nie odpowiadają. Pokazujemy najtańsze opublikowane propozycje Tripowni; cenę i dostępność potwierdzisz po kliknięciu."
        : "Źródła live chwilowo nie odpowiadają i nie mamy bezpiecznej opublikowanej alternatywy dla tych ustawień.";

    return NextResponse.json(
      {
        ok: true,
        key,
        mode,
        checkedAt: new Date().toISOString(),
        sourceCount: selectedFallback.length,
        partial: true,
        sourceStatus: { esky: eskyStatus, exim: feedStatus.exim, tui: feedStatus.tui },
        fallback: true,
        providers: Array.from(new Set(selectedFallback.map((offer) => offer.partner))),
        coverage: "published_fallback",
        sourceType: "published_fallback",
        exactSourceCount: 0,
        destinationCount: selectedFallback.length,
        notice: fallbackNotice,
        offers: selectedFallback,
        upstreamError: error instanceof Error ? error.message : "Źródła live chwilowo nie odpowiadają.",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
