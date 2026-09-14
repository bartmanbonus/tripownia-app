import { NextRequest, NextResponse } from "next/server";
import type { Offer } from "@/lib/offers";
import { touristDestinationKey } from "@/lib/destinationGrouping";
import { GET as getTodayOffers } from "@/app/api/today-offers/route";

type DealsOffer = Offer & {
  startDateISO?: string;
  airportCode?: string;
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

function airportMatches(offer: DealsOffer, airport: string) {
  if (!airport) return true;
  const haystack = normalize(`${offer.departure || ""} ${offer.airportCode || ""}`);
  const code = airport.toUpperCase();

  if (code === "WAWA") return /warszawa|chopin|modlin|\bwaw\b|\bwmi\b/.test(haystack);
  if (code === "KRK") return /krakow|balice|\bkrk\b/.test(haystack);
  if (code === "KTW") return /katowice|pyrzowice|\bktw\b/.test(haystack);
  if (code === "GDN") return /gdansk|rebiechowo|\bgdn\b/.test(haystack);
  if (code === "WRO") return /wroclaw|strachowice|\bwro\b/.test(haystack);
  if (code === "POZ") return /poznan|lawica|\bpoz\b/.test(haystack);
  return false;
}

function dateMatches(offer: DealsOffer, month: string, year: string) {
  if (!month && !year) return true;
  if (!offer.startDateISO || !/^20\d{2}-\d{2}-\d{2}$/.test(offer.startDateISO)) return false;

  const [offerYear, offerMonth] = offer.startDateISO.split("-");
  if (month && offerMonth !== month) return false;
  if (year && offerYear !== year) return false;
  return true;
}

function cheapestPerDestination(offers: DealsOffer[]) {
  const best = new Map<string, DealsOffer>();
  for (const offer of offers) {
    if (!offer || !Number.isFinite(Number(offer.price)) || Number(offer.price) <= 0) continue;
    const key = touristDestinationKey(offer);
    const current = best.get(key);
    if (!current || Number(offer.price) < Number(current.price)) best.set(key, offer);
  }
  return Array.from(best.values()).sort((a, b) => Number(a.price) - Number(b.price));
}

export async function GET(request: NextRequest) {
  const airport = (request.nextUrl.searchParams.get("from") || "").trim();
  const rawMonth = (request.nextUrl.searchParams.get("month") || "").trim();
  const rawYear = (request.nextUrl.searchParams.get("year") || "").trim();
  const month = /^(0[1-9]|1[0-2])$/.test(rawMonth) ? rawMonth : "";
  const year = /^20\d{2}$/.test(rawYear) ? rawYear : "";

  const sourceUrl = new URL("/api/today-offers", request.url);
  sourceUrl.searchParams.set("mode", "search");
  sourceUrl.searchParams.set("broad", "1");

  const sourceRequest = new NextRequest(sourceUrl, {
    headers: request.headers,
  });
  const sourceResponse = await getTodayOffers(sourceRequest);
  const payload = await sourceResponse.json() as {
    ok?: boolean;
    checkedAt?: string;
    offers?: DealsOffer[];
    error?: string;
  };

  if (!sourceResponse.ok) {
    return NextResponse.json(
      { ok: false, checkedAt: payload.checkedAt, offers: [], error: payload.error || "Nie udało się pobrać okazji." },
      { status: sourceResponse.status, headers: { "Cache-Control": "no-store" } }
    );
  }

  const sourceOffers = Array.isArray(payload.offers) ? payload.offers : [];
  const filtered = sourceOffers
    .filter((offer) => airportMatches(offer, airport))
    .filter((offer) => dateMatches(offer, month, year));
  const offers = cheapestPerDestination(filtered).slice(0, 20);

  return NextResponse.json(
    {
      ok: true,
      checkedAt: payload.checkedAt || new Date().toISOString(),
      sourceCount: sourceOffers.length,
      filteredCount: filtered.length,
      destinationCount: offers.length,
      strict: true,
      filters: { airport: airport || null, month: month || null, year: year || null },
      notice: offers.length
        ? "Pokazujemy wyłącznie okazje zgodne z wybranym lotniskiem, miesiącem i rokiem."
        : "Brak potwierdzonych okazji dla dokładnie wybranych filtrów.",
      offers,
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
  );
}
