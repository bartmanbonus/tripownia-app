"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, CalendarRange, Search } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { getLinkMatch, homepageFallbackOffers, isOfferExpired, type Offer } from "@/lib/offers";
import { buildEskyPackagesUrl } from "@/lib/partners";
import { touristDestinationKey } from "@/lib/destinationGrouping";
import { isPriceStale } from "@/lib/offerQuality";

type SeasonalOffer = Offer & { startDateISO?: string; endDateISO?: string };
type Props = { query: string; departure?: string; minNights?: number; maxNights?: number; maxPrice?: number; startDate?: string; endDate?: string; searchHref?: string; pagePath?: string };
type ApiResponse = { ok?: boolean; offers?: SeasonalOffer[]; checkedAt?: string; notice?: string; matchMode?: string };

const FALLBACKS: Record<string, string[]> = {
  malta: ["Malta"], rzym: ["Rzym", "Włochy"], barcelona: ["Barcelona", "Costa Brava", "Hiszpania"],
  cypr: ["Cypr", "Pafos", "Larnaka"], madera: ["Madera", "Portugalia"], teneryfa: ["Teneryfa", "Wyspy Kanaryjskie"],
  "wyspy kanaryjskie": ["Teneryfa", "Fuerteventura", "Gran Canaria"],
  "wyspy zielonego przyladka": ["Wyspy Zielonego Przylądka", "Sal", "Boa Vista"],
  "city break": ["Malta", "Rzym", "Cypr", "Stambuł", "Wiedeń", "Praga", "Budapeszt"],
  "cieple wakacje": ["Egipt", "Teneryfa", "Fuerteventura", "Maroko", "Malta", "Cypr"],
  "all inclusive": ["Egipt", "Turcja", "Tunezja", "Grecja", "Cypr", "Wyspy Kanaryjskie", "Maroko", "Wyspy Zielonego Przylądka"], egzotyka: ["Zanzibar", "Malediwy", "Tajlandia", "Dominikana", "Mauritius"],
  "last minute": ["Egipt", "Turcja", "Tunezja", "Cypr"], wakacje: ["Grecja", "Turcja", "Egipt", "Cypr"],
};

const GENERIC_TERMS = new Set(["city break", "cieple wakacje", "all inclusive", "egzotyka", "last minute", "wakacje"]);

