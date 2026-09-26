import { NextRequest, NextResponse } from "next/server";
import type { Offer } from "@/lib/offers";
import { touristDestinationKey } from "@/lib/destinationGrouping";

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

type Provider = "exim" | "tui";

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
  "Malta", "Pafos", "Sycylia",
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
  "Portugalia", "Włochy", "Maroko", "Malta", "Teneryfa", "Fuerteventura", "Rodos", "Kreta",
  "Zakynthos", "Majorka", "Sycylia", "Djerba", "Hurghada", "Marsa Alam", "Sharm el Sheikh",
  "Rzym", "Mediolan", "Neapol", "Barcelona", "Alicante", "Lizbona", "Porto", "Ateny", "Stambuł",
  "Zanzibar", "Kenia", "Mauritius", "Dominikana", "Meksyk", "Tajlandia", "Malediwy", "Dubaj"
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
};

function expandSearchTerms(rawTerms: string[]) {
  const expanded: string[] = [];
  for (const raw of rawTerms) {
    const key = normalize(raw).replace(/ /g, "_");
    expanded.push(raw);
    if (SEARCH_ALIASES[key]) expanded.push(...SEARCH_ALIASES[key]);
  }
  return Array.from(new Set(expanded)).slice(0, 24);
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
};

function normalize(value: string | undefined | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  if (Number(parts.hour) < 8) date.setUTCDate(date.getUTCDate() - 1);
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
  if (price <= 2300 || /all inclusive/i.test(board)) return "OKAZJA";
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
  return `${nights} nocy${boardText} w cenie od ${price.toLocaleString("pl-PL")} zł/os. Dobra opcja na ten termin.`;
}

