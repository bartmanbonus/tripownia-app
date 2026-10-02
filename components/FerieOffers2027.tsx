"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, RefreshCw, Search } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import SearchHub from "@/components/SearchHub";
import type { Offer } from "@/lib/offers";

type LiveOffer = Offer & {
  startDateISO?: string;
  endDateISO?: string;
};

type FerieTurn = {
  id: string;
  label: string;
  dates: string;
  from: string;
  to: string;
  regions: string;
};

const FERIE_TURNS: FerieTurn[] = [
  {
    id: "all",
    label: "Wszystkie ferie",
    dates: "18 stycznia – 28 lutego 2027",
    from: "2027-01-18",
    to: "2027-02-28",
    regions: "Wszystkie województwa",
  },
  {
    id: "turn-1",
    label: "Tura 1",
    dates: "18–31 stycznia",
    from: "2027-01-18",
    to: "2027-01-31",
    regions: "podkarpackie, podlaskie, dolnośląskie, łódzkie, śląskie, opolskie",
  },
  {
    id: "turn-2",
    label: "Tura 2",
    dates: "1–14 lutego",
    from: "2027-02-01",
    to: "2027-02-14",
    regions: "mazowieckie, pomorskie, świętokrzyskie, lubelskie",
  },
  {
    id: "turn-3",
    label: "Tura 3",
    dates: "15–28 lutego",
    from: "2027-02-15",
    to: "2027-02-28",
    regions: "lubuskie, kujawsko-pomorskie, warmińsko-mazurskie, wielkopolskie, zachodniopomorskie, małopolskie",
  },
];

function inRange(offer: LiveOffer, from: string, to: string) {
  if (!offer.startDateISO) return false;
  return offer.startDateISO >= from && offer.startDateISO <= to;
}

export default function FerieOffers2027() {
  const [selectedId, setSelectedId] = useState("all");
  const [offers, setOffers] = useState<LiveOffer[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState("");
  const selected = FERIE_TURNS.find((turn) => turn.id === selectedId) || FERIE_TURNS[0];

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      mode: "search",
      broad: "1",
      rescue: "1",
      fast: "1",
      strict: "1",
      start: FERIE_TURNS[0].from,
      end: FERIE_TURNS[0].to,
      dateKind: "departure",
    });

    setStatus("loading");
    fetch(`/api/today-offers?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Nie udało się pobrać ofert.");
        const rows = Array.isArray(payload?.offers) ? payload.offers as LiveOffer[] : [];
        setOffers(rows);
        setNotice(typeof payload?.notice === "string" ? payload.notice : "");
        setStatus("ready");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setStatus("error");
        setNotice(error instanceof Error ? error.message : "Nie udało się pobrać ofert.");
      });

    return () => controller.abort();
  }, []);

  const visibleOffers = useMemo(() => {
    const rows = offers
      .filter((offer) => inRange(offer, selected.from, selected.to))
      .filter((offer) => Boolean(offer.affiliateUrl) && offer.availabilityStatus !== "expired")
      .sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity));

    const unique = new Map<string, LiveOffer>();
    for (const offer of rows) {
      const key = `${offer.city}|${offer.country}`.toLowerCase();
      if (!unique.has(key)) unique.set(key, offer);
    }
    return Array.from(unique.values()).slice(0, 9);
  }, [offers, selected]);

  return (
    <section className="shell ferie-live-section" id="oferty-ferie" aria-labelledby="ferie-live-title">
      <div className="ferie-live-head">
        <div>
          <div className="kicker">KONKRETNE OFERTY NA FERIE</div>
          <h2 id="ferie-live-title">Najtańsze wyjazdy w terminach ferii 2027</h2>
          <p>Tu nie pokazujemy samych inspiracji. Wybierz swoją turę i zobacz konkretne, klikalne oferty z ceną, terminem, lotniskiem i hotelem.</p>
        </div>
      </div>

      <div className="ferie-turn-tabs" role="tablist" aria-label="Wybierz termin ferii">
        {FERIE_TURNS.map((turn) => (
          <button
            type="button"
            key={turn.id}
            role="tab"
            aria-selected={selected.id === turn.id}
            className={selected.id === turn.id ? "active" : ""}
            onClick={() => setSelectedId(turn.id)}
          >
            <strong>{turn.label}</strong>
            <span>{turn.dates}</span>
          </button>
        ))}
      </div>

      <div className="ferie-selected-turn">
        <CalendarDays size={17}/>
        <div>
          <strong>{selected.dates}</strong>
          <span>{selected.regions}</span>
        </div>
      </div>

      {status === "loading" && (
        <div className="ferie-live-state">
          <RefreshCw size={20} className="ferie-spin"/>
          <div><strong>Szukamy aktualnych ofert w terminach ferii…</strong><span>Sprawdzamy dostępne pakiety i sortujemy je od najniższej ceny.</span></div>
        </div>
      )}

      {status === "error" && (
        <div className="ferie-live-state ferie-live-state-error">
          <div><strong>Nie udało się teraz odświeżyć ofert.</strong><span>{notice || "Skorzystaj z wyszukiwarki poniżej — daty ferii są już ustawione."}</span></div>
        </div>
      )}

      {status === "ready" && visibleOffers.length > 0 && (
        <>
          <div className="ferie-live-grid">
            {visibleOffers.map((offer) => (
              <div className="ferie-live-card" key={offer.id}>
                <OfferCard
                  offer={offer}
                  sourceSurface="ferie_2027"
                  priceHighlight={{ label: "Ferie 2027", detail: selected.dates }}
                />
              </div>
            ))}
          </div>
          {notice && <p className="ferie-live-notice">{notice}</p>}
        </>
      )}

      {status === "ready" && visibleOffers.length === 0 && (
        <div className="ferie-live-state">
          <Search size={20}/>
          <div>
            <strong>Brak potwierdzonych ofert w tej turze w aktualnym feedzie.</strong>
            <span>Nie podstawiamy ofert z innych terminów. Użyj wyszukiwarki poniżej, żeby sprawdzić konkretny kierunek lub lotnisko.</span>
          </div>
        </div>
      )}

      <div className="ferie-direct-search">
        <div className="ferie-direct-search-head">
          <div className="kicker">SZUKAJ DOKŁADNIE W SWOJEJ TURZE</div>
          <h3>Daty ferii są już ustawione</h3>
          <p>Wybierz lotnisko i kierunek. Wyszukiwarka nie powinna wyprowadzać Cię poza wybrany termin ferii.</p>
        </div>
        <SearchHub
          key={selected.id}
          embedded
          initialTab="Lot + hotel"
          initialDateMode="range"
          initialDateFrom={selected.from}
          initialDateTo={selected.to}
          destinationQuickPicks={["Egipt", "Teneryfa", "Fuerteventura", "Malta", "Cypr"]}
        />
      </div>
    </section>
  );
}
