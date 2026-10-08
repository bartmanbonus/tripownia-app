import { NextRequest, NextResponse } from "next/server";
import { homepageFallbackOffers as publishedOffers, type Offer } from "@/lib/offers";
import { dedupeOffersByIdentity, isUsableOffer } from "@/lib/offerEngine";
import { GET as getTodayOffers } from "@/app/api/today-offers/route";
import { destinationQueryMatches } from "@/lib/destinationAliases";
import { partners } from "@/lib/partners";
import { isPromotableOffer } from "@/lib/offerValuePolicy";

type DealsOffer = Offer & {
  startDateISO?: string;
  airportCode?: string;
};

type SourcePayload = {
  ok?: boolean;
  checkedAt?: string;
  offers?: DealsOffer[];
  error?: string;
  partial?: boolean;
};

type SourceResult = {
  response: Response;
  payload: SourcePayload;
  label: string;
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

function destinationMatches(offer: DealsOffer, destination: string) {
  if (!destination) return true;
  const query = normalize(destination);
  if (!query) return true;
  const haystack = normalize(`${offer.city || ""} ${offer.country || ""} ${offer.hotel || ""} ${offer.reason || ""}`);
  return haystack.includes(query)
    || query.includes(normalize(offer.city))
    || query.includes(normalize(offer.country))
    || destinationQueryMatches(destination, offer.city, offer.country, offer.hotel, offer.reason);
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
  if (code === "WAW") return /warszawa|chopin|okecie|\bwaw\b/.test(haystack) && !/modlin|\bwmi\b/.test(haystack);
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
  if (code === "IEG") return /zielona gora|babimost|\bieg\b/.test(haystack);
  if (code === "SZY") return /olsztyn|mazur|szymany|\bszy\b/.test(haystack);
  if (code === "RDO") return /radom|\brdo\b/.test(haystack);
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
  if (parts) {
    if (month && parts.month !== month) return false;
    if (year && parts.year !== year) return false;
    return true;
  }

  // Published fallback offers often have human-readable ranges instead of
  // startDateISO. Respect explicit month/year filters rather than silently
  // showing a different period when the live feed is unavailable.
  const dateText = normalize(offer.dates || "");
  if (year && !dateText.includes(year)) return false;
  if (!month) return true;

  const monthNames: Record<string, string> = {
    "01": "styczen", "02": "luty", "03": "marzec", "04": "kwiecien",
    "05": "maj", "06": "czerwiec", "07": "lipiec", "08": "sierpien",
    "09": "wrzesien", "10": "pazdziernik", "11": "listopad", "12": "grudzien",
  };
  const monthName = monthNames[month];
  return Boolean(monthName && dateText.includes(monthName));
}

function selectedMonthSourceParams(month: string, year: string): Record<string, string> {
  if (!month || !year) return {};
  const lastDay = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
    dateKind: "departure",
  };
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
  return isUsableOffer(offer, "live");
}

function isUsableDestinationCatalogOffer(offer: DealsOffer) {
  return Boolean(
    offer
    && Number.isFinite(Number(offer.price))
    && Number(offer.price) > 0
    && offer.affiliateUrl
    && offer.linkMatch !== "unsafe"
    && offer.availabilityStatus !== "expired"
  );
}

function dedupeDestinationCatalogOffers(offers: DealsOffer[]) {
  const unique = new Map<string, DealsOffer>();
  for (const offer of offers) {
    if (!isUsableDestinationCatalogOffer(offer)) continue;
    const key = `${offer.partner}:${offer.id}`;
    const current = unique.get(key);
    if (!current || Number(offer.price) < Number(current.price)) unique.set(key, offer);
  }
  return Array.from(unique.values());
}

function isUsablePublishedFallback(offer: DealsOffer) {
  // Published/manual rows may keep the catalogue broad, but they must never be
  // reintroduced as priced commercial offers after their verification expired.
  return isUsableOffer(offer, "fallback") && isPromotableOffer(offer);
}

function sortedDestinationOffers(
  offers: DealsOffer[],
  mode: "live" | "fallback"
) {
  const usable = mode === "live"
    ? dedupeDestinationCatalogOffers(offers)
    : dedupeOffersByIdentity(offers, mode);
  return usable
    .sort((a, b) => Number(a.price) - Number(b.price) || Number(b.score || 0) - Number(a.score || 0));
}

function fallbackSelection(offers: DealsOffer[], destination: string) {
  if (destination) return sortedDestinationOffers(offers, "fallback");
  return dedupeOffersByIdentity(offers, "fallback")
    .sort((a, b) => Number(a.price) - Number(b.price) || Number(b.score || 0) - Number(a.score || 0));
}

