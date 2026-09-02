"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { CalendarDays, Car, Compass, MapPin, Search, Users, WalletCards, PlaneTakeoff, Check, ChevronDown, X } from "lucide-react";
import OfferCard from "./OfferCard";
import { airportOptions, destinationOptions, offers } from "@/lib/offers";
import { buildEskyFlightsUrl, partners } from "@/lib/partners";
import { trackedAffiliateHref } from "@/lib/tracking";
import { matchesPreset, recommendationScore, type SmartPreset } from "@/lib/offerQuality";


const flightDestinations: Record<string, { eskyType: "ap" | "ci" | "co"; eskyCode: string; slug: string; kiwiCode: string }> = {
  "malta": { eskyType: "co", eskyCode: "mt", slug: "malta", kiwiCode: "MLA" },
  "barcelona": { eskyType: "ci", eskyCode: "bcn", slug: "barcelona", kiwiCode: "BCN" },
  "rzym": { eskyType: "ci", eskyCode: "rom", slug: "rzym", kiwiCode: "ROM" },
  "porto": { eskyType: "ci", eskyCode: "opo", slug: "porto", kiwiCode: "OPO" },
  "alicante": { eskyType: "ci", eskyCode: "alc", slug: "alicante", kiwiCode: "ALC" },
  "pafos": { eskyType: "ci", eskyCode: "pfo", slug: "pafos", kiwiCode: "PFO" },
  "madera": { eskyType: "ap", eskyCode: "fnc", slug: "funchal-madera", kiwiCode: "FNC" },
  "teneryfa": { eskyType: "co", eskyCode: "es", slug: "hiszpania", kiwiCode: "TCI" },
  "fuerteventura": { eskyType: "ap", eskyCode: "fue", slug: "fuerteventura", kiwiCode: "FUE" },
  "majorka": { eskyType: "ap", eskyCode: "pmi", slug: "palma-de-mallorca", kiwiCode: "PMI" },
  "malaga": { eskyType: "ci", eskyCode: "agp", slug: "malaga", kiwiCode: "AGP" },
  "bergamo": { eskyType: "ci", eskyCode: "bgy", slug: "bergamo", kiwiCode: "BGY" },
  "londyn": { eskyType: "ci", eskyCode: "lon", slug: "londyn", kiwiCode: "LON" },
  "paryz": { eskyType: "ci", eskyCode: "par", slug: "paryz", kiwiCode: "PAR" },
  "paryż": { eskyType: "ci", eskyCode: "par", slug: "paryz", kiwiCode: "PAR" },
  "wieden": { eskyType: "ci", eskyCode: "vie", slug: "wieden", kiwiCode: "VIE" },
  "wiedeń": { eskyType: "ci", eskyCode: "vie", slug: "wieden", kiwiCode: "VIE" },
  "budapeszt": { eskyType: "ci", eskyCode: "bud", slug: "budapeszt", kiwiCode: "BUD" },
  "praga": { eskyType: "ci", eskyCode: "prg", slug: "praga", kiwiCode: "PRG" },
  "split": { eskyType: "ci", eskyCode: "spu", slug: "split", kiwiCode: "SPU" },
  "neapol": { eskyType: "ci", eskyCode: "nap", slug: "neapol", kiwiCode: "NAP" },
  "sewilla": { eskyType: "ci", eskyCode: "svq", slug: "sewilla", kiwiCode: "SVQ" },
  "amsterdam": { eskyType: "ci", eskyCode: "ams", slug: "amsterdam", kiwiCode: "AMS" },
  "kopenhaga": { eskyType: "ci", eskyCode: "cph", slug: "kopenhaga", kiwiCode: "CPH" },
  "dubaj": { eskyType: "ci", eskyCode: "dxb", slug: "dubaj", kiwiCode: "DXB" },
  "japonia": { eskyType: "co", eskyCode: "jp", slug: "japonia", kiwiCode: "TYO" },
  "islandia": { eskyType: "co", eskyCode: "is", slug: "islandia", kiwiCode: "REK" },
  "norwegia": { eskyType: "co", eskyCode: "no", slug: "norwegia", kiwiCode: "OSL" },
};