async function fetchProducts(provider: Provider, query: string, token: string) {
  const fid = provider === "exim" ? 103442 : 24864;
  const endpoint = new URL("https://api.tradedoubler.com/1.0/products.json");
  const path = `${endpoint.origin}${endpoint.pathname};q=${encodeURIComponent(query)};page=1;pageSize=100;fid=${fid}?token=${encodeURIComponent(token)}`;
  const response = await fetch(path, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${provider.toUpperCase()} feed ${response.status}`);
  const data = await response.json();
  return Array.isArray(data?.products) ? (data.products as TdProduct[]) : [];
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
  if (price < 350 || price > 9000) return null;

  const destinationAddress = fields.DestinationAddress || product.description || "";
  const addressParts = destinationAddress.split(";").map((value) => value.trim()).filter(Boolean);
  const country = addressParts.at(-1) || product.description?.split(",").at(0)?.trim() || "";
  const city = fields.DestinationName || addressParts[0] || product.name || "Wakacje";
  const board = boardFromEximUrl(productUrl);
  const departure = fields.Departue || fields.Departure || fields.DepartureCity || "Polska";
  const departureDate = destinationUrl?.searchParams.get("DD") ? new Date(`${destinationUrl.searchParams.get("DD")}T00:00:00Z`) : null;
  const returnDate = destinationUrl?.searchParams.get("RD") ? new Date(`${destinationUrl.searchParams.get("RD")}T00:00:00Z`) : null;
  const daysOut = departureDate ? Math.max(0, Math.round((departureDate.getTime() - Date.now()) / 86400000)) : 120;
  const rating = Number(fields.Stars || 0);
  const modifiedAt = Number(offer?.modified || 0);
  const sourceKey = offer?.sourceProductId || productUrl;

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
    airportCode: "",
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
  if (price < 350 || price > 9000) return null;

  const country = fields.Country || "";
  const city = fields.Region || fields.City || product.name || "Wakacje";
  const nights = Math.max(1, Number(fields.Duration || 7));
  const board = fields.ServiceDescription || product.description || "Wyżywienie wg oferty";
  const departure = fields.DepartureCity || fields.DeparturePlace || "Polska";
  const departureDate = parseDate(fields.DepartureDate);
  const returnDate = departureDate ? addDays(departureDate, nights) : null;
  const daysOut = departureDate ? Math.max(0, Math.round((departureDate.getTime() - Date.now()) / 86400000)) : 120;
  const rating = Number(fields.Rating || 0);
  const modifiedAt = Number(offer?.modified || 0);
  const sourceKey = offer?.sourceProductId || productUrl;

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
    airportCode: fields.DeparturePlace || "",
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
  return normalize(`${offer.city}|${offer.country}`);
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
  const queries = query
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!queries.length) return true;
  return queries.some((item) => candidateMatchesSingleQuery(offer, item));
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

function selectDailyDiversified(candidates: LiveCandidate[], key: string, limit = 20) {
  const buckets = {
    europe: candidates.filter((o) => continentFor(o) === "europe"),
    africa: candidates.filter((o) => continentFor(o) === "africa"),
    asia: candidates.filter((o) => continentFor(o) === "asia"),
    americas: candidates.filter((o) => continentFor(o) === "americas"),
  };

  const quotas: Array<[keyof typeof buckets, number]> = [
    ["europe", 8],
    ["africa", 5],
    ["asia", 4],
    ["americas", 3],
  ];

  const picked: LiveCandidate[] = [];
  const seen = new Set<string>();
  for (const [bucket, quota] of quotas) {
    const ranked = shuffle([...buckets[bucket]].sort((a,b) => dealValue(b)-dealValue(a)).slice(0, 24), `${key}:${bucket}`);
    for (const offer of ranked) {
      const dk = destinationKey(offer);
      if (seen.has(dk)) continue;
      picked.push(offer);
      seen.add(dk);
      if (picked.filter((o) => continentFor(o) === bucket).length >= quota) break;
    }
  }

  if (picked.length < limit) {
    const rest = selectDaily(candidates.filter((o) => !seen.has(destinationKey(o))), `${key}:rest`, limit - picked.length);
    picked.push(...rest);
  }
  return picked.slice(0, limit);
}

function cheapestPerDestination(candidates: LiveCandidate[]) {
  const best = new Map<string, LiveCandidate>();
  for (const offer of candidates) {
    const key = destinationKey(offer);
    const previous = best.get(key);
    if (!previous || offer.price < previous.price || (offer.price === previous.price && departurePriority(offer) > departurePriority(previous))) {
      best.set(key, offer);
    }
  }
  return Array.from(best.values());
}

function selectDaily(candidates: LiveCandidate[], key: string, limit = 12) {
  const ranked = [...candidates].sort((a, b) => dealValue(b) - dealValue(a));
  const shortlist = ranked.slice(0, Math.min(48, ranked.length));
  const shuffled = shuffle(shortlist, `tripownia-live:${key}`);

  const selected: LiveCandidate[] = [];
  const countryCounts = new Map<string, number>();
  const providerCounts = new Map<Provider, number>();
  const destinationKeys = new Set<string>();
  let secondaryAirportCount = 0;

  for (const offer of shuffled) {
    const destKey = destinationKey(offer);
    if (destinationKeys.has(destKey)) continue;

    const countryKey = normalize(offer.country);
    const countryCount = countryCounts.get(countryKey) || 0;
    if (countryCount >= countryLimit(offer)) continue;

    const providerCount = providerCounts.get(offer.provider) || 0;
    if (providerCount >= Math.max(10, Math.ceil(limit * 0.75))) continue;

    const primaryAirport = departurePriority(offer) > 0;
    if (!primaryAirport && secondaryAirportCount >= 2) continue;

    selected.push(offer);
    destinationKeys.add(destKey);
    countryCounts.set(countryKey, countryCount + 1);
    providerCounts.set(offer.provider, providerCount + 1);
    if (!primaryAirport) secondaryAirportCount += 1;
    if (selected.length >= limit) break;
  }

  return selected
    .sort((a, b) => dealValue(b) - dealValue(a))
    .slice(0, limit);
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key") || dailyKey();
  const requestedMode = request.nextUrl.searchParams.get("mode");
  const mode = requestedMode === "citybreak" ? "citybreak" : requestedMode === "search" ? "search" : requestedMode === "surprise" ? "surprise" : requestedMode === "newyear" ? "newyear" : "daily";
  const query = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 80);
  const budget = Math.max(500, Math.min(10000, Number(request.nextUrl.searchParams.get("budget") || 2500)));
  const broadSearch = request.nextUrl.searchParams.get("broad") === "1";
  const providerParam = request.nextUrl.searchParams.get("provider");
  const providerOnly: Provider | null = providerParam === "exim" || providerParam === "tui" ? providerParam : null;
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
  const eximToken = process.env.TRADEDOUBLER_EXIM_TOKEN || process.env.TRADEDOUBLER_TOKEN || process.env.TRADEDOUBLER_TUI_TOKEN;
  const tuiToken = process.env.TRADEDOUBLER_TUI_TOKEN || process.env.TRADEDOUBLER_TOKEN;

  if (!eximToken && !tuiToken) {
    return NextResponse.json({ ok: false, key, offers: [], error: "Brak tokenów TradeDoubler." }, { status: 503 });
  }

  try {
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
      : mode === "search" && broadSearch
        ? BROAD_SEARCH_TERMS
      : mode === "citybreak"
        ? (query ? searchTerms : shuffle(CITY_BREAK_TERMS, `citybreak:${key}`).slice(0, 20))
        : mode === "surprise"
          ? shuffle(budget >= 3500 ? SURPRISE_TERMS.high : budget >= 1800 ? SURPRISE_TERMS.mid : SURPRISE_TERMS.low, `surprise:${key}:${budget}`).slice(0, 12)
          : mode === "newyear"
            ? NEW_YEAR_SEARCH_TERMS
          : mode === "search"
            ? BROAD_SEARCH_TERMS
            : [
                ...shuffle(EUROPE_SEARCH_TERMS, `terms-eu:${key}`).slice(0, 7),
                ...shuffle(EXOTIC_SEARCH_TERMS, `terms-exotic:${key}`).slice(0, 11),
              ];
    const jobs: Promise<{ provider: Provider; products: TdProduct[] }>[] = [];

    for (const term of terms) {
      if (eximToken && providerOnly !== "tui") jobs.push(fetchProducts("exim", term, eximToken).then((products) => ({ provider: "exim" as const, products })));
      if (mode !== "citybreak" && mode !== "newyear" && tuiToken && providerOnly !== "exim") jobs.push(fetchProducts("tui", term, tuiToken).then((products) => ({ provider: "tui" as const, products })));
    }

    const settled = await Promise.allSettled(jobs);
    const candidates: LiveCandidate[] = [];
    for (const item of settled) {
      if (item.status !== "fulfilled") continue;
      for (const product of item.value.products) {
        const candidate = item.value.provider === "exim" ? fromExim(product) : fromTui(product);
        if (candidate) candidates.push(candidate);
      }
    }

    const unique = new Map<string, LiveCandidate>();
    for (const candidate of candidates) {
      const keyValue = `${candidate.provider}:${candidate.sourceKey}`;
      const previous = unique.get(keyValue);
      if (!previous || candidate.price < previous.price) unique.set(keyValue, candidate);
    }

    const rawCandidates = Array.from(unique.values());
    const allCandidates = query && !rescueMode && (mode === "search" || mode === "citybreak")
      ? rawCandidates.filter((offer) => candidateMatchesQuery(offer, query))
      : rawCandidates;

    const departureMatches = (offer: LiveCandidate) => {
      if (!departureFilter) return true;
      const haystack = normalize(`${offer.departure} ${offer.airportCode}`);
      const codes = departureFilter
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean);

      return codes.some((code) => {
        if (code === "WAWA") return /warszawa|chopin|okecie|modlin|\bwaw\b|\bwmi\b/.test(haystack);
        if (code === "WAW") return /chopin|okecie|\bwaw\b/.test(haystack);
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
      if (nightsFilter === "1-2") return offer.nights >= 1 && offer.nights <= 2;
      if (nightsFilter === "3-4") return offer.nights >= 3 && offer.nights <= 4;
      if (nightsFilter === "5-7") return offer.nights >= 5 && offer.nights <= 7;
      if (nightsFilter === "8-10") return offer.nights >= 8 && offer.nights <= 10;
      if (nightsFilter === "11-14") return offer.nights >= 11 && offer.nights <= 14;
      if (nightsFilter === "15+") return offer.nights >= 15;
      return true;
    };
    const boardMatches = (offer: LiveCandidate) => {
      if (boardFilter === "any") return true;
      const value = normalize(offer.board);
      if (boardFilter === "allinclusive") return /all inclusive|allinclusive/.test(value) && !/ultra/.test(value);
      if (boardFilter === "ultraallinclusive") return /ultra all|ultraall/.test(value);
      if (boardFilter === "breakfast") return /sniad|breakfast|\bbb\b/.test(value);
      if (boardFilter === "halfboard") return /half board|\bhb\b|2 posil|sniad.*obiad|sniad.*kolac/.test(value);
      if (boardFilter === "fullboard") return /full board|\bfb\b|3 posil|pelne wyzywienie/.test(value);
      if (boardFilter === "roomonly") return /bez wyzywienia|room only|self catering|no meals/.test(value);
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

    const exactPool = rescueMode
      ? budgetCandidates
      : dateCandidates.filter((offer) =>
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

    if (mode === "search" || mode === "citybreak") {
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

    const cheapestDestinations = cheapestPerDestination(pool);
    const dailyLengthPool = cheapestDestinations.filter((offer) => hasConcreteDates(offer) && tripLengthMatches(offer));

    const selected = mode === "newyear"
      ? cheapestPerDestination(
          pool.filter((offer) => {
            if (offer.provider !== "exim" || !offer.startDateISO) return false;
            const start = offer.startDateISO;
            return start >= "2026-12-26" && start <= "2027-01-02" && offer.nights >= 3 && offer.nights <= 12;
          })
        )
          .sort((a, b) => {
            const aCity = a.nights <= 6 ? 0 : 1;
            const bCity = b.nights <= 6 ? 0 : 1;
            if (aCity !== bCity) return aCity - bCity;
            return a.price - b.price;
          })
          .slice(0, 30)
      : mode === "citybreak"
      ? query
        ? pool
            .filter((offer) => offer.provider === "exim" && offer.nights >= 2 && offer.nights <= 5)
            .sort((a, b) => a.price !== b.price ? a.price - b.price : b.score - a.score)
            .slice(0, 40)
        : selectDaily(
            cheapestPerDestination(
              pool.filter((offer) => offer.provider === "exim" && offer.nights >= 2 && offer.nights <= 5)
            ),
            `${key}:citybreak`,
            24
          )
      : mode === "search"
        ? [...pool]
            .sort((a,b) => {
              const dateDelta = (startDateFilter || endDateFilter)
                ? dateWindowDistance(a, startDateFilter, endDateFilter) - dateWindowDistance(b, startDateFilter, endDateFilter)
                : 0;
              return dateDelta || (a.price !== b.price ? a.price - b.price : b.score - a.score);
            })
            .slice(0, 36)
        : mode === "surprise"
          ? cheapestDestinations
              .filter((offer) => offer.price <= budget)
              .filter((offer) => budget < 3500 || offer.price >= Math.round(budget * 0.45))
              .sort((a,b) => (b.score * 100 + b.price / 20) - (a.score * 100 + a.price / 20))
              .slice(0, 12)
          : selectDailyDiversified(dailyLengthPool.length >= 12 ? dailyLengthPool : cheapestDestinations, key, 36);

    const validEmptySearch = Boolean(query && !rescueMode && (mode === "search" || mode === "citybreak"));

    return NextResponse.json(
      {
        ok: selected.length > 0 || validEmptySearch,
        key,
        mode,
        checkedAt: new Date().toISOString(),
        sourceCount: pool.length,
        exactSourceCount: exactPool.length,
        destinationCount: cheapestDestinations.length,
        notice,
        offers: selected,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, key, offers: [], error: error instanceof Error ? error.message : "Nie udało się odświeżyć ofert." },
      { status: 502 }
    );
  }
}
