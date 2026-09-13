"use client";

import { useEffect, useMemo, useState } from "react";
import OfferCard from "@/components/OfferCard";
import type { Offer } from "@/lib/offers";

type SeasonalOffer = Offer & { startDateISO?: string; endDateISO?: string };
type Props = { query: string; departure?: string; minNights?: number; maxNights?: number; maxPrice?: number; startDate?: string; endDate?: string };
type ApiResponse = { ok?: boolean; offers?: SeasonalOffer[]; checkedAt?: string };

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

function normalize(value: string) {
  return value.toLocaleLowerCase("pl").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function departureCode(value?: string) {
  const n = normalize(value || "");
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
      const params = new URLSearchParams({ mode: "search", provider: "exim", q: term });
      if (from) params.set("from", from);
      const response = await fetch(`/api/today-offers?${params.toString()}&refresh=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return [] as SeasonalOffer[];
      const data = (await response.json()) as ApiResponse;
      return Array.isArray(data.offers) ? data.offers.filter((offer) => offer.partner === "exim") : [];
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
        }

        const unique = uniqByProduct(gathered).sort((a, b) => a.price - b.price);
        const strict = strictFilter(unique);
        if (cancelled) return;
        if (strict.length > 0) {
          setOffers(strict.slice(0, 6));
          setRelaxed(false);
        } else {
          const seasonal = seasonalScope(unique);
          if (seasonal.length > 0) {
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
  }, [queries, departure, minNights, maxNights, maxPrice, startDate, endDate]);

  if (loading) return <div className="seo-live-status"><span className="seo-live-pulse" /><strong>Sprawdzamy teraz aktualne oferty…</strong></div>;
  if (error || offers.length === 0) {
    return <div className="seo-live-status seo-live-status-warning"><strong>Nie znaleźliśmy teraz pasującej oferty dla tego lotniska i terminu.</strong><span>Nie podstawiamy ofert z innego lotniska ani miesiąca tylko po to, żeby zapełnić stronę. Sprawdź ponownie później albo ustaw alert.</span></div>;
  }

  return <>
    {relaxed && <div className="seo-live-note">Lotnisko i termin się zgadzają. Pokazujemy najbliższe aktualne propozycje — cena lub długość pobytu może różnić się od dodatkowego filtra strony.</div>}
    <div className="cards-grid seo-live-offers-grid">{offers.map((offer) => <OfferCard key={`${offer.id}-${offer.affiliateUrl}`} offer={offer} />)}</div>
  </>;
}
