"use client";

import { useMemo, useState } from "react";
import { CalendarDays, MapPin, Plane, Search, Users } from "lucide-react";
import { partners } from "@/lib/partners";

type Mode = "all" | "city" | "holiday" | "lastminute";

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

const eximPathByDestination: Record<string,string> = {
  "djerba":"/kierunki/tunezja/djerba",
  "tunezja":"/kierunki/tunezja",
  "hammamet":"/kierunki/tunezja/tunezja-kontynent/hammamet",
  "marsa alam":"/kierunki/egipt/marsa-alam",
  "hurghada":"/kierunki/egipt/hurghada",
  "egipt":"/kierunki/egipt",
  "sloneczny brzeg":"/kierunki/bulgaria/sloneczny-brzeg",
  "bulgaria":"/kierunki/bulgaria",
  "albania":"/kierunki/albania",
  "turcja":"/kierunki/turcja",
  "antalya":"/kierunki/turcja/antalya",
  "kreta":"/kierunki/grecja/kreta",
  "rodos":"/kierunki/grecja/rodos",
  "grecja":"/kierunki/grecja",
  "cypr":"/kierunki/cypr",
  "teneryfa":"/kierunki/hiszpania/wyspy-kanaryjskie/teneryfa",
  "majorka":"/kierunki/hiszpania/baleary/majorka",
  "hiszpania":"/kierunki/hiszpania"
};

const wakacjePathByDestination: Record<string,string> = {
  "djerba":"/wczasy/djerba/","tunezja":"/wczasy/tunezja/","egipt":"/wczasy/egipt/","marsa alam":"/wczasy/marsa-alam/","hurghada":"/wczasy/hurghada/","kreta":"/wczasy/kreta/","rodos":"/wczasy/rodos/","grecja":"/wczasy/grecja/","teneryfa":"/wczasy/teneryfa/","majorka":"/wczasy/majorka/","hiszpania":"/wczasy/hiszpania/","turcja":"/wczasy/turcja/","albania":"/wczasy/albania/","zanzibar":"/wczasy/zanzibar/","malediwy":"/wczasy/malediwy/","dominikana":"/wczasy/dominikana/","meksyk":"/wczasy/meksyk/"
};

function norm(value:string){
  return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
}

function destinationKey(destination:string){
  const first = norm(destination.split(",")[0]);
  const full = norm(destination);
  return { first, full };
}

function firstMatch<T>(map:Record<string,T>, destination:string):T|undefined{
  const {first,full}=destinationKey(destination);
  if(map[first]) return map[first];
  const key=Object.keys(map).find(k=>full.includes(k));
  return key ? map[key] : undefined;
}

function isoAfter(days:number){
  const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10);
}

function plusDays(iso:string, days:number){
  const d=new Date(`${iso}T12:00:00`); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10);
}

function airportCode(value:string, explicit?:string){
  if(explicit) return explicit;
  const n=norm(value);
  return airportChoices.find(a=>n.includes(norm(a.label)) || n.includes(a.code.toLowerCase()))?.code || "WAW";
}

function airportLabel(code:string){ return airportChoices.find(a=>a.code===code)?.label || code; }