function normalize(value: string) {
  return value.toLocaleLowerCase("pl").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function termMatchesOffer(term: string, offer: SeasonalOffer) {
  const needle = normalize(term);
  if (!needle) return true;

  if (GENERIC_TERMS.has(needle)) {
    if (needle === "city break") return offer.category.includes("city") || offer.category.includes("weekend");
    if (needle === "all inclusive") return offer.category.includes("allinclusive") || normalize(offer.board).includes("all inclusive");
    if (needle === "cieple wakacje") return offer.category.includes("cieplo");
    if (needle === "last minute" || needle === "wakacje") return true;
    if (needle === "egzotyka") return /zanzibar|malediw|tajland|dominik|mauritius|seszel|kenia|meksyk/i.test(normalize(`${offer.city} ${offer.country}`));
  }

  const haystack = normalize(`${offer.city} ${offer.country} ${offer.hotel}`);
  return haystack.includes(needle);
}

function departureCode(value?: string) {
  const n = normalize(value || "");
  if (n.includes("modlin")) return "WMI";
  if (n.includes("warsz")) return "WAWA";
  if (n.includes("krak")) return "KRK";
  if (n.includes("katow")) return "KTW";
  if (n.includes("gdansk")) return "GDN";
  if (n.includes("wrocl")) return "WRO";
  if (n.includes("pozn")) return "POZ";
  if (n.includes("rzesz")) return "RZE";
  if (n.includes("lublin")) return "LUZ";
  if (n.includes("szczec")) return "SZZ";
  if (n.includes("lodz")) return "LCJ";
  if (n.includes("bydgos")) return "BZG";
  if (n.includes("olsztyn") || n.includes("mazur")) return "SZY";
  return "";
}

function purchaseReadinessScore(offer: SeasonalOffer) {
  const match = getLinkMatch(offer);
  let score = Number(offer.score || 0) * 2;
  if (offer.availabilityStatus === "available") score += 18;
  if (offer.availabilityStatus === "expired") score -= 100;
  if (match === "exact") score += 24;
  else if (match === "parameters") score += 14;
  else if (match === "destination") score += 5;
  else score -= 20;
  if (offer.priceCheckedAt && !isPriceStale(offer.priceCheckedAt, 0.25)) score += 16;
  if (offer.hotel) score += 4;
  if (offer.board) score += 3;
  return score;
}

function uniqByProduct(items: SeasonalOffer[]) {
  const seen = new Set<string>();
  const result: SeasonalOffer[] = [];
  for (const offer of items) {
    const key = `${offer.affiliateUrl}|${offer.hotel}|${offer.dates}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(offer);
  }
  return result;
}

function relatedFallbackTerms(value: string) {
  const n = normalize(value);
  if (GENERIC_TERMS.has(n)) return FALLBACKS[n] || ["Malta", "Cypr", "Egipt", "Grecja"];
  if (/filip|wietnam|vietnam|tajland|thailand|bali|indonez|sri lanka|malezj|malaysia/.test(n)) {
    return ["Tajlandia", "Bali", "Sri Lanka", "Wietnam", "Zanzibar", "Dubaj"];
  }
  if (/curacao|jamaj|dominik|meksyk|mexic|kuba|aruba/.test(n)) {
    return ["Dominikana", "Meksyk", "Kuba", "Jamajka", "Dubaj"];
  }
  if (/madagaskar|mauritius|seszel|zanzibar|kenia|gambia|zielonego przyladka/.test(n)) {
    return ["Zanzibar", "Kenia", "Mauritius", "Wyspy Zielonego Przylądka", "Egipt"];
  }
  if (/polinez|malediw/.test(n)) {
    return ["Malediwy", "Mauritius", "Zanzibar", "Tajlandia", "Bali"];
  }
  if (/rpa|south africa|republika poludniowej afryki/.test(n)) {
    return ["Kenia", "Zanzibar", "Mauritius", "Egipt"];
  }
  if (/oman|maskat|muscat|dubaj|emirat|bahrajn|bahrain/.test(n)) {
    return ["Dubaj", "Egipt", "Maroko", "Cypr"];
  }
  return ["Malta", "Cypr", "Grecja", "Hiszpania", "Egipt", "Turcja"];
}

function fallbackAirportMatches(offer: SeasonalOffer, departure?: string) {
  const code = departureCode(departure);
  if (!code) return true;
  if (code === "WAWA") return offer.airportCode === "WAW" || offer.airportCode === "WMI";
  return offer.airportCode === code;
}

function staticFallbackOffers(query: string, departure?: string) {
  const active = homepageFallbackOffers.filter((offer) => !isOfferExpired(offer));
  const exact = active.filter((offer) => termMatchesOffer(query, offer));
  const relatedTerms = relatedFallbackTerms(query);
  const related = active.filter((offer) => relatedTerms.some((term) => termMatchesOffer(term, offer)));
  const intentPool = exact.length ? exact : related.length ? related : active;
  const sameAirport = intentPool.filter((offer) => fallbackAirportMatches(offer, departure));
  // Never mix airports into an otherwise exact local result just to fill the grid.
  // Nationwide options are a separate, explicitly labelled fallback.
  const pool = sameAirport.length > 0 ? sameAirport : intentPool;
  return uniqByProduct([...pool].sort((a, b) => a.price - b.price)).slice(0, 18);
}

export default function SeoEximOffers({ query, departure, minNights, maxNights, maxPrice, startDate, endDate, searchHref, pagePath = "/podroze" }: Props) {
  const cityBreakOverview = normalize(query) === "city break";
  const eskySearch = new URL("https://www2.esky.pl/lot+hotel/portfolio");
  eskySearch.searchParams.set("rooms[0][adults]", "2");
  eskySearch.searchParams.set("datesTab", "flexDates");
  eskySearch.searchParams.set("stayLength", "2:4");
  eskySearch.searchParams.set("landingPageId", "qWXMSX");
  const eskyDeparture = departureCode(departure);
  if (eskyDeparture) eskySearch.searchParams.set("departurePlaces", eskyDeparture === "WAWA" ? "ap-WAW,ap-WMI" : `ap-${eskyDeparture}`);
  const morePackagesUrl = buildEskyPackagesUrl(eskySearch.toString());
  // Server-side affiliate resolver logs the click even if the client-side bridge has not hydrated.
  const morePackagesHref = `/go/live?${new URLSearchParams({
    target: morePackagesUrl,
    partner: "esky",
    source: "seo_landing_more_packages",
    page: pagePath,
    return: pagePath,
  }).toString()}`;

  // Render strictly matching previously published suggestions in initial HTML.
  // They are not represented as live prices while the API verifies availability.
  const [offers, setOffers] = useState<SeasonalOffer[]>(() =>
    staticFallbackOffers(query, departure)
      .filter((offer) => termMatchesOffer(query, offer) && fallbackAirportMatches(offer, departure))
      .filter((offer) => typeof minNights !== "number" || offer.nights >= minNights)
      .filter((offer) => typeof maxNights !== "number" || offer.nights <= maxNights)
      .filter((offer) => typeof maxPrice !== "number" || offer.price <= maxPrice)
      .filter((offer) => (!startDate && !endDate) || (
        Boolean(offer.startDateISO)
        && (!startDate || offer.startDateISO! >= startDate)
        && (!endDate || offer.startDateISO! <= endDate)
      ))
      .slice(0, 6)
  );
  const [loading, setLoading] = useState(true);
  const [relaxed, setRelaxed] = useState(false);
  const [usingCachedOffers, setUsingCachedOffers] = useState(false);
  const [fallbackReason, setFallbackReason] = useState("");
  const [error, setError] = useState(false);

  const queries = useMemo(() => {
    const key = normalize(query);
    const fallback = FALLBACKS[key] || [query];
    return Array.from(new Set([query, ...fallback].filter(Boolean)));
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    async function fetchFor(term: string, from?: string, loose = false) {
      const normalizedTerm = normalize(term);

      if (GENERIC_TERMS.has(normalizedTerm) && (from || cityBreakOverview)) {
        if (normalizedTerm === "city break") {
          const params = new URLSearchParams({ mode: "citybreak", view: "destinations" });
          if (!loose) params.set("strict", "1");
          if (from) params.set("from", from);
          if (!loose && maxPrice) params.set("maxPrice", String(maxPrice));
          if (!loose && minNights) params.set("minNights", String(minNights));
          if (!loose && maxNights) params.set("maxNights", String(maxNights));
          if (!loose && startDate) params.set("start", startDate);
          if (!loose && endDate) params.set("end", endDate);
          if (!loose && (startDate || endDate)) params.set("dateKind", "departure");
          const response = await fetch(`/api/today-offers?${params.toString()}&refresh=${Date.now()}`, { cache: "no-store" });
          if (!response.ok) return [] as SeasonalOffer[];
          const data = (await response.json()) as ApiResponse;
          return Array.isArray(data.offers)
            ? data.offers.filter((offer) => offer.nights >= 2 && offer.nights <= 5 && offer.price <= 2000)
            : [];
        }

        const params = new URLSearchParams({ from: from || "" });
        if (!loose) params.set("strict", "1");
        if (normalizedTerm === "all inclusive") params.set("type", "allinclusive");
        const response = await fetch(`/api/deals?${params.toString()}&refresh=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return [] as SeasonalOffer[];
        const data = (await response.json()) as ApiResponse;
        return Array.isArray(data.offers)
          ? data.offers.filter((offer) => termMatchesOffer(term, offer))
          : [];
      }

      if (normalize(query) === "all inclusive") {
        const params = new URLSearchParams({ q: term, type: "allinclusive" });
        if (!loose) params.set("strict", "1");
        if (from) params.set("from", from);
        const response = await fetch(`/api/deals?${params.toString()}&refresh=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return [] as SeasonalOffer[];
        const data = (await response.json()) as ApiResponse;
        return Array.isArray(data.offers)
          ? data.offers.filter((offer) => termMatchesOffer("all inclusive", offer))
          : [];
      }

      const params = new URLSearchParams({ mode: "search", q: term });
      if (from) params.set("from", from);
      const response = await fetch(`/api/today-offers?${params.toString()}&refresh=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return [] as SeasonalOffer[];
      const data = (await response.json()) as ApiResponse;
      return Array.isArray(data.offers)
        ? data.offers.filter((offer) => termMatchesOffer(term, offer))
        : [];
    }

    function dateMatches(offer: SeasonalOffer) {
      if (!startDate && !endDate) return true;
      if (!offer.startDateISO) return false;
      if (startDate && offer.startDateISO < startDate) return false;
      if (endDate && offer.startDateISO > endDate) return false;
      return true;
    }

    function seasonalScope(items: SeasonalOffer[]) { return items.filter(dateMatches); }
    function strictFilter(items: SeasonalOffer[]) {
      return seasonalScope(items).filter((offer) => {
        if (departure && !fallbackAirportMatches(offer, departure)) return false;
        if (normalize(query) === "all inclusive" && !termMatchesOffer("all inclusive", offer)) return false;
        if (typeof minNights === "number" && offer.nights < minNights) return false;
        if (typeof maxNights === "number" && offer.nights > maxNights) return false;
        if (typeof maxPrice === "number" && offer.price > maxPrice) return false;
        return true;
      });
    }

    async function load() {
      setLoading(true); setError(false); setRelaxed(false); setUsingCachedOffers(false); setFallbackReason("");

      const diversify = (items: SeasonalOffer[], limit = 24) => {
        if (normalize(query) !== "all inclusive") return items.slice(0, limit);
        const buckets = new Map<string, SeasonalOffer[]>();
        for (const offer of items) {
          const key = normalize(offer.country || offer.city || "inne");
          const bucket = buckets.get(key) || [];
          if (bucket.length < 5) bucket.push(offer);
          buckets.set(key, bucket);
        }
        const result: SeasonalOffer[] = [];
        let round = 0;
        while (result.length < limit) {
          let added = false;
          for (const bucket of buckets.values()) {
            if (bucket[round]) {
              result.push(bucket[round]);
              added = true;
              if (result.length >= limit) break;
            }
          }
          if (!added) break;
          round += 1;
        }
        return result;
      };

      const present = (items: SeasonalOffer[], reason = "", isRelaxed = false, isCached = false) => {
        const sorted = uniqByProduct(items).sort((a, b) => a.price - b.price);
        const seen = new Set<string>();
        const finalOffers = cityBreakOverview
          ? sorted.filter((offer) => {
              const key = touristDestinationKey(offer);
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            }).slice(0, 24)
          : diversify(sorted, 24);

        const differentAirport = Boolean(departure) && finalOffers.some((offer) => !fallbackAirportMatches(offer, departure));
        const airportWarning = differentAirport
          ? `Uwaga: część propozycji ma wylot z innego lotniska niż ${departure}. Sprawdź lotnisko przed rezerwacją.`
          : "";
        setOffers(finalOffers);
        setRelaxed(isRelaxed || differentAirport);
        setUsingCachedOffers(isCached);
        setFallbackReason([reason, airportWarning].filter(Boolean).join(" "));
        setError(finalOffers.length === 0);
        return finalOffers.length > 0;
      };

      try {
        const from = departureCode(departure);
        const gathered: SeasonalOffer[] = [];
        for (const term of queries) {
          gathered.push(...(await fetchFor(term, from || undefined)));
          if (strictFilter(uniqByProduct(gathered)).length >= 30) break;
          if (cityBreakOverview) break;
        }

        const unique = uniqByProduct(gathered).sort((a, b) => purchaseReadinessScore(b) - purchaseReadinessScore(a) || a.price - b.price);
        const strict = strictFilter(unique);
        if (cancelled) return;

        if (strict.length > 0) {
          present(strict);
          return;
        }

        const typeCompatible = (items: SeasonalOffer[]) => items.filter((offer) =>
          normalize(query) !== "all inclusive" || termMatchesOffer("all inclusive", offer)
        );

        const seasonal = typeCompatible(seasonalScope(unique)).filter((offer) => fallbackAirportMatches(offer, departure));
        if (seasonal.length > 0) {
          present(
            seasonal,
            "Nie ma dziś pełnego dopasowania ceny lub długości pobytu. Pokazujemy aktualne oferty w tym samym terminie i dla tego samego kierunku/typu wyjazdu.",
            true
          );
          return;
        }

        const looseSameAirport: SeasonalOffer[] = [];
        for (const term of queries) {
          looseSameAirport.push(...(await fetchFor(term, from || undefined, true)));
          if (uniqByProduct(looseSameAirport).length >= 24) break;
          if (cityBreakOverview) break;
        }
        const sameAirport = typeCompatible(uniqByProduct(looseSameAirport)).filter((offer) => fallbackAirportMatches(offer, departure));
        if (sameAirport.length > 0) {
          present(
            sameAirport,
            "Dokładny termin jest chwilowo niedostępny. Pokazujemy najbliższe aktualne propozycje z tego samego lotniska i dla tego samego kierunku/typu wyjazdu.",
            true
          );
          return;
        }

        if (from) {
          const nationwide: SeasonalOffer[] = [];
          for (const term of queries) {
            nationwide.push(...(await fetchFor(term, undefined, true)));
            if (uniqByProduct(nationwide).length >= 24) break;
            if (cityBreakOverview) break;
          }
          const nationwideMatches = typeCompatible(uniqByProduct(nationwide));
          if (nationwideMatches.length > 0) {
            present(
              nationwideMatches,
              "Nie ma teraz dostępnej oferty z wybranego lotniska. Pokazujemy ten sam kierunek lub typ wyjazdu z innych polskich lotnisk — bez odsyłania Cię na pustą stronę.",
              true
            );
            return;
          }
        }

        const alternativeTerms = relatedFallbackTerms(query);
        const related: SeasonalOffer[] = [];
        for (const term of alternativeTerms.slice(0, 6)) {
          related.push(...(await fetchFor(term, from || undefined, true)));
          if (uniqByProduct(related).length >= 24) break;
        }

        let relatedOffers = uniqByProduct(related).filter((offer) => fallbackAirportMatches(offer, departure));
        if (relatedOffers.length === 0 && from) {
          for (const term of alternativeTerms.slice(0, 6)) {
            relatedOffers.push(...(await fetchFor(term, undefined, true)));
            if (uniqByProduct(relatedOffers).length >= 24) break;
          }
          relatedOffers = uniqByProduct(relatedOffers);
        }

        if (relatedOffers.length > 0) {
          present(
            relatedOffers,
            `Nie ma teraz aktywnej oferty dokładnie dla „${query}”. Zamiast pustego przekierowania pokazujemy podobne, aktualnie dostępne kierunki, które można od razu porównać i zarezerwować.`,
            true
          );
          return;
        }

        const publishedFallback = staticFallbackOffers(query, departure);
        if (publishedFallback.length > 0) {
          present(
            publishedFallback,
            "Źródło aktualnych ofert nie zwróciło wyników. To inspiracje z ostatniej zapisanej puli. Ceny, terminy i dostępność wymagają ponownego potwierdzenia u partnera.",
            true,
            true
          );
          return;
        }

        setOffers([]);
        setError(true);
      } catch {
        if (!cancelled) {
          const publishedFallback = staticFallbackOffers(query, departure);
          if (publishedFallback.length > 0) {
            present(
              publishedFallback,
              "Źródło aktualnych ofert chwilowo nie odpowiada. To inspiracje z zapisanej puli; ceny, terminy i dostępność wymagają ponownego potwierdzenia u partnera.",
              true,
              true
            );
          } else {
            setOffers([]);
            setError(true);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    const timer = window.setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [queries, departure, minNights, maxNights, maxPrice, startDate, endDate, cityBreakOverview]);

  if (loading) {
    if (offers.length > 0) {
      return (
        <div className="seo-initial-offers">
          <p className="seo-live-note" role="status">Sprawdzamy teraz dostępność. Poniżej wcześniej zapisane, pasujące propozycje — aktualną cenę potwierdzisz w szczegółach.</p>
          <div className="cards-grid seo-live-offers-grid" id="seo-live-offers-grid">
            {offers.map((offer) => <OfferCard key={`${offer.id}-${offer.affiliateUrl}`} offer={offer} sourceSurface="seo_landing" />)}
          </div>
        </div>
      );
    }
    return (
      <div className="seo-offers-loading" aria-live="polite" aria-busy="true">
        <div className="seo-offers-loading-head">
          <span className="seo-live-pulse" />
          <div>
            <strong>Szukamy najlepszych dopasowań…</strong>
            <span>Sprawdzamy ceny i dostępność dla tych parametrów.</span>
          </div>
        </div>
        <div className="seo-empty-offers-actions">
          <Link href={searchHref || "/szukaj"} className="seo-empty-primary">
            <Search size={17} /> Zobacz wyszukiwanie z tymi parametrami <ArrowRight size={16} />
          </Link>
        </div>
        <div className="seo-offers-skeleton-grid" aria-hidden="true">
          {[0, 1, 2].map((item) => (
            <div className="seo-offer-skeleton" key={item}>
              <div className="seo-offer-skeleton-media" />
              <div className="seo-offer-skeleton-body">
                <span className="seo-skeleton-line seo-skeleton-line-short" />
                <span className="seo-skeleton-line seo-skeleton-line-title" />
                <span className="seo-skeleton-line" />
                <div className="seo-offer-skeleton-bottom">
                  <span className="seo-skeleton-price" />
                  <span className="seo-skeleton-button" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const minPrice = offers.length ? Math.min(...offers.map((offer) => Number(offer.price || Infinity))) : 0;
  const destinationCount = new Set(offers.map((offer) => touristDestinationKey(offer)).filter(Boolean)).size;
  const destinationSummary = destinationCount > 1 ? ` · ${destinationCount} kierunków` : "";
  const salesSummary = offers.length
    ? usingCachedOffers
      ? `${offers.length} zapisanych propozycji${destinationSummary} · ceny do potwierdzenia`
      : relaxed
        ? `${offers.length} propozycji do porównania${destinationSummary} · sprawdź parametry`
        : `${offers.length} aktualnych ofert${destinationSummary}${Number.isFinite(minPrice) && minPrice > 0 ? ` · od ${minPrice.toLocaleString("pl-PL")} zł/os.` : ""}`
    : "";

  if (error || offers.length === 0) {
    const alertParams = new URLSearchParams({ destination: query });
    if (departure) alertParams.set("departure", departure);
    if (maxPrice) alertParams.set("maxPrice", String(maxPrice));

    return (
      <div className="seo-empty-offers">
        <div className="seo-empty-offers-copy">
          <div className="seo-empty-offers-icon"><Search size={24}/></div>
          <div>
            <small>NIC NA SIŁĘ</small>
            <h3>Nie ma teraz potwierdzonej oferty dokładnie dla tych parametrów.</h3>
            <p>
              Nie podmieniamy lotniska, miesiąca ani kierunku tylko po to, żeby zapełnić stronę.
              Wyszukiwarka jest już ustawiona za Ciebie — możesz od razu zobaczyć najbliższe dostępne warianty i zmienić tylko to, co chcesz.
            </p>
          </div>
        </div>

        <div className="seo-empty-offers-actions">
          <Link href={searchHref || "/#wyszukiwarka"} className="seo-empty-primary">
            <CalendarRange size={17}/> Pokaż gotowe wyniki <ArrowRight size={16}/>
          </Link>
          <Link href="/gdzie-leciec" className="seo-empty-secondary">
            <Search size={17}/> Pokaż podobne kierunki
          </Link>
          <Link href={`/alerty?${alertParams.toString()}`} className="seo-empty-secondary">
            <Bell size={17}/> Ustaw alert
          </Link>
        </div>
      </div>
    );
  }

  return <>
    <div className="seo-sales-snapshot" aria-live="polite">
      <div>
        <small>{usingCachedOffers ? "ZAPISANE INSPIRACJE" : relaxed ? "PODOBNE PROPOZYCJE" : "SPRAWDZONE TERAZ"}</small>
        <strong>{salesSummary}</strong>
        <span>{usingCachedOffers ? "Zobacz szczegóły w Tripowni i potwierdź aktualną cenę u partnera." : "Kliknij ofertę → zobacz szczegóły w Tripowni → przejdź do rezerwacji u partnera."}</span>
      </div>
      <a href="#seo-live-offers-grid">Zobacz oferty ↓</a>
    </div>
    {cityBreakOverview && <p className="seo-live-note">{usingCachedOffers
      ? "Kierunki z ostatniej zapisanej puli · ceny i dostępność do ponownego sprawdzenia"
      : relaxed
        ? "Podobne kierunki · sprawdź termin, lotnisko i aktualną cenę"
        : `${offers.length} różnych kierunków · od najniższej ceny · najtańsza dostępna oferta dla każdego kierunku`}</p>}
    {relaxed && <div className="seo-live-note">{fallbackReason || "Pokazujemy podobne propozycje — część parametrów może różnić się od pierwotnego filtra strony."}</div>}
    <div className="cards-grid seo-live-offers-grid" id="seo-live-offers-grid">{offers.map((offer) => <OfferCard key={`${offer.id}-${offer.affiliateUrl}`} offer={offer} sourceSurface="seo_landing" />)}</div>
    {cityBreakOverview && !startDate && !endDate && <div className="seo-empty-offers-actions"><a href={morePackagesHref} rel="nofollow sponsored" className="seo-empty-secondary">Porównaj więcej pakietów lot + hotel <ArrowRight size={16}/></a></div>}
  </>;
}