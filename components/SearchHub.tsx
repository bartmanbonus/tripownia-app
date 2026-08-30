"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Car, Compass, MapPin, Search, Users, WalletCards } from "lucide-react";
import OfferCard from "./OfferCard";
import { offers } from "@/lib/offers";
import { partnerList, partners } from "@/lib/partners";

const tabs = [
  { id: "inspiracje", label: "Inspiracje" }, { id: "lot-hotel", label: "Lot + hotel" }, { id: "wakacje", label: "Wakacje" },
  { id: "atrakcje", label: "Atrakcje" }, { id: "parking", label: "Parkingi" }, { id: "esim", label: "eSIM" },
];

export default function SearchHub() {
  const [tab, setTab] = useState("inspiracje");
  const [departure, setDeparture] = useState("all");
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState(5000);
  const [duration, setDuration] = useState("all");
  const [board, setBoard] = useState("all");
  const [searched, setSearched] = useState(false);
  const [visible, setVisible] = useState(12);

  const results = useMemo(() => offers.filter((offer) => {
    const destinationMatch = !destination || `${offer.city} ${offer.country}`.toLowerCase().includes(destination.toLowerCase());
    const departureMatch = departure === "all" || offer.airportCode === departure;
    const budgetMatch = offer.price <= budget;
    const durationMatch = duration === "all" || (duration === "short" ? offer.nights <= 4 : duration === "week" ? offer.nights >= 5 && offer.nights <= 8 : offer.nights > 8);
    const boardMatch = board === "all" || (board === "ai" ? offer.board.toLowerCase().includes("all inclusive") : !offer.board.toLowerCase().includes("all inclusive"));
    const tabMatch = tab === "lot-hotel" ? offer.partner === "esky" : tab === "wakacje" ? ["wakacje","exim","tui"].includes(offer.partner) : true;
    return destinationMatch && departureMatch && budgetMatch && durationMatch && boardMatch && tabMatch;
  }), [departure, destination, budget, duration, board, tab]);

  const specialist = tab === "atrakcje" ? partners.getyourguide : tab === "parking" ? partners.parklot : tab === "esim" ? partners.fonia : null;
  const shown = results.slice(0, visible);

  return <section className="search-hub shell" id="wyszukiwarka">
    <div className="search-tabs">{tabs.map(item => <button key={item.id} onClick={() => { setTab(item.id); setSearched(false); setVisible(12); }} className={tab === item.id ? "active" : ""}>{item.label}</button>)}</div>
    {specialist ? <div className="special-search"><div className="special-icon">{tab === "parking" ? <Car/> : tab === "atrakcje" ? <Compass/> : <MapPin/>}</div><div><small>{specialist.description}</small><h3>{tab === "parking" ? "Znajdź parking przy lotnisku" : tab === "atrakcje" ? "Znajdź atrakcje na miejscu" : "Internet na wyjazd bez roamingu"}</h3><p>Przejdziesz do partnera przez link Tripowni. Zakup może naliczyć nam prowizję, bez dodatkowego kosztu dla Ciebie.</p></div><a className="primary-cta compact" href={specialist.buildUrl()} target="_blank" rel="sponsored noopener noreferrer">Szukaj u {specialist.name} →</a></div> : <>
      <div className="advanced-search">
        <label><span><MapPin/> Skąd?</span><select value={departure} onChange={e=>{setDeparture(e.target.value);setVisible(12)}}><option value="all">Dowolne lotnisko</option><option value="WAW">Warszawa Chopina</option><option value="WMI">Warszawa Modlin</option><option value="KRK">Kraków</option><option value="KTW">Katowice</option><option value="GDN">Gdańsk</option></select></label>
        <label><span><Compass/> Dokąd?</span><input value={destination} onChange={e=>{setDestination(e.target.value);setVisible(12)}} placeholder="np. Malta, Hiszpania..."/></label>
        <label><span><CalendarDays/> Na ile?</span><select value={duration} onChange={e=>{setDuration(e.target.value);setVisible(12)}}><option value="all">Dowolnie</option><option value="short">2–4 noce</option><option value="week">5–8 nocy</option><option value="long">9+ nocy</option></select></label>
        <label><span><WalletCards/> Budżet / os.</span><select value={budget} onChange={e=>{setBudget(Number(e.target.value));setVisible(12)}}><option value="1000">do 1 000 zł</option><option value="1500">do 1 500 zł</option><option value="2000">do 2 000 zł</option><option value="3000">do 3 000 zł</option><option value="5000">do 5 000 zł</option><option value="10000">bez ograniczenia</option></select></label>
        <label><span><Users/> Wyżywienie</span><select value={board} onChange={e=>{setBoard(e.target.value);setVisible(12)}}><option value="all">Dowolne</option><option value="ai">All Inclusive</option><option value="other">Bez All Inclusive</option></select></label>
        <button className="search-submit" onClick={()=>{setSearched(true);setVisible(12)}}><Search size={19}/> Szukaj ofert</button>
      </div>
      {(searched || tab === "inspiracje" || tab === "lot-hotel" || tab === "wakacje") && <div className="search-results-block"><div className="search-results-heading"><div><small>WYNIKI TRIPOWNI</small><h3>{results.length ? `${results.length} dopasowanych ofert` : "Nie znaleźliśmy oferty"}</h3></div><span>Pokazujemy oferty i źródła, do których możemy przekierować Cię przez link partnerski.</span></div><div className="cards-grid">{shown.map(o => <OfferCard key={o.id} offer={o}/>)}</div>{results.length > visible && <div style={{display:"flex",justifyContent:"center",marginTop:24}}><button className="search-submit" onClick={()=>setVisible(v=>v+12)}>Pokaż więcej ({results.length-visible})</button></div>}{!results.length && <div className="empty-search">Zwiększ budżet, wybierz inne lotnisko albo pozostaw kierunek pusty.</div>}</div>}
    </>}
    <div className="partner-strip"><span>Źródła i partnerzy:</span>{partnerList.map(p=><a key={p.key} href={p.buildUrl()} target="_blank" rel="sponsored noopener noreferrer">{p.name}</a>)}</div>
  </section>;
}
