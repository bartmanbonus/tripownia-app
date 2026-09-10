import { NextResponse } from "next/server";
import { eskyApiConfig, searchEskyFlights, type EskyFlightResult } from "@/lib/eskyApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteSeed = {
  from: string;
  to: string;
  city: string;
  country: string;
  flag: string;
  image: string;
  maxGemPrice: number;
};

const ROUTES: RouteSeed[] = [
  { from: "WAW", to: "BCN", city: "Barcelona", country: "Hiszpania", flag: "🇪🇸", image: "/images/destinations/barcelona.jpg", maxGemPrice: 650 },
  { from: "WAW", to: "FCO", city: "Rzym", country: "Włochy", flag: "🇮🇹", image: "/images/destinations/rzym.jpg", maxGemPrice: 600 },
  { from: "WAW", to: "LIS", city: "Lizbona", country: "Portugalia", flag: "🇵🇹", image: "/images/destinations/lizbona.jpg", maxGemPrice: 750 },
  { from: "WAW", to: "OPO", city: "Porto", country: "Portugalia", flag: "🇵🇹", image: "/images/destinations/porto.jpg", maxGemPrice: 750 },
  { from: "WAW", to: "ALC", city: "Alicante", country: "Hiszpania", flag: "🇪🇸", image: "/images/destinations/barcelona.jpg", maxGemPrice: 650 },
  { from: "WAW", to: "AGP", city: "Malaga", country: "Hiszpania", flag: "🇪🇸", image: "/images/destinations/barcelona.jpg", maxGemPrice: 700 },
  { from: "KRK", to: "BCN", city: "Barcelona", country: "Hiszpania", flag: "🇪🇸", image: "/images/destinations/barcelona.jpg", maxGemPrice: 600 },
  { from: "KRK", to: "FCO", city: "Rzym", country: "Włochy", flag: "🇮🇹", image: "/images/destinations/rzym.jpg", maxGemPrice: 550 },
  { from: "KRK", to: "PFO", city: "Pafos", country: "Cypr", flag: "🇨🇾", image: "/images/destinations/pafos.jpg", maxGemPrice: 650 },
  { from: "KRK", to: "MLA", city: "Malta", country: "Malta", flag: "🇲🇹", image: "/images/destinations/valletta.jpg", maxGemPrice: 600 },
  { from: "KTW", to: "FCO", city: "Rzym", country: "Włochy", flag: "🇮🇹", image: "/images/destinations/rzym.jpg", maxGemPrice: 550 },
  { from: "KTW", to: "BCN", city: "Barcelona", country: "Hiszpania", flag: "🇪🇸", image: "/images/destinations/barcelona.jpg", maxGemPrice: 600 },
  { from: "GDN", to: "BCN", city: "Barcelona", country: "Hiszpania", flag: "🇪🇸", image: "/images/destinations/barcelona.jpg", maxGemPrice: 650 },
  { from: "GDN", to: "FCO", city: "Rzym", country: "Włochy", flag: "🇮🇹", image: "/images/destinations/rzym.jpg", maxGemPrice: 650 },
  { from: "WRO", to: "FCO", city: "Rzym", country: "Włochy", flag: "🇮🇹", image: "/images/destinations/rzym.jpg", maxGemPrice: 600 },
  { from: "WRO", to: "BCN", city: "Barcelona", country: "Hiszpania", flag: "🇪🇸", image: "/images/destinations/barcelona.jpg", maxGemPrice: 650 }
];

function warsawDateKey(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);
}

function addDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function dailySeed(key: string) {
  return Array.from(key).reduce((acc, char) => ((acc * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
}

function selectedRoutes(key: string) {
  const seed = dailySeed(key);
  return [...ROUTES]
    .map((route, index) => ({ route, sort: ((seed ^ ((index + 1) * 2654435761)) >>> 0) }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 10)
    .map((item) => item.route);
}

function bestResult(results: EskyFlightResult[]) {
  return results.find((result) => Number.isFinite(result.price) && result.price > 0) || null;
}

export async function GET() {
  const config = eskyApiConfig();
  const checkedAt = new Date().toISOString();
  if (!config.configured) {
    return NextResponse.json({ ok: true, configured: false, checkedAt, searched: 0, gem: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const today = warsawDateKey();
  const routes = selectedRoutes(today);
  const offsets = [14, 21, 28, 35];
  const stays = [3, 4, 3, 4];
  const candidates: Array<{
    route: RouteSeed;
    departureDate: string;
    returnDate: string;
    cheapest: EskyFlightResult;
    medianPrice: number;
    discountPct: number;
    comparableCount: number;
    score: number;
  }> = [];

  for (let start = 0; start < routes.length; start += 4) {
    const batch = routes.slice(start, start + 4);
    const settled = await Promise.allSettled(batch.map(async (route, localIndex) => {
      const index = start + localIndex;
      const offset = offsets[(dailySeed(today) + index) % offsets.length];
      const stay = stays[(dailySeed(today) + index * 3) % stays.length];
      const departureDate = addDays(today, offset);
      const returnDate = addDays(departureDate, stay);
      const results = await searchEskyFlights({
        departureCode: route.from,
        arrivalCode: route.to,
        departureDate,
        returnDate,
        adults: 1,
        currency: "PLN",
        language: "PL"
      });
      return { route, departureDate, returnDate, results };
    }));

    for (const result of settled) {
      if (result.status !== "fulfilled") continue;
      const { route, departureDate, returnDate, results } = result.value;
      const positivePrices = results.map((item) => item.price).filter((price) => Number.isFinite(price) && price > 0);
      const cheapest = bestResult(results);
      const medianPrice = median(positivePrices);
      if (!cheapest || !medianPrice || positivePrices.length < 3) continue;
      const discountPct = Math.round(((medianPrice - cheapest.price) / medianPrice) * 100);
      const extremelyCheap = cheapest.price <= route.maxGemPrice * 0.65;
      const marketGem = cheapest.price <= route.maxGemPrice && discountPct >= 12;
      if (!extremelyCheap && !marketGem) continue;
      const priceAdvantage = Math.max(0, (route.maxGemPrice - cheapest.price) / route.maxGemPrice);
      const score = discountPct * 2 + priceAdvantage * 50;
      candidates.push({
        route,
        departureDate,
        returnDate,
        cheapest,
        medianPrice,
        discountPct,
        comparableCount: positivePrices.length,
        score
      });
    }
  }

  const best = candidates.sort((a, b) => b.score - a.score || a.cheapest.price - b.cheapest.price)[0];
  if (!best) {
    return NextResponse.json({ ok: true, configured: true, checkedAt, searched: routes.length, gem: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const numericDate = Number(today.replace(/-/g, ""));
  const gem = {
    id: 900000000 + numericDate,
    from: best.route.from,
    to: best.route.to,
    city: best.route.city,
    country: best.route.country,
    flag: best.route.flag,
    image: best.route.image,
    price: best.cheapest.price,
    currency: best.cheapest.currency || "PLN",
    bookingUrl: best.cheapest.bookingUrl,
    departureDate: best.departureDate,
    returnDate: best.returnDate,
    checkedAt,
    medianPrice: Math.round(best.medianPrice),
    discountPct: best.discountPct,
    comparableCount: best.comparableCount,
    outbound: best.cheapest.outbound || null,
    inbound: best.cheapest.inbound || null
  };

  return NextResponse.json({ ok: true, configured: true, checkedAt, searched: routes.length, gem }, { headers: { "Cache-Control": "no-store" } });
}
