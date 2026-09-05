import { NextRequest, NextResponse } from "next/server";
import type { Offer } from "@/lib/offers";

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
};

const CITY_BREAK_TERMS = [
  "Rzym", "Barcelona", "Alicante", "Malta", "Pafos", "Sycylia", "Neapol", "Stambuł",
  "Ateny", "Praga", "Budapeszt", "Wiedeń", "Lizbona", "Porto", "Walencja", "Sewilla",
];

const SURPRISE_TERMS = {
  low: ["Malta", "Sycylia", "Alicante", "Pafos", "Stambuł", "Marrakesz"],
  mid: ["Djerba", "Marrakesz", "Teneryfa", "Fuerteventura", "Marsa Alam", "Hurghada"],
  high: ["Dubaj", "Zanzibar", "Dominikana", "Malediwy", "Kenia", "Meksyk", "Tajlandia", "Kuba"],
};

const SEARCH_TERMS = [
  "Egipt",
  "Tunezja",
  "Turcja",
  "Grecja",
  "Hiszpania",
  "Cypr",
  "Malta",
  "Bułgaria",
  "Włochy",
  "Maroko",
  "Portugalia",
  "Albania",
  "Djerba",
  "Hurghada",
  "Marsa Alam",
  "Rodos",
  "Kreta",
  "Zakynthos",
  "Pafos",
  "Teneryfa",
  "Fuerteventura",
  "Majorka",
];

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
    next: { revalidate: 1800 },
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

  if (modifiedAt && Date.now() - modifiedAt > 48 * 3600 * 1000) return null;

  return {
    id: 1_000_000 + (hash(`exim:${sourceKey}`) % 800_000_000),
    flag: countryFlag(country),
    city,
    country,
    price,
    priceCheckedAt: modifiedAt ? new Date(modifiedAt).toISOString() : new Date().toISOString(),
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

  if (modifiedAt && Date.now() - modifiedAt > 48 * 3600 * 1000) return null;

  return {
    id: 1_000_000 + (hash(`tui:${sourceKey}`) % 800_000_000),
    flag: countryFlag(country),
    city,
    country,
    price,
    priceCheckedAt: modifiedAt ? new Date(modifiedAt).toISOString() : new Date().toISOString(),
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
  // Małe kierunki wyspowe nie powinny zajmować dwóch miejsc w jednej dziennej selekcji.
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

function selectDaily(candidates: LiveCandidate[], key: string, limit = 12) {
  const shuffled = shuffle(candidates, `tripownia-live:${key}`)
    .sort((a, b) => dealValue(b) - dealValue(a));

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
    if (providerCount >= 7) continue;

    const primaryAirport = departurePriority(offer) > 0;
    if (!primaryAirport && secondaryAirportCount >= 2) continue;

    selected.push(offer);
    destinationKeys.add(destKey);
    countryCounts.set(countryKey, countryCount + 1);
    providerCounts.set(offer.provider, providerCount + 1);
    if (!primaryAirport) secondaryAirportCount += 1;
    if (selected.length >= limit) break;
  }

  // Nie dopełniamy karuzeli duplikatami. Lepiej pokazać 9 dobrych, różnych propozycji niż 12 z powtórzeniami.
  return selected.slice(0, limit);
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key") || dailyKey();
  const requestedMode = request.nextUrl.searchParams.get("mode");
  const mode = requestedMode === "citybreak" ? "citybreak" : requestedMode === "search" ? "search" : requestedMode === "surprise" ? "surprise" : "daily";
  const query = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 80);
  const budget = Math.max(500, Math.min(10000, Number(request.nextUrl.searchParams.get("budget") || 2500)));
  const eximToken = process.env.TRADEDOUBLER_EXIM_TOKEN || process.env.TRADEDOUBLER_TOKEN || process.env.TRADEDOUBLER_TUI_TOKEN;
  const tuiToken = process.env.TRADEDOUBLER_TUI_TOKEN || process.env.TRADEDOUBLER_TOKEN;

  if (!eximToken && !tuiToken) {
    return NextResponse.json({ ok: false, key, offers: [], error: "Brak tokenów TradeDoubler." }, { status: 503 });
  }

  try {
    const searchTerms = query ? Array.from(new Set([query, query.split(",")[0].trim()].filter(Boolean))) : [];
    const terms = mode === "search" && query
      ? searchTerms
      : mode === "citybreak"
        ? (query ? searchTerms : shuffle(CITY_BREAK_TERMS, `citybreak:${key}`).slice(0, 12))
        : mode === "surprise"
          ? shuffle(budget >= 3500 ? SURPRISE_TERMS.high : budget >= 1800 ? SURPRISE_TERMS.mid : SURPRISE_TERMS.low, `surprise:${key}:${budget}`).slice(0, 8)
          : shuffle(SEARCH_TERMS, `terms:${key}`).slice(0, 8);
    const jobs: Promise<{ provider: Provider; products: TdProduct[] }>[] = [];

    for (const term of terms) {
      if (eximToken) jobs.push(fetchProducts("exim", term, eximToken).then((products) => ({ provider: "exim" as const, products })));
      if (mode !== "citybreak" && tuiToken) jobs.push(fetchProducts("tui", term, tuiToken).then((products) => ({ provider: "tui" as const, products })));
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

    const pool = Array.from(unique.values());
    const selected = mode === "citybreak"
      ? selectDaily(pool.filter((offer) => offer.provider === "exim" && offer.nights >= 2 && offer.nights <= 5), `${key}:citybreak`, 8)
      : mode === "search"
        ? pool.sort((a,b) => a.price - b.price).slice(0, 24)
        : mode === "surprise"
          ? pool
              .filter((offer) => offer.price <= budget)
              .filter((offer) => budget < 3500 || offer.price >= Math.round(budget * 0.45))
              .sort((a,b) => (b.score * 100 + b.price / 20) - (a.score * 100 + a.price / 20))
              .slice(0, 12)
          : selectDaily(pool, key, 12);
    return NextResponse.json(
      {
        ok: selected.length > 0,
        key,
        mode,
        checkedAt: new Date().toISOString(),
        sourceCount: unique.size,
        offers: selected,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
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
