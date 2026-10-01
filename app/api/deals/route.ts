import { NextRequest, NextResponse } from "next/server";
import { offers as publishedOffers, type Offer } from "@/lib/offers";
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

// Keep a broad enough live pool so valid affiliate deals are not hidden too early.
const DEAL_LIMIT = 36;

function normalize(value: string | undefined | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function destinationMatches(offer: DealsOffer, destination: string) {
  if (!destination) return true;
  const query = normalize(destination);
  if (!query) return true;
  const haystack = normalize(`${offer.city || ""} ${offer.country || ""} ${offer.hotel || ""} ${offer.reason || ""}`);
  return haystack.includes(query) || query.includes(normalize(offer.city)) || query.includes(normalize(offer.country));
}

function typeMatches(offer: DealsOffer, type: string) {
  if (!type) return true;
  if (type === "allinclusive") {
    const categories = Array.isArray(offer.category) ? offer.category : [];
    return categories.includes("allinclusive") || /all\s*inclusive/i.test(offer.board || "");
  }
  return true;
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
  if (code === "RZE") return /rzeszow|jasionka|\brze\b/.test(haystack);
  if (code === "LUZ") return /lublin|swidnik|\bluz\b/.test(haystack);
  if (code === "SZZ") return /szczecin|goleniow|\bszz\b/.test(haystack);
  if (code === "LCJ") return /lodz|lublinek|\blcj\b/.test(haystack);
  if (code === "BZG") return /bydgoszcz|\bbzg\b/.test(haystack);
  if (code === "SZY") return /olsztyn|mazur|szymany|\bszy\b/.test(haystack);
  if (code === "WMI") return /modlin|\bwmi\b/.test(haystack);
  return false;
}

function polishDepartureMatches(offer: DealsOffer) {
  const haystack = normalize(`${offer.departure || ""} ${offer.airportCode || ""}`);
  return /polska|warszawa|chopin|modlin|radom|krakow|balice|katowice|pyrzowice|gdansk|rebiechowo|wroclaw|strachowice|poznan|lawica|rzeszow|jasionka|lublin|swidnik|szczecin|goleniow|lodz|lublinek|bydgoszcz|zielona gora|babimost|olsztyn|mazury|szymany|\bwaw\b|\bwmi\b|\brdo\b|\bkrk\b|\bktw\b|\bgdn\b|\bwro\b|\bpoz\b|\brze\b|\bluz\b|\bszz\b|\blcj\b|\bbzg\b|\bieg\b|\bszy\b/.test(haystack);
}

function requestedDepartureMatches(offer: DealsOffer, airport: string) {
  return airport ? airportMatches(offer, airport) : polishDepartureMatches(offer);
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
  const destination = (request.nextUrl.searchParams.get("q") || request.nextUrl.searchParams.get("destination") || "").trim();
  const type = (request.nextUrl.searchParams.get("type") || "").trim().toLowerCase();
  const strict = request.nextUrl.searchParams.get("strict") === "1";
  const rawMonth = (request.nextUrl.searchParams.get("month") || "").trim();
  const rawYear = (request.nextUrl.searchParams.get("year") || "").trim();
  const month = /^(0[1-9]|1[0-2])$/.test(rawMonth) ? rawMonth : "";
  const year = /^20\d{2}$/.test(rawYear) ? rawYear : "";

  // Okazje use one combined live package pool across available providers plus
  // short EXIM city breaks. We deduplicate only after the combined pool is loaded,
  // so a temporarily partial provider response cannot be mistaken for the cheapest deal.
  const results = await Promise.all([
    loadSource(request, "combined-packages", destination ? { mode: "search", q: destination } : { mode: "search", broad: "1" }),
    loadSource(request, "exim-citybreaks", destination ? { mode: "citybreak", q: destination, provider: "exim" } : { mode: "citybreak", provider: "exim" }),
  ]);

  const successful = results.filter((item) => item.response.ok);
  const unavailableSources = results.filter((item) => !item.response.ok).map((item) => item.label);
  if (!successful.length) {
    const fallbackPool = (publishedOffers as DealsOffer[])
      .filter(isUsableDeal)
      .filter(polishDepartureMatches)
      .filter((offer) => typeMatches(offer, type))
      .filter((offer) => destinationMatches(offer, destination));
    const fallbackExact = fallbackPool
      .filter((offer) => requestedDepartureMatches(offer, airport))
      .filter((offer) => dateMatches(offer, month, year));
    const fallbackOffers = lowestPriceDeals(
      fallbackExact.length ? fallbackExact : strict && (airport || month || year) ? [] : fallbackPool
    );
    const error = results.map((item) => item.payload.error).find(Boolean) || "Nie udało się pobrać okazji.";

    if (fallbackOffers.length) {
      return NextResponse.json(
        {
          ok: true,
          checkedAt: new Date().toISOString(),
          sourceCount: fallbackPool.length,
          exactCount: fallbackExact.length,
          destinationCount: fallbackOffers.length,
          sort: "price_asc",
          selection: "cheapest_per_destination",
          sources: ["published-fallback"],
          unavailableSources: results.map((item) => item.label),
          partial: true,
          sourceType: "published_fallback",
          matchMode: fallbackExact.length ? "fallback_exact" : "fallback_pool",
          filters: { destination: destination || null, type: type || null, airport: airport || null, month: month || null, year: year || null, strict },

          notice: "Część aktualnych danych jest chwilowo niedostępna. Pokazujemy ostatnio sprawdzone oferty Tripowni; cenę i dostępność potwierdź przy rezerwacji.",
          offers: fallbackOffers,
          error,
        },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
      );
    }

    if (strict) {
      return NextResponse.json(
        {
          ok: true,
          offers: [],
          checkedAt: new Date().toISOString(),
          sourceCount: 0,
          exactCount: 0,
          destinationCount: 0,
          sort: "price_asc",
          selection: "cheapest_per_destination",
          sources: [],
          unavailableSources: results.map((item) => item.label),
          partial: true,
          sourceType: "live_unavailable",
          matchMode: "strict_no_match",
          filters: { destination: destination || null, type: type || null, airport: airport || null, month: month || null, year: year || null, strict },
          notice: airport
            ? "Nie mamy teraz potwierdzonej oferty z wybranego lotniska. Nie pokazujemy ofert z innego miasta."
            : "Nie mamy teraz potwierdzonej oferty spełniającej te filtry.",
          error,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

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
  const sourceOffers = Array.from(unique.values())
    .filter(polishDepartureMatches)
    .filter((offer) => typeMatches(offer, type))
    .filter((offer) => destinationMatches(offer, destination));

  if (!sourceOffers.length) {
    const fallbackPool = (publishedOffers as DealsOffer[]).filter(isUsableDeal).filter((offer) => typeMatches(offer, type)).filter((offer) => destinationMatches(offer, destination));
    const fallbackExact = fallbackPool
      .filter((offer) => requestedDepartureMatches(offer, airport))
      .filter((offer) => dateMatches(offer, month, year));
    const fallbackOffers = lowestPriceDeals(
      fallbackExact.length ? fallbackExact : strict && (airport || month || year) ? [] : fallbackPool
    );

    if (fallbackOffers.length) {
      return NextResponse.json(
        {
          ok: true,
          checkedAt: new Date().toISOString(),
          sourceCount: fallbackPool.length,
          exactCount: fallbackExact.length,
          destinationCount: fallbackOffers.length,
          sort: "price_asc",
          selection: "cheapest_per_destination",
          sources: ["published-fallback"],
          unavailableSources,
          partial: true,
          sourceType: "published_fallback",
          matchMode: fallbackExact.length ? "fallback_exact" : "fallback_pool",
          filters: { destination: destination || null, type: type || null, airport: airport || null, month: month || null, year: year || null, strict },
          notice: "Nie znaleźliśmy teraz nowszych ofert. Pokazujemy ostatnio sprawdzone propozycje Tripowni; cenę i dostępność potwierdź przy rezerwacji.",
          offers: fallbackOffers,
        },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
      );
    }
  }

  const exact = sourceOffers
    .filter((offer) => requestedDepartureMatches(offer, airport))
    .filter((offer) => dateMatches(offer, month, year));

  let offers = lowestPriceDeals(exact);
  let matchMode = "exact";
  let notice = offers.length
    ? type === "allinclusive"
      ? "Najtańsze aktualne All Inclusive są na górze. Dla każdego kierunku zostawiamy najtańszą potwierdzoną ofertę."
      : "Najtańsze znalezione ceny z polskich lotnisk są na górze. Dla każdego kierunku zostawiamy tylko najtańszą aktualną ofertę."
    : "";

  if (!strict && !offers.length && (month || year)) {
    const sameDate = sourceOffers.filter((offer) => dateMatches(offer, month, year));
    if (sameDate.length) {
      offers = lowestPriceDeals(sameDate);
      matchMode = "same_date_other_airport";
      notice = airport
        ? "Brak ceny z wybranego lotniska. Pokazujemy najtańsze oferty w tym samym terminie z innych lotnisk."
        : "Pokazujemy najtańsze znalezione oferty dla wybranego terminu.";
    }
  }

  if (!strict && !offers.length && airport) {
    const sameAirport = sourceOffers.filter((offer) => airportMatches(offer, airport));
    if (sameAirport.length) {
      offers = closestCheapDeals(sameAirport, month, year);
      matchMode = "same_airport_nearby_date";
      notice = "Brak dokładnego terminu. Pokazujemy najbliższe daty z tego lotniska, nadal od najniższej ceny w każdym kierunku.";
    }
  }

  if (!strict && !offers.length && year) {
    const sameYear = sourceOffers.filter((offer) => dateMatches(offer, "", year));
    if (sameYear.length) {
      offers = closestCheapDeals(sameYear, month, year);
      matchMode = "same_year";
      notice = "Brak dokładnego dopasowania. Pokazujemy najtańsze znalezione opcje w wybranym roku.";
    }
  }

  if (!strict && !offers.length && sourceOffers.length) {
    offers = lowestPriceDeals(sourceOffers);
    matchMode = "closest";
    notice = destination
      ? `Pokazujemy najtańsze aktualne oferty dla kierunku: ${destination}.`
      : "Brak dokładnej kombinacji filtrów. Pokazujemy najtańsze aktualne okazje z całej potwierdzonej puli.";
  }

  if (strict && !offers.length) {
    matchMode = "strict_no_match";
    notice = airport
      ? "Brak potwierdzonej oferty spełniającej dokładnie wybrane lotnisko i filtry. Nie pokazujemy ofert z innego miasta."
      : "Brak potwierdzonej oferty spełniającej dokładnie wybrane filtry.";
  }

  if (unavailableSources.length) {
    const providerNotice = `Część danych jest chwilowo niedostępna. Pokazujemy tylko oferty, które udało się teraz potwierdzić.`;
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
      sourceType: "live",
      matchMode,
      filters: { destination: destination || null, type: type || null, airport: airport || null, month: month || null, year: year || null, strict },
      notice,
      offers,
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
  );
}
