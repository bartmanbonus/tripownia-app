"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, Compass, MapPin, Plane, Search, Utensils, X } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import { airportOptions, type Offer } from "@/lib/offers";
import { WORLD_DESTINATIONS, destinationMatches, normalizeDestination } from "@/lib/worldDestinations";
import { isTravelDestinationAllowed, isTravelDestinationBlocked } from "@/lib/travelSafety";
import { requestCatalog } from "@/lib/catalogClient";
import { partners } from "@/lib/partners";

type Props = { initialAirports?: string[]; initialDestinations?: string[]; initialDuration?: string; searchRequest?: number; initialTab?: string };
type Selection = { airports: string[]; destinations: string[]; customDestination: string; duration: string; budget: string; board: string; text: string; weekendOnly: boolean; dateFrom: string; dateTo: string; activeTab: string };
type CatalogPage = { offers: Offer[]; totalMatches: number; page: number; pageSize: number; catalogSize: number; catalogCheckedAt: string | null; stale: boolean };
const defaults: Selection = { airports: [], destinations: [], customDestination: "", duration: "all", budget: "all", board: "all", text: "", weekendOnly: false, dateFrom: "", dateTo: "", activeTab: "Inspiracje" };
const boards: Record<string, string> = { "all inclusive": "allinclusive", "ultra all inclusive": "ultraallinclusive", "śniadanie": "breakfast", "half board": "halfboard", "full board": "fullboard", "bez wyżywienia": "roomonly" };
export default function SearchHub({ initialAirports = [], initialDestinations = [], initialDuration = "all", searchRequest = 0, initialTab = "Inspiracje" }: Props) {
  const [selection, setSelection] = useState<Selection>({ ...defaults, airports: initialAirports, destinations: initialDestinations, duration: initialDuration, activeTab: initialTab });
  const { airports, destinations, customDestination, duration, budget, board, text, weekendOnly, dateFrom, dateTo, activeTab } = selection;
  const [page, setPage] = useState(1), [refresh, setRefresh] = useState(0);
  const [open, setOpen] = useState<"from" | "to" | null>(null);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [state, setState] = useState<{ key: string; data?: CatalogPage; error?: string }>({ key: "" });
  const [loadingKey, setLoadingKey] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const fromDropdownRef = useRef<HTMLDivElement>(null), toDropdownRef = useRef<HTMLDivElement>(null), resultsRailRef = useRef<HTMLDivElement>(null);
  function change(patch: Partial<Selection>) { setSelection(current => ({ ...current, ...patch })); setPage(1); setCarouselIndex(0); }
  const setAirports = (value: string[] | ((current: string[]) => string[])) => change({ airports: typeof value === "function" ? value(airports) : value });
  const setDestinations = (value: string[]) => change({ destinations: value });
  const setCustomDestination = (value: string) => change({ customDestination: value });
  const setDuration = (value: string) => change({ duration: value });
  const setBudget = (value: string) => change({ budget: value });
  const setBoard = (value: string) => change({ board: value });
  const setText = (value: string) => change({ text: value });
  const setWeekendOnly = (value: boolean) => change({ weekendOnly: value });
  useEffect(() => {
    change({ airports: initialAirports, destinations: initialDestinations, duration: initialDuration, activeTab: initialTab });
  }, [initialAirports.join("|"), initialDestinations.join("|"), initialDuration, initialTab, searchRequest]);
  useEffect(() => {
    if (!open) return;
    const pointer = (event: PointerEvent) => { const target = event.target as Node; if (!(open === "from" ? fromDropdownRef : toDropdownRef).current?.contains(target)) setOpen(null); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(null); };
    document.addEventListener("pointerdown", pointer); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", pointer); document.removeEventListener("keydown", escape); };
  }, [open]);
  const selectedTo = [...destinations, ...(customDestination ? [customDestination] : [])];
  const selectedToLabel = selectedTo.length === 0 ? "Gdziekolwiek" : selectedTo.length === 1 ? selectedTo[0] : `${selectedTo.length} kierunki`;
  const selectedFromLabel = airports.length ? airports.map(code => airportOptions.find(a => a.code === code)?.label || code).join(", ") : "Wszystkie lotniska";
  const worldFiltered = useMemo(() => WORLD_DESTINATIONS.filter(d => isTravelDestinationAllowed(d.label, d.region) && destinationMatches(destinationQuery, d)), [destinationQuery]);
  const params = new URLSearchParams({ page: String(page), pageSize: "20", nights: duration === "all" ? "any" : duration, board: boards[board] || "any", tripType: activeTab === "City break" ? "citybreak" : "any" });
  for (const destination of selectedTo) params.append("destination", destination);
  if (text.trim()) params.set("q", text.trim());
  if (airports.length) params.set("from", airports.join(","));
  if (budget !== "all") params.set("maxPrice", budget);
  if (weekendOnly) params.set("weekend", "1");
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  const queryKey = params.toString();
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoadingKey(queryKey);
    const timer = window.setTimeout(() => {
      requestCatalog(new URLSearchParams(queryKey), controller.signal)
        .then(data => { if (active) setState({ key: queryKey, data }); })
        .catch(error => { if (active) setState({ key: queryKey, error: error instanceof Error ? error.message : "Błąd pobierania katalogu." }); })
        .finally(() => { if (active) setLoadingKey(""); });
    }, 200);
    return () => { active = false; window.clearTimeout(timer); controller.abort(); };
  }, [queryKey, refresh]);
  // Previous criteria never appear under new labels. Empty matches remain empty.
  const current = state.key === queryKey ? state : null;
  const data = current?.data;
  const results = data?.offers || [];
  const liveLoading = loadingKey === queryKey || !current;
  const queryDestination = selectedTo[0] || text || "";
  const activeChips = airports.length || selectedTo.length || duration !== "all" || budget !== "all" || board !== "all" || weekendOnly || text || dateFrom || dateTo ? ["filters"] : [];
  function submit() { setRefresh(value => value + 1); setOpen(null); }
  function clearAll() { setSelection(defaults); setPage(1); setCarouselIndex(0); setDestinationQuery(""); setOpen(null); }
  function toggleDestination(value: string) { change({ customDestination: "", destinations: destinations.includes(value) ? destinations.filter(d => d !== value) : [...destinations, value] }); }
  function useCustom() { const value = destinationQuery.trim(); if (!value || isTravelDestinationBlocked(value)) return; change({ destinations: [], customDestination: value }); setOpen(null); setDestinationQuery(""); }
  function pickDestination(label: string, options?: { duration?: string; budget?: string; board?: string }) { change({ destinations: [label], customDestination: "", text: "", ...options }); setOpen(null); }
  function chooseTab(tab: string) {
    if (tab === "Atrakcje") { window.location.assign(partners.getyourguide.buildUrl()); return; }
    if (tab === "Parkingi" || tab === "eSIM") { window.location.assign(tab === "Parkingi" ? "/parkingi" : "/esim"); return; }
    change({ activeTab: tab });
  }
  function moveResults(direction: -1 | 1) {
    const rail = resultsRailRef.current; if (!rail) return;
    const card = rail.querySelector<HTMLElement>(".search-results-carousel-item");
    const next = Math.max(0, Math.min(results.length - 1, carouselIndex + direction));
    setCarouselIndex(next); rail.scrollTo({ left: next * ((card?.getBoundingClientRect().width || 290) + 14), behavior: "smooth" });
  }
  const quickPicks = [
    ["🏛️", "City break: Rzym", "Rzym, Włochy", { duration: "3-4" }],
    ["☀️", "Teneryfa", "Teneryfa, Hiszpania", { duration: "5-7" }],
    ["🏖️", "All Inclusive: Djerba", "Djerba, Tunezja", { duration: "5-7", board: "all inclusive" }],
    ["💶", "Bergamo do 1000 zł", "Bergamo, Włochy", { duration: "3-4", budget: "1000" }],
    ["🌴", "Egzotyka: Zanzibar", "Zanzibar, Tanzania", { duration: "11-14" }],
  ] as const;
  return <section className="section shell" id="wyszukiwarka">
    <div className="search-hub">
      <div className="search-tabs">
        {['Inspiracje','City break','Lot + hotel','Wakacje','Atrakcje','Parkingi','eSIM'].map(x=><button key={x} className={activeTab===x?'active':''} type="button" onClick={()=>chooseTab(x)}>{x === "Inspiracje" ? "Wszystkie oferty" : x}</button>)}
      </div>

      <div className="search-text-row search-text-row-with-weekend search-top-inline">
        <div className="search-text-field"><Search size={18}/><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")submit()}} placeholder="Wpisz kierunek, miasto albo hotel, np. Nowy Jork, Wietnam lub Resort 4★"/>{text&&<button onClick={()=>setText("")} aria-label="Wyczyść"><X size={16}/></button>}</div>
        <label className={`weekend-required weekend-required-inline ${weekendOnly?"active":""}`}><input type="checkbox" checked={weekendOnly} onChange={e=>setWeekendOnly(e.target.checked)}/><span className="weekend-check">{weekendOnly?<Check size={14}/>:null}</span><div><strong>Pobyt obejmuje sobotę i niedzielę</strong><small>Powrót najwcześniej w poniedziałek</small></div></label>
      </div>

      <div className="compact-search-row">
        <div className="dropdown-filter" ref={fromDropdownRef}>
          <button className={`dropdown-trigger ${open==='from'?'open':''}`} onClick={()=>setOpen(open==='from'?null:'from')}><span className="dropdown-icon"><Plane size={18}/></span><span className="dropdown-copy"><small>Skąd?</small><strong>{selectedFromLabel}</strong></span><ChevronDown className={`dropdown-chevron ${open==='from'?'rotated':''}`} size={17}/></button>
          {open==='from'&&<div className="dropdown-menu"><div className="dropdown-menu-head"><strong>Skąd?</strong><button onClick={()=>setOpen(null)}><X size={18}/></button></div><button className={`dropdown-anywhere ${airports.length===0?'active':''}`} onClick={()=>setAirports([])}><Check size={16}/> Wszystkie lotniska</button><div className="dropdown-options">{airportOptions.map((a:any)=><button key={a.code} className={`dropdown-option ${airports.includes(a.code)?'active':''}`} onClick={()=>setAirports(p=>p.includes(a.code)?p.filter(x=>x!==a.code):[...p,a.code])}><span className="check-box">{airports.includes(a.code)&&<Check size={13}/>}</span>{a.label}</button>)}</div><button className="dropdown-done" onClick={()=>setOpen(null)}>Gotowe</button></div>}
        </div>

        <div className="dropdown-filter" ref={toDropdownRef}>
          <button className={`dropdown-trigger ${open==='to'?'open':''}`} onClick={()=>setOpen(open==='to'?null:'to')}><span className="dropdown-icon"><Compass size={18}/></span><span className="dropdown-copy"><small>Dokąd?</small><strong>{selectedToLabel}</strong></span><ChevronDown className={`dropdown-chevron ${open==='to'?'rotated':''}`} size={17}/></button>
          {open==='to'&&<div className="dropdown-menu"><div className="dropdown-menu-head"><strong>Dokąd? — cały świat</strong><button onClick={()=>setOpen(null)}><X size={18}/></button></div>
            <div className="search-text-field" style={{height:44,marginBottom:8}}><Search size={15}/><input autoFocus value={destinationQuery} onChange={e=>setDestinationQuery(e.target.value)} placeholder="Wpisz kraj, miasto lub wyspę…"/></div>
            <button className={`dropdown-anywhere ${selectedTo.length===0?'active':''}`} onClick={()=>{setDestinations([]);setCustomDestination("")}}><Check size={16}/> Gdziekolwiek</button>
            <div className="dropdown-options">{worldFiltered.map(d=><button key={d.label} className={`dropdown-option ${destinations.includes(d.label)?'active':''}`} onClick={()=>toggleDestination(d.label)}><span className="check-box">{destinations.includes(d.label)&&<Check size={13}/>}</span><span>{d.label}<small style={{display:'block',fontWeight:600,opacity:.6}}>{d.region}</small></span></button>)}</div>
            {destinationQuery.trim()&&!WORLD_DESTINATIONS.some(d=>normalizeDestination(d.label)===normalizeDestination(destinationQuery))&&!isTravelDestinationBlocked(destinationQuery)&&<button className="dropdown-anywhere" onClick={useCustom}><MapPin size={16}/> Szukaj dokładnie: „{destinationQuery.trim()}”</button>}
            {isTravelDestinationBlocked(destinationQuery)&&<div style={{padding:'10px 12px',borderRadius:12,background:'#fff2ed',color:'#8a2b12',fontWeight:750,fontSize:13}}>Tego kierunku Tripownia obecnie nie promuje ze względów bezpieczeństwa.</div>}
            <button className="dropdown-done" onClick={()=>setOpen(null)}>Gotowe</button></div>}
        </div>

        <label className="compact-select"><span><CalendarDays size={14}/> Na ile?</span><select value={duration} onChange={e=>setDuration(e.target.value)}>
          <option value="all">Dowolnie</option><option value="1-2">1–2 noce</option><option value="3-4">3–4 noce</option><option value="5-7">5–7 nocy</option><option value="8-10">8–10 nocy</option><option value="11-14">11–14 nocy</option><option value="15+">15+ nocy</option>
        </select></label>
        <label className="compact-select"><span>💳 Budżet / os.</span><select value={budget} onChange={e=>setBudget(e.target.value)}>
          <option value="all">Dowolny</option><option value="500">do 500 zł</option><option value="750">do 750 zł</option><option value="1000">do 1 000 zł</option><option value="1500">do 1 500 zł</option><option value="2000">do 2 000 zł</option><option value="2500">do 2 500 zł</option><option value="3000">do 3 000 zł</option><option value="4000">do 4 000 zł</option><option value="5000">do 5 000 zł</option><option value="7500">do 7 500 zł</option><option value="10000">do 10 000 zł</option><option value="15000">do 15 000 zł</option><option value="20000">do 20 000 zł</option>
        </select></label>
        <label className="compact-select"><span><Utensils size={14}/> Wyżywienie</span><select value={board} onChange={e=>setBoard(e.target.value)}>
          <option value="all">Dowolne</option><option value="bez wyżywienia">Bez wyżywienia</option><option value="śniadanie">Śniadanie</option><option value="half board">2 posiłki / Half Board</option><option value="full board">3 posiłki / Full Board</option><option value="all inclusive">All Inclusive</option><option value="ultra all inclusive">Ultra All Inclusive</option>
        </select></label>
        <button className="search-submit compact-submit" onClick={submit}><Search size={18}/> {liveLoading?"Szukamy okazji…":"Odkryj okazje"}</button>
      </div>

      <div className="quick-destination-wrap">
        <div className="quick-destination-head"><small>SZYBKIE STARTY — KONKRETNY KIERUNEK</small>{activeChips.length>0&&<button className="quick-clear-filters" type="button" onClick={clearAll}>Wyczyść filtry</button>}</div>
        <div className="quick-destination-grid">{quickPicks.map(([icon,label,dest,opts])=><button key={dest} type="button" onClick={()=>pickDestination(dest,opts)}><span>{icon}</span><strong>{label}</strong></button>)}</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "16px 0" }}>
        <label className="compact-select"><span>Wylot od</span><input type="date" value={dateFrom} onChange={event => change({ dateFrom: event.target.value })}/></label>
        <label className="compact-select"><span>Wylot do</span><input type="date" value={dateTo} min={dateFrom || undefined} onChange={event => change({ dateTo: event.target.value })}/></label>
        <small>Zakres dotyczy daty wylotu, nie powrotu. Nieznane daty nie pasują do filtra terminu.</small>
      </div>
      <div className="search-results-block" aria-busy={liveLoading}>
        <div className="search-results-heading premium-results-heading">
          <div><small>KATALOG TRIPOWNI</small><h3>{data ? `${data.totalMatches} dopasowań` : "Wyszukiwarka ofert"}</h3></div>
          <span>Przeszukujemy cały zapisany katalog Tripowni, niezależnie od Radaru. To wycinek ofert z integracji, nie cała oferta dostawców.</span>
        </div>
        {liveLoading && <p role="status">Szukamy według Twoich kryteriów…</p>}
        {current?.error && <div className="empty-search" role="alert"><strong>{current.error}</strong><p>Nie zastępujemy wyników innymi kierunkami.</p><button type="button" onClick={submit}>Spróbuj ponownie</button></div>}
        {data && <>
          <p className="search-live-notice">Dostępna baza: {data.catalogSize} ofert. Odczyt danych: {data.catalogCheckedAt ? new Date(data.catalogCheckedAt).toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" }) : "brak daty"}. {data.stale ? "Dane starsze niż 24 godziny. " : ""}Cenę i dostępność potwierdź u partnera.</p>
          {data.totalMatches === 0 ? <div className="empty-search"><strong>Brak ofert spełniających wszystkie wybrane warunki.</strong><p>Nie zmieniliśmy Twoich kryteriów. Poszerz je samodzielnie lub skorzystaj z osobnej wyszukiwarki partnera poniżej.</p><button type="button" onClick={clearAll}>Wyczyść filtry i pokaż dostępną bazę</button></div> : <>
            <div className="premium-results-summary premium-results-carousel-summary"><strong>{`Dopasowania: ${data.totalMatches}. Karty ${(data.page - 1) * data.pageSize + 1}–${(data.page - 1) * data.pageSize + results.length}.`}</strong></div>
            <div className="search-results-carousel-wrap premium-search-results-wrap">
              <div className="premium-results-carousel-controls premium-results-carousel-controls-overlay">
                <button type="button" onClick={() => moveResults(-1)} disabled={carouselIndex === 0} aria-label="Poprzednia oferta"><ArrowLeft size={20}/></button>
                <button type="button" onClick={() => moveResults(1)} disabled={carouselIndex >= results.length - 1} aria-label="Następna oferta"><ArrowRight size={20}/></button>
              </div>
              <div className="search-results-carousel premium-search-results-carousel" ref={resultsRailRef} key={queryKey}>
                {results.map(offer => <div className="search-results-carousel-item" key={`${offer.partner}:${offer.id}`}><OfferCard offer={offer}/></div>)}
              </div>
            </div>
            <div className="premium-action-row" aria-label="Strony wyników">
              <button type="button" className="secondary-cta" disabled={page <= 1 || liveLoading} onClick={() => { setPage(value => value - 1); setCarouselIndex(0); }}>Poprzednia strona</button>
              <span>{`Strona ${page} z ${Math.ceil(data.totalMatches / data.pageSize)}`}</span>
              <button type="button" className="secondary-cta" disabled={page * data.pageSize >= data.totalMatches || liveLoading} onClick={() => { setPage(value => value + 1); setCarouselIndex(0); }}>Następna strona</button>
            </div>
          </>}
        </>}
        <details className="partner-search-banner">
          <summary>Wyszukaj samodzielnie u partnera</summary>
          <p>To osobna wyszukiwarka, nie dopasowania powyżej. Przekazujemy pierwszy kierunek i obsługiwane lotnisko; termin, budżet, liczbę osób i pozostałe warunki sprawdź w formularzu oraz u partnera. Brak wybranego lotniska oznacza tutaj domyślną Warszawę.</p>
          <UnifiedPartnerSearch key={`${queryDestination}:${airports.join(",")}:${dateFrom}`} mode={activeTab === "City break" || activeTab === "Lot + hotel" ? "city" : activeTab === "Wakacje" ? "holiday" : "all"} initialDestination={queryDestination} initialDepartureCode={airports[0] === "WAWA" ? undefined : airports[0]} initialStartDate={dateFrom || undefined} initialWeekendOnly={weekendOnly}/>
        </details>
      </div>
    </div>
  </section>;
}
