"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Moon,
  MountainSnow,
  Plane,
  RefreshCw,
  Search,
  Sun,
  Utensils,
} from "lucide-react";
import SearchHub from "@/components/SearchHub";
import TravelImage from "@/components/TravelImage";
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

type PresetResult = {
  id: string;
  query: string;
  label: string;
  offer: LiveOffer | null;
  regionalDeparture: boolean;
  airportLabel: string;
  notice?: string;
  searchUrl?: string;
};

type FeriePresetPayload = {
  ok?: boolean;
  airports?: string[];
  airportLabel?: string;
  presets?: PresetResult[];
};

const FERIE_DESTINATIONS = [
  {
    id: "italy",
    label: "Włochy",
    icon: "🇮🇹",
    eyebrow: "ALPY / ZIMOWY WYJAZD",
    short: "Dolomity i północne Włochy",
    imageCity: "Cortina d'Ampezzo",
    imageCountry: "Włochy",
    vibe: "snow",
    emptyCopy: "Nie mamy teraz potwierdzonego pakietu w tej turze. Sprawdź Włochy w wyszukiwarce z gotowymi datami.",
  },
  {
    id: "austria",
    label: "Austria",
    icon: "🇦🇹",
    eyebrow: "ALPY / ZIMOWY WYJAZD",
    short: "Tyrol, Salzburg i austriackie Alpy",
    imageCity: "Innsbruck",
    imageCountry: "Austria",
    vibe: "snow",
    emptyCopy: "Nie mamy teraz potwierdzonego pakietu w tej turze. Sprawdź Austrię w wyszukiwarce z gotowymi datami.",
  },
  {
    id: "egypt",
    label: "Egipt",
    icon: "🇪🇬",
    eyebrow: "SŁOŃCE / ALL INCLUSIVE",
    short: "Hurghada, Marsa Alam, Sharm el Sheikh",
    imageCity: "Hurghada",
    imageCountry: "Egipt",
    vibe: "sun",
    emptyCopy: "Nie mamy teraz potwierdzonego Egiptu w tej turze. Wyszukiwarka poniżej zachowa daty ferii.",
  },
  {
    id: "turkey",
    label: "Turcja",
    icon: "🇹🇷",
    eyebrow: "HOTEL / ZWIEDZANIE",
    short: "Stambuł i zimowy wyjazd do Turcji",
    imageCity: "Stambuł",
    imageCountry: "Turcja",
    vibe: "sun",
    emptyCopy: "Nie mamy teraz potwierdzonej Turcji w tej turze. Wyszukaj ją niżej bez zmiany dat.",
  },
] as const;

const FERIE_TURNS: FerieTurn[] = [
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
  {
    id: "all",
    label: "Całe ferie",
    dates: "18 stycznia – 28 lutego",
    from: "2027-01-18",
    to: "2027-02-28",
    regions: "wszystkie województwa",
  },
];

function inRange(offer: LiveOffer, from: string, to: string) {
  if (!offer.startDateISO) return false;
  return offer.startDateISO >= from && offer.startDateISO <= to;
}

function nightsLabel(nights: number) {
  if (nights === 1) return "noc";
  if (nights % 10 >= 2 && nights % 10 <= 4 && !(nights % 100 >= 12 && nights % 100 <= 14)) return "noce";
  return "nocy";
}

function SearchPresetCard({
  preset,
  searchUrl,
  dates,
  airportLabel,
}: {
  preset: (typeof FERIE_DESTINATIONS)[number];
  searchUrl?: string;
  dates: string;
  airportLabel: string;
}) {
  return (
    <a className="ferie-search-preset-card" href={searchUrl || "#szukaj-w-tej-turze"}>
      <div className="ferie-search-preset-media">
        <TravelImage
          city={preset.imageCity}
          country={preset.imageCountry}
          alt={`${preset.label} — ferie 2027`}
          className="ferie-search-preset-image"
        />
        <span>GOTOWE WYSZUKIWANIE</span>
      </div>
      <div className="ferie-search-preset-body">
        <strong>{preset.label}</strong>
        <small>{preset.short}</small>
        <div className="ferie-search-preset-meta">
          <span><CalendarDays size={14}/>{dates} 2027</span>
          <span><Plane size={14}/>{airportLabel || "lotniska w Polsce"}</span>
          <span><Moon size={14}/>5–9 nocy</span>
        </div>
        <div className="ferie-search-preset-cta">Sprawdź aktualne pakiety <ArrowRight size={15}/></div>
        <p>Bez zgadywania ceny — otwieramy wyszukiwanie już ustawione na tę turę.</p>
      </div>
    </a>
  );
}

