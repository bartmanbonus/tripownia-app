import { NextRequest, NextResponse } from "next/server";
import type { Offer } from "@/lib/offers";
import { touristDestinationKey } from "@/lib/destinationGrouping";
import { GET as getTodayOffers } from "@/app/api/today-offers/route";

type DealsOffer = Offer & {
  startDateISO?: string;
  airportCode?: string;
};

type SourcePayload = {
  ok?: boolean;
  checkedAt?: string;
  offers?: DealsOffer[];
  error?: string;
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

function dateParts(offer: DealsOffer) {
  if (!offer.startDateISO || !/^20\d{2}-\d{2}-\d{2}$/.test(offer.startDateISO)) return null;
  const [year, month] = offer.startDateISO.split("-");
  return { year, month };
}

function dateMatches(offer: DealsOffer, month: string, year: string) {
  if (!month && !year) return true;
  const parts = dateParts(offer);
  if (!parts) return false;
  if (month && parts.month !== month) return false;
  if (year && parts.year !== year) return false;
  return true;
}

function monthDistance(offer: DealsOffer, month: string, year: string) {
  const parts = dateParts(offer);
  if (!parts) return Number.POSITIVE_INFINITY;
  if (!month && !year) return 0;

  const targetYear = Number(year || parts.year);
  const targetMonth = Number(month || parts.month);
  const offerYear = Number(parts.year);
  const offerMonth = Number(parts.month);
  return Math.abs((offerYear * 12 + offerMonth) - (targetYear * 12 + targetMonth));
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

function closestPerDestination(offers: DealsOffer[], month: string, year: string) {
  const ranked = [...offers].sort((a, b) => {
    const distance = monthDistance(a, month, year) - monthDistance(b, month, year);
    return distance || Number(a.price) - Number(b.price);
  });

  const seen = new Set<string>();
  const result: DealsOffer[] = [];
  for (const offer of ranked) {
    const key = touristDestinationKey(offer);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(offer);
    if (result.length >= 20) break;
  }
  return result;
}

async function loadProvider(request: NextRequest, provider: "exim" | "tui") {
  const sourceUrl = new URL("/api/today-offers", request.url);
  sourceUrl.searchParams.set("mode", "search");
  sourceUrl.searchParams.set("broad", "1");
  sourceUrl.searchParams.set("provider", provider);

  const sourceRequest = new NextRequest(sourceUrl, { headers: request.headers });
  const response = await getTodayOffers(sourceRequest);
  const payload = await response.json() as SourcePayload;
  return { response, payload };
}

export async function GET(request: NextRequest) {
  const airport = (request.nextUrl.searchParams.get("from") || "").trim();
  const rawMonth = (request.nextUrl.searchParams.get("month") || "").trim();
  const rawYear = (request.nextUrl.searchParams.get("year") || "").trim();
  const month = /^(0[1-9]|1[0-2])$/.test(rawMonth) ? rawMonth : "";
  const year = /^20\d{2}$/.test(rawYear) ? rawYear : "";

  const [eximResult, tuiResult] = await Promise.all([
    loadProvider(request, "exim"),
    loadProvider(request, "tui"),
  ]);

  const successful = [eximResult, tuiResult].filter((item) => item.response.ok);
  if (!successful.length) {
    const error = eximResult.payload.error || tuiResult.payload.error || "Nie udało się pobrać okazji.";
    return NextResponse.json(
      { ok: false, offers: [], error },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  const combined = successful.flatMap((item) => Array.isArray(item.payload.offers) ? item.payload.offers : []);
  const unique = new Map<number, DealsOffer>();
  for (const offer of combined) {
    const current = unique.get(offer.id);
    if (!current || Number(offer.price) < Number(current.price)) unique.set(offer.id, offer);
  }
  const sourceOffers = Array.from(unique.values());

  const exact = sourceOffers
    .filter((offer) => airportMatches(offer, airport))
    .filter((offer) => dateMatches(offer, month, year));

  let offers = cheapestPerDestination(exact).slice(0, 20);
  let matchMode = "exact";
  let notice = offers.length
    ? "Dokładne dopasowanie do wybranych filtrów."
    : "";

  if (!offers.length && (month || year)) {
    const sameDate = sourceOffers.filter((offer) => dateMatches(offer, month, year));
    if (sameDate.length) {
      offers = cheapestPerDestination(sameDate).slice(0, 20);
      matchMode = "same_date_other_airport";
      notice = airport
        ? "Nie ma teraz dokładnego dopasowania z tego lotniska. Pokazujemy ten sam termin z innych dostępnych lotnisk."
        : "Pokazujemy najlepsze okazje dla wybranego terminu.";
    }
  }

  if (!offers.length && airport) {
    const sameAirport = sourceOffers.filter((offer) => airportMatches(offer, airport));
    if (sameAirport.length) {
      offers = closestPerDestination(sameAirport, month, year);
      matchMode = "same_airport_nearby_date";
      notice = "Nie ma teraz dokładnego terminu. Pokazujemy najbliższe dostępne daty z wybranego lotniska.";
    }
  }

  if (!offers.length && year) {
    const sameYear = sourceOffers.filter((offer) => dateMatches(offer, "", year));
    if (sameYear.length) {
      offers = closestPerDestination(sameYear, month, year);
      matchMode = "same_year";
      notice = "Nie ma dokładnego dopasowania. Pokazujemy najbliższe dostępne okazje w wybranym roku.";
    }
  }

  if (!offers.length && sourceOffers.length) {
    offers = closestPerDestination(sourceOffers, month, year);
    matchMode = "closest";
    notice = "Nie znaleźliśmy dokładnej kombinacji. Pokazujemy najbliższe potwierdzone okazje, zamiast zostawiać pusty wynik.";
  }

  const checkedAt = successful
    .map((item) => item.payload.checkedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) || new Date().toISOString();

  return NextResponse.json(
    {
      ok: true,
      checkedAt,
      sourceCount: sourceOffers.length,
      exactCount: exact.length,
      destinationCount: offers.length,
      matchMode,
      filters: { airport: airport || null, month: month || null, year: year || null },
      notice,
      offers,
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
  );
}