function buildLinks(destination:string, fromCode:string, start:string, end:string, adults:number, mode:Mode){
  const nights=Math.max(1,Math.round((new Date(`${end}T12:00:00`).getTime()-new Date(`${start}T12:00:00`).getTime())/86400000));
  const iata=firstMatch(iataByDestination,destination);
  const eximPath=firstMatch(eximPathByDestination,destination) || (mode==="lastminute"?"/last-minute":"/wakacje");
  const wakacjePath=firstMatch(wakacjePathByDestination,destination) || (mode==="lastminute"?"/last-minute/":"/");

  const exim=partners.exim.buildUrl(`https://www.exim.pl${eximPath}`);
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

  const kiwiDeep=new URL("https://www.kiwi.com/deep");
  kiwiDeep.searchParams.set("from",fromCode);
  if(iata) kiwiDeep.searchParams.set("to",iata);
  else kiwiDeep.searchParams.set("to",destination.split(",")[0]);
  kiwiDeep.searchParams.set("departure",start);
  kiwiDeep.searchParams.set("return",end);
  kiwiDeep.searchParams.set("adults",String(adults));
  kiwiDeep.searchParams.set("currency","PLN");
  kiwiDeep.searchParams.set("locale","pl");
  kiwiDeep.searchParams.set("sort","price");
  kiwiDeep.searchParams.set("asc","1");
  const kiwi=partners.kiwi.buildUrl(kiwiDeep.toString());

  const bookingBase=new URL("https://www.booking.com/searchresults.pl.html");
  bookingBase.searchParams.set("ss",destination);
  bookingBase.searchParams.set("checkin",start);
  bookingBase.searchParams.set("checkout",end);
  bookingBase.searchParams.set("group_adults",String(adults));
  bookingBase.searchParams.set("no_rooms","1");
  bookingBase.searchParams.set("group_children","0");
  const booking=partners.booking.buildUrl(bookingBase.toString());

  const gygBase=`https://www.getyourguide.pl/s/?q=${encodeURIComponent(destination.split(",")[0])}`;
  const gyg=partners.getyourguide.buildUrl(gygBase);
  const esim=partners.fonia.buildUrl("https://fonia.app/");
  const tui=partners.tui.buildUrl(mode==="lastminute"?"https://www.tui.pl/last-minute":"https://www.tui.pl/wypoczynek");

  return {exim,wakacje,tui,esky,kiwi,booking,gyg,esim,nights,iata};
}

export default function UnifiedPartnerSearch({mode="all",initialDestination="",initialDeparture="Warszawa Chopina",initialDepartureCode,initialStartDate,initialEndDate,initialAdults=2}:Props){
  const initialFrom=airportCode(initialDeparture,initialDepartureCode);
  const [destination,setDestination]=useState(initialDestination);
  const [from,setFrom]=useState(initialFrom);
  const [start,setStart]=useState(initialStartDate||isoAfter(45));
  const [end,setEnd]=useState(initialEndDate||plusDays(initialStartDate||isoAfter(45),mode==="city"?3:7));
  const [adults,setAdults]=useState(initialAdults);
  const [submitted,setSubmitted]=useState(Boolean(initialDestination));
  const links=useMemo(()=>buildLinks(destination,from,start,end,adults,mode),[destination,from,start,end,adults,mode]);

  const title=mode==="city"?"Jedna wyszukiwarka city breaków":mode==="lastminute"?"Jedna wyszukiwarka last minute":mode==="holiday"?"Jedna wyszukiwarka wakacji":"Jedna wyszukiwarka całej podróży";

  const holidayFirst=[
    {key:"exim",badge:"1 · PRIORYTET",icon:"☀️",name:"EXIM Tours",desc:"Pakiety, czartery i last minute",url:links.exim,accent:true},
    {key:"wakacje",badge:"2 · PORÓWNAJ",icon:"🏖️",name:"Wakacje.pl",desc:"Pełna baza ofert biur podróży",url:links.wakacje},
    {key:"tui",badge:"WAKACJE",icon:"🌴",name:"TUI",desc:"Pełna baza pakietów TUI",url:links.tui},
    {key:"esky",badge:"CITY BREAK",icon:"✈️",name:"eSky",desc:`Lot + hotel · ${airportLabel(from)} · ${links.nights} nocy`,url:links.esky},
  ];
  const cityFirst=[
    {key:"esky",badge:"1 · CITY BREAK",icon:"✈️",name:"eSky",desc:`Lot + hotel · ${airportLabel(from)} · ${links.nights} nocy`,url:links.esky,accent:true},
    {key:"kiwi",badge:"2 · LOTY",icon:"🛫",name:"Kiwi.com",desc:`Najtańsze kombinacje lotów · ${from} → ${destination||"wybrany kierunek"}`,url:links.kiwi},
    {key:"booking",badge:"3 · NOCLEGI",icon:"🏨",name:"Booking.com",desc:`Noclegi ${start} – ${end}`,url:links.booking},
  ];
  const common=[
    {key:"kiwi",badge:"LOTY · PRIORYTET",icon:"🛫",name:"Kiwi.com",desc:`Najpierw szukamy najtańszych lotów · ${from} → ${destination||"wybrany kierunek"}`,url:links.kiwi,accent:true},
    {key:"booking",badge:"NOCLEGI",icon:"🏨",name:"Booking.com",desc:`Noclegi ${start} – ${end}`,url:links.booking},
    {key:"esim",badge:"INTERNET",icon:"📱",name:"eSIM",desc:"Internet na wyjazd · link afiliacyjny",url:links.esim},
    {key:"gyg",badge:"ATRAKCJE",icon:"🎟️",name:"GetYourGuide",desc:`Atrakcje w: ${destination||"wybranym miejscu"}`,url:links.gyg},
  ];
  const results=mode==="city"
    ? [...cityFirst,{key:"gyg",badge:"ATRAKCJE",icon:"🎟️",name:"GetYourGuide",desc:`Atrakcje w: ${destination||"wybranym miejscu"}`,url:links.gyg},{key:"esim",badge:"INTERNET",icon:"📱",name:"eSIM",desc:"Internet na wyjazd · link afiliacyjny",url:links.esim},{key:"exim",badge:"PAKIETY",icon:"☀️",name:"EXIM Tours",desc:"Sprawdź także dostępne pakiety",url:links.exim},{key:"wakacje",badge:"PAKIETY",icon:"🏖️",name:"Wakacje.pl",desc:"Sprawdź także pełne pakiety",url:links.wakacje}]
    : [...holidayFirst,...common];

  return <section className="unified-partner-search" id="pelna-wyszukiwarka">
    <div className="unified-search-head"><div><div className="kicker">PEŁNA OFERTA PARTNERÓW</div><h2>{title}</h2><p>Ustaw parametry raz. Tripownia przygotuje gotowe linki afiliacyjne do właściwych partnerów — bez ponownego wpisywania kierunku, terminu i lotniska tam, gdzie partner pozwala je przekazać.</p></div></div>
    <div className="unified-search-form">
      <label className="unified-field unified-destination"><span><MapPin size={15}/> Dokąd?</span><input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="np. Djerba, Rzym, Nowy Jork"/></label>
      <label className="unified-field"><span><Plane size={15}/> Skąd?</span><select value={from} onChange={e=>setFrom(e.target.value)}>{airportChoices.map(a=><option key={a.code} value={a.code}>{a.label}</option>)}</select></label>
      <label className="unified-field"><span><CalendarDays size={15}/> Wyjazd</span><input type="date" value={start} onChange={e=>{setStart(e.target.value);if(e.target.value>=end)setEnd(plusDays(e.target.value,mode==="city"?3:7))}}/></label>
      <label className="unified-field"><span><CalendarDays size={15}/> Powrót</span><input type="date" min={start} value={end} onChange={e=>setEnd(e.target.value)}/></label>
      <label className="unified-field"><span><Users size={15}/> Osoby</span><select value={adults} onChange={e=>setAdults(Number(e.target.value))}>{[1,2,3,4,5,6].map(n=><option value={n} key={n}>{n}</option>)}</select></label>
      <button className="unified-search-submit" type="button" onClick={()=>setSubmitted(true)}><Search size={18}/> Pokaż opcje</button>
    </div>

    {submitted && <div className="unified-results">
      <div className="unified-results-summary"><strong>{destination||"Dowolny kierunek"}</strong><span>{airportLabel(from)} · {start} – {end} · {adults} os.</span></div>
      <div className="unified-results-grid">{results.map(r=><a className={`unified-result-card ${("accent" in r && r.accent)?"is-priority":""}`} href={r.url} target="_blank" rel="sponsored noopener noreferrer" key={r.key}><small>{r.badge}</small><div className="unified-result-main"><span>{r.icon}</span><div><strong>{r.name}</strong><p>{r.desc}</p></div></div><b>Sprawdź →</b></a>)}</div>
      <p className="unified-search-note">EXIM i Wakacje.pl są na początku dla pakietów wakacyjnych. eSky jest priorytetem dla city breaków, Kiwi dla samych lotów, Booking dla noclegów. eSIM i GetYourGuide domykają podróż. Jeżeli dany partner nie obsługuje konkretnego parametru w deeplinku, otwieramy najbliższą możliwą stronę z zachowaną afiliacją.</p>
    </div>}
  </section>;
}