function lowestPriceDeals(offers: DealsOffer[], destination: string) {
  if (destination) return sortedDestinationOffers(offers, "live");
  return dedupeOffersByIdentity(offers, "live")
    .sort((a, b) => Number(a.price) - Number(b.price) || Number(b.score || 0) - Number(a.score || 0));
}

function closestCheapDeals(offers: DealsOffer[], month: string, year: string, destination: string) {
  const ranked = destination
    ? dedupeDestinationCatalogOffers(offers)
    : dedupeOffersByIdentity(offers, "live");

  return ranked.sort((a, b) => {
    const distance = monthDistance(a, month, year) - monthDistance(b, month, year);
    return distance || Number(a.price) - Number(b.price);
  });
}


type FlightCalendarRow = {
  destination?: string;
  depart_date?: string;
  return_date?: string;
  depart_stops?: number;
  return_stops?: number;
  value?: number | null;
};

const CITY_FLIGHT_TARGETS = [
  { code: "MXP", city: "Mediolan", country: "Włochy", image: "/images/destinations/bergamo.jpg", kiwi: "milan-italy" },
  { code: "FCO", city: "Rzym", country: "Włochy", image: "/images/destinations/rzym.jpg", kiwi: "rome-italy" },
  { code: "BCN", city: "Barcelona", country: "Hiszpania", image: "/images/destinations/barcelona.jpg", kiwi: "barcelona-spain" },
  { code: "VIE", city: "Wiedeń", country: "Austria", image: "/images/destinations/wieden.jpg", kiwi: "vienna-austria" },
  { code: "BUD", city: "Budapeszt", country: "Węgry", image: "/images/destinations/budapeszt.jpg", kiwi: "budapest-hungary" },
  { code: "PRG", city: "Praga", country: "Czechy", image: "/images/destinations/praga.jpg", kiwi: "prague-czechia" },
  { code: "OPO", city: "Porto", country: "Portugalia", image: "/images/destinations/porto.jpg", kiwi: "porto-portugal" },
  { code: "LIS", city: "Lizbona", country: "Portugalia", image: "/images/destinations/lizbona.jpg", kiwi: "lisbon-portugal" },
];

const ORIGIN_KIWI: Record<string, string> = {
  WAW: "warsaw-poland", WMI: "warsaw-poland", KRK: "krakow-poland", KTW: "katowice-poland",
  GDN: "gdansk-poland", WRO: "wroclaw-poland", POZ: "poznan-poland", RZE: "rzeszow-poland",
};

function originForFlights(airport: string) {
  const code = airport.toUpperCase();
  if (!code || code === "WAWA") return "WAW";
  return /^[A-Z]{3}$/.test(code) ? code : "WAW";
}

