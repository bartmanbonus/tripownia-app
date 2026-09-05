"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, Compass, MapPin, Plane, Search, Users, Utensils, X } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import SelfSearchLegacy from "@/components/SelfSearchLegacy";
import { airportOptions, offers, isOfferExpired } from "@/lib/offers";
import { WORLD_DESTINATIONS, destinationMatches, normalizeDestination } from "@/lib/worldDestinations";
import { isTravelDestinationAllowed, isTravelDestinationBlocked } from "@/lib/travelSafety";

type Props={initialAirports?:string[];initialDestinations?:string[];initialDuration?:string;searchRequest?:number;initialTab?:string};

function offerText(o:any){return normalizeDestination([o.city,o.country,o.hotel,o.destination,o.title].filter(Boolean).join(" "));}
function depCode(o:any){return String(o.departureCode||o.airportCode||o.departureAirportCode||"").toUpperCase()}
function durationOk(o:any,d:string){const n=Number(o.nights||o.duration||0);if(d==="all")return true;if(d==="short")return !n||n<=4;if(d==="week")return !n||(n>=5&&n<=8);if(d==="long")return !n||n>=9;return true}
function budgetValue(v:string){return v==="all"?Infinity:Number(v)}

export default function SearchHub({initialAirports=[],initialDestinations=[],initialDuration="all",searchRequest=0,initialTab="Inspiracje"}:Props){
  const [airports,setAirports]=useState<string[]>(initialAirports);
  const [destinations,setDestinations]=useState<string[]>(initialDestinations);
  const [customDestination,setCustomDestination]=useState("");
  const [duration,setDuration]=useState(initialDuration||"all");
  const [budget,setBudget]=useState("5000");
  const [board,setBoard]=useState("all");
  const [weekendOnly,setWeekendOnly]=useState(false);
  const [text,setText]=useState("");
  const [open,setOpen]=useState<"from"|"to"|null>(null);
  const [destinationQuery,setDestinationQuery]=useState("");
  const [submitted,setSubmitted]=useState(0);
  const [liveResults,setLiveResults]=useState<any[]>([]);
  const [liveLoading,setLiveLoading]=useState(false);
  const [activeTab,setActiveTab]=useState(initialTab);
  const resultsRailRef=useRef<HTMLDivElement>(null);
  const moveResults=(direction:-1|1)=>{const rail=resultsRailRef.current;if(!rail)return;const card=rail.querySelector<HTMLElement>(".search-results-carousel-item");const step=card?card.getBoundingClientRect().width+18:304;rail.scrollBy({left:direction*step*2,behavior:"smooth"});};

  useEffect(()=>{setAirports(initialAirports);setDestinations(initialDestinations);setDuration(initialDuration||"all")},[initialAirports.join("|"),initialDestinations.join("|"),initialDuration]);
  useEffect(()=>{if(searchRequest>0)setSubmitted(v=>v+1)},[searchRequest]);

  const worldFiltered=useMemo(()=>WORLD_DESTINATIONS.filter(x=>isTravelDestinationAllowed(x.label,x.region)).filter(x=>destinationMatches(destinationQuery,x)),[destinationQuery]);
  const selectedTo=[...destinations,...(customDestination?[customDestination]:[])];
  const selectedToLabel=selectedTo.length===0?"Gdziekolwiek":selectedTo.length===1?selectedTo[0]:`${selectedTo.length} kierunki`;
  const selectedFromLabel=airports.length===0?"Wszystkie lotniska":airports.length===1?(airportOptions.find((a:any)=>a.code===airports[0])?.label||airports[0]):`${airports.length} lotniska`;

  const results=useMemo(()=>{
    const q=normalizeDestination(text);
    const max=budgetValue(budget);
    const to:string[]=selectedTo.map(v=>normalizeDestination(String(v))).filter(Boolean);
    const source = submitted > 0 ? liveResults : (offers as any[]).filter((o:any)=>["exim","tui"].includes(String(o.partner||"").toLowerCase()));
    return source.filter((o:any)=>{
      if(isOfferExpired(o))return false;
      if(!isTravelDestinationAllowed(String(o.city||""),String(o.country||"")))return false;
      if(Number(o.price||0)>max)return false;
      if(airports.length && !airports.includes(depCode(o)) && !airports.some(a=>normalizeDestination(String(o.departure||"")).includes(normalizeDestination(airportOptions.find((x:any)=>x.code===a)?.label||a))))return false;
      if(to.length && !to.some(d=>offerText(o).includes(d)||d.includes(normalizeDestination(String(o.city||o.country||"")))))return false;
      if(!durationOk(o,duration))return false;
      if(board!=="all"&&!normalizeDestination(String(o.board||"")).includes(normalizeDestination(board)))return false;
      if(weekendOnly){
        const cats=(o.category||[]).map((c:any)=>normalizeDestination(String(c)));
        const nights=Number(o.nights||o.duration||0);
        if(!cats.some((c:string)=>c.includes("weekend")) && !(nights>=2&&nights<=4)) return false;
      }
      if(q&&!offerText(o).includes(q))return false;
      return true;
    });
  },[airports,destinations,customDestination,duration,budget,board,text,weekendOnly,submitted,liveResults]);


  async function runPartnerSearch(destinationOverride?:string, cityModeOverride?:boolean){
    const destination=(destinationOverride||selectedTo[0]||text||"").trim();
    if(!destination) return;
    setLiveLoading(true);
    try{
      const cityMode=cityModeOverride ?? activeTab==="City break";
      const params=new URLSearchParams({mode:cityMode?"citybreak":"search",q:destination});
      const response=await fetch(`/api/today-offers?${params.toString()}`,{cache:"no-store"});
      const data=await response.json();
      const rows=Array.isArray(data?.offers)?data.offers:[];
      setLiveResults(rows.filter((o:any)=>cityMode?String(o.partner||"").toLowerCase()==="exim":["exim","tui"].includes(String(o.partner||"").toLowerCase())));
    }catch{setLiveResults([])}finally{setLiveLoading(false);setSubmitted(v=>v+1)}
  }
  function toggleDestination(v:string){setCustomDestination("");setDestinations(prev=>prev.includes(v)?prev.filter(x=>x!==v):[...prev,v])}
  function useCustom(){const v=destinationQuery.trim();if(!v||isTravelDestinationBlocked(v))return;setDestinations([]);setCustomDestination(v);setOpen(null);setDestinationQuery("")}
  function clearAll(){setAirports([]);setDestinations([]);setCustomDestination("");setDuration("all");setBudget("5000");setBoard("all");setWeekendOnly(false);setText("");setDestinationQuery("")}
  function pickDestination(label:string, opts?:{duration?:string;budget?:string;board?:string}, cityModeOverride?:boolean){
    setDestinations([label]); setCustomDestination(""); setText(""); setDestinationQuery("");
    if(opts?.duration)setDuration(opts.duration); if(opts?.budget)setBudget(opts.budget); if(opts?.board)setBoard(opts.board);
    setOpen(null);
    void runPartnerSearch(label, cityModeOverride);
  }
  function chooseTab(tab:string){
    setActiveTab(tab);
    if(tab==="Inspiracje") return;
    if(tab==="City break") pickDestination("Rzym, Włochy",{duration:"short"},true);
    if(tab==="Lot + hotel") pickDestination("Barcelona, Hiszpania",{duration:"short"},false);
    if(tab==="Wakacje") pickDestination("Djerba, Tunezja",{duration:"week",board:"all inclusive"},false);
    if(tab==="Atrakcje") pickDestination("Paryż, Francja",{duration:"short"},false);
    if(tab==="Parkingi") window.location.href="/parkingi";
    if(tab==="eSIM") window.location.href="/esim";
  }
  const activeChips=[...(airports.length?[`✈ ${selectedFromLabel}`]:[]),...(selectedTo.length?[`🌍 ${selectedToLabel}`]:[]),...(duration!=="all"?[`📅 ${duration==="short"?"2–4 noce":duration==="week"?"5–8 nocy":"9+ nocy"}`]:[]),...(budget!=="5000"?[`💰 do ${Number(budget).toLocaleString("pl-PL")} zł`]:[]),...(board!=="all"?[`🍽 ${board}`]:[]),...(weekendOnly?[`🗓 musi obejmować weekend`]:[])];

  const queryDestination=selectedTo[0]||text||"";
  const hasDestination=Boolean(queryDestination.trim());
  const quickPicks=[
    ["🏛️","City break: Rzym","Rzym, Włochy",{duration:"short"}],
    ["☀️","Ciepło zimą: Teneryfa","Teneryfa, Hiszpania",{duration:"week"}],
    ["🏖️","All Inclusive: Djerba","Djerba, Tunezja",{duration:"week",board:"all inclusive"}],
    ["💶","Tanio: Bergamo","Bergamo, Włochy",{duration:"short",budget:"1000"}],
    ["🌴","Egzotyka: Zanzibar","Zanzibar, Tanzania",{duration:"long"}]
  ] as const;

  return <section className="section shell" id="wyszukiwarka">
    <div className="search-hub">
      <div className="search-tabs">
        {['Inspiracje','City break','Lot + hotel','Wakacje','Atrakcje','Parkingi','eSIM'].map(x=><button key={x} className={activeTab===x?'active':''} type="button" onClick={()=>chooseTab(x)}>{x}</button>)}
      </div>

      <div className="search-text-row"><div className="search-text-field"><Search size={18}/><input value={text} onChange={e=>setText(e.target.value)} placeholder="Wpisz kierunek, miasto albo hotel, np. Nowy Jork, Wietnam lub Resort 4★"/>{text&&<button onClick={()=>setText("")} aria-label="Wyczyść"><X size={16}/></button>}</div></div>

      <div className="compact-search-row">
        <div className="dropdown-filter">
          <button className={`dropdown-trigger ${open==='from'?'open':''}`} onClick={()=>setOpen(open==='from'?null:'from')}><span className="dropdown-icon"><Plane size={18}/></span><span className="dropdown-copy"><small>Skąd?</small><strong>{selectedFromLabel}</strong></span><ChevronDown className={`dropdown-chevron ${open==='from'?'rotated':''}`} size={17}/></button>
          {open==='from'&&<div className="dropdown-menu"><div className="dropdown-menu-head"><strong>Skąd?</strong><button onClick={()=>setOpen(null)}><X size={18}/></button></div><button className={`dropdown-anywhere ${airports.length===0?'active':''}`} onClick={()=>setAirports([])}><Check size={16}/> Wszystkie lotniska</button><div className="dropdown-options">{airportOptions.map((a:any)=><button key={a.code} className={`dropdown-option ${airports.includes(a.code)?'active':''}`} onClick={()=>setAirports(p=>p.includes(a.code)?p.filter(x=>x!==a.code):[...p,a.code])}><span className="check-box">{airports.includes(a.code)&&<Check size={13}/>}</span>{a.label}</button>)}</div><button className="dropdown-done" onClick={()=>setOpen(null)}>Gotowe</button></div>}
        </div>

        <div className="dropdown-filter">
          <button className={`dropdown-trigger ${open==='to'?'open':''}`} onClick={()=>setOpen(open==='to'?null:'to')}><span className="dropdown-icon"><Compass size={18}/></span><span className="dropdown-copy"><small>Dokąd?</small><strong>{selectedToLabel}</strong></span><ChevronDown className={`dropdown-chevron ${open==='to'?'rotated':''}`} size={17}/></button>
          {open==='to'&&<div className="dropdown-menu"><div className="dropdown-menu-head"><strong>Dokąd? — cały świat</strong><button onClick={()=>setOpen(null)}><X size={18}/></button></div>
            <div className="search-text-field" style={{height:44,marginBottom:8}}><Search size={15}/><input autoFocus value={destinationQuery} onChange={e=>setDestinationQuery(e.target.value)} placeholder="Wpisz kraj, miasto lub wyspę…"/></div>
            <button className={`dropdown-anywhere ${selectedTo.length===0?'active':''}`} onClick={()=>{setDestinations([]);setCustomDestination("")}}><Check size={16}/> Gdziekolwiek</button>
            <div className="dropdown-options">{worldFiltered.map(d=><button key={d.label} className={`dropdown-option ${destinations.includes(d.label)?'active':''}`} onClick={()=>toggleDestination(d.label)}><span className="check-box">{destinations.includes(d.label)&&<Check size={13}/>}</span><span>{d.label}<small style={{display:'block',fontWeight:600,opacity:.6}}>{d.region}</small></span></button>)}</div>
            {destinationQuery.trim()&&!WORLD_DESTINATIONS.some(d=>normalizeDestination(d.label)===normalizeDestination(destinationQuery))&&!isTravelDestinationBlocked(destinationQuery)&&<button className="dropdown-anywhere" onClick={useCustom}><MapPin size={16}/> Szukaj dokładnie: „{destinationQuery.trim()}”</button>}
            {isTravelDestinationBlocked(destinationQuery)&&<div style={{padding:'10px 12px',borderRadius:12,background:'#fff2ed',color:'#8a2b12',fontWeight:750,fontSize:13}}>Tego kierunku Tripownia obecnie nie promuje ze względów bezpieczeństwa.</div>}
            <button className="dropdown-done" onClick={()=>setOpen(null)}>Gotowe</button></div>}
        </div>

        <label className="compact-select"><span><CalendarDays size={14}/> Na ile?</span><select value={duration} onChange={e=>setDuration(e.target.value)}><option value="all">Dowolnie</option><option value="short">2–4 noce</option><option value="week">5–8 nocy</option><option value="long">9+ nocy</option></select></label>
        <label className="compact-select"><span>💳 Budżet / os.</span><select value={budget} onChange={e=>setBudget(e.target.value)}><option value="all">Dowolny</option><option value="1000">do 1 000 zł</option><option value="2000">do 2 000 zł</option><option value="3000">do 3 000 zł</option><option value="5000">do 5 000 zł</option><option value="10000">do 10 000 zł</option></select></label>
        <label className="compact-select"><span><Utensils size={14}/> Wyżywienie</span><select value={board} onChange={e=>setBoard(e.target.value)}><option value="all">Dowolne</option><option value="śniadanie">Śniadanie</option><option value="all inclusive">All Inclusive</option><option value="bez wyżywienia">Bez wyżywienia</option></select></label>
        <button className="search-submit compact-submit" onClick={()=>void runPartnerSearch()}><Search size={18}/> {liveLoading?"Szukamy…":"Pokaż wyniki"}</button>
      </div>

      <div className="search-smart-options" aria-label="Dodatkowe opcje wyszukiwania">
        <label className={`weekend-required ${weekendOnly?"active":""}`}><input type="checkbox" checked={weekendOnly} onChange={e=>setWeekendOnly(e.target.checked)}/><span className="weekend-check">{weekendOnly?<Check size={14}/>:null}</span><div><strong>Musi obejmować weekend</strong><small>Preferuj terminy z sobotą i niedzielą — mniej urlopu, więcej wyjazdu.</small></div></label>
      </div>

      <div className="active-filter-bar"><div className="active-filter-chips">{activeChips.length?activeChips.map(x=><span key={x}>{x}</span>):<span>🌍 Cały świat</span>}</div><button onClick={clearAll}>Wyczyść filtry</button></div>

      <div className="quick-destination-wrap">
        <small>SZYBKIE STARTY — KONKRETNY KIERUNEK</small>
        <div className="quick-destination-grid">{quickPicks.map(([icon,label,dest,opts])=><button key={dest} type="button" onClick={()=>pickDestination(dest,opts)}><span>{icon}</span><strong>{label}</strong></button>)}</div>
      </div>

      <div className="search-results-block">
        <div className="search-results-heading"><div><small>WYNIKI WYSZUKIWANIA</small><h3>{hasDestination?`Szukamy: ${queryDestination}`:`${results.length} dopasowanych okazji`}</h3></div><span>Pokazujemy dostępne pakiety EXIM Tours i TUI. W City Break znajdziesz wyłącznie krótkie wyjazdy EXIM Tours z transferem.</span></div>
        {results.length>0&&<><div className="partner-search-banner search-results-carousel-head"><div><small>⭐ WYNIKI EXIM + TUI</small><strong>{results.length} aktualnych ofert pasuje do parametrów</strong></div></div><div className="search-results-carousel-wrap"><div className="search-results-carousel-controls"><button type="button" onClick={()=>moveResults(-1)} aria-label="Poprzednie oferty"><ArrowLeft size={17}/></button><button type="button" onClick={()=>moveResults(1)} aria-label="Następne oferty"><ArrowRight size={17}/></button></div><div className="search-results-carousel" ref={resultsRailRef} tabIndex={0}>{results.slice(0,12).map((o:any)=><div className="search-results-carousel-item" key={o.id}><OfferCard offer={o}/></div>)}</div></div></>}
        {hasDestination&&<UnifiedPartnerSearch mode={activeTab==="City break"||activeTab==="Lot + hotel"?"city":activeTab==="Wakacje"?"holiday":"all"} initialDestination={queryDestination} initialDeparture={selectedFromLabel} initialDepartureCode={airports[0]} initialWeekendOnly={weekendOnly}/>}
        {!hasDestination&&results.length===0&&<div className="empty-search"><strong>Wpisz dowolne miejsce na świecie.</strong><p>Może to być miasto, kraj, wyspa albo konkretny hotel — wyszukiwanie nie jest ograniczone do opublikowanych okazji.</p></div>}
      </div>
    </div>
    <SelfSearchLegacy />
  </section>
}
