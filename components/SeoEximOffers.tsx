"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, CalendarRange, Search } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import type { Offer } from "@/lib/offers";
import { touristDestinationKey } from "@/lib/destinationGrouping";

type SeasonalOffer = Offer & { startDateISO?: string; endDateISO?: string };
type Props = { query: string; departure?: string; minNights?: number; maxNights?: number; maxPrice?: number; startDate?: string; endDate?: string };
type ApiResponse = { ok?: boolean; offers?: SeasonalOffer[]; checkedAt?: string; notice?: string; matchMode?: string };

const FALLBACKS: Record<string, string[]> = {
  malta: ["Malta"], rzym: ["Rzym", "Włochy"], barcelona: ["Barcelona", "Costa Brava", "Hiszpania"],
  cypr: ["Cypr", "Pafos", "Larnaka"], madera: ["Madera", "Portugalia"], teneryfa: ["Teneryfa", "Wyspy Kanaryjskie"],
  "wyspy kanaryjskie": ["Teneryfa", "Fuerteventura", "Gran Canaria"],
  "wyspy zielonego przyladka": ["Wyspy Zielonego Przylądka", "Sal", "Boa Vista"],
  "city break": ["Malta", "Rzym", "Cypr", "Stambuł", "Wiedeń", "Praga", "Budapeszt"],
  "cieple wakacje": ["Egipt", "Teneryfa", "Fuerteventura", "Maroko", "Malta", "Cypr"],
  "all inclusive": ["Egipt", "Turcja", "Tunezja"], egzotyka: ["Zanzibar", "Malediwy", "Tajlandia", "Dominikana", "Mauritius"],
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

export default function SeoEximOffers({ query, departure, minNights, maxNights, maxPrice, startDate, endDate }: Props) {
  const cityBreakOverview = normalize(query) === "city break";
  const [offers, setOffers] = useState<SeasonalOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [relaxed, setRelaxed] = useState(false);
  const [error, setError] = useState(false);

  const queries = useMemo(() => {
    const key = normalize(query);
    const fallback = FALLBACKS[key] || [query];
    return Array.from(new Set([query, ...fallback].filter(Boolean)));
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    async function fetchFor(term: string, from?: string) {
      const normalizedTerm = normalize(term);

      if (GENERIC_TERMS.has(normalizedTerm) && (from || cityBreakOverview)) {
        if (normalizedTerm === "city break") {
          const params = new URLSearchParams({ mode: "citybreak", provider: "exim", view: "destinations", strict: "1" });
          if (from) params.set("from", from);
          if (maxPrice) params.set("maxPrice", String(maxPrice));
          if (minNights) params.set("minNights", String(minNights));
          if (maxNights) params.set("maxNights", String(maxNights));
          if (startDate) params.set("start", startDate);
          if (endDate) params.set("end", endDate);
          if (startDate || endDate) params.set("dateKind", "departure");
          const response = await fetch(`/api/today-offers?${params.toString()}&refresh=${Date.now()}`, { cache: "no-store" });
          if (!response.ok) return [] as SeasonalOffer[];
          const data = (await response.json()) as ApiResponse;
          return Array.isArray(data.offers)
            ? data.offers.filter((offer) => offer.partner === "exim" && termMatchesOffer(term, offer))
            : [];
        }

        const params = new URLSearchParams({ from: from || "", strict: "1" });
        if (normalizedTerm === "all inclusive") params.set("type", "allinclusive");
        const response = await fetch(`/api/deals?${params.toString()}&refresh=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return [] as SeasonalOffer[];
        const data = (await response.json()) as ApiResponse;
        return Array.isArray(data.offers)
          ? data.offers.filter((offer) => termMatchesOffer(term, offer))
          : [];
      }

      const params = new URLSearchParams({ mode: "search", provider: "exim", q: term });
      if (from) params.set("from", from);
      const response = await fetch(`/api/today-offers?${params.toString()}&refresh=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return [] as SeasonalOffer[];
      const data = (await response.json()) as ApiResponse;
      return Array.isArray(data.offers)
        ? data.offers.filter((offer) => offer.partner === "exim" && termMatchesOffer(term, offer))
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
        if (typeof minNights === "number" && offer.nights < minNights) return false;
        if (typeof maxNights === "number" && offer.nights > maxNights) return false;
        if (typeof maxPrice === "number" && offer.price > maxPrice) return false;
        return true;
      });
    }

    async function load() {
      setLoading(true); setError(false); setRelaxed(false);
      try {
        const from = departureCode(departure);
        const gathered: SeasonalOffer[] = [];
        for (const term of queries) {
          gathered.push(...(await fetchFor(term, from || undefined)));
          if (strictFilter(uniqByProduct(gathered)).length >= 6) break;
          if (cityBreakOverview || (GENERIC_TERMS.has(normalize(query)) && from)) break;
        }

        const unique = uniqByProduct(gathered).sort((a, b) => a.price - b.price);
        const strict = strictFilter(unique);
        if (cancelled) return;
        if (strict.length > 0) {
          const seen = new Set<string>();
          setOffers(cityBreakOverview ? strict.filter(offer => {
            const key = touristDestinationKey(offer);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          }) : strict.slice(0, 6));
          setRelaxed(false);
        } else {
          const seasonal = seasonalScope(unique);
          if (seasonal.length > 0 && !cityBreakOverview) {
            setOffers(seasonal.slice(0, 6));
            setRelaxed(true);
          } else {
            setOffers([]);
            setError(true);
          }
        }
      } catch {
        if (!cancelled) { setOffers([]); setError(true); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const timer = window.setInterval(load, 10 * 60 * 1000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [queries, departure, minNights, maxNights, maxPrice, startDate, endDate, cityBreakOverview]);

  if (loading) {
    return (
      <div className="seo-offers-loading" aria-live="polite" aria-busy="true">
        <div className="seo-offers-loading-head">
          <span className="seo-live-pulse" />
          <div>
            <strong>Szukamy najlepszych dopasowań…</strong>
            <span>Sprawdzamy ceny i dostępność dla tych parametrów.</span>
          </div>
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
            <h3>Nie ma teraz dobrej oferty dla tych parametrów.</h3>
            <p>
              Nie podmieniamy lotniska, miesiąca ani kierunku tylko po to, żeby zapełnić stronę.
              Najszybciej zwiększysz szansę, rozszerzając termin albo wyszukując podobny wariant.
            </p>
          </div>
        </div>

        <div className="seo-empty-offers-actions">
          <Link href="/#wyszukiwarka" className="seo-empty-primary">
            <CalendarRange size={17}/> Zmień termin lub parametry <ArrowRight size={16}/>
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
    {cityBreakOverview && <p className="seo-live-note">{offers.length} różnych kierunków · od najniższej ceny · najtańsza dostępna oferta dla każdego kierunku</p>}
    {relaxed && <div className="seo-live-note">Lotnisko i główny typ wyjazdu się zgadzają. Pokazujemy najbliższe aktualne propozycje — cena lub długość pobytu może różnić się od dodatkowego filtra strony.</div>}
    <div className="cards-grid seo-live-offers-grid">{offers.map((offer) => <OfferCard key={`${offer.id}-${offer.affiliateUrl}`} offer={offer} />)}</div>
  </>;
}