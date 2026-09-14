"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, RefreshCw, Search, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import type { Offer } from "@/lib/offers";
import { isOfferExpired } from "@/lib/offerRuntime";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import { touristDestinationKey } from "@/lib/destinationGrouping";
import { useLiveOffers } from "@/lib/useLiveOffers";

type DealsOffer = Offer & { startDateISO?: string };

const AIRPORTS = [
  { value: "any", label: "Wszystkie lotniska" },
  { value: "WAWA", label: "Warszawa (WAW + WMI)" },
  { value: "KRK", label: "Kraków" },
  { value: "KTW", label: "Katowice" },
  { value: "GDN", label: "Gdańsk" },
  { value: "WRO", label: "Wrocław" },
  { value: "POZ", label: "Poznań" },
] as const;

const MONTH_NAMES = [
  "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
  "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień",
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildMonthOptions(count = 12) {
  const now = new Date();
  const startYear = now.getFullYear();
  const startMonth = now.getMonth();

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(startYear, startMonth + index, 1, 12));
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    return {
      value: `${year}-${String(month + 1).padStart(2, "0")}`,
      label: `${MONTH_NAMES[month]} ${year}`,
    };
  });
}

function airportMatches(offer: DealsOffer, airport: string) {
  if (airport === "any") return true;
  const code = String(offer.airportCode || "").toUpperCase();
  const departure = normalize(offer.departure || "");

  if (airport === "WAWA") return code === "WAW" || code === "WMI" || departure.includes("warszawa") || departure.includes("modlin");
  if (code === airport) return true;

  const aliases: Record<string, string[]> = {
    KRK: ["krakow", "balice"],
    KTW: ["katowice", "pyrzowice"],
    GDN: ["gdansk", "rebiechowo"],
    WRO: ["wroclaw", "strachowice"],
    POZ: ["poznan", "lawica"],
  };

  return (aliases[airport] || []).some((alias) => departure.includes(alias));
}

function offerMonthKeys(offer: DealsOffer) {
  const keys = new Set<string>();
  if (offer.startDateISO && /^20\d{2}-\d{2}/.test(offer.startDateISO)) {
    keys.add(offer.startDateISO.slice(0, 7));
    return keys;
  }

  const raw = normalize(offer.dates || "");
  const numeric = raw.match(/(?:\d{1,2}[.\/-])?(\d{1,2})[.\/-](20\d{2})/g) || [];
  numeric.forEach((part) => {
    const match = part.match(/(?:\d{1,2}[.\/-])?(\d{1,2})[.\/-](20\d{2})/);
    if (!match) return;
    const month = Number(match[1]);
    if (month >= 1 && month <= 12) keys.add(`${match[2]}-${String(month).padStart(2, "0")}`);
  });

  const yearMatch = raw.match(/20\d{2}/);
  if (yearMatch) {
    const year = yearMatch[0];
    const normalizedMonths = MONTH_NAMES.map(normalize);
    normalizedMonths.forEach((name, index) => {
      if (raw.includes(name)) keys.add(`${year}-${String(index + 1).padStart(2, "0")}`);
    });
  }

  return keys;
}

function monthMatches(offer: DealsOffer, month: string) {
  if (month === "any") return true;
  return offerMonthKeys(offer).has(month);
}

function cheapestUnique(rows: DealsOffer[]) {
  const best = new Map<string, DealsOffer>();

  rows
    .filter((offer) => offer && Number(offer.price) > 0)
    .filter((offer) => !isOfferExpired(offer))
    .filter((offer) => isTravelDestinationAllowed(offer.city, offer.country))
    .forEach((offer) => {
      const key = touristDestinationKey(offer);
      const current = best.get(key);
      if (!current || Number(offer.price) < Number(current.price)) best.set(key, offer);
    });

  return Array.from(best.values())
    .sort((a, b) => Number(a.price) - Number(b.price))
    .slice(0, 20);
}

export default function DealsPage() {
  const [airport, setAirport] = useState("any");
  const [month, setMonth] = useState("any");
  const monthOptions = useMemo(() => buildMonthOptions(12), []);
  const { offers, source, loading, checkedAt, refresh } = useLiveOffers("/api/today-offers?mode=search&broad=1");

  const matchingPool = useMemo(() => (offers as DealsOffer[])
    .filter((offer) => airportMatches(offer, airport))
    .filter((offer) => monthMatches(offer, month)), [offers, airport, month]);

  const rows = useMemo(() => cheapestUnique(matchingPool), [matchingPool]);

  const checkedLabel = checkedAt
    ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Warsaw" }).format(new Date(checkedAt))
    : "";

  const sourceCopy = source === "live"
    ? `Aktualny feed${checkedLabel ? ` · ${checkedLabel}` : ""}`
    : offers.length
      ? `Ostatnia poprawna pula${checkedLabel ? ` · ${checkedLabel}` : ""}`
      : "Brak potwierdzonej puli — odświeżamy dane";

  const airportLabel = AIRPORTS.find((item) => item.value === airport)?.label || "Wszystkie lotniska";
  const monthLabel = monthOptions.find((item) => item.value === month)?.label || "dowolny miesiąc";
  const filtering = airport !== "any" || month !== "any";

  return <main>
    <SiteHeader/>
    <section className="shell hub-page deals-hub-page">
      <div className="deals-hub-hero">
        <div>
          <div className="kicker">OKAZJE TRIPOWNI</div>
          <h1>Wybierz skąd i kiedy. My pokażemy okazje.</h1>
          <p className="hub-lead">Nie ograniczamy Cię do najbliższych terminów. Wybierz lotnisko i miesiąc, a pokażemy najtańszą potwierdzoną propozycję na każdy kierunek dostępny w tej kombinacji.</p>
        </div>
        <div className="deals-hub-actions">
          <Link className="primary-cta" href="/#wyszukiwarka"><Search size={17}/> Wyszukaj dokładniej</Link>
          <button className="secondary-cta" type="button" onClick={refresh} disabled={loading}><RefreshCw size={16}/>{loading ? "Odświeżamy…" : "Odśwież ceny"}</button>
        </div>
      </div>

      <div className="deals-filter-panel" aria-label="Filtry okazji Tripowni">
        <label>
          <span><MapPin size={15}/> Lotnisko wylotu</span>
          <select value={airport} onChange={(event) => setAirport(event.target.value)}>
            {AIRPORTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span><CalendarDays size={15}/> Miesiąc wyjazdu</span>
          <select value={month} onChange={(event) => setMonth(event.target.value)}>
            <option value="any">Wszystkie miesiące</option>
            {monthOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        {filtering && <button type="button" className="deals-clear-filters" onClick={() => { setAirport("any"); setMonth("any"); }}>Wyczyść filtry</button>}
      </div>

      <div className="deals-trust-bar">
        <span><Sparkles size={15}/><strong>{rows.length} {rows.length === 1 ? "różny kierunek" : "różnych kierunków"}</strong></span>
        <span>{filtering ? `${airportLabel} · ${monthLabel}` : "Wszystkie dostępne lotniska i miesiące"}</span>
        <span>{sourceCopy}</span>
      </div>

      {rows.length > 0 ? (
        <div className="cards-grid deals-premium-grid">{rows.map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div>
      ) : !loading ? (
        <div className="self-search-empty">
          <strong>{filtering ? "Nie mamy teraz potwierdzonej okazji dla tego lotniska i miesiąca." : "Nie mamy teraz potwierdzonej puli okazji."}</strong>
          <span>{filtering ? "Nie podstawiamy innego lotniska ani najbliższego terminu. Zmień miesiąc lub lotnisko albo odśwież dane." : "Nie podstawiamy statycznych cen. Odśwież dane albo skorzystaj z wyszukiwarki Tripowni."}</span>
        </div>
      ) : null}

      <div className="deals-end-cta"><div><strong>Chcesz zawęzić jeszcze bardziej?</strong><span>W głównej wyszukiwarce ustawisz też kierunek, budżet, długość pobytu, weekend i wyżywienie.</span></div><Link href="/#wyszukiwarka">Przejdź do wyszukiwarki <ArrowRight size={16}/></Link></div>
    </section>
    <SiteFooter/>
  </main>;
}
