"use client";

import { useMemo, useState, type ReactNode } from "react";
import { BedDouble, CalendarDays, Check, MapPin, Package, Plane, Search, Sun, Users, Zap } from "lucide-react";
import { partners } from "@/lib/partners";
import { isTravelDestinationBlocked } from "@/lib/travelSafety";
import { trackEvent } from "@/lib/analytics";

type Mode = "all" | "city" | "holiday" | "lastminute";
type SearchType = "package" | "city" | "holiday" | "lastminute" | "flights" | "hotels";

type Props = {
  mode?: Mode;
  initialDestination?: string;
  initialDeparture?: string;
  initialDepartureCode?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialAdults?: number;
  initialWeekendOnly?: boolean;
};

const airportChoices = [
  { code: "ANY", label: "Dowolne lotnisko w Polsce" },
  { code: "WAW", label: "Warszawa Chopina" },
  { code: "WMI", label: "Warszawa Modlin" },
  { code: "KRK", label: "Kraków" },
  { code: "KTW", label: "Katowice" },
  { code: "GDN", label: "Gdańsk" },
  { code: "WRO", label: "Wrocław" },
  { code: "POZ", label: "Poznań" },
];

const iataByDestination: Record<string,string> = {
  "rzym":"ROM","barcelona":"BCN","bergamo":"BGY","mediolan":"MIL","paryz":"PAR","londyn":"LON","lizbona":"LIS","porto":"OPO","madryt":"MAD","malaga":"AGP","alicante":"ALC","walencja":"VLC","sewilla":"SVQ","wieden":"VIE","praga":"PRG","budapeszt":"BUD","kopenhaga":"CPH","reykjavik":"KEF","oslo":"OSL","tromso":"TOS","malta":"MLA","pafos":"PFO","ateny":"ATH","kreta":"HER","rodos":"RHO","teneryfa":"TFS","majorka":"PMI","djerba":"DJE","marsa alam":"RMF","hurghada":"HRG","kair":"CAI","marrakesz":"RAK","dubaj":"DXB","abu dhabi":"AUH","doha":"DOH","stambul":"IST","antalya":"AYT","zanzibar":"ZNZ","nairobi":"NBO","hanoi":"HAN","ho chi minh":"SGN","bangkok":"BKK","phuket":"HKT","tokio":"TYO","pekin":"BJS","seul":"SEL","singapur":"SIN","bali":"DPS","nowy jork":"NYC","miami":"MIA","los angeles":"LAX","san francisco":"SFO","cancun":"CUN","toronto":"YTO","sydney":"SYD","melbourne":"MEL","auckland":"AKL"
};

const kiwiOriginByAirport: Record<string,string> = {
  WAW:"warszawa-polska", WMI:"warszawa-polska", KRK:"krakow-polska", KTW:"katowice-polska",
  GDN:"gdansk-polska", WRO:"wroclaw-polska", POZ:"poznan-polska"
};

const kiwiSlugByDestination: Record<string,string> = {
  "rzym":"rzym-wlochy", "barcelona":"barcelona-hiszpania", "bergamo":"bergamo-wlochy", "mediolan":"mediolan-wlochy",
  "paryz":"paryz-francja", "londyn":"londyn-wielka-brytania", "lizbona":"lizbona-portugalia", "porto":"porto-portugalia",
  "madryt":"madryt-hiszpania", "malaga":"malaga-hiszpania", "alicante":"alicante-hiszpania", "walencja":"walencja-hiszpania",
  "sewilla":"sewilla-hiszpania", "wieden":"wieden-austria", "praga":"praga-czechy", "budapeszt":"budapeszt-wegry",
  "kopenhaga":"kopenhaga-dania", "reykjavik":"reykjavik-islandia", "oslo":"oslo-norwegia", "tromso":"tromso-norwegia",
  "malta":"malta-malta", "pafos":"pafos-cypr", "ateny":"ateny-grecja", "kreta":"kreta-grecja", "rodos":"rodos-grecja",
  "teneryfa":"teneryfa-hiszpania", "majorka":"majorka-hiszpania", "djerba":"djerba-tunezja", "hurghada":"hurghada-egipt",
  "kair":"kair-egipt", "marrakesz":"marrakesz-maroko", "dubaj":"dubaj-zjednoczone-emiraty-arabskie", "abu dhabi":"abu-dhabi-zjednoczone-emiraty-arabskie",
  "stambul":"stambul-turcja", "antalya":"antalya-turcja", "zanzibar":"zanzibar-tanzania", "nairobi":"nairobi-kenia",
  "hanoi":"hanoi-wietnam", "ho chi minh":"ho-chi-minh-wietnam", "bangkok":"bangkok-tajlandia", "phuket":"phuket-tajlandia",
  "tokio":"tokio-japonia", "pekin":"pekin-chiny", "seul":"seul-korea-poludniowa", "singapur":"singapur-singapur",
  "bali":"bali-indonezja", "nowy jork":"nowy-jork-nowy-jork-stany-zjednoczone", "miami":"miami-floryda-stany-zjednoczone",
  "los angeles":"los-angeles-kalifornia-stany-zjednoczone", "san francisco":"san-francisco-kalifornia-stany-zjednoczone",
  "sydney":"sydney-nowa-poludniowa-walia-australia", "melbourne":"melbourne-wiktoria-australia", "auckland":"auckland-nowa-zelandia"
};