function normalizeFlightPlace(value: string) {
  return value.trim().replace(/,.*$/, "").toLocaleLowerCase("pl");
}

const tabs = [
  { id: "inspiracje", label: "Inspiracje" },
  { id: "city-break", label: "City break" },
  { id: "lot-hotel", label: "Lot + hotel" },
  { id: "wakacje", label: "Wakacje" },
  { id: "atrakcje", label: "Atrakcje" },
  { id: "parking", label: "Parkingi" },
  { id: "esim", label: "eSIM" },
];

function MultiSelect({
  label, icon, options, selected, setSelected, anywhereLabel = "Gdziekolwiek"
}: {
  label: string;
  icon: React.ReactNode;
  options: { value: string; label: string }[];
  selected: string[];
  setSelected: (v: string[]) => void;
  anywhereLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selectedLabels = options.filter(o => selected.includes(o.value)).map(o => o.label);
  const summary = !selected.length ? anywhereLabel : selectedLabels.length <= 2 ? selectedLabels.join(", ") : `${selectedLabels.slice(0,2).join(", ")} +${selectedLabels.length - 2}`;

  function toggle(value: string) {
    setSelected(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
  }

  return <div className="dropdown-filter" ref={ref}>
    <button type="button" className={`dropdown-trigger ${open ? "open" : ""}`} onClick={() => setOpen(v => !v)}>
      <span className="dropdown-icon">{icon}</span>
      <span className="dropdown-copy"><small>{label}</small><strong>{summary}</strong></span>
      <ChevronDown size={17} className={`dropdown-chevron ${open ? "rotated" : ""}`}/>
    </button>
    {open && <div className="dropdown-menu">
      <div className="dropdown-menu-head">
        <strong>{label}</strong>
        <button type="button" onClick={() => setOpen(false)} aria-label="Zamknij"><X size={17}/></button>
      </div>
      <button type="button" className={`dropdown-anywhere ${!selected.length ? "active" : ""}`} onClick={() => setSelected([])}>
        <Check size={15}/> {anywhereLabel}
      </button>
      <div className="dropdown-options">
        {options.map(option => <button type="button" key={option.value} className={`dropdown-option ${selected.includes(option.value) ? "active" : ""}`} onClick={() => toggle(option.value)}>
          <span className="check-box">{selected.includes(option.value) && <Check size={13}/>}</span>
          <span>{option.label}</span>
        </button>)}
      </div>
      <button type="button" className="dropdown-done" onClick={() => setOpen(false)}>Gotowe</button>
    </div>}
  </div>;
}

type SearchHubProps = {
  initialAirports?: string[];
  initialDestinations?: string[];
  initialDuration?: string;
  searchRequest?: number;
};

export default function SearchHub({
  initialAirports = [],
  initialDestinations = [],
  initialDuration = "all",
  searchRequest = 0,
}: SearchHubProps) {
  const [tab, setTab] = useState("inspiracje");
  const [selectedAirports, setSelectedAirports] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [budget, setBudget] = useState(5000);
  const [duration, setDuration] = useState("all");
  const [board, setBoard] = useState("all");
  const [searched, setSearched] = useState(false);
  const [visible, setVisible] = useState(12);
  const [preset, setPreset] = useState<SmartPreset>("all");
  const [sort, setSort] = useState<"recommended" | "price" | "score">("recommended");
  const [query, setQuery] = useState("");
  const [exotic, setExotic] = useState(false);

  useEffect(() => {
    if (!searchRequest) return;
    setSelectedAirports(initialAirports);
    setSelectedDestinations(initialDestinations);
    setDuration(initialDuration);
    setSearched(true);
    setVisible(12);
  }, [searchRequest, initialAirports, initialDestinations, initialDuration]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const requestedTab = params.get("trip");
    if (requestedTab && tabs.some(item => item.id === requestedTab)) {
      setTab(requestedTab);
      setSearched(true);
    }
    if (params.get("focus") === "destination") {
      window.setTimeout(() => document.getElementById("tripownia-search-query")?.focus(), 250);
    }
  }, []);

  const airportSelectOptions = airportOptions.map(a => ({ value: a.code, label: a.label }));
  const destinationSelectOptions = destinationOptions.map(place => ({ value: place, label: place }));

  const exoticKeywords = [
    "malediwy","mauritius","seszele","zanzibar","bali","indonezja","tajlandia",
    "phuket","krabi","koh samui","sri lanka","dominikana","meksyk","riviera maya",
    "kuba","jamajka","barbados","aruba","bora bora","oman","dubaj","abu dhabi",
    "katar","wyspy zielonego przylądka","cabo verde","kenia","tanzania","wietnam",
    "filipiny","malezja","singapur","japonia","nowa zelandia","australia","rpa"
  ];

  const results = useMemo(() => offers
    .filter((offer) => {
      if (offer.availabilityStatus === "expired") return false;
      const normalizedQuery = query.trim().toLocaleLowerCase("pl");
      const searchable = `${offer.city} ${offer.country} ${offer.hotel} ${offer.board} ${offer.departure} ${offer.reason}`.toLocaleLowerCase("pl");
      const queryMatch = !normalizedQuery || searchable.includes(normalizedQuery);
      const destinationMatch = !selectedDestinations.length || selectedDestinations.some(item => item === offer.country || item === `${offer.city}, ${offer.country}`);
      const departureMatch = !selectedAirports.length || selectedAirports.includes(offer.airportCode);
      const budgetMatch = offer.price <= budget;
      const presetMatch = matchesPreset(offer, preset);
      const exoticSearchable = `${offer.city} ${offer.country} ${offer.hotel}`.toLocaleLowerCase("pl");
      const exoticMatch = !exotic || exoticKeywords.some(keyword => exoticSearchable.includes(keyword));

      const tripDays = offer.nights + 1;
      const durationMatch =
        tab === "wakacje"
          ? tripDays >= 6 && tripDays <= 10
          : duration === "all" ||
            (duration === "short"
              ? offer.nights <= 4
              : duration === "week"
                ? offer.nights >= 5 && offer.nights <= 8
                : offer.nights > 8);

      const boardName = offer.board.toLowerCase();
      const isAI = boardName.includes("all inclusive");
      const isHB = boardName.includes("half board") || boardName.includes("hb") || boardName.includes("2 posił");
      const hasBreakfast = boardName.includes("śniad");

      const boardMatch =
        board === "all" ||
        (board === "ai" && isAI) ||
        (board === "hb" && isHB) ||
        (board === "breakfast" && hasBreakfast);

      const tabMatch =
        tab === "city-break"
          ? offer.category.includes("city") && offer.nights <= 5
          : tab === "lot-hotel"
            ? ["esky", "booking", "kiwi"].includes(offer.partner) || offer.category.includes("city")
            : tab === "wakacje"
              ? offer.nights >= 5 || offer.category.includes("plaza") || isAI || isHB
              : true;

      return queryMatch && destinationMatch && departureMatch && budgetMatch && durationMatch && boardMatch && tabMatch && presetMatch && exoticMatch;
    })
    .sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "score") return b.score - a.score;
      return recommendationScore(b, preset) - recommendationScore(a, preset);
    }),
  [selectedAirports, selectedDestinations, budget, duration, board, tab, preset, sort, query, exotic]);

  const specialistPath = tab === "atrakcje" ? "/atrakcje" : tab === "parking" ? "/parkingi" : tab === "esim" ? "/esim" : null;
  const fallbackOffers = useMemo(() => {
    if (results.length) return [];
    const normalizedQuery = query.trim().toLocaleLowerCase("pl");
    return offers
      .filter(o => o.availabilityStatus !== "expired")
      .map(o => {
        let points = o.score * 10;
        const searchable = `${o.city} ${o.country} ${o.hotel} ${o.reason}`.toLocaleLowerCase("pl");
        if (normalizedQuery && searchable.includes(normalizedQuery)) points += 40;
        if (selectedDestinations.some(item => item === o.country || item === `${o.city}, ${o.country}`)) points += 50;
        if (selectedAirports.includes(o.airportCode)) points += 20;
        if (o.price <= budget) points += 10;
        if (duration === "short" && o.nights <= 4) points += 8;
        if (duration === "week" && o.nights >= 5 && o.nights <= 8) points += 8;
        if (duration === "long" && o.nights > 8) points += 8;
        if (preset !== "all" && matchesPreset(o, preset)) points += 12;
        if (exotic) {
          const exoticSearchable = `${o.city} ${o.country} ${o.hotel}`.toLocaleLowerCase("pl");
          points += exoticKeywords.some(keyword => exoticSearchable.includes(keyword)) ? 60 : -40;
        }
        return { o, points };
      })
      .sort((a,b) => b.points - a.points || a.o.price - b.o.price)
      .slice(0, 8)
      .map(x => x.o);
  }, [results.length, selectedAirports, selectedDestinations, budget, duration, preset, query, exotic]);

  const displayResults = results.length ? results : fallbackOffers;
  const displayed = displayResults.slice(0, visible);

  const partnerQuery = (selectedDestinations[0] || query.trim() || "wakacje").replace(/,.*$/, "").trim();
  const normalizedPartnerQuery = normalizeFlightPlace(partnerQuery);
  const flightDestination = flightDestinations[normalizedPartnerQuery];
  const flightOrigin = selectedAirports[0] || "";

  const bookingSearchUrl = useMemo(() => {
    const url = new URL("https://www.booking.com/searchresults.html");
    if (partnerQuery && partnerQuery !== "wakacje") url.searchParams.set("ss", partnerQuery);
    return partners.booking.buildUrl(url.toString());
  }, [partnerQuery]);

  const eskyFlightUrl = useMemo(() => {
    if (!flightDestination) return buildEskyFlightsUrl("https://www.esky.pl/tanie-loty/");
    const fromPart = flightOrigin ? `ap/${flightOrigin.toLowerCase()}` : "0/0";
    const destination = `${flightDestination.eskyType}/${flightDestination.eskyCode}/${flightDestination.slug}`;
    return buildEskyFlightsUrl(`https://www.esky.pl/tanie-loty/${fromPart}/${destination}`);
  }, [flightDestination, flightOrigin]);

  const kiwiSearchUrl = useMemo(() => {
    const deep = new URL("https://www.kiwi.com/deep");
    deep.searchParams.set("from", flightOrigin || "anywhere");
    deep.searchParams.set("to", flightDestination?.kiwiCode || "anywhere");
    deep.searchParams.set("sort", "price");
    deep.searchParams.set("asc", "1");
    deep.searchParams.set("currency", "PLN");
    deep.searchParams.set("locale", "pl");
    return partners.kiwi.buildUrl(deep.toString());
  }, [flightDestination, flightOrigin]);
  const hasActiveFilters =
    Boolean(query.trim()) ||
    selectedAirports.length > 0 ||
    selectedDestinations.length > 0 ||
    budget !== 5000 ||
    duration !== "all" ||
    board !== "all" ||
    preset !== "all" ||
    exotic;

  function runSearch() {
    setSearched(true);
    setVisible(12);
    if (typeof window !== "undefined" && window.location.hash !== "#wyszukiwarka") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#wyszukiwarka`);
    }
  }

  function clearFilters() {
    setQuery("");
    setSelectedAirports([]);
    setSelectedDestinations([]);
    setBudget(5000);
    setDuration("all");
    setBoard("all");
    setPreset("all");
    setExotic(false);
    setSort("recommended");
    setVisible(12);
    setSearched(false);
  }

  const presetButtons: { id: SmartPreset; label: string; emoji: string }[] = [
    { id: "all", label: "Dla mnie", emoji: "✨" },
    { id: "cheap", label: "Najtaniej", emoji: "💸" },
    { id: "warm", label: "Chcę ciepła", emoji: "☀️" },
    { id: "city", label: "City break", emoji: "🏙️" },
    { id: "allinclusive", label: "All Inclusive", emoji: "🍹" },
    { id: "discover", label: "Coś mniej oczywistego", emoji: "🧭" },
  ];

  return <section className="search-hub shell" id="wyszukiwarka">
    <div className="smart-finder-head"><div><small>POWIEDZ TYLKO, NA CO MASZ OCHOTĘ</small><h2>Tripownia zawęzi wybór za Ciebie</h2><p>Nie przekopuj setek ofert. Zacznij od jednego pomysłu albo ustaw dokładne filtry.</p></div></div>
    <div className="smart-presets">
      {presetButtons.map(item => <button type="button" key={item.id} className={!exotic && preset === item.id ? "active" : ""} onClick={() => { setExotic(false); setPreset(item.id); setSearched(true); setVisible(12); }}><span>{item.emoji}</span>{item.label}</button>)}
      <button type="button" className={exotic ? "active" : ""} onClick={() => { setExotic(true); setPreset("all"); setSearched(true); setVisible(12); }}><span>🌴</span>Egzotyka</button>
    </div>
    <div className="search-tabs">{tabs.map(item => <button key={item.id} onClick={() => { setTab(item.id); setBoard("all"); setSearched(false); setVisible(12); }} className={tab === item.id ? "active" : ""}>{item.label}</button>)}</div>

    {specialistPath ? <div className="special-search"><div className="special-icon">{tab === "parking" ? <Car/> : tab === "atrakcje" ? <Compass/> : <MapPin/>}</div><div><small>Wyniki Tripownia.pl najpierw pokazują kontekst</small><h3>{tab === "parking" ? "Znajdź parking przy lotnisku" : tab === "atrakcje" ? "Znajdź atrakcje na miejscu" : "Internet na wyjazd bez roamingu"}</h3><p>Zobacz wskazówki i opcje na Tripowni. Dopiero przy konkretnej rezerwacji przejdziesz do partnera.</p></div><a className="primary-cta compact" href={specialistPath}>Przejdź do działu →</a></div> : <>
      <div className="search-text-row">
        <label className="search-text-field">
          <Search size={17}/>
          <input
            id="tripownia-search-query"
            value={query}
            onChange={e => { setQuery(e.target.value); setVisible(12); }}
            onKeyDown={e => { if (e.key === "Enter") runSearch(); }}
            placeholder="Wpisz kierunek, miasto albo hotel, np. Rzym lub Resort 4★"
            aria-label="Szukaj po kierunku, mieście lub hotelu"
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Wyczyść wyszukiwanie"><X size={16}/></button>}
        </label>
      </div>
      <div className="compact-search-row">
        <MultiSelect label="Skąd?" icon={<PlaneTakeoff size={17}/>} options={airportSelectOptions} selected={selectedAirports} setSelected={(v)=>{setSelectedAirports(v);setVisible(12)}} anywhereLabel="Wszystkie lotniska" />
        <MultiSelect label="Dokąd?" icon={<Compass size={17}/>} options={destinationSelectOptions} selected={selectedDestinations} setSelected={(v)=>{setSelectedDestinations(v);setVisible(12)}} anywhereLabel="Gdziekolwiek" />

        <label className="compact-select"><span><CalendarDays size={16}/> Na ile?</span><select value={duration} onChange={e=>{setDuration(e.target.value);setVisible(12)}}><option value="all">Dowolnie</option><option value="short">2–4 noce</option><option value="week">5–8 nocy</option><option value="long">9+ nocy</option></select></label>
        <label className="compact-select"><span><WalletCards size={16}/> Budżet / os.</span><select value={budget} onChange={e=>{setBudget(Number(e.target.value));setVisible(12)}}><option value="1000">do 1 000 zł</option><option value="1500">do 1 500 zł</option><option value="2000">do 2 000 zł</option><option value="3000">do 3 000 zł</option><option value="5000">do 5 000 zł</option><option value="10000">bez ograniczenia</option></select></label>
        <label className="compact-select"><span><Users size={16}/> Wyżywienie</span><select value={board} onChange={e=>{setBoard(e.target.value);setVisible(12)}}>
          <option value="all">Dowolne</option>
          {tab === "wakacje" && <><option value="ai">All Inclusive</option><option value="hb">HB / 2 posiłki</option></>}
          {tab === "city-break" && <option value="breakfast">Śniadanie</option>}
          {!["wakacje","city-break"].includes(tab) && <><option value="ai">All Inclusive</option><option value="hb">HB / 2 posiłki</option><option value="breakfast">Śniadanie</option></>}
        </select></label>
        <button type="button" className="search-submit compact-submit" onClick={runSearch}><Search size={19}/> Pokaż wyniki</button>
      </div>

      {hasActiveFilters && <div className="active-filter-bar">
        <div className="active-filter-chips">
          {query.trim() && <span>🔎 {query.trim()}</span>}
          {selectedAirports.map(code => <span key={`a-${code}`}>✈ {code}</span>)}
          {selectedDestinations.map(place => <span key={`d-${place}`}>📍 {place}</span>)}
          {budget !== 5000 && <span>💳 do {budget.toLocaleString("pl-PL")} zł</span>}
          {duration !== "all" && <span>📅 {duration === "short" ? "2–4 noce" : duration === "week" ? "5–8 nocy" : "9+ nocy"}</span>}
          {board !== "all" && <span>🍽 {board === "ai" ? "All Inclusive" : board === "hb" ? "HB / 2 posiłki" : "Śniadanie"}</span>}
          {preset !== "all" && <span>✨ {presetButtons.find(x => x.id === preset)?.label}</span>}
        </div>
        <button type="button" onClick={clearFilters}>Wyczyść filtry</button>
      </div>}

      {(searched || tab === "inspiracje" || tab === "lot-hotel" || tab === "wakacje") && <div className="search-results-block"><div className="search-results-heading"><div><small>WYNIKI TRIPOWNIA.PL</small><h3>{results.length ? `${results.length} dopasowanych ofert` : `${fallbackOffers.length} najbliższych propozycji + wyszukiwanie u partnerów`}</h3><span>Najpierw pokazujemy wynik na Tripownia.pl. Dopiero potem możesz przejść do partnera przez link afiliacyjny.</span></div><label className="results-sort">Sortuj<select value={sort} onChange={e=>setSort(e.target.value as "recommended" | "price" | "score")}><option value="recommended">Polecane przez Tripownię</option><option value="price">Najniższa cena</option><option value="score">Najwyższa ocena</option></select></label></div><div className="cards-grid">{displayed.map(o => <OfferCard key={o.id} offer={o}/>)}</div>{displayResults.length > visible && <div style={{display:"flex",justifyContent:"center",marginTop:24}}><button className="search-submit" onClick={()=>setVisible(v=>v+12)}>Pokaż więcej ({displayResults.length-visible})</button></div>}{!results.length && <div className="search-fallback">
        <div className="search-fallback-head"><small>POZA DZISIEJSZĄ SELEKCJĄ</small><h4>Nie ma identycznej kombinacji? Pokazujemy najbliższe sensowne oferty i szukamy dalej.</h4><p>Wyniki powyżej są najbliższym dopasowaniem z Tripownii.</p></div>
      </div>}
      <div className="partner-live-search"><div><strong>🔎 Pełny rynek: {partnerQuery === "wakacje" ? "dowolny kierunek" : partnerQuery}</strong><span>Po naszych rekomendacjach możesz od razu porównać loty i noclegi u partnerów.</span></div><div className="partner-live-actions"><a href={trackedAffiliateHref({ partner: "esky", url: eskyFlightUrl, source: "search_flights", destination: partnerQuery })} target="_blank" rel="sponsored noopener noreferrer">✈️ Tanie loty eSky</a><a href={trackedAffiliateHref({ partner: "kiwi", url: kiwiSearchUrl, source: "search_flights", destination: partnerQuery })} target="_blank" rel="sponsored noopener noreferrer">🛫 Kiwi — najniższa cena</a><a href={trackedAffiliateHref({ partner: "booking", url: bookingSearchUrl, source: "search_hotels", destination: partnerQuery })} target="_blank" rel="sponsored noopener noreferrer">🏨 Noclegi Booking</a></div></div>
      <div className="empty-search-nudge"><div><strong>Chcesz zacząć szerzej?</strong><span>Wyczyść część filtrów albo zobacz wszystkie aktualnie wybrane okazje Tripownii.</span></div><a href="/okazje">Zobacz wszystkie okazje →</a></div></div>}
    </>}
  </section>;
}
