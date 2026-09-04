export type EximLiveResult = {
  available: boolean;
  productName?: string;
  productUrl?: string;
  totalPrice?: number;
  pricePerPerson?: number;
  adults?: number;
  departure?: string;
  nights?: number;
  board?: string;
  checkedAt: string;
};

type TdField = { name?: string; value?: string };
type TdOffer = {
  productUrl?: string;
  legacyProductUrl?: string;
  modified?: number;
  priceHistory?: Array<{ price?: { value?: string; currency?: string } }>;
};
type TdProduct = {
  name?: string;
  description?: string;
  fields?: TdField[];
  offers?: TdOffer[];
};

const departureNames: Record<string, string[]> = {
  WAW: ["warszawa", "warsaw"],
  WMI: ["warszawa", "modlin"],
  KRK: ["krakow", "kraków"],
  KTW: ["katowice"],
  GDN: ["gdansk", "gdańsk"],
  WRO: ["wroclaw", "wrocław"],
  POZ: ["poznan", "poznań"],
  RZE: ["rzeszow", "rzeszów"],
  LUZ: ["lublin"],
  SZZ: ["szczecin"],
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
    (product.fields || []).filter((field) => field.name).map((field) => [field.name as string, field.value || ""])
  );
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

function normalizeBoardFromDi(di: string | null) {
  const value = (di || "").toUpperCase();
  if (value.includes("AI")) return "All Inclusive";
  if (value.includes("BB")) return "Śniadanie";
  if (value.includes("HB")) return "2 posiłki";
  if (value.includes("FB")) return "3 posiłki";
  if (value.includes("AO") || value.includes("RO")) return "Bez wyżywienia";
  return "";
}

function boardMatches(wanted: string, current: string) {
  const w = normalize(wanted);
  const c = normalize(current);
  if (!w) return true;
  if (w.includes("all inclusive")) return c.includes("all inclusive");
  if (w.includes("sniad")) return c.includes("sniad");
  if (w.includes("bez wyzyw")) return c.includes("bez wyzyw");
  return !c || c.includes(w);
}

async function fetchProducts(query: string, token: string) {
  const endpoint = new URL("https://api.tradedoubler.com/1.0/products.json");
  const path = `${endpoint.origin}${endpoint.pathname};q=${encodeURIComponent(query)};page=1;pageSize=100;fid=103442?token=${encodeURIComponent(token)}`;
  const response = await fetch(path, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!response.ok) throw new Error(`Tradedoubler EXIM API ${response.status}`);
  const data = await response.json();
  return Array.isArray(data?.products) ? (data.products as TdProduct[]) : [];
}

function candidate(product: TdProduct, target: { destination: string; country: string; from: string; nights: number; board: string }) {
  const fields = fieldMap(product);
  const offer = product.offers?.[0];
  const productUrl = offer?.productUrl || offer?.legacyProductUrl;
  if (!productUrl) return null;

  const destinationUrl = decodeTrackedDestination(productUrl);
  const haystack = normalize([product.name, product.description, fields.DestinationName, fields.DestinationAddress].filter(Boolean).join(" "));
  const destination = normalize(target.destination);
  const country = normalize(target.country);

  // Nie podstawiamy innego kurortu tylko dlatego, że zgadza się kraj.
  if (destination && !haystack.includes(destination)) return null;
  if (country && !haystack.includes(country)) return null;

  const departure = normalize(fields.Departue || fields.Departure || fields.DepartureCity);
  const wantedDeparture = (departureNames[target.from] || [target.from]).map(normalize);
  const departureMatch = wantedDeparture.some((name) => name && departure.includes(name));
  if (departure && !departureMatch) return null;

  const nights = Number(destinationUrl?.searchParams.get("NN") || 0);
  if (target.nights > 0 && nights > 0 && Math.abs(nights - target.nights) > 1) return null;

  const board = normalizeBoardFromDi(destinationUrl?.searchParams.get("DI") || null);
  if (!boardMatches(target.board, board)) return null;

  const rawPrice = Number(fields.BestPrice || fields.SalePrice || offer?.priceHistory?.[0]?.price?.value || 0);
  if (!Number.isFinite(rawPrice) || rawPrice <= 0) return null;

  const adults = Math.max(1, Number(destinationUrl?.searchParams.get("AC1") || 2));
  const pricePerPerson = Math.round(rawPrice / adults);

  let score = 0;
  score += 100; // dokładny kierunek
  if (departureMatch) score += 35;
  if (target.nights > 0 && nights === target.nights) score += 25;
  if (target.board && boardMatches(target.board, board)) score += 25;

  return {
    product,
    productUrl,
    totalPrice: rawPrice,
    pricePerPerson,
    adults,
    departure: fields.Departue || fields.Departure || fields.DepartureCity || "",
    nights,
    board,
    score,
  };
}

export async function findBestEximOffer(target: {
  destination: string;
  country?: string;
  from?: string;
  nights?: number;
  board?: string;
}): Promise<EximLiveResult> {
  const token = process.env.TRADEDOUBLER_EXIM_TOKEN || process.env.TRADEDOUBLER_TOKEN || process.env.TRADEDOUBLER_TUI_TOKEN;
  const checkedAt = new Date().toISOString();
  if (!token) return { available: false, checkedAt };

  const destination = target.destination.trim();
  const country = (target.country || "").trim();
  const from = (target.from || "WAW").toUpperCase();
  const nights = Math.max(0, Number(target.nights || 0));
  const board = target.board || "";

  const queries = Array.from(new Set([destination, country].filter(Boolean)));
  let products: TdProduct[] = [];
  for (const query of queries) products = products.concat(await fetchProducts(query, token));

  const unique = new Map<string, TdProduct>();
  for (const product of products) {
    const url = product.offers?.[0]?.productUrl || product.offers?.[0]?.legacyProductUrl;
    if (url) unique.set(url, product);
  }

  const matches = Array.from(unique.values())
    .map((product) => candidate(product, { destination, country, from, nights, board }))
    .filter(Boolean) as NonNullable<ReturnType<typeof candidate>>[];

  if (!matches.length) return { available: false, checkedAt };

  // Najpierw zgodność, a w ramach równie dobrych dopasowań najniższa aktualna cena.
  matches.sort((a, b) => b.score - a.score || a.pricePerPerson - b.pricePerPerson);
  const bestScore = matches[0].score;
  const equallyGood = matches.filter((item) => item.score === bestScore);
  equallyGood.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
  const best = equallyGood[0];

  return {
    available: true,
    productName: best.product.name,
    productUrl: best.productUrl,
    totalPrice: best.totalPrice,
    pricePerPerson: best.pricePerPerson,
    adults: best.adults,
    departure: best.departure,
    nights: best.nights,
    board: best.board,
    checkedAt,
  };
}