function CompactOfferCard({
  offer,
  badge,
  sourceNote,
}: {
  offer: LiveOffer;
  badge?: string;
  sourceNote?: string;
}) {
  return (
    <a className="ferie-compact-offer" href={offer.affiliateUrl}>
      <div className="ferie-compact-media">
        <TravelImage
          city={offer.city}
          country={offer.country}
          alt={`${offer.city}, ${offer.country}`}
          className="ferie-compact-image"
          overrideSrc={offer.image}
        />
        {badge && <span className="ferie-compact-badge">{badge}</span>}
      </div>
      <div className="ferie-compact-body">
        <div className="ferie-compact-country">{offer.flag} {offer.country}</div>
        <div className="ferie-compact-title-row">
          <div>
            <strong>{offer.city}</strong>
            {offer.hotel && <span>{offer.hotel}</span>}
          </div>
          <ArrowRight size={18}/>
        </div>

        <div className="ferie-compact-meta">
          <span><CalendarDays size={14}/>{offer.dates}</span>
          <span><Plane size={14}/>{offer.departure}</span>
          <span><Moon size={14}/>{offer.nights} {nightsLabel(offer.nights)}</span>
          <span><Utensils size={14}/>{offer.board}</span>
        </div>

        <div className="ferie-compact-bottom">
          <div>
            <small>od</small>
            <b>{Number(offer.price).toLocaleString("pl-PL")} zł</b>
            <span>/ os.</span>
          </div>
          <em>Sprawdź ofertę</em>
        </div>
        {sourceNote && <div className="ferie-compact-source"><MapPin size={12}/>{sourceNote}</div>}
      </div>
    </a>
  );
}