function flightMonth(month: string, year: string) {
  if (month && year) return `${year}-${month}`;
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function kiwiSearchUrl(origin: string, target: string, departDate: string, returnDate: string) {
  const from = ORIGIN_KIWI[origin] || "warsaw-poland";
  const url = `https://www.kiwi.com/pl/search/results/${from}/${target}/${departDate}/${returnDate}`;
  return partners.kiwi.buildUrl(url);
}

async function loadKiwiCityBreakFlights(airport: string, month: string, year: string): Promise<DealsOffer[]> {
  const origin = originForFlights(airport);
  const selectedMonth = flightMonth(month, year);
  const targets = CITY_FLIGHT_TARGETS.slice(0, 8);

  const settled = await Promise.allSettled(targets.map(async (target) => {
    const upstream = new URL("https://suggest.apistp.com/uaca/v1/get_data_forward");
    upstream.searchParams.set("service", "calendar_aviasales_month");
    upstream.searchParams.set("origin_iata", origin);
    upstream.searchParams.set("currency", "pln");
    upstream.searchParams.set("destination_iata", target.code);
    upstream.searchParams.set("one_way", "false");
    upstream.searchParams.set("min_trip_duration", "2");
    upstream.searchParams.set("max_trip_duration", "5");
    upstream.searchParams.set("only_direct", "true");
    upstream.searchParams.set("month", selectedMonth);
    upstream.searchParams.set("host", "hydra.aviasales.com");

    const response = await fetch(upstream, {
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) throw new Error(`flight_calendar_${response.status}`);
    const data = await response.json() as { month?: Record<string, FlightCalendarRow> };
    const rows = Object.values(data?.month || {})
      .filter((row) => Number(row.value || 0) > 0 && row.depart_date && row.return_date)
      .filter((row) => Number(row.depart_stops || 0) === 0 && Number(row.return_stops || 0) === 0)
      .sort((a, b) => Number(a.value || Infinity) - Number(b.value || Infinity));
    const best = rows[0];
    if (!best?.depart_date || !best.return_date || !best.value) return null;

    const start = new Date(`${best.depart_date}T00:00:00Z`);
    const end = new Date(`${best.return_date}T00:00:00Z`);
    const nights = Math.max(2, Math.round((end.getTime() - start.getTime()) / 86400000));
    const sourceKey = `kiwi-flight:${origin}:${target.code}:${best.depart_date}:${best.return_date}`;
    let hashValue = 0;
    for (let i = 0; i < sourceKey.length; i++) hashValue = ((hashValue << 5) - hashValue + sourceKey.charCodeAt(i)) | 0;

    return {
      id: 1_850_000_000 + Math.abs(hashValue % 100_000_000),
      flag: target.country === "Włochy" ? "🇮🇹" : target.country === "Hiszpania" ? "🇪🇸" : target.country === "Austria" ? "🇦🇹" : target.country === "Węgry" ? "🇭🇺" : target.country === "Czechy" ? "🇨🇿" : "🇵🇹",
      city: target.city,
      country: target.country,
      price: Math.round(Number(best.value)),
      priceCheckedAt: new Date().toISOString(),
      availabilityStatus: "available" as const,
      departure: origin === "WAW" ? "Warszawa Chopina" : origin,
      airportCode: origin,
      nights,
      weather: "sprawdź",
      score: 9,
      tag: Math.round(Number(best.value)) <= 300 ? "BIERZEMY" as const : "OKAZJA" as const,
      reason: `Sam lot w obie strony · ${nights} dni · bezpośrednio · od ${Math.round(Number(best.value))} zł/os.`,
      image: target.image,
      category: ["city", "weekend", "flight", "tanio"],
      hotel: "Sam lot",
      board: "Bez hotelu",
      dates: `${best.depart_date}–${best.return_date}`,
      partner: "kiwi" as const,
      affiliateUrl: kiwiSearchUrl(origin, target.kiwi, best.depart_date, best.return_date),
      linkType: "exact" as const,
      linkMatch: "parameters" as const,
      startDateISO: best.depart_date,
    } satisfies DealsOffer;
  }));

  return settled.flatMap((item) => item.status === "fulfilled" && item.value ? [item.value] : []);
}

function mixedOfferSelection(liveOffers: DealsOffer[], fallbackOffers: DealsOffer[], flightOffers: DealsOffer[], destination: string) {
  const live = lowestPriceDeals(liveOffers, destination);
  const fallback = fallbackSelection(fallbackOffers, destination);
  const unique = new Map<string, DealsOffer>();
  for (const offer of [...live, ...fallback, ...flightOffers]) {
    const key = `${offer.partner}:${offer.id}`;
    const current = unique.get(key);
    if (!current || Number(offer.price) < Number(current.price)) unique.set(key, offer);
  }
  return Array.from(unique.values()).sort((a, b) => Number(a.price) - Number(b.price) || Number(b.score || 0) - Number(a.score || 0));
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
  const hasScopedFallbackFilter = Boolean(airport || month || year);

  // Push airport/month scope into provider queries so destination pages search
  // the requested inventory instead of filtering one generic snapshot afterwards.
  const sourceScope: Record<string, string> = {
    ...(airport ? { from: airport } : {}),
    ...selectedMonthSourceParams(month, year),
    ...(strict ? { strict: "1" } : {}),
  };

  const sourceRequests: Array<Promise<SourceResult>> = [
    loadSource(
      request,
      "combined-packages",
      destination
        ? { mode: "search", q: destination, ...sourceScope }
        : { mode: "search", broad: "1", fast: "1", ...sourceScope }
    ),
  ];

  // Typed destination search already includes short stays. Avoid a duplicate
  // city-break request for the same destination, which can trigger provider limits.
  if (!destination) {
    sourceRequests.push(
      loadSource(request, "combined-citybreaks", { mode: "citybreak", fast: "1", ...sourceScope })
    );
  }

  const results = await Promise.all(sourceRequests);
  const kiwiCityBreakFlights = destination || type === "allinclusive" ? [] : await loadKiwiCityBreakFlights(airport, month, year);

  const successful = results.filter((item) => item.response.ok);
  const unavailableSources = results.filter((item) => !item.response.ok || item.payload.partial).map((item) => item.label);
  if (!successful.length) {
    const fallbackPool = (publishedOffers as DealsOffer[])
      .filter(isUsablePublishedFallback)
      .filter(polishDepartureMatches)
      .filter((offer) => typeMatches(offer, type))
      .filter((offer) => destinationMatches(offer, destination));
    const fallbackExact = fallbackPool
      .filter((offer) => requestedDepartureMatches(offer, airport))
      .filter((offer) => dateMatches(offer, month, year));
    const fallbackOffers = fallbackSelection(
      fallbackExact.length ? fallbackExact : hasScopedFallbackFilter ? [] : fallbackPool,
      destination
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
          selection: destination ? "multiple_offers_for_destination" : "all_available_offers",
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
          selection: destination ? "multiple_offers_for_destination" : "all_available_offers",
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
  // Destination catalogue pages are search surfaces, not editorial "top deal" rails.
  // Keep exact affiliate inventory even when it is expensive or the upstream feed
  // marks availability as "unknown"; otherwise valid long-haul stock disappears.
  const sourceOffers = (destination
    ? dedupeDestinationCatalogOffers(combined)
    : dedupeOffersByIdentity(combined, "live"))
    .filter(polishDepartureMatches)
    .filter((offer) => typeMatches(offer, type))
    .filter((offer) => destinationMatches(offer, destination));

  if (!sourceOffers.length) {
    const fallbackPool = (publishedOffers as DealsOffer[]).filter(isUsablePublishedFallback).filter(polishDepartureMatches).filter((offer) => typeMatches(offer, type)).filter((offer) => destinationMatches(offer, destination));
    const fallbackExact = fallbackPool
      .filter((offer) => requestedDepartureMatches(offer, airport))
      .filter((offer) => dateMatches(offer, month, year));
    const fallbackOffers = fallbackSelection(
      fallbackExact.length ? fallbackExact : hasScopedFallbackFilter ? [] : fallbackPool,
      destination
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
          selection: destination ? "multiple_offers_for_destination" : "all_available_offers",
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

  // Keep the deals page commercially diverse even when one live provider is down.
  // Published partner rows are clearly presented as last-checked/indicative, while
  // Kiwi flight cards use a real current flight-calendar price for 2–5 day trips.
  const publishedSupplement = (publishedOffers as DealsOffer[])
    .filter(isUsablePublishedFallback)
    .filter(polishDepartureMatches)
    .filter((offer) => typeMatches(offer, type))
    .filter((offer) => destinationMatches(offer, destination))
    .filter((offer) => requestedDepartureMatches(offer, airport))
    .filter((offer) => dateMatches(offer, month, year));

  // When live providers are only partially available, prefer an exact published
  // fallback for the requested airport/date over silently widening the user's
  // filters to another airport or nearby month.
  if (!exact.length && unavailableSources.length && hasScopedFallbackFilter) {
    const fallbackPool = (publishedOffers as DealsOffer[])
      .filter(isUsablePublishedFallback)
      .filter(polishDepartureMatches)
      .filter((offer) => typeMatches(offer, type))
      .filter((offer) => destinationMatches(offer, destination));
    const fallbackExact = fallbackPool
      .filter((offer) => requestedDepartureMatches(offer, airport))
      .filter((offer) => dateMatches(offer, month, year));
    const fallbackOffers = fallbackSelection(fallbackExact, destination);

    if (fallbackOffers.length) {
      return NextResponse.json(
        {
          ok: true,
          checkedAt: new Date().toISOString(),
          sourceCount: sourceOffers.length,
          exactCount: fallbackExact.length,
          destinationCount: fallbackOffers.length,
          sort: "price_asc",
          selection: destination ? "multiple_offers_for_destination" : "all_available_offers",
          sources: ["published-fallback"],
          unavailableSources,
          partial: true,
          sourceType: "published_fallback",
          matchMode: "fallback_exact",
          filters: { destination: destination || null, type: type || null, airport: airport || null, month: month || null, year: year || null, strict },
          notice: "Nie udało się teraz potwierdzić pełnej puli live dla tych filtrów. Pokazujemy pasujące, nieprzeterminowane propozycje Tripowni; finalną cenę i dostępność potwierdź u partnera.",
          offers: fallbackOffers,
        },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
      );
    }
  }

  let offers = mixedOfferSelection(exact, publishedSupplement, kiwiCityBreakFlights, destination);
  let matchMode = "exact";
  let notice = offers.length
    ? destination
      ? `Pokazujemy aktualne oferty dla kierunku: ${destination}. Tripownia może ułożyć je w interfejsie według gotowości do rezerwacji albo ceny.`
      : type === "allinclusive"
        ? "Pokazujemy całą aktualną pulę All Inclusive bez limitu liczby ofert. W interfejsie możesz sortować po gotowości do rezerwacji albo cenie."
        : "Mieszamy krótkie city breaki, same loty i pakiety wakacyjne. W interfejsie priorytetem mogą być oferty najbardziej gotowe do rezerwacji; awaria jednego źródła nie blokuje pozostałych."
    : "";

  if (!strict && !offers.length && (month || year)) {
    const sameDate = sourceOffers.filter((offer) => dateMatches(offer, month, year));
    if (sameDate.length) {
      offers = lowestPriceDeals(sameDate, destination);
      matchMode = "same_date_other_airport";
      notice = airport
        ? "Brak ceny z wybranego lotniska. Pokazujemy najtańsze oferty w tym samym terminie z innych lotnisk."
        : "Pokazujemy najtańsze znalezione oferty dla wybranego terminu.";
    }
  }

  if (!strict && !offers.length && airport) {
    const sameAirport = sourceOffers.filter((offer) => airportMatches(offer, airport));
    if (sameAirport.length) {
      offers = closestCheapDeals(sameAirport, month, year, destination);
      matchMode = "same_airport_nearby_date";
      notice = "Brak dokładnego terminu. Pokazujemy wszystkie dostępne najbliższe daty z tego lotniska, od najniższej ceny.";
    }
  }

  if (!strict && !offers.length && year) {
    const sameYear = sourceOffers.filter((offer) => dateMatches(offer, "", year));
    if (sameYear.length) {
      offers = closestCheapDeals(sameYear, month, year, destination);
      matchMode = "same_year";
      notice = "Brak dokładnego dopasowania. Pokazujemy najtańsze znalezione opcje w wybranym roku.";
    }
  }

  if (!strict && !offers.length && sourceOffers.length) {
    offers = lowestPriceDeals(sourceOffers, destination);
    matchMode = "closest";
    notice = destination
      ? `Pokazujemy najtańsze aktualne oferty dla kierunku: ${destination}.`
      : "Brak dokładnej kombinacji filtrów. Pokazujemy najtańsze aktualne okazje z całej potwierdzonej puli.";
  }

  // A strict commercial landing should not go empty only because the live pool
  // has no exact row at this moment. Before showing an empty state, reuse only
  // non-expired published offers that still match the requested airport/date/type.
  // We never widen to another departure city in this fallback.
  if (strict && !offers.length && hasScopedFallbackFilter) {
    const fallbackPool = (publishedOffers as DealsOffer[])
      .filter(isUsablePublishedFallback)
      .filter(polishDepartureMatches)
      .filter((offer) => typeMatches(offer, type))
      .filter((offer) => destinationMatches(offer, destination));
    const fallbackExact = fallbackPool
      .filter((offer) => requestedDepartureMatches(offer, airport))
      .filter((offer) => dateMatches(offer, month, year));
    const fallbackOffers = fallbackSelection(fallbackExact, destination);

    if (fallbackOffers.length) {
      return NextResponse.json(
        {
          ok: true,
          checkedAt: new Date().toISOString(),
          sourceCount: sourceOffers.length,
          exactCount: fallbackExact.length,
          destinationCount: fallbackOffers.length,
          sort: "price_asc",
          selection: destination ? "multiple_offers_for_destination" : "all_available_offers",
          sources: ["published-fallback"],
          unavailableSources,
          partial: true,
          sourceType: "published_fallback",
          matchMode: "fallback_exact",
          filters: { destination: destination || null, type: type || null, airport: airport || null, month: month || null, year: year || null, strict },
          notice: "Nie ma teraz świeższego wyniku live dla tych filtrów. Pokazujemy nadal aktualne propozycje Tripowni z tego samego lotniska i typu wyjazdu; finalną cenę i dostępność potwierdź u partnera.",
          offers: fallbackOffers,
        },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
      );
    }
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

  if (!offers.length && unavailableSources.length && hasScopedFallbackFilter) {
    notice = airport
      ? "Nie mamy teraz potwierdzonej oferty z wybranego lotniska i terminu. Nie podstawiamy innego miasta ani miesiąca."
      : "Nie mamy teraz potwierdzonej oferty dla wybranego terminu. Nie podstawiamy innego miesiąca.";
  }

  offers.sort((a, b) => a.price - b.price);

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
      selection: destination ? "multiple_offers_for_destination" : "all_available_offers",
      sources: successful.map((item) => item.label),
      unavailableSources,
      partial: unavailableSources.length > 0,
      sourceType: sourceOffers.length ? "live" : unavailableSources.length ? "live_unavailable" : "live",
      matchMode,
      filters: { destination: destination || null, type: type || null, airport: airport || null, month: month || null, year: year || null, strict },
      notice,
      offers,
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
  );
}