function kiwiPlaceSlug(destination:string){
  const {first,full}=destinationKey(destination);
  if(kiwiSlugByDestination[first]) return kiwiSlugByDestination[first];
  const pieces=full.split(",").map(x=>x.trim()).filter(Boolean);
  const raw=pieces.join("-") || first;
  return raw.replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}

const eximPathByDestination: Record<string,string> = {
  "djerba":"/kierunki/tunezja/djerba","tunezja":"/kierunki/tunezja","hammamet":"/kierunki/tunezja/tunezja-kontynent/hammamet","marsa alam":"/kierunki/egipt/marsa-alam","hurghada":"/kierunki/egipt/hurghada","egipt":"/kierunki/egipt","sloneczny brzeg":"/kierunki/bulgaria/sloneczny-brzeg","bulgaria":"/kierunki/bulgaria","albania":"/kierunki/albania","turcja":"/kierunki/turcja","antalya":"/kierunki/turcja/antalya","kreta":"/kierunki/grecja/kreta","rodos":"/kierunki/grecja/rodos","grecja":"/kierunki/grecja","cypr":"/kierunki/cypr","teneryfa":"/kierunki/hiszpania/wyspy-kanaryjskie/teneryfa","majorka":"/kierunki/hiszpania/baleary/majorka","hiszpania":"/kierunki/hiszpania"
};

const wakacjePathByDestination: Record<string,string> = {
  "djerba":"/wczasy/djerba/","tunezja":"/wczasy/tunezja/","zarzis":"/wczasy/zarzis/","monastir":"/wczasy/monastir/","hammamet":"/wczasy/hammamet/","sousse":"/wczasy/sousse/","egipt":"/wczasy/egipt/","marsa alam":"/wczasy/marsa-alam/","hurghada":"/wczasy/hurghada/","kreta":"/wczasy/kreta/","rodos":"/wczasy/rodos/","grecja":"/wczasy/grecja/","teneryfa":"/wczasy/teneryfa/","majorka":"/wczasy/majorka/","hiszpania":"/wczasy/hiszpania/","turcja":"/wczasy/turcja/","albania":"/wczasy/albania/","zanzibar":"/wczasy/zanzibar/","malediwy":"/wczasy/malediwy/","dominikana":"/wczasy/dominikana/","meksyk":"/wczasy/meksyk/"
};

