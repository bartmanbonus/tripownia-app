"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, MapPin, Plane, Search, SlidersHorizontal, X } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { airportOptions, offers, isOfferExpired } from "@/lib/offers";
import { WORLD_DESTINATIONS, destinationMatches, normalizeDestination } from "@/lib/worldDestinations";
import { isTravelDestinationAllowed, isTravelDestinationBlocked } from "@/lib/travelSafety";

type Props = {
  initialAirports?: string[];
  initialDestinations?: string[];
  initialDuration?: string;
  searchRequest?: number;
  initialTab?: string;
};

type SearchOverrides = {
  duration?: string;
  budget?: string;
  board?: string;
  weekendOnly?: boolean;
  tab?: string;
};

function normalizeOffer(o: any) {
  return normalizeDestination([o.city, o.country, o.hotel, o.destination, o.title].filter(Boolean).join(" "));
}

function onePerDirection(rows: any[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = normalizeDestination(String(row.city || row.country || row.destination || row.hotel || row.title || ""));
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function durationMatches(o: any, value: string) {
  const nights = Number(o.nights || o.duration || 0);
  if (value === "all" || !nights) return true;
  if (value === "1-2") return nights >= 1 && nights <= 2;
  if (value === "3-4") return nights >= 3 && nights <= 4;
  if (value === "5-7") return nights >= 5 && nights <= 7;
  if (value === "8-10") return nights >= 8 && nights <= 10;
  if (value === "11-14") return nights >= 11 && nights <= 14;
  if (value === "15+") return nights >= 15;
  return true;
}

export default function SearchHub({
  initialAirports = [],
  initialDestinations = [],
  initialDuration = "all",
  searchRequest = 0,
  initialTab = "Inspiracje",
}: Props) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [destination, setDestination] = useState(initialDestinations[0] || "");
  const [departure, setDeparture] = useState(initialAirports[0] || "");
  const [duration, setDuration] = useState(initialDuration || "all");
  const [budget, setBudget] = useState("5000");
  const [board, setBoard] = useState("all");
  const [weekendOnly, setWeekendOnly] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notice, setNotice] = useState("");
  const destinationRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const query = destination.trim();
    if (!query) return WORLD_DESTINATIONS.filter((x) => isTravelDestinationAllowed(x.label, x.region)).slice(0, 8);
    return WORLD_DESTINATIONS
      .filter((x) => isTravelDestinationAllowed(x.label, x.region))
      .filter((x) => destinationMatches(query, x))
      .slice(0, 8);
  }, [destination]);

  useEffect(() => {
    setDestination(initialDestinations[0] || "");
    setDeparture(initialAirports[0] || "");
    setDuration(initialDuration || "all");
  }, [initialAirports.join("|"), initialDestinations.join("|"), initialDuration]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) setSuggestionsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (searchRequest > 0) void runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchRequest]);

  function staticFallback(query: string, overrides: SearchOverrides = {}) {
    const activeDuration = overrides.duration ?? duration;
    const activeBudget = overrides.budget ?? budget;
    const activeBoard = overrides.board ?? board;
    const activeWeekend = overrides.weekendOnly ?? weekendOnly;
    const normalizedQuery = normalizeDestination(query);
    const maxPrice = activeBudget === "all" ? Infinity : Number(activeBudget);

    const rows = (offers as any[])
      .filter((o) => !isOfferExpired(o))
      .filter((o) => isTravelDestinationAllowed(String(o.city || ""), String(o.country || "")))
      .filter((o) => ["exim", "tui", "wakacje"].includes(String(o.partner || "").toLowerCase()))
      .filter((o) => !normalizedQuery || normalizeOffer(o).includes(normalizedQuery) || normalizedQuery.includes(normalizeDestination(String(o.city || o.country || ""))))
      .filter((o) => !departure || String(o.departureCode || o.airportCode || o.departureAirportCode || "").toUpperCase() === departure || normalizeDestination(String(o.departure || "")).includes(normalizeDestination(airportOptions.find((a: any) => a.code === departure)?.label || departure)))
      .filter((o) => durationMatches(o, activeDuration))
      .filter((o) => Number(o.price || 0) <= maxPrice)
      .filter((o) => activeBoard === "all" || normalizeDestination(String(o.board || "")).includes(normalizeDestination(activeBoard)))
      .filter((o) => {
        if (!activeWeekend) return true;
        const nights = Number(o.nights || o.duration || 0);
        const categories = (o.category || []).map((c: any) => normalizeDestination(String(c)));
        return categories.some((c: string) => c.includes("weekend")) || (nights >= 2 && nights <= 4);
      })
      .sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity));

    return onePerDirection(rows).slice(0, 9);
  }

  async function runSearch(destinationOverride?: string, overrides: SearchOverrides = {}) {
    const query = (destinationOverride ?? destination).trim();
    if (query && isTravelDestinationBlocked(query)) {
      setSearched(true);
      setResults([]);
      setNotice("Tego kierunku Tripownia obecnie nie promuje ze względów bezpieczeństwa.");
      return;
    }

    const activeDuration = overrides.duration ?? duration;
    const activeBudget = overrides.budget ?? budget;
    const activeBoard = overrides.board ?? board;
    const activeWeekend = overrides.weekendOnly ?? weekendOnly;
    const activeMode = overrides.tab ?? activeTab;

    setLoading(true);
    setSearched(true);
    setSuggestionsOpen(false);
    setNotice("");

    try {
      const params = new URLSearchParams({ mode: activeMode === "City break" ? "citybreak" : "search" });
      if (query) params.set("q", query);
      else params.set("broad", "1");
      if (departure) params.set("from", departure);
      if (activeDuration !== "all") params.set("nights", activeDuration);
      if (activeBudget !== "all") params.set("maxPrice", activeBudget);
      if (activeWeekend) params.set("weekend", "1");
      if (activeBoard === "all inclusive") params.set("board", "allinclusive");
      else if (activeBoard === "ultra all inclusive") params.set("board", "ultraallinclusive");
      else if (activeBoard === "śniadanie") params.set("board", "breakfast");
      else if (activeBoard === "half board") params.set("board", "halfboard");
      else if (activeBoard === "full board") params.set("board", "fullboard");
      else if (activeBoard === "bez wyżywienia") params.set("board", "roomonly");

      const response = await fetch(`/api/today-offers?${params.toString()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || data?.ok === false) throw new Error(String(data?.error || `HTTP ${response.status}`));

      let rows = Array.isArray(data?.offers) ? data.offers : [];
      rows = rows.filter((o: any) => ["exim", "tui"].includes(String(o.partner || "").toLowerCase()));
      rows = onePerDirection(rows.sort((a: any, b: any) => Number(a.price || Infinity) - Number(b.price || Infinity))).slice(0, 9);

      if (!rows.length) {
        const fallback = staticFallback(query, overrides);
        setResults(fallback);
        setNotice(fallback.length ? "Nie mamy teraz dokładnego wyniku z feedu. Pokazujemy najbliższe sensowne propozycje Tripowni." : "Nie znaleźliśmy teraz dobrego dopasowania. Zmień kierunek, budżet albo długość pobytu.");
      } else {
        setResults(rows);
        setNotice(String(data?.notice || ""));
      }
    } catch {
      const fallback = staticFallback(query, overrides);
      setResults(fallback);
      setNotice(fallback.length ? "Feed chwilowo nie odpowiedział. Pokazujemy sprawdzone propozycje z bazy Tripowni." : "Nie udało się pobrać ofert. Spróbuj zmienić parametry wyszukiwania.");
    } finally {
      setLoading(false);
    }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    void runSearch();
  }

  function chooseTab(tab: string) {
    if (tab === "Atrakcje") {
      window.location.href = "/atrakcje";
      return;
    }
    if (tab === "Parkingi") {
      window.location.href = "/parkingi";
      return;
    }
    if (tab === "eSIM") {
      window.location.href = "/esim";
      return;
    }

    setActiveTab(tab);
    setSearched(false);
    setResults([]);
    setNotice("");
    if (tab === "City break" || tab === "Lot + hotel") setDuration("3-4");
    if (tab === "Wakacje") setDuration("5-7");
  }

  function quickSearch(label: string, overrides: SearchOverrides) {
    setDestination(label);
    if (overrides.duration) setDuration(overrides.duration);
    if (overrides.budget) setBudget(overrides.budget);
    if (overrides.board) setBoard(overrides.board);
    if (typeof overrides.weekendOnly === "boolean") setWeekendOnly(overrides.weekendOnly);
    if (overrides.tab) setActiveTab(overrides.tab);
    void runSearch(label, overrides);
  }

  function resetSearch() {
    setDestination("");
    setDeparture("");
    setDuration("all");
    setBudget("5000");
    setBoard("all");
    setWeekendOnly(false);
    setAdvancedOpen(false);
    setResults([]);
    setNotice("");
    setSearched(false);
  }

  const quickPicks: Array<[string, string, SearchOverrides]> = [
    ["Rzym, Włochy", "Rzym na city break", { duration: "3-4", budget: "1500", tab: "City break" }],
    ["Teneryfa, Hiszpania", "Ciepło na Teneryfie", { duration: "5-7", budget: "3000", tab: "Wakacje" }],
    ["Djerba, Tunezja", "All Inclusive na Djerbie", { duration: "5-7", board: "all inclusive", budget: "3000", tab: "Wakacje" }],
    ["Bergamo, Włochy", "Tani weekend w Bergamo", { duration: "3-4", budget: "1000", weekendOnly: true, tab: "City break" }],
    ["Zanzibar, Tanzania", "Egzotyka: Zanzibar", { duration: "11-14", budget: "7500", tab: "Wakacje" }],
  ];

  return (
    <section className="section shell search-v3-section" id="wyszukiwarka">
      <div className="search-v3">
        <div className="search-v3-head">
          <div>
            <small>WYSZUKIWARKA TRIPOWNI</small>
            <h2>Gdzie chcesz lecieć?</h2>
            <p>Najpierw kierunek. Resztę doprecyzujesz w kilku kliknięciach.</p>
          </div>
          <button type="button" className="search-v3-reset" onClick={resetSearch}>Wyczyść</button>
        </div>

        <div className="search-v3-tabs" role="tablist" aria-label="Rodzaj podróży">
          {["Inspiracje", "City break", "Lot + hotel", "Wakacje", "Atrakcje", "Parkingi", "eSIM"].map((tab) => (
            <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => chooseTab(tab)}>{tab}</button>
          ))}
        </div>

        <form className="search-v3-form" onSubmit={submitSearch}>
          <div className="search-v3-field search-v3-destination" ref={destinationRef}>
            <label htmlFor="tripownia-destination"><MapPin size={15}/> Dokąd?</label>
            <div className="search-v3-input-wrap">
              <input
                id="tripownia-destination"
                value={destination}
                onChange={(event) => { setDestination(event.target.value); setSuggestionsOpen(true); }}
                onFocus={() => setSuggestionsOpen(true)}
                placeholder="Miasto, kraj albo wyspa"
                autoComplete="off"
              />
              {destination && <button type="button" aria-label="Wyczyść kierunek" onClick={() => { setDestination(""); setSuggestionsOpen(true); }}><X size={16}/></button>}
            </div>

            {suggestionsOpen && (
              <div className="search-v3-suggestions">
                {suggestions.length > 0 ? suggestions.map((item) => (
                  <button key={item.label} type="button" onClick={() => { setDestination(item.label); setSuggestionsOpen(false); }}>
                    <MapPin size={15}/><span><strong>{item.label}</strong><small>{item.region}</small></span>
                  </button>
                )) : destination.trim() && !isTravelDestinationBlocked(destination) ? (
                  <button type="button" onClick={() => setSuggestionsOpen(false)}><Search size={15}/><span><strong>Szukaj dokładnie „{destination.trim()}”</strong><small>Dowolny kierunek na świecie</small></span></button>
                ) : null}
              </div>
            )}
          </div>

          <label className="search-v3-field">
            <span><Plane size={15}/> Skąd?</span>
            <select value={departure} onChange={(event) => setDeparture(event.target.value)}>
              <option value="">Wszystkie lotniska</option>
              {airportOptions.map((airport: any) => <option key={airport.code} value={airport.code}>{airport.label}</option>)}
            </select>
            <ChevronDown size={15} className="search-v3-chevron"/>
          </label>

          <label className="search-v3-field">
            <span>Na ile?</span>
            <select value={duration} onChange={(event) => setDuration(event.target.value)}>
              <option value="all">Dowolnie</option>
              <option value="1-2">1–2 noce</option>
              <option value="3-4">3–4 noce</option>
              <option value="5-7">5–7 nocy</option>
              <option value="8-10">8–10 nocy</option>
              <option value="11-14">11–14 nocy</option>
              <option value="15+">15+ nocy</option>
            </select>
            <ChevronDown size={15} className="search-v3-chevron"/>
          </label>

          <label className="search-v3-field">
            <span>Budżet / os.</span>
            <select value={budget} onChange={(event) => setBudget(event.target.value)}>
              <option value="all">Dowolny</option>
              <option value="750">do 750 zł</option>
              <option value="1000">do 1 000 zł</option>
              <option value="1500">do 1 500 zł</option>
              <option value="2000">do 2 000 zł</option>
              <option value="3000">do 3 000 zł</option>
              <option value="5000">do 5 000 zł</option>
              <option value="7500">do 7 500 zł</option>
              <option value="10000">do 10 000 zł</option>
              <option value="15000">do 15 000 zł</option>
            </select>
            <ChevronDown size={15} className="search-v3-chevron"/>
          </label>

          <button type="submit" className="search-v3-submit" disabled={loading}><Search size={18}/>{loading ? "Szukamy…" : "Szukaj wyjazdu"}</button>
        </form>

        <div className="search-v3-options-row">
          <button type="button" className={`search-v3-more ${advancedOpen ? "active" : ""}`} onClick={() => setAdvancedOpen((value) => !value)}>
            <SlidersHorizontal size={15}/> Więcej filtrów
          </button>
          <button type="button" className={`search-v3-weekend ${weekendOnly ? "active" : ""}`} onClick={() => setWeekendOnly((value) => !value)}>
            <span className="search-v3-check">{weekendOnly && <Check size={13}/>}</span> Pobyt obejmuje sobotę i niedzielę
          </button>
          {advancedOpen && (
            <label className="search-v3-board">
              <span>Wyżywienie</span>
              <select value={board} onChange={(event) => setBoard(event.target.value)}>
                <option value="all">Dowolne</option>
                <option value="bez wyżywienia">Bez wyżywienia</option>
                <option value="śniadanie">Śniadanie</option>
                <option value="half board">Half Board</option>
                <option value="full board">Full Board</option>
                <option value="all inclusive">All Inclusive</option>
                <option value="ultra all inclusive">Ultra All Inclusive</option>
              </select>
            </label>
          )}
        </div>

        <div className="search-v3-quick">
          <span>Szybki start</span>
          <div>{quickPicks.map(([destinationLabel, label, overrides]) => <button type="button" key={destinationLabel} onClick={() => quickSearch(destinationLabel, overrides)}>{label}</button>)}</div>
        </div>

        {searched && (
          <div className="search-v3-results">
            <div className="search-v3-results-head">
              <div><small>WYNIKI</small><h3>{loading ? "Sprawdzamy aktualne oferty…" : results.length ? `${results.length} propozycji dla Ciebie` : "Brak dopasowania"}</h3></div>
              {notice && <p>{notice}</p>}
            </div>

            {!loading && results.length > 0 && <div className="search-v3-results-grid">{results.map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div>}
            {!loading && results.length === 0 && <div className="search-v3-empty"><strong>Spróbuj trochę szerzej.</strong><span>Zmień kierunek, budżet albo długość pobytu — nie dokładamy przypadkowych ofert tylko po to, żeby zapełnić ekran.</span></div>}
          </div>
        )}
      </div>
    </section>
  );
}
