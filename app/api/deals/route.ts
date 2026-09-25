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

type SourceResult = {
  response: Response;
  payload: SourcePayload;
  label: string;
};

const DEAL_LIMIT = 20;

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

function isUsableDeal(offer: DealsOffer) {
  return Boolean(
    offer &&
    Number.isFinite(Number(offer.price)) &&
    Number(offer.price) > 0 &&
    offer.affiliateUrl &&
    offer.availabilityStatus !== "expired"
  );
}

function cheapestPerDestination(offers: DealsOffer[]) {
  const best = new Map<string, DealsOffer>();
  for (const offer of offers) {
    if (!isUsableDeal(offer)) continue;
    const key = touristDestinationKey(offer);
    const current = best.get(key);
    if (!current || Number(offer.price) < Number(current.price)) best.set(key, offer);
  }
  return Array.from(best.values()).sort((a, b) => Number(a.price) - Number(b.price));
}

function lowestPriceDeals(offers: DealsOffer[], limit = DEAL_LIMIT) {
  return cheapestPerDestination(offers).slice(0, limit);
}

function closestCheapDeals(offers: DealsOffer[], month: string, year: string, limit = DEAL_LIMIT) {
  const ranked = cheapestPerDestination(offers).sort((a, b) => {
    const distance = monthDistance(a, month, year) - monthDistance(b, month, year);
    return distance || Number(a.price) - Number(b.price);
  });
  return ranked.slice(0, limit);
}

async function loadSource(
  request: NextRequest,
  label: string,
  params: Record<string, string>
): Promise<SourceResult> {
  const sourceUrl = new URL("/api/today-offers", request.url);
  Object.entries(params).forEach(([key, value]) => sourceUrl.searchParams.set(key, value));

  const sourceRequest = new NextRequest(sourceUrl, { headers: request.headers });
  const response = await getTodayOffers(sourceRequest);
  const payload = await response.json() as SourcePayload;
  return { response, payload, label };
}

export async function GET(request: NextRequest) {
  const airport = (request.nextUrl.searchParams.get("from") || "").trim();
  const rawMonth = (request.nextUrl.searchParams.get("month") || "").trim();
  const rawYear = (request.nextUrl.searchParams.get("year") || "").trim();
  const month = /^(0[1-9]|1[0-2])$/.test(rawMonth) ? rawMonth : "";
  const year = /^20\d{2}$/.test(rawYear) ? rawYear : "";

  // Okazje use a wider price pool than the homepage daily ranking. Packages
  // from both providers are merged with short EXIM city breaks, then reduced
  // to the cheapest live option for every tourist destination.
  const results = await Promise.all([
    loadSource(request, "exim-packages", { mode: "search", broad: "1", provider: "exim" }),
    loadSource(request, "tui-packages", { mode: "search", broad: "1", provider: "tui" }),
    loadSource(request, "exim-citybreaks", { mode: "citybreak", provider: "exim" }),
  ]);

  const successful = results.filter((item) => item.response.ok);
  const unavailableSources = results.filter((item) => !item.response.ok).map((item) => item.label);
  if (!successful.length) {
    const error = results.map((item) => item.payload.error).find(Boolean) || "Nie udało się pobrać okazji.";
    return NextResponse.json(
      { ok: false, offers: [], error },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  const combined = successful.flatMap((item) => Array.isArray(item.payload.offers) ? item.payload.offers : []);
  const unique = new Map<number, DealsOffer>();
  for (const offer of combined) {
    if (!isUsableDeal(offer)) continue;
    const current = unique.get(offer.id);
    if (!current || Number(offer.price) < Number(current.price)) unique.set(offer.id, offer);
  }
  const sourceOffers = Array.from(unique.values());

  const exact = sourceOffers
    .filter((offer) => airportMatches(offer, airport))
    .filter((offer) => dateMatches(offer, month, year));

  let offers = lowestPriceDeals(exact);
  let matchMode = "exact";
  let notice = offers.length
    ? "Najtańsze znalezione ceny są na górze. Dla każdego kierunku zostawiamy tylko najtańszą aktualną ofertę."
    : "";

  if (!offers.length && (month || year)) {
    const sameDate = sourceOffers.filter((offer) => dateMatches(offer, month, year));
    if (sameDate.length) {
      offers = lowestPriceDeals(sameDate);
      matchMode = "same_date_other_airport";
      notice = airport
        ? "Brak ceny z wybranego lotniska. Pokazujemy najtańsze oferty w tym samym terminie z innych lotnisk."
        : "Pokazujemy najtańsze znalezione oferty dla wybranego terminu.";
    }
  }

  if (!offers.length && airport) {
    const sameAirport = sourceOffers.filter((offer) => airportMatches(offer, airport));
    if (sameAirport.length) {
      offers = closestCheapDeals(sameAirport, month, year);
      matchMode = "same_airport_nearby_date";
      notice = "Brak dokładnego terminu. Pokazujemy najbliższe daty z tego lotniska, nadal od najniższej ceny w każdym kierunku.";
    }
  }

  if (!offers.length && year) {
    const sameYear = sourceOffers.filter((offer) => dateMatches(offer, "", year));
    if (sameYear.length) {
      offers = closestCheapDeals(sameYear, month, year);
      matchMode = "same_year";
      notice = "Brak dokładnego dopasowania. Pokazujemy najtańsze znalezione opcje w wybranym roku.";
    }
  }

  if (!offers.length && sourceOffers.length) {
    offers = lowestPriceDeals(sourceOffers);
    matchMode = "closest";
    notice = "Brak dokładnej kombinacji filtrów. Pokazujemy najtańsze aktualne okazje z całej potwierdzonej puli.";
  }

  if (unavailableSources.length) {
    const providerNotice = `Część źródeł jest chwilowo niedostępna (${unavailableSources.join(", ")}). Pokazujemy tylko oferty potwierdzone przez działające źródła.`;
    notice = notice ? `${notice} ${providerNotice}` : providerNotice;
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
      sort: "price_asc",
      selection: "cheapest_per_destination",
      sources: successful.map((item) => item.label),
      unavailableSources,
      partial: unavailableSources.length > 0,
      matchMode,
      filters: { airport: airport || null, month: month || null, year: year || null },
      notice,
      offers,
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
  );
}