function norm(value:string){ return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(); }
function canonicalDestination(value:string){
  const n=norm(value);
  if(n==="bergamo" || n.startsWith("bergamo,")) return "Mediolan";
  if(n==="milan" || n.startsWith("milan,")) return "Mediolan";
  if(n==="sajgon" || n.startsWith("sajgon,")) return "Ho Chi Minh";
  if(n==="ho chi minh city") return "Ho Chi Minh";
  return value.trim();
}
function destinationKey(destination:string){ const first=norm(destination.split(",")[0]); return {first,full:norm(destination)}; }
function firstMatch<T>(map:Record<string,T>, destination:string):T|undefined{ const {first,full}=destinationKey(destination); if(map[first]) return map[first]; const key=Object.keys(map).find(k=>full.includes(k)); return key?map[key]:undefined; }
function isoAfter(days:number){ const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
function plusDays(iso:string,days:number){ const d=new Date(`${iso}T12:00:00`); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
function airportCode(value:string,explicit?:string){ if(explicit)return explicit; const n=norm(value); return airportChoices.find(a=>n.includes(norm(a.label))||n.includes(a.code.toLowerCase()))?.code||"WAW"; }
function airportLabel(code:string){ return airportChoices.find(a=>a.code===code)?.label||code; }

function nextFriday(iso:string){
  const d=new Date(`${iso}T12:00:00`);
  const day=d.getDay();
  const add=(5-day+7)%7;
  d.setDate(d.getDate()+add);
  return d.toISOString().slice(0,10);
}
function weekendRange(start:string,searchType:SearchType){
  const fri=nextFriday(start);
  const nights=searchType==="holiday"||searchType==="lastminute"?7:3;
  return {start:fri,end:plusDays(fri,nights)};
}

function defaultSearchType(mode:Mode):SearchType{
  if(mode==="city") return "city";
  if(mode==="holiday") return "holiday";
  if(mode==="lastminute") return "lastminute";
  return "package";
}

function buildLinks(destination:string,fromCode:string,start:string,end:string,adults:number,searchType:SearchType){
  destination=canonicalDestination(destination);
  const isLast=searchType==="lastminute";
  const eximPath=firstMatch(eximPathByDestination,destination)||(isLast?"/last-minute":"/wakacje");
  const wakacjePath=firstMatch(wakacjePathByDestination,destination)||(isLast?"/last-minute/":"/");
  const eximParams=new URLSearchParams({path:eximPath,from:fromCode,start,end,adults:String(adults)});
  const exim=`/go/exim-best?${eximParams.toString()}`;
  const wakacje=partners.wakacje.buildUrl(`https://www.wakacje.pl${wakacjePath}`);

  const kiwiDeep=new URL("https://www.kiwi.com/pl/");
  kiwiDeep.searchParams.set("origin",kiwiOriginByAirport[fromCode]||"warszawa-polska");
  kiwiDeep.searchParams.set("destination",kiwiPlaceSlug(destination));
  kiwiDeep.searchParams.set("outboundDate",start);
  kiwiDeep.searchParams.set("inboundDate",end);
  kiwiDeep.searchParams.set("adults",String(adults));
  kiwiDeep.searchParams.set("currency","PLN");
  const kiwi=partners.kiwi.buildUrl(kiwiDeep.toString());

  const bookingBase=new URL("https://www.booking.com/searchresults.pl.html");
  bookingBase.searchParams.set("ss",destination);
  bookingBase.searchParams.set("checkin",start);
  bookingBase.searchParams.set("checkout",end);
  bookingBase.searchParams.set("group_adults",String(adults));
  bookingBase.searchParams.set("no_rooms","1");
  bookingBase.searchParams.set("group_children","0");
  const booking=partners.booking.buildUrl(bookingBase.toString());

  return {
    exim,wakacje,kiwi,booking,
    tui:partners.tui.buildUrl(isLast?"https://www.tui.pl/last-minute":"https://www.tui.pl/wypoczynek"),
  };
}

const tabs:{key:SearchType;label:string;icon:ReactNode}[]=[
  {key:"package",label:"Lot + hotel",icon:<Package size={17}/>},
  {key:"city",label:"City break",icon:<Plane size={17}/>},
  {key:"holiday",label:"Wakacje",icon:<Sun size={17}/>},
  {key:"lastminute",label:"Last minute",icon:<Zap size={17}/>},
  {key:"flights",label:"Loty",icon:<Plane size={17}/>},
  {key:"hotels",label:"Hotele",icon:<BedDouble size={17}/>},
];

export default function UnifiedPartnerSearch({mode="all",initialDestination="",initialDeparture="Warszawa Chopina",initialDepartureCode,initialStartDate,initialEndDate,initialAdults=2,initialWeekendOnly=false}:Props){
  const [searchType,setSearchType]=useState<SearchType>(defaultSearchType(mode));
  const [destination,setDestination]=useState(initialDestination);
  const [from,setFrom]=useState<string[]>([airportCode(initialDeparture,initialDepartureCode)]);
  const [start,setStart]=useState(initialStartDate||isoAfter(45));
  const [end,setEnd]=useState(initialEndDate||plusDays(initialStartDate||isoAfter(45),mode==="city"?3:7));
  const [adults,setAdults]=useState(initialAdults);
  const [weekendOnly,setWeekendOnly]=useState(initialWeekendOnly);
  const [submitted,setSubmitted]=useState(false);
  const blockedDestination=isTravelDestinationBlocked(destination);
  const selectedFrom = from.includes("ANY") ? "WAW" : (from[0] || "WAW");
  const links=useMemo(()=>buildLinks(destination,selectedFrom,start,end,adults,searchType),[destination,selectedFrom,start,end,adults,searchType]);

  const visibleTabs=useMemo(()=>{
    if(mode==="holiday") return tabs.filter(tab=>tab.key==="holiday"||tab.key==="lastminute");
    if(mode==="lastminute") return tabs.filter(tab=>tab.key==="lastminute"||tab.key==="holiday");
    if(mode==="city") return tabs.filter(tab=>tab.key==="city"||tab.key==="package");
    return tabs;
  },[mode]);

  const primary=useMemo(()=>{
    if(searchType==="flights") return {label:"Pokaż loty w Kiwi.com",url:links.kiwi,source:"Kiwi.com"};
    if(searchType==="hotels") return {label:"Pokaż hotele w Booking.com",url:links.booking,source:"Booking.com"};
    if(searchType==="city") return {label:"Sprawdź city break w EXIM Tours",url:links.exim,source:"EXIM Tours"};
    if(searchType==="holiday"||searchType==="lastminute") return {label:"Sprawdź pakiety w EXIM Tours",url:links.exim,source:"EXIM Tours"};
    return {label:"Sprawdź pakiety w EXIM Tours",url:links.exim,source:"EXIM Tours"};
  },[searchType,links]);

  const alternative=useMemo(()=>{
    if(searchType==="holiday"||searchType==="lastminute") return {label:"Porównaj w Wakacje.pl",url:links.wakacje,source:"Wakacje.pl"};
    if(searchType==="city"||searchType==="package") return {label:"Porównaj w TUI",url:links.tui,source:"TUI"};
    return null;
  },[searchType,links]);

  function changeType(type:SearchType){
    setSearchType(type);
    setSubmitted(false);
    if((type==="city"||type==="package") && start){ setEnd(plusDays(start,3)); }
    if((type==="holiday"||type==="lastminute") && start){ setEnd(plusDays(start,7)); }
  }

  function submitSearch(){
    setSubmitted(true);
    trackEvent("partner_search_submit",{
      search_type:searchType,
      destination:canonicalDestination(destination)||"dowolny",
      departure:searchType==="hotels"?"hotel_only":from.join(","),
      start_date:start,
      end_date:end,
      adults,
      weekend_only:weekendOnly,
    });
  }

  return <section className="trip-search-engine trip-search-conversion" id="pelna-wyszukiwarka">
    <div className="trip-search-title"><span>WYSZUKIWARKA TRIPOWNI</span><h2>Znajdź wyjazd i przejdź prosto do rezerwacji</h2><p>Ustaw najważniejsze parametry. Potem dostajesz jedną główną ścieżkę i maksymalnie jedno porównanie.</p></div>

    <div className="trip-search-steps" aria-label="Jak działa wyszukiwanie">
      <span><b>1</b> Ustaw wyjazd</span>
      <span><b>2</b> Sprawdź dopasowanie</span>
      <span><b>3</b> Rezerwuj u partnera</span>
    </div>

    <div className="trip-search-shell">
      <div className="trip-search-tabs" role="tablist" aria-label="Rodzaj wyjazdu">
        {visibleTabs.map(tab=><button key={tab.key} type="button" role="tab" aria-selected={searchType===tab.key} className={searchType===tab.key?"active":""} onClick={()=>changeType(tab.key)}>{tab.icon}<span>{tab.label}</span></button>)}
      </div>

      <div className="trip-search-context"><strong>{tabs.find(t=>t.key===searchType)?.label}</strong><span>{searchType==="flights"?"Znajdź połączenie i przejdź do aktualnych wyników lotów.":searchType==="hotels"?"Sprawdź noclegi dla wybranego miejsca i terminu.":searchType==="holiday"||searchType==="lastminute"?"Gotowe pakiety wakacyjne. Po wyszukaniu pokażemy najprostszą drogę do rezerwacji.":"Pakiety i krótkie wyjazdy dopasowane do wskazanego terminu."}</span></div>

      <div className="trip-search-form">
        <label className="trip-field trip-destination"><span><MapPin size={15}/> Dokąd?</span><input value={destination} onChange={e=>{setDestination(e.target.value);setSubmitted(false)}} placeholder="Gdziekolwiek albo np. Mediolan, Rzym, Malta"/><small>Możesz wpisać kilka miejsc po przecinku albo zostawić puste — wtedy szukasz „gdziekolwiek”.</small></label>
        {searchType!=="hotels"&&<div className="trip-field trip-flex-field"><span><Plane size={15}/> Skąd?</span><div className="trip-flex-options">{airportChoices.map(a=>{const checked=from.includes(a.code);return <button key={a.code} type="button" className={checked?"active":""} onClick={()=>{setSubmitted(false);if(a.code==="ANY"){setFrom(["ANY"]);return;}setFrom(current=>{const base=current.filter(code=>code!=="ANY");return checked?(base.length>1?base.filter(code=>code!==a.code):base):[...base,a.code];});}}>{checked?"✓ ":""}{a.label}</button>})}</div><small>Możesz zaznaczyć kilka lotnisk. „Dowolne” oznacza pełną elastyczność.</small></div>}
        <label className="trip-field"><span><CalendarDays size={15}/> Kiedy?</span><input type="date" value={start} onChange={e=>{setSubmitted(false);setStart(e.target.value);if(e.target.value>=end)setEnd(plusDays(e.target.value,(searchType==="city"||searchType==="package")?3:7))}}/></label>
        <label className="trip-field"><span><CalendarDays size={15}/> Do kiedy?</span><input type="date" min={start} value={end} onChange={e=>{setEnd(e.target.value);setSubmitted(false)}}/></label>
        <label className="trip-field trip-people"><span><Users size={15}/> Ile osób?</span><select value={adults} onChange={e=>{setAdults(Number(e.target.value));setSubmitted(false)}}>{[1,2,3,4,5,6].map(n=><option value={n} key={n}>{n} {n===1?"osoba":"osoby"}</option>)}</select></label>
        <button className="trip-search-submit" type="button" onClick={submitSearch} disabled={blockedDestination}><Search size={19}/><span>Znajdź wyjazd</span></button>
      </div>
      <div className="trip-search-weekend-row">
        <label className={`weekend-required ${weekendOnly?"active":""}`}><input type="checkbox" checked={weekendOnly} onChange={e=>{const checked=e.target.checked;setWeekendOnly(checked);setSubmitted(false);if(checked){const r=weekendRange(start,searchType);setStart(r.start);setEnd(r.end);}}}/><span className="weekend-check">{weekendOnly?<Check size={14}/>:null}</span><div><strong>Musi obejmować weekend</strong><small>Tripownia ustawi najbliższy sensowny termin z sobotą i niedzielą.</small></div></label>
      </div>
      {blockedDestination&&<div role="alert" style={{marginTop:12,padding:"12px 14px",borderRadius:14,background:"#fff2ed",border:"1px solid #ffd0c2",fontWeight:750,color:"#8a2b12"}}>Ten kierunek nie jest obecnie promowany przez Tripownię ze względów bezpieczeństwa. Wybierz inny kierunek.</div>}
    </div>

    {submitted&&!blockedDestination&&<div className="trip-search-results trip-search-decision">
      <div><small>KROK 2 Z 3 · GOTOWE</small><strong>{canonicalDestination(destination)||"Gdziekolwiek"}</strong><span>{searchType!=="hotels"?`${from.includes("ANY")?"Dowolne lotnisko":from.map(airportLabel).join(" + ")} · `:""}{start} – {end} · {adults} os.</span></div>
      <div className="trip-search-actions">
        <a className="primary" href={primary.url} target="_blank" rel="sponsored noopener noreferrer">{primary.label} →</a>
        {alternative&&<a className="secondary" href={alternative.url} target="_blank" rel="sponsored noopener noreferrer">{alternative.label}</a>}
      </div>
      <p className="trip-search-booking-note">Tripownia przekazuje parametry wyszukiwania. Finalną cenę i rezerwację potwierdzasz bezpośrednio u partnera.</p>
    </div>}
  </section>;
}
