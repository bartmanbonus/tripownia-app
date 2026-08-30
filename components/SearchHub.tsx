"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Car, Compass, MapPin, Search, Users, WalletCards, PlaneTakeoff, Check } from "lucide-react";
import OfferCard from "./OfferCard";
import { airportOptions, destinationOptions, offers } from "@/lib/offers";

const tabs = [
  { id: "inspiracje", label: "Inspiracje" }, { id: "lot-hotel", label: "Lot + hotel" }, { id: "wakacje", label: "Wakacje" },
  { id: "atrakcje", label: "Atrakcje" }, { id: "parking", label: "Parkingi" }, { id: "esim", label: "eSIM" },
];

export default function SearchHub() {
  const [tab, setTab] = useState("inspiracje");
  const [selectedAirports, setSelectedAirports] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [budget, setBudget] = useState(5000);
  const [duration, setDuration] = useState("all");
  const [board, setBoard] = useState("all");
  const [searched, setSearched] = useState(false);
  const [visible, setVisible] = useState(12);

  function toggleValue(list: string[], value: string, setter: (value: string[]) => void) {
    setter(list.includes(value) ? list.filter(item => item !== value) : [...list, value]);
    setVisible(12);
  }

  const results = useMemo(() => offers.filter((offer) => {
    const destinationMatch = !selectedDestinations.length || selectedDestinations.some(item => item === offer.country || item === `${offer.city}, ${offer.country}`);
    const departureMatch = !selectedAirports.length || selectedAirports.includes(offer.airportCode);
    const budgetMatch = offer.price <= budget;
    const durationMatch = duration === "all" || (duration === "short" ? offer.nights <= 4 : duration === "week" ? offer.nights >= 5 && offer.nights <= 8 : offer.nights > 8);
    const boardMatch = board === "all" || (board === "ai" ? offer.board.toLowerCase().includes("all inclusive") : !offer.board.toLowerCase().includes("all inclusive"));
    const tabMatch = tab === "lot-hotel" ? offer.partner === "esky" : tab === "wakacje" ? ["wakacje","exim","tui"].includes(offer.partner) : true;
    return destinationMatch && departureMatch && budgetMatch && durationMatch && boardMatch && tabMatch;
  }), [selectedAirports, selectedDestinations, budget, duration, board, tab]);

  const specialistPath = tab === "atrakcje" ? "/atrakcje" : tab === "parking" ? "/parkingi" : tab === "esim" ? "/esim" : null;
  const shown = results.slice(0, visible);

  return <section className="search-hub shell" id="wyszukiwarka">
    <div className="search-tabs">{tabs.map(item => <button key={item.id} onClick={() => { setTab(item.id); setSearched(false); setVisible(12); }} className={tab === item.id ? "active" : ""}>{item.label}</button>)}</div>
    {specialistPath ? <div className="special-search"><div className="special-icon">{tab === "parking" ? <Car/> : tab === "atrakcje" ? <Compass/> : <MapPin/>}</div><div><small>Wyniki Tripownia.pl najpierw pokazują kontekst</small><h3>{tab === "parking" ? "Znajdź parking przy lotnisku" : tab === "atrakcje" ? "Znajdź atrakcje na miejscu" : "Internet na wyjazd bez roamingu"}</h3><p>Zobacz wskazówki i opcje na Tripowni. Dopiero przy konkretnej rezerwacji przejdziesz do partnera.</p></div><a className="primary-cta compact" href={specialistPath}>Przejdź do działu →</a></div> : <>
      <div className="advanced-search advanced-search-v2">
        <div className="filter-box filter-box-wide">
          <div className="filter-box-header"><span><PlaneTakeoff size={16}/> Skąd?</span><button type="button" className="mini-clear" onClick={() => setSelectedAirports([])}>Gdziekolwiek</button></div>
          <div className="selected-summary">{selectedAirports.length ? `Wybrane lotniska: ${selectedAirports.join(", ")}` : "Wybrane lotniska: wszystkie"}</div>
          <div className="checkbox-grid">
            {airportOptions.map((airport) => <button type="button" key={airport.code} className={`choice-pill ${selectedAirports.includes(airport.code) ? "active" : ""}`} onClick={() => toggleValue(selectedAirports, airport.code, setSelectedAirports)}><Check size={14}/> {airport.label}</button>)}
          </div>
        </div>

        <div className="filter-box filter-box-wide">
          <div className="filter-box-header"><span><Compass size={16}/> Dokąd?</span><button type="button" className="mini-clear" onClick={() => setSelectedDestinations([])}>Gdziekolwiek</button></div>
          <div className="selected-summary">{selectedDestinations.length ? `Wybrane miejsca: ${selectedDestinations.slice(0,4).join(", ")}${selectedDestinations.length > 4 ? ` +${selectedDestinations.length - 4}` : ""}` : "Wybrane miejsca: gdziekolwiek"}</div>
          <div className="checkbox-grid destination-grid">
            {destinationOptions.map((place) => <button type="button" key={place} className={`choice-pill ${selectedDestinations.includes(place) ? "active" : ""}`} onClick={() => toggleValue(selectedDestinations, place, setSelectedDestinations)}><Check size={14}/> {place}</button>)}
          </div>
        </div>

        <div className="search-inline-row">
          <label><span><CalendarDays/> Na ile?</span><select value={duration} onChange={e=>{setDuration(e.target.value);setVisible(12)}}><option value="all">Dowolnie</option><option value="short">2–4 noce</option><option value="week">5–8 nocy</option><option value="long">9+ nocy</option></select></label>
          <label><span><WalletCards/> Budżet / os.</span><select value={budget} onChange={e=>{setBudget(Number(e.target.value));setVisible(12)}}><option value="1000">do 1 000 zł</option><option value="1500">do 1 500 zł</option><option value="2000">do 2 000 zł</option><option value="3000">do 3 000 zł</option><option value="5000">do 5 000 zł</option><option value="10000">bez ograniczenia</option></select></label>
          <label><span><Users/> Wyżywienie</span><select value={board} onChange={e=>{setBoard(e.target.value);setVisible(12)}}><option value="all">Dowolne</option><option value="ai">All Inclusive</option><option value="other">Bez All Inclusive</option></select></label>
          <button className="search-submit" onClick={()=>{setSearched(true);setVisible(12)}}><Search size={19}/> Pokaż wyniki</button>
        </div>
      </div>
      {(searched || tab === "inspiracje" || tab === "lot-hotel" || tab === "wakacje") && <div className="search-results-block"><div className="search-results-heading"><div><small>WYNIKI TRIPOWNIA.PL</small><h3>{results.length ? `${results.length} dopasowanych ofert` : "Nie znaleźliśmy oferty"}</h3></div><span>Najpierw pokazujemy wynik na Tripownia.pl. Dopiero potem możesz przejść do partnera przez link afiliacyjny.</span></div><div className="cards-grid">{shown.map(o => <OfferCard key={o.id} offer={o}/>)}</div>{results.length > visible && <div style={{display:"flex",justifyContent:"center",marginTop:24}}><button className="search-submit" onClick={()=>setVisible(v=>v+12)}>Pokaż więcej ({results.length-visible})</button></div>}{!results.length && <div className="empty-search">Spróbuj kliknąć „Gdziekolwiek”, zwiększ budżet albo wybierz mniej lotnisk i miejsc docelowych.</div>}</div>}
    </>}
</section>;
}