export default function FerieOffers2027() {
  const [selectedId, setSelectedId] = useState("all");
  const [presetPayload, setPresetPayload] = useState<FeriePresetPayload | null>(null);
  const [presetStatus, setPresetStatus] = useState<"loading" | "ready" | "error">("loading");
  const [offers, setOffers] = useState<LiveOffer[]>([]);
  const [offersStatus, setOffersStatus] = useState<"loading" | "ready" | "error">("loading");
  const selected = FERIE_TURNS.find((turn) => turn.id === selectedId) || FERIE_TURNS[0];

  useEffect(() => {
    const controller = new AbortController();
    setPresetStatus("loading");
    setPresetPayload(null);

    fetch(`/api/ferie-2027-offers?turn=${encodeURIComponent(selected.id)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json() as FeriePresetPayload;
        if (!response.ok || !payload?.ok) throw new Error("Nie udało się pobrać gotowców.");
        setPresetPayload(payload);
        setPresetStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setPresetStatus("error");
      });

    return () => controller.abort();
  }, [selected.id]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      mode: "search",
      broad: "1",
      fast: "1",
      strict: "1",
      start: selected.from,
      end: selected.to,
      dateKind: "departure",
    });

    setOffersStatus("loading");
    setOffers([]);

    fetch(`/api/today-offers?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error("Nie udało się pobrać ofert.");
        const rows = Array.isArray(payload?.offers) ? payload.offers as LiveOffer[] : [];
        setOffers(rows);
        setOffersStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setOffersStatus("error");
      });

    return () => controller.abort();
  }, [selected.from, selected.to]);

  const presetsById = useMemo(() => {
    const map = new Map<string, PresetResult>();
    for (const row of presetPayload?.presets || []) map.set(row.id, row);
    return map;
  }, [presetPayload]);

  const presetIds = useMemo(() => {
    return new Set((presetPayload?.presets || []).map((item) => item.offer?.id).filter(Boolean));
  }, [presetPayload]);

  const visibleOffers = useMemo(() => {
    const rows = offers
      .filter((offer) => inRange(offer, selected.from, selected.to))
      .filter((offer) => Boolean(offer.affiliateUrl) && offer.availabilityStatus !== "expired")
      .filter((offer) => !presetIds.has(offer.id))
      .sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity));

    const unique = new Map<string, LiveOffer>();
    for (const offer of rows) {
      const key = `${offer.city}|${offer.country}`.toLowerCase();
      if (!unique.has(key)) unique.set(key, offer);
    }
    return Array.from(unique.values()).slice(0, 6);
  }, [offers, presetIds, selected.from, selected.to]);

  return (
    <section className="shell ferie-live-section ferie-live-section-v2" id="oferty-ferie" aria-labelledby="ferie-live-title">
      <div className="ferie-live-head ferie-live-head-v2">
        <div>
          <div className="kicker">FERIE 2027 · GOTOWE WYJAZDY</div>
          <h2 id="ferie-live-title">Wybierz swoją turę. My podpinamy właściwe daty i lotniska.</h2>
          <p>Najpierw pokazujemy cztery gotowe kierunki na ferie. Dopiero niżej są pozostałe oferty i pełna wyszukiwarka.</p>
        </div>
      </div>

      <div className="ferie-turn-tabs ferie-turn-tabs-v2" role="tablist" aria-label="Wybierz termin ferii">
        {FERIE_TURNS.map((turn) => (
          <button
            type="button"
            key={turn.id}
            role="tab"
            aria-selected={selected.id === turn.id}
            className={selected.id === turn.id ? "active" : ""}
            onClick={() => setSelectedId(turn.id)}
          >
            <small>{turn.label}</small>
            <strong>{turn.dates}</strong>
            <span>{turn.id === "all" ? "wszystkie regiony" : turn.regions.split(",").slice(0, 3).join(", ") + "…"}</span>
          </button>
        ))}
      </div>

      <div className="ferie-selected-summary">
        <div>
          <CalendarDays size={18}/>
          <span><small>TERMIN</small><strong>{selected.dates} 2027</strong></span>
        </div>
        <div>
          <MapPin size={18}/>
          <span><small>WOJEWÓDZTWA</small><strong>{selected.regions}</strong></span>
        </div>
        <div>
          <Plane size={18}/>
          <span>
            <small>SZUKAMY NAJPIERW Z</small>
            <strong>
              {presetStatus === "loading"
                ? "dobieramy lotniska…"
                : presetPayload?.airportLabel || "lotnisk w Polsce"}
            </strong>
          </span>
        </div>
      </div>

      <div className="ferie-presets-head ferie-presets-head-v2">
        <div>
          <div className="kicker">4 GOTOWCE</div>
          <h3>Narty albo słońce — bez przeklikiwania dziesiątek kierunków</h3>
          <p>Każdy gotowiec jest liczony dla wybranej tury. Jeśli nie ma potwierdzonej oferty w tych datach, nie podmieniamy jej przypadkowym terminem.</p>
        </div>
      </div>

      <div className="ferie-presets-grid ferie-presets-grid-v2">
        {FERIE_DESTINATIONS.map((preset) => {
          const result = presetsById.get(preset.id);
          const offer = result?.offer || null;
          const regionalNote = offer
            ? result?.regionalDeparture
              ? `Wylot dopasowany do tej grupy: ${offer.departure}`
              : `Najtańszy znaleziony wylot: ${offer.departure}`
            : "";

          return (
            <article className="ferie-preset ferie-preset-v2" key={preset.id}>
              <div className="ferie-preset-heading">
                <div className="ferie-preset-heading-main">
                  <span className="ferie-preset-flag">{preset.icon}</span>
                  <div>
                    <small>{preset.vibe === "snow" ? <MountainSnow size={13}/> : <Sun size={13}/>} {preset.eyebrow}</small>
                    <strong>{preset.label}</strong>
                    <span>{preset.short}</span>
                  </div>
                </div>
              </div>

              {presetStatus === "loading" ? (
                <div className="ferie-preset-skeleton">
                  <div/>
                  <span><RefreshCw size={17} className="ferie-spin"/> Szukamy najlepszej opcji w tej turze…</span>
                </div>
              ) : presetStatus === "error" ? (
                <div className="ferie-preset-empty ferie-preset-empty-v2">
                  <strong>Nie udało się teraz odświeżyć tego kierunku.</strong>
                  <a href="#szukaj-w-tej-turze">Szukaj ręcznie <ArrowRight size={14}/></a>
                </div>
              ) : offer ? (
                <CompactOfferCard
                  offer={offer}
                  badge={result?.regionalDeparture ? "DOPASOWANY WYLOT" : "NAJLEPSZA CENA"}
                  sourceNote={regionalNote}
                />
              ) : (
                <SearchPresetCard
                  preset={preset}
                  searchUrl={result?.searchUrl}
                  dates={selected.dates}
                  airportLabel={presetPayload?.airportLabel || "lotniska w Polsce"}
                />
              )}
            </article>
          );
        })}
      </div>

      <div className="ferie-more-offers-head ferie-more-offers-head-v2">
        <div>
          <div className="kicker">WIĘCEJ W TYM TERMINIE</div>
          <h3>Najtańsze pozostałe oferty</h3>
        </div>
        <span>{selected.dates} 2027</span>
      </div>

      {offersStatus === "loading" && (
        <div className="ferie-live-state">
          <RefreshCw size={20} className="ferie-spin"/>
          <div><strong>Sprawdzamy pozostałe oferty…</strong><span>Sortujemy je od najniższej ceny i usuwamy powtórki kierunków.</span></div>
        </div>
      )}

      {offersStatus === "ready" && visibleOffers.length > 0 && (
        <div className="ferie-more-grid">
          {visibleOffers.map((offer) => (
            <CompactOfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}

      {(offersStatus === "error" || (offersStatus === "ready" && visibleOffers.length === 0)) && (
        <div className="ferie-live-state">
          <Search size={20}/>
          <div>
            <strong>Nie mamy teraz kolejnych potwierdzonych ofert dla tej tury.</strong>
            <span>Niżej możesz wyszukać konkretny kierunek — daty ferii są już ustawione.</span>
          </div>
        </div>
      )}

      <div className="ferie-direct-search ferie-direct-search-v2" id="szukaj-w-tej-turze">
        <div className="ferie-direct-search-head">
          <div className="kicker">NIE WIDZISZ SWOJEGO KIERUNKU?</div>
          <h3>Wyszukaj go bez ustawiania dat od nowa</h3>
          <p>Termin {selected.dates} 2027 jest już wpisany. Wybierz tylko lotnisko i kierunek.</p>
        </div>
        <SearchHub
          key={selected.id}
          embedded
          initialTab="Lot + hotel"
          initialAirports={presetPayload?.airports || []}
          initialDateMode="range"
          initialDateFrom={selected.from}
          initialDateTo={selected.to}
          destinationQuickPicks={["Włochy", "Austria", "Egipt", "Turcja", "Wyspy Kanaryjskie"]}
        />
      </div>
    </section>
  );
}
