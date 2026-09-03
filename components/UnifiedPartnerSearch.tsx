"use client";

import { useMemo, useState, type ReactNode } from "react";
import { BedDouble, CalendarDays, MapPin, Package, Plane, Search, Sun, Users, Zap } from "lucide-react";
import { partners } from "@/lib/partners";

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
};

const airportChoices = [
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
  "djerba":"/wczasy/djerba/","tunezja":"/wczasy/tunezja/","egipt":"/wczasy/egipt/","marsa alam":"/wczasy/marsa-alam/","hurghada":"/wczasy/hurghada/","kreta":"/wczasy/kreta/","rodos":"/wczasy/rodos/","grecja":"/wczasy/grecja/","teneryfa":"/wczasy/teneryfa/","majorka":"/wczasy/majorka/","hiszpania":"/wczasy/hiszpania/","turcja":"/wczasy/turcja/","albania":"/wczasy/albania/","zanzibar":"/wczasy/zanzibar/","malediwy":"/wczasy/malediwy/","dominikana":"/wczasy/dominikana/","meksyk":"/wczasy/meksyk/"
};

function norm(value:string){ return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(); }
function destinationKey(destination:string){ const first=norm(destination.split(",")[0]); return {first,full:norm(destination)}; }
function firstMatch<T>(map:Record<string,T>, destination:string):T|undefined{ const {first,full}=destinationKey(destination); if(map[first]) return map[first]; const key=Object.keys(map).find(k=>full.includes(k)); return key?map[key]:undefined; }
function isoAfter(days:number){ const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
function plusDays(iso:string,days:number){ const d=new Date(`${iso}T12:00:00`); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
function airportCode(value:string,explicit?:string){ if(explicit)return explicit; const n=norm(value); return airportChoices.find(a=>n.includes(norm(a.label))||n.includes(a.code.toLowerCase()))?.code||"WAW"; }
function airportLabel(code:string){ return airportChoices.find(a=>a.code===code)?.label||code; }

function defaultSearchType(mode:Mode):SearchType{
  if(mode==="city") return "city";
  if(mode==="holiday") return "holiday";
  if(mode==="lastminute") return "lastminute";
  return "package";
}

function buildLinks(destination:string,fromCode:string,start:string,end:string,adults:number,searchType:SearchType){
  const nights=Math.max(1,Math.round((new Date(`${end}T12:00:00`).getTime()-new Date(`${start}T12:00:00`).getTime())/86400000));
  const iata=firstMatch(iataByDestination,destination);
  const isLast=searchType==="lastminute";
  const eximPath=firstMatch(eximPathByDestination,destination)||(isLast?"/last-minute":"/wakacje");
  const wakacjePath=firstMatch(wakacjePathByDestination,destination)||(isLast?"/last-minute/":"/");
  // EXIM: zamiast otwierać ogólną listę, przechodzimy przez serwer Tripowni.
  // Route wybiera najtańszą konkretną ofertę/hotel z aktualnej strony kierunku
  // (z preferencją wybranego miasta wylotu i najbliższego terminu) i dopiero wtedy
  // przekierowuje przez afiliację EXIM.
  const eximParams=new URLSearchParams({path:eximPath,from:fromCode,start,end,adults:String(adults)});
  const exim=`/go/exim-best?${eximParams.toString()}`;
  const wakacje=partners.wakacje.buildUrl(`https://www.wakacje.pl${wakacjePath}`);

  const eskyBase=new URL("https://www2.esky.pl/lot+hotel/portfolio");
  eskyBase.searchParams.set("rooms[0][adults]",String(adults));
  eskyBase.searchParams.set("datesTab","flexDates");
  eskyBase.searchParams.set("departureDate",start);
  eskyBase.searchParams.set("returnDate",end);
  eskyBase.searchParams.set("stayLength",`${nights}:${nights}`);
  eskyBase.searchParams.set("departurePlaces",`ap-${fromCode}`);
  eskyBase.searchParams.set("selectedDeparturePlaces",`ap-${fromCode}`);
  if(iata) eskyBase.searchParams.set("arrivalPlaces",`ci-${iata}`);
  eskyBase.searchParams.set("context","pl-packages");
  eskyBase.searchParams.set("sort[TotalPrice]","asc");
  const esky=partners.esky.buildUrl(eskyBase.toString());

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
    exim,wakacje,esky,kiwi,booking,nights,
    tui:partners.tui.buildUrl(isLast?"https://www.tui.pl/last-minute":"https://www.tui.pl/wypoczynek"),
    gyg:partners.getyourguide.buildUrl(`https://www.getyourguide.pl/s/?q=${encodeURIComponent(destination.split(",")[0])}`),
    esim:partners.fonia.buildUrl("https://fonia.app/"),
    car:"https://getrentacar.tpk.lv/buzTQvPf",taxi:"https://kiwitaxi.tpk.lv/UuvtPHby",transfer:"https://gettransfer.tpk.lv/SqNqK9Q7"
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

export default function UnifiedPartnerSearch({mode="all",initialDestination="",initialDeparture="Warszawa Chopina",initialDepartureCode,initialStartDate,initialEndDate,initialAdults=2}:Props){
  const [searchType,setSearchType]=useState<SearchType>(defaultSearchType(mode));
  const [destination,setDestination]=useState(initialDestination);
  const [from,setFrom]=useState(airportCode(initialDeparture,initialDepartureCode));
  const [start,setStart]=useState(initialStartDate||isoAfter(45));
  const [end,setEnd]=useState(initialEndDate||plusDays(initialStartDate||isoAfter(45),mode==="city"?3:7));
  const [adults,setAdults]=useState(initialAdults);
  const [submitted,setSubmitted]=useState(false);
  const links=useMemo(()=>buildLinks(destination,from,start,end,adults,searchType),[destination,from,start,end,adults,searchType]);

  const primary=useMemo(()=>{
    if(searchType==="flights") return {label:"Pokaż loty",url:links.kiwi,source:"Loty"};
    if(searchType==="hotels") return {label:"Pokaż hotele",url:links.booking,source:"Hotele"};
    if(searchType==="city") return {label:"Pokaż city break",url:links.esky,source:"Lot + hotel"};
    if(searchType==="holiday"||searchType==="lastminute") return {label:"Pokaż wyjazdy",url:links.exim,source:"Pakiety wakacyjne"};
    return {label:"Pokaż lot + hotel",url:links.esky,source:"Lot + hotel"};
  },[searchType,links]);

  const alternatives=searchType==="holiday"||searchType==="lastminute"
    ? [{label:"Porównaj wakacje",url:links.wakacje},{label:"Lot + hotel",url:links.esky}]
    : searchType==="city"||searchType==="package"
      ? [{label:"Same loty",url:links.kiwi},{label:"Sam hotel",url:links.booking}]
      : [];

  function changeType(type:SearchType){
    setSearchType(type);
    setSubmitted(false);
    if((type==="city"||type==="package") && start){ setEnd(plusDays(start,3)); }
    if((type==="holiday"||type==="lastminute") && start){ setEnd(plusDays(start,7)); }
  }

  return <section className="trip-search-engine" id="pelna-wyszukiwarka">
    <div className="trip-search-title"><span>WYSZUKIWARKA TRIPOWNI</span><h2>Znajdź i rezerwuj bezpośrednio u partnera</h2><p>Jedno wyszukiwanie. Tripownia dobiera właściwe źródło i przekazuje kierunek, termin, lotnisko oraz liczbę osób.</p></div>

    <div className="trip-search-shell">
      <div className="trip-search-tabs" role="tablist" aria-label="Rodzaj wyjazdu">
        {tabs.map(tab=><button key={tab.key} type="button" role="tab" aria-selected={searchType===tab.key} className={searchType===tab.key?"active":""} onClick={()=>changeType(tab.key)}>{tab.icon}<span>{tab.label}</span></button>)}
      </div>

      <div className="trip-search-context"><strong>{tabs.find(t=>t.key===searchType)?.label}</strong><span>{searchType==="flights"?"Znajdź najtańsze połączenia z uwzględnieniem wszystkich lotnisk w mieście.":searchType==="hotels"?"Sprawdź noclegi dla wybranego miejsca i terminu.":searchType==="holiday"||searchType==="lastminute"?"Porównaj pakiety i gotowe wakacje — najpierw sprawdzamy EXIM, potem Wakacje.pl.":"Połącz lot i nocleg w jednym wyszukiwaniu."}</span></div>

      <div className="trip-search-form">
        <label className="trip-field trip-destination"><span><MapPin size={15}/> Dokąd?</span><input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Dowolny kierunek"/></label>
        {searchType!=="hotels"&&<label className="trip-field"><span><Plane size={15}/> Skąd?</span><select value={from} onChange={e=>setFrom(e.target.value)}>{airportChoices.map(a=><option key={a.code} value={a.code}>{a.label}</option>)}</select></label>}
        <label className="trip-field"><span><CalendarDays size={15}/> Kiedy?</span><input type="date" value={start} onChange={e=>{setStart(e.target.value);if(e.target.value>=end)setEnd(plusDays(e.target.value,(searchType==="city"||searchType==="package")?3:7))}}/></label>
        <label className="trip-field"><span><CalendarDays size={15}/> Do kiedy?</span><input type="date" min={start} value={end} onChange={e=>setEnd(e.target.value)}/></label>
        <label className="trip-field trip-people"><span><Users size={15}/> Ile osób?</span><select value={adults} onChange={e=>setAdults(Number(e.target.value))}>{[1,2,3,4,5,6].map(n=><option value={n} key={n}>{n} {n===1?"osoba":"osoby"}</option>)}</select></label>
        <button className="trip-search-submit" type="button" onClick={()=>setSubmitted(true)}><Search size={19}/><span>Szukaj</span></button>
      </div>
    </div>

    {submitted&&<div className="trip-search-results">
      <div><small>GOTOWE WYSZUKIWANIE</small><strong>{destination||"Dowolny kierunek"}</strong><span>{searchType!=="hotels"?`${airportLabel(from)} · `:""}{start} – {end} · {adults} os.</span></div>
      <div className="trip-search-actions"><a className="primary" href={primary.url} target="_blank" rel="sponsored noopener noreferrer">{primary.label} →</a>{alternatives.map(a=><a key={a.label} href={a.url} target="_blank" rel="sponsored noopener noreferrer">{a.label}</a>)}</div>
    </div>}

    <div className="trip-search-extras"><span>Domknij podróż:</span><a href={links.car} target="_blank" rel="sponsored noopener noreferrer">🚗 Samochód</a><a href={links.taxi} target="_blank" rel="sponsored noopener noreferrer">🚕 Taxi</a><a href={links.transfer} target="_blank" rel="sponsored noopener noreferrer">🚐 Transfer</a><a href={links.gyg} target="_blank" rel="sponsored noopener noreferrer">🎟️ Atrakcje</a><a href={links.esim} target="_blank" rel="sponsored noopener noreferrer">📱 eSIM</a></div>
  </section>;
}
