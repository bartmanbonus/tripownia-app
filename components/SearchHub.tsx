"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, MapPin, Plane, Search, SlidersHorizontal, X } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { airportOptions } from "@/lib/offers";
import { WORLD_DESTINATIONS, destinationMatches } from "@/lib/worldDestinations";
import { isTravelDestinationAllowed, isTravelDestinationBlocked } from "@/lib/travelSafety";
import { touristDestinationKey } from "@/lib/destinationGrouping";

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

function onePerDirection(rows: any[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = touristDestinationKey(row);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueOfferVariants(rows: any[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = [
      String(row?.partner || ""),
      String(row?.hotel || row?.city || "").toLowerCase(),
      String(row?.dates || ""),
      String(row?.departure || "").toLowerCase(),
      String(row?.price || ""),
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
  const [budget, setBudget] = useState("all");
  const [board, setBoard] = useState("all");
  const [weekendOnly, setWeekendOnly] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
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
    setVisibleCount(6);
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
      rows = rows
        .filter((o: any) => ["exim", "tui"].includes(String(o.partner || "").toLowerCase()))
        .filter((o: any) => isTravelDestinationAllowed(String(o.city || ""), String(o.country || "")))
        .sort((a: any, b: any) => Number(a.price || Infinity) - Number(b.price || Infinity));

      // When a user names a destination, show real hotel/term variants for that place.
      // The API already resolves aliases and relevance; collapsing to one card per destination
      // made searches like Djerba look as if only one offer existed.
      rows = query
        ? uniqueOfferVariants(rows).slice(0, 18)
        : onePerDirection(rows).slice(0, 12);

      setResults(rows);
      if (!rows.length) {
        setNotice(query
          ? `Nie znaleźliśmy teraz potwierdzonej oferty dla „${query}”. Spróbuj bez jednego filtra albo wybierz Inspiracje.`
          : "Nie znaleźliśmy teraz potwierdzonej oferty dla tych parametrów. Spróbuj bez jednego filtra.");
      } else {
        const exactCount = Number(data?.exactSourceCount || 0);
        const apiNotice = String(data?.notice || "");
        setNotice(apiNotice || (query && exactCount > 0 && rows.length > exactCount
          ? `Najpierw pokazujemy ${exactCount} dokładnych dopasowań, a dalej najbliższe aktualne opcje dla tego kierunku.`
          : ""));
      }
    } catch {
      setResults([]);
      setNotice("Nie udało się teraz pobrać aktualnych ofert. Spróbuj ponownie za chwilę albo wybierz szersze parametry.");
    } finally {
      setLoading(false);
    }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    void runSearch();
  }

  function chooseTab(tab: string) {
    setActiveTab(tab);
    setSearched(false);
    setResults([]);
    setVisibleCount(6);
    setNotice("");
    // Typ podróży nie powinien sam zawężać długości pobytu.
    // Użytkownik może doprecyzować ją świadomie albo skorzystać z quick picka.
    setDuration("all");
  }

  function quickSearch(label: string, overrides: SearchOverrides) {
    setDestination(label);
    if (overrides.duration) setDuration(overrides.duration);
    if (overrides.budget) setBudget(overrides.budget);
    if (overrides.board) setBoard(overrides.board);
    if (typeof overrides.weekendOnly === "boolean") setWeekendOnly(overrides.weekendOnly);
    if (overrides.board || overrides.weekendOnly) setAdvancedOpen(true);
    if (overrides.tab) setActiveTab(overrides.tab);
    void runSearch(label, overrides);
  }

  function resetSearch() {
    setDestination("");
    setDeparture("");
    setDuration("all");
    setBudget("all");
    setBoard("all");
    setWeekendOnly(false);
    setAdvancedOpen(false);
    setResults([]);
    setVisibleCount(6);
    setNotice("");
    setSearched(false);
  }

  const quickPicks: Array<[string, string, SearchOverrides]> = [
    ["Djerba, Tunezja", "All Inclusive Tunezja", { duration: "5-7", board: "all inclusive", budget: "3000", tab: "Wakacje" }],
    ["Rzym, Włochy", "City break Rzym", { duration: "3-4", budget: "1500", tab: "City break" }],
    ["Teneryfa, Hiszpania", "Ciepło: Teneryfa", { duration: "5-7", budget: "3000", tab: "Wakacje" }],
    ["Zanzibar, Tanzania", "Egzotyka: Zanzibar", { duration: "11-14", budget: "7500", tab: "Wakacje" }],
  ];

  return (
    <section className="section shell search-v3-section" id="wyszukiwarka">
      <div className="search-v3">
        <div className="search-v3-head">
          <div>
            <small>WYSZUKIWARKA TRIPOWNI</small>
            <h2>Znajdź wyjazd</h2>
            <p>Wybierz kierunek. Pozostałe opcje są tylko wtedy, gdy ich potrzebujesz.</p>
          </div>
          <button type="button" className="search-v3-reset" onClick={resetSearch}>Wyczyść</button>
        </div>

        <div className="search-v3-tabs" role="tablist" aria-label="Rodzaj podróży">
          {["Wakacje", "City break", "Lot + hotel", "Inspiracje"].map((tab) => (
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
                placeholder={activeTab === "Inspiracje" ? "Może być dowolnie" : "Miasto, kraj albo wyspa"}
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

          <label className="search-v3-field search-v3-departure">
            <span><Plane size={15}/> Skąd?</span>
            <select value={departure} onChange={(event) => setDeparture(event.target.value)}>
              <option value="">Wszystkie lotniska</option>
              {airportOptions.map((airport: any) => <option key={airport.code} value={airport.code}>{airport.label}</option>)}
            </select>
            <ChevronDown size={15} className="search-v3-chevron"/>
          </label>

          <label className="search-v3-field search-v3-duration">
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

          <label className="search-v3-field search-v3-budget">
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

          <button type="submit" className="search-v3-submit" disabled={loading}><Search size={18}/>{loading ? "Szukamy…" : "Pokaż oferty"}</button>
        </form>

        <div className="search-v3-options-row">
          <button type="button" className={`search-v3-more ${advancedOpen ? "active" : ""}`} onClick={() => setAdvancedOpen((value) => !value)}>
            <SlidersHorizontal size={15}/> {advancedOpen ? "Mniej opcji" : "Więcej opcji"}
          </button>
          {advancedOpen && (
            <>
              <button type="button" className={`search-v3-weekend ${weekendOnly ? "active" : ""}`} onClick={() => setWeekendOnly((value) => !value)}>
                <span className="search-v3-check">{weekendOnly && <Check size={13}/>}</span> Weekend w terminie
              </button>
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
            </>
          )}
        </div>

        <div className="search-v3-quick">
          <span>Szybki start</span>
          <div>{quickPicks.map(([destinationLabel, label, overrides]) => <button type="button" key={destinationLabel} onClick={() => quickSearch(destinationLabel, overrides)}>{label}</button>)}</div>
        </div>

        {searched && (
          <div className="search-v3-results">
            <div className="search-v3-results-head">
              <div><small>WYNIKI</small><h3>{loading ? "Sprawdzamy aktualne oferty…" : results.length ? `${results.length} aktualnych ofert` : "Brak potwierdzonego dopasowania"}</h3></div>
              {notice && <p>{notice}</p>}
            </div>

            {!loading && results.length > 0 && (
              <>
                <div className="search-v3-results-grid">{results.slice(0, visibleCount).map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div>
                {results.length > visibleCount && <button className="search-v3-show-more" type="button" onClick={() => setVisibleCount((count) => Math.min(results.length, count + 6))}>Pokaż kolejne oferty ({results.length - visibleCount})</button>}
              </>
            )}
            {!loading && results.length === 0 && <div className="search-v3-empty"><strong>Spróbuj trochę szerzej.</strong><span>Usuń jeden filtr albo wybierz „Inspiracje” — Tripownia spróbuje znaleźć aktualne alternatywy zamiast zostawiać Ci pusty ekran.</span></div>}
          </div>
        )}
      </div>
    </section>
  );
}
