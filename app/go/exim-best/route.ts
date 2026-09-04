import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
    (product.fields || [])
      .filter((field) => field.name)
      .map((field) => [field.name as string, field.value || ""])
  );
}

function destinationFromPath(path: string) {
  const clean = path.split("?")[0].replace(/\/+$/, "");
  const slug = clean.split("/").filter(Boolean).pop() || "";
  return slug.replace(/-/g, " ");
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

function dateDeltaDays(a: string | null, b: string | null) {
  if (!a || !b) return 9999;
  const da = new Date(`${a}T12:00:00Z`);
  const db = new Date(`${b}T12:00:00Z`);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return 9999;
  return Math.abs(Math.round((da.getTime() - db.getTime()) / 86400000));
}

function scoreProduct(
  product: TdProduct,
  target: { destination: string; country: string; from: string; start: string; nights: number }
) {
  const fields = fieldMap(product);
  const offer = product.offers?.[0];
  const tracked = offer?.productUrl || offer?.legacyProductUrl;
  const destinationUrl = decodeTrackedDestination(tracked);

  const haystack = normalize([
    product.name,
    product.description,
    fields.DestinationName,
    fields.DestinationAddress,
  ].filter(Boolean).join(" "));

  const destination = normalize(target.destination);
  const country = normalize(target.country);
  let score = 0;

  if (destination && haystack.includes(destination)) score += 70;
  else if (destination) {
    const tokens = destination.split(" ").filter((x) => x.length >= 4);
    score += Math.min(45, tokens.filter((token) => haystack.includes(token)).length * 15);
  }
  if (country && haystack.includes(country)) score += 18;

  const departure = normalize(fields.Departue || fields.Departure || fields.DepartureCity);
  const wantedDeparture = (departureNames[target.from] || [target.from]).map(normalize);
  if (wantedDeparture.some((name) => name && departure.includes(name))) score += 40;

  if (destinationUrl) {
    const nn = Number(destinationUrl.searchParams.get("NN") || 0);
    if (target.nights > 0 && nn === target.nights) score += 28;
    else if (target.nights > 0 && Math.abs(nn - target.nights) <= 1) score += 12;

    const offerStart = destinationUrl.searchParams.get("DD") || destinationUrl.searchParams.get("PC")?.split("-").slice(1).join("-") || null;
    const delta = dateDeltaDays(target.start || null, offerStart);
    if (delta === 0) score += 35;
    else if (delta <= 3) score += 26;
    else if (delta <= 7) score += 18;
    else if (delta <= 14) score += 8;
  }

  if (offer?.productUrl) score += 20;
  if (offer?.priceHistory?.[0]?.price?.value) score += 5;

  return score;
}

async function fetchProducts(query: string, token: string) {
  const endpoint = new URL("https://api.tradedoubler.com/1.0/products.json");
  const path = `${endpoint.origin}${endpoint.pathname};q=${encodeURIComponent(query)};page=1;pageSize=100;fid=103442?token=${encodeURIComponent(token)}`;

  const response = await fetch(path, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Tradedoubler EXIM API ${response.status}`);
  const data = await response.json();
  return Array.isArray(data?.products) ? (data.products as TdProduct[]) : [];
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const rawPath = params.get("path") || "/wakacje";
  const destination = params.get("destination") || destinationFromPath(rawPath);
  const country = params.get("country") || "";
  const from = (params.get("from") || "WAW").toUpperCase();
  const start = params.get("start") || "";
  const nights = Math.max(0, Number(params.get("nights") || params.get("duration") || 0));

  const token =
    process.env.TRADEDOUBLER_EXIM_TOKEN ||
    process.env.TRADEDOUBLER_TOKEN ||
    process.env.TRADEDOUBLER_TUI_TOKEN;

  if (!token) {
    const fallback = new URL("/okazje", request.url);
    fallback.searchParams.set("exim", "brak-tokena");
    return NextResponse.redirect(fallback, 307);
  }

  try {
    const queries = Array.from(new Set([destination, country].map((x) => x.trim()).filter(Boolean)));
    let products: TdProduct[] = [];

    for (const query of queries.length ? queries : ["wakacje"]) {
      const batch = await fetchProducts(query, token);
      products = [...products, ...batch];
      const strong = batch.some((product) => scoreProduct(product, { destination, country, from, start, nights }) >= 110);
      if (strong) break;
    }

    const unique = new Map<string, TdProduct>();
    for (const product of products) {
      const url = product.offers?.[0]?.productUrl || product.offers?.[0]?.legacyProductUrl;
      if (url) unique.set(url, product);
    }

    const ranked = Array.from(unique.values())
      .map((product) => ({ product, score: scoreProduct(product, { destination, country, from, start, nights }) }))
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    const bestUrl = best?.product.offers?.[0]?.productUrl || best?.product.offers?.[0]?.legacyProductUrl;

    // Kluczowa zasada: przekazujemy productUrl z feedu 1:1.
    // Nie budujemy ponownie linku afiliacyjnego i nie obcinamy parametrów oferty.
    if (best && bestUrl && best.score >= 55) {
      return NextResponse.redirect(bestUrl, 307);
    }

    const fallback = new URL("/okazje", request.url);
    fallback.searchParams.set("exim", "brak-dopasowania");
    fallback.searchParams.set("kierunek", destination);
    return NextResponse.redirect(fallback, 307);
  } catch (error) {
    console.error("[tripownia_exim_feed]", error);
    const fallback = new URL("/okazje", request.url);
    fallback.searchParams.set("exim", "blad-feedu");
    fallback.searchParams.set("kierunek", destination);
    return NextResponse.redirect(fallback, 307);
  }
}
