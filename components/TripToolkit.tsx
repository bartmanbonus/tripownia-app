"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeEuro,
  BookOpenCheck,
  BriefcaseBusiness,
  BusFront,
  Camera,
  Car,
  ExternalLink,
  FileText,
  Globe2,
  Map,
  MapPin,
  Plane,
  Plus,
  ReceiptText,
  Route,
  ShieldCheck,
  Smartphone,
  TicketCheck,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react";
import { partners } from "@/lib/partners";

type Reservation = {
  id: string;
  type: "flight" | "hotel" | "attraction" | "car" | "transfer" | "other";
  title: string;
  reference?: string;
  date?: string;
  url?: string;
  note?: string;
};

type Expense = {
  id: string;
  title: string;
  amount: number;
  payer: string;
  participants: string[];
};

type PhotoSpot = {
  id: string;
  title: string;
  note?: string;
};

type ToolkitState = {
  travelers: string[];
  reservations: Reservation[];
  expenses: Expense[];
  photoSpots: PhotoSpot[];
  entryNotes?: string;
  baggageNotes?: string;
  localTransportNotes?: string;
};

const LEGACY_STORAGE_KEY = "tripownia-trip-toolkit";
const EMPTY_STATE: ToolkitState = { travelers: ["Ja"], reservations: [], expenses: [], photoSpots: [] };

function storageKey(tripId: string) {
  return `tripownia-trip-toolkit:${tripId}`;
}

function normalizeState(saved?: ToolkitState | null): ToolkitState {
  if (!saved) return { ...EMPTY_STATE };
  return {
    ...saved,
    travelers: saved.travelers?.length ? saved.travelers : ["Ja"],
    reservations: saved.reservations || [],
    expenses: saved.expenses || [],
    photoSpots: saved.photoSpots || [],
  };
}

const reservationLabels: Record<Reservation["type"], string> = {
  flight: "Lot",
  hotel: "Hotel",
  attraction: "Atrakcja",
  car: "Auto",
  transfer: "Transfer",
  other: "Inne",
};

export default function TripToolkit({ city, country, tripId }: { city: string; country: string; tripId: string }) {
  const [state, setState] = useState<ToolkitState>({ ...EMPTY_STATE });
  const [newTraveler, setNewTraveler] = useState("");
  const [reservation, setReservation] = useState<Omit<Reservation, "id">>({ type: "flight", title: "", reference: "", date: "", url: "", note: "" });
  const [expense, setExpense] = useState({ title: "", amount: "", payer: "Ja", participants: ["Ja"] as string[] });
  const [photoSpot, setPhotoSpot] = useState({ title: "", note: "" });

  useEffect(() => {
    try {
      const key = storageKey(tripId);
      let raw = localStorage.getItem(key);
      if (!raw) {
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) {
          localStorage.setItem(key, legacy);
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          raw = legacy;
        }
      }
      const saved = raw ? JSON.parse(raw) as ToolkitState : null;
      const next = normalizeState(saved);
      setState(next);
      setExpense((current) => ({
        ...current,
        payer: next.travelers[0] || "Ja",
        participants: [...next.travelers],
      }));
    } catch {
      setState({ ...EMPTY_STATE });
      setExpense({ title: "", amount: "", payer: "Ja", participants: ["Ja"] });
    }
  }, [tripId]);

  function save(next: ToolkitState) {
    setState(next);
    localStorage.setItem(storageKey(tripId), JSON.stringify(next));
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));
  }

  function addTraveler() {
    const name = newTraveler.trim();
    if (!name || state.travelers.includes(name)) return;
    const travelers = [...state.travelers, name];
    save({ ...state, travelers });
    setNewTraveler("");
    setExpense((current) => ({ ...current, participants: Array.from(new Set([...current.participants, name])) }));
  }

  function addReservation() {
    const title = reservation.title.trim();
    if (!title) return;
    save({ ...state, reservations: [...state.reservations, { ...reservation, id: `${Date.now()}`, title }] });
    setReservation({ type: "flight", title: "", reference: "", date: "", url: "", note: "" });
  }

  function addExpense() {
    const amount = Number(String(expense.amount).replace(",", "."));
    const title = expense.title.trim();
    if (!title || !amount || amount <= 0 || expense.participants.length === 0) return;
    save({ ...state, expenses: [...state.expenses, { id: `${Date.now()}`, title, amount, payer: expense.payer, participants: expense.participants }] });
    setExpense({ title: "", amount: "", payer: state.travelers[0] || "Ja", participants: [...state.travelers] });
  }

  function addPhotoSpot() {
    const title = photoSpot.title.trim();
    if (!title) return;
    save({ ...state, photoSpots: [...state.photoSpots, { id: `${Date.now()}`, title, note: photoSpot.note.trim() }] });
    setPhotoSpot({ title: "", note: "" });
  }

  const balances = useMemo(() => {
    const values = new globalThis.Map<string, number>();
    state.travelers.forEach((person) => values.set(person, 0));
    state.expenses.forEach((item) => {
      const share = item.amount / item.participants.length;
      values.set(item.payer, (values.get(item.payer) || 0) + item.amount);
      item.participants.forEach((person) => values.set(person, (values.get(person) || 0) - share));
    });
    return Array.from(values.entries()).map(([name, balance]) => ({ name, balance }));
  }, [state.expenses, state.travelers]);

  const totalExpenses = state.expenses.reduce((sum, item) => sum + item.amount, 0);
  const gyGuide = partners.getyourguide.buildUrl(`https://www.getyourguide.pl/s/?q=${encodeURIComponent(city)}`);
  const booking = partners.booking.buildUrl(`https://www.booking.com/searchresults.pl.html?ss=${encodeURIComponent(city)}`);
  const esim = partners.fonia.buildUrl();
  const parking = partners.parklot.buildUrl();
  const kiwi = partners.kiwi.buildUrl(`https://www.kiwi.com/pl/search/results/${encodeURIComponent(city.toLowerCase().replaceAll(" ", "-"))}`);
  const photoSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`best photo spots ${city}`)}`;
  const taxiSearch = `https://www.google.com/search?q=${encodeURIComponent(`${city} taxi app Bolt Uber local taxi`)}`;
  const carSearch = `https://www.google.com/search?q=${encodeURIComponent(`${city} car rental airport`)}`;
  const borderSearch = `https://www.gov.pl/web/dyplomacja/${encodeURIComponent(country.toLowerCase().replaceAll(" ", "-"))}`;
  const baggageSearch = `https://www.google.com/search?q=${encodeURIComponent(`baggage allowance airline cabin baggage dimensions`)}`;

  return (
    <>
      <nav className="trip-toolkit-nav" aria-label="Narzędzia podróży">
        <a href="#rezerwacje"><TicketCheck size={16}/> Rezerwacje</a>
        <a href="#wydatki"><WalletCards size={16}/> Wydatki</a>
        <a href="#na-miejscu"><Route size={16}/> Na miejscu</a>
        <a href="#foto"><Camera size={16}/> Photo spots</a>
        <a href="#formalnosci"><ShieldCheck size={16}/> Formalności</a>
        <a href="#uslugi"><BadgeEuro size={16}/> Usługi</a>
      </nav>

      <div className="trip-summary-strip">
        <div className="trip-summary-pill"><span>Rezerwacje</span><strong>{state.reservations.length || "Dodaj pierwszą"}</strong></div>
        <div className="trip-summary-pill"><span>Wydatki</span><strong>{totalExpenses ? `${totalExpenses.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} zł` : "0 zł"}</strong></div>
        <div className="trip-summary-pill"><span>Podróżujący</span><strong>{state.travelers.length}</strong></div>
        <div className="trip-summary-pill"><span>Zapisane miejsca</span><strong>{state.photoSpots.length}</strong></div>
      </div>

      <section id="rezerwacje" className="trip-toolkit-section">
        <div className="trip-section-heading"><div><h2>Rezerwacje w jednym miejscu</h2><p>Loty, hotel, auto, transfer i bilety. Numer rezerwacji przestaje ginąć w mailach.</p></div></div>
        <div className="trip-toolkit-grid">
          <div className="trip-toolkit-card" style={{ gridColumn: "span 2" }}>
            <div className="trip-toolkit-card-head"><BookOpenCheck size={21}/><div><h3>Dodaj rezerwację</h3><p>Zapisz najważniejsze dane i link do biletu lub potwierdzenia.</p></div></div>
            <div className="trip-toolkit-form row">
              <label className="trip-toolkit-label">Typ<select value={reservation.type} onChange={(e) => setReservation({ ...reservation, type: e.target.value as Reservation["type"] })}><option value="flight">Lot</option><option value="hotel">Hotel</option><option value="attraction">Atrakcja</option><option value="car">Auto</option><option value="transfer">Transfer</option><option value="other">Inne</option></select></label>
              <label className="trip-toolkit-label">Nazwa<input value={reservation.title} onChange={(e) => setReservation({ ...reservation, title: e.target.value })} placeholder="np. LO3910 Warszawa–Barcelona" /></label>
              <label className="trip-toolkit-label">Numer / kod rezerwacji<input value={reservation.reference || ""} onChange={(e) => setReservation({ ...reservation, reference: e.target.value })} placeholder="np. ABC123" /></label>
              <label className="trip-toolkit-label">Data i godzina<input type="datetime-local" value={reservation.date || ""} onChange={(e) => setReservation({ ...reservation, date: e.target.value })} /></label>
              <label className="trip-toolkit-label">Link do biletu / potwierdzenia<input value={reservation.url || ""} onChange={(e) => setReservation({ ...reservation, url: e.target.value })} placeholder="https://..." /></label>
              <label className="trip-toolkit-label">Notatka<input value={reservation.note || ""} onChange={(e) => setReservation({ ...reservation, note: e.target.value })} placeholder="terminal, miejsce, godzina odbioru..." /></label>
            </div>
            <div className="trip-toolkit-actions"><button className="primary" onClick={addReservation}><Plus size={16}/> Dodaj rezerwację</button></div>
          </div>
          <div className="trip-toolkit-card">
            <div className="trip-toolkit-card-head"><Plane size={21}/><div><h3>Twoje rezerwacje</h3><p>Najważniejsze rzeczy pod ręką przed wyjazdem.</p></div></div>
            <div className="trip-toolkit-list">
              {state.reservations.length ? state.reservations.slice().sort((a,b) => (a.date || "").localeCompare(b.date || "")).map((item) => <div className="trip-toolkit-item" key={item.id}><TicketCheck size={18}/><div><strong>{reservationLabels[item.type]} · {item.title}</strong><small>{[item.reference && `kod ${item.reference}`, item.date && new Date(item.date).toLocaleString("pl-PL"), item.note].filter(Boolean).join(" · ")}</small>{item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">Otwórz potwierdzenie <ExternalLink size={13}/></a>}</div><button onClick={() => save({ ...state, reservations: state.reservations.filter((x) => x.id !== item.id) })} aria-label={`Usuń ${item.title}`}><Trash2 size={16}/></button></div>) : <div className="trip-empty-small">Jeszcze nic tu nie ma.</div>}
            </div>
          </div>
        </div>
      </section>

      <section id="wydatki" className="trip-toolkit-section">
        <div className="trip-section-heading"><div><h2>Wydatki i rozliczenie grupy</h2><p>Dodawaj koszty na bieżąco. Tripownia liczy, kto wyłożył za dużo, a kto powinien oddać.</p></div></div>
        <div className="trip-toolkit-grid">
          <div className="trip-toolkit-card">
            <div className="trip-toolkit-card-head"><Users size={21}/><div><h3>Kto jedzie?</h3><p>Dodaj osoby, żeby dzielić rachunki.</p></div></div>
            <div className="trip-toolkit-form"><input value={newTraveler} onChange={(e) => setNewTraveler(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTraveler()} placeholder="Imię" /></div>
            <div className="trip-toolkit-actions"><button onClick={addTraveler}><Plus size={16}/> Dodaj osobę</button></div>
            <div className="trip-toolkit-list">{state.travelers.map((person, index) => <div className="trip-toolkit-item" key={person}><Users size={17}/><div><strong>{person}</strong></div>{index > 0 && <button onClick={() => save({ ...state, travelers: state.travelers.filter((x) => x !== person), expenses: state.expenses.map((e) => ({ ...e, participants: e.participants.filter((x) => x !== person) })).filter((e) => e.participants.length) })}><Trash2 size={15}/></button>}</div>)}</div>
          </div>
          <div className="trip-toolkit-card">
            <div className="trip-toolkit-card-head"><ReceiptText size={21}/><div><h3>Dodaj wydatek</h3><p>Kwota jest dzielona równo między zaznaczone osoby.</p></div></div>
            <div className="trip-toolkit-form row"><input value={expense.title} onChange={(e) => setExpense({ ...expense, title: e.target.value })} placeholder="np. kolacja" /><input inputMode="decimal" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} placeholder="Kwota PLN" /><label className="trip-toolkit-label">Zapłacił<select value={expense.payer} onChange={(e) => setExpense({ ...expense, payer: e.target.value })}>{state.travelers.map((p) => <option key={p}>{p}</option>)}</select></label><div className="trip-toolkit-label"><span>Dzielimy na</span><div className="trip-toolkit-actions">{state.travelers.map((p) => <button key={p} className={expense.participants.includes(p) ? "primary" : ""} onClick={() => setExpense({ ...expense, participants: expense.participants.includes(p) ? expense.participants.filter((x) => x !== p) : [...expense.participants, p] })}>{p}</button>)}</div></div></div>
            <div className="trip-toolkit-actions"><button className="primary" onClick={addExpense}><Plus size={16}/> Dodaj wydatek</button></div>
          </div>
          <div className="trip-toolkit-card">
            <div className="trip-toolkit-card-head"><WalletCards size={21}/><div><h3>Saldo</h3><p>Plus oznacza, że dana osoba wyłożyła więcej niż jej udział.</p></div></div>
            <div className="trip-expense-summary"><div><span>Łącznie</span><strong>{totalExpenses.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} zł</strong></div><div><span>Wpisów</span><strong>{state.expenses.length}</strong></div></div>
            <div className="trip-balance-list">{balances.map(({ name, balance }) => <div className="trip-balance-row" key={name}><span>{name}</span><strong className={balance >= 0 ? "positive" : "negative"}>{balance >= 0 ? "+" : ""}{balance.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} zł</strong></div>)}</div>
            {state.expenses.length > 0 && <div className="trip-toolkit-actions"><button onClick={() => save({ ...state, expenses: [] })}>Wyczyść wydatki</button></div>}
          </div>
        </div>
      </section>

      <section id="na-miejscu" className="trip-toolkit-section">
        <div className="trip-section-heading"><div><h2>Jak poruszać się na miejscu</h2><p>Najpierw sprawdź, czy wygodniejsza będzie komunikacja, taxi czy auto.</p></div></div>
        <div className="trip-toolkit-grid">
          <div className="trip-toolkit-card"><div className="trip-toolkit-card-head"><BusFront size={21}/><div><h3>Taxi i transport lokalny</h3><p>Sprawdź lokalne aplikacje taxi i dojazd z lotniska, zanim wsiądziesz do pierwszej taksówki.</p></div></div><div className="trip-toolkit-actions"><a href={taxiSearch} target="_blank" rel="noopener noreferrer">Sprawdź taxi w {city} <ExternalLink size={14}/></a><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${city} public transport`)}`} target="_blank" rel="noopener noreferrer"><Map size={14}/> Komunikacja</a></div></div>
          <div className="trip-toolkit-card"><div className="trip-toolkit-card-head"><Car size={21}/><div><h3>Czy warto wynająć auto?</h3><p>Porównaj odległości i parkingi. Jeśli auto ma sens, szukaj odbioru na lotnisku lub blisko hotelu.</p></div></div><div className="trip-toolkit-actions"><a href={carSearch} target="_blank" rel="noopener noreferrer">Porównaj wynajem auta <ExternalLink size={14}/></a></div><div className="trip-service-disclosure">Nie mamy jeszcze skonfigurowanego partnera afiliacyjnego dla wynajmu aut, więc ten link nie jest afiliacyjny.</div></div>
          <div className="trip-toolkit-card"><div className="trip-toolkit-card-head"><MapPin size={21}/><div><h3>Mapa wyjazdu</h3><p>Otwórz atrakcje, restauracje i zapisane miejsca w jednej okolicy.</p></div></div><div className="trip-toolkit-actions"><a className="primary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${city} attractions restaurants`)}`} target="_blank" rel="noopener noreferrer"><Map size={14}/> Otwórz mapę</a></div></div>
        </div>
        <label className="trip-toolkit-label" style={{ marginTop: 12 }}>Twoje notatki o transporcie<textarea value={state.localTransportNotes || ""} onChange={(e) => save({ ...state, localTransportNotes: e.target.value })} placeholder="np. z lotniska najlepszy autobus X, Bolt działa do 23:00, auto odbieramy w terminalu..." /></label>
      </section>

      <section id="foto" className="trip-toolkit-section">
        <div className="trip-section-heading"><div><h2>Photo spots</h2><p>Zapisuj konkretne miejsca, najlepszą porę i wskazówkę, jak tam dojść.</p></div></div>
        <div className="trip-toolkit-grid">
          <div className="trip-toolkit-card trip-photo-card"><div className="trip-toolkit-card-head"><Camera size={21}/><div><h3>Znajdź dobre kadry w {city}</h3><p>Najpierw sprawdź punkty widokowe i zdjęcia na mapie, potem zapisz własny plan.</p></div></div><div className="trip-toolkit-actions"><a className="primary" href={photoSearch} target="_blank" rel="noopener noreferrer"><MapPin size={14}/> Photo spots na mapie</a></div></div>
          <div className="trip-toolkit-card" style={{ gridColumn: "span 2" }}><div className="trip-toolkit-card-head"><Camera size={21}/><div><h3>Zapisz miejsce na zdjęcie</h3><p>Dodaj punkt i wskazówkę typu „45 min przed zachodem” albo „wejście od bocznej uliczki”.</p></div></div><div className="trip-toolkit-form row"><input value={photoSpot.title} onChange={(e) => setPhotoSpot({ ...photoSpot, title: e.target.value })} placeholder="Miejsce / punkt widokowy" /><input value={photoSpot.note} onChange={(e) => setPhotoSpot({ ...photoSpot, note: e.target.value })} placeholder="Pora dnia, dojście, wskazówka" /></div><div className="trip-toolkit-actions"><button className="primary" onClick={addPhotoSpot}><Plus size={16}/> Zapisz spot</button></div><div className="trip-toolkit-list">{state.photoSpots.map((spot) => <div className="trip-toolkit-item" key={spot.id}><Camera size={17}/><div><strong>{spot.title}</strong><small>{spot.note || "Bez notatki"}</small><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.title} ${city}`)}`} target="_blank" rel="noopener noreferrer">Pokaż na mapie <ExternalLink size={13}/></a></div><button onClick={() => save({ ...state, photoSpots: state.photoSpots.filter((x) => x.id !== spot.id) })}><Trash2 size={15}/></button></div>)}</div></div>
        </div>
      </section>

      <section id="formalnosci" className="trip-toolkit-section">
        <div className="trip-section-heading"><div><h2>Formalności i bagaż</h2><p>Trzymaj własne ustalenia obok linków do źródeł, które warto sprawdzić przed wyjazdem.</p></div></div>
        <div className="trip-toolkit-grid">
          <div className="trip-toolkit-card"><div className="trip-toolkit-card-head"><Globe2 size={21}/><div><h3>Wjazd i dokumenty</h3><p>Paszport, wiza/ETA, minimalna ważność dokumentu i wymagania graniczne.</p></div></div><div className="trip-toolkit-actions"><a href={borderSearch} target="_blank" rel="noopener noreferrer">Sprawdź oficjalne informacje <ExternalLink size={14}/></a></div><label className="trip-toolkit-label">Twoja notatka<textarea value={state.entryNotes || ""} onChange={(e) => save({ ...state, entryNotes: e.target.value })} placeholder="np. paszport ważny 6 miesięcy, ETA zrobione..." /></label></div>
          <div className="trip-toolkit-card"><div className="trip-toolkit-card-head"><BriefcaseBusiness size={21}/><div><h3>Bagaż</h3><p>Zapisz taryfę, wymiary i wagę, żeby nie szukać ich tuż przed odprawą.</p></div></div><div className="trip-toolkit-actions"><a href={baggageSearch} target="_blank" rel="noopener noreferrer">Sprawdź limit przewoźnika <ExternalLink size={14}/></a></div><label className="trip-toolkit-label">Twój limit<textarea value={state.baggageNotes || ""} onChange={(e) => save({ ...state, baggageNotes: e.target.value })} placeholder="np. plecak 40×20×25, 10 kg kabinowy..." /></label></div>
          <div className="trip-toolkit-card"><div className="trip-toolkit-card-head"><FileText size={21}/><div><h3>Ważne informacje</h3><p>Numery polis, adres hotelu, kontakt alarmowy i inne dane, które chcesz mieć pod ręką.</p></div></div><div className="trip-inline-note">Nie zapisuj tutaj haseł, PIN-ów ani pełnych danych kart płatniczych.</div></div>
        </div>
      </section>

      <section id="uslugi" className="trip-toolkit-section">
        <div className="trip-section-heading"><div><h2>Do Twojej podróży</h2><p>Usługi pojawiają się tam, gdzie realnie mogą ułatwić wyjazd.</p></div></div>
        <div className="trip-market-grid">
          <a className="trip-market-link" href={gyGuide} target="_blank" rel="sponsored noopener noreferrer"><TicketCheck size={21}/><div><strong>Atrakcje i bilety</strong><span>GetYourGuide dla {city}</span></div><ArrowRight size={16}/></a>
          <a className="trip-market-link" href={booking} target="_blank" rel="sponsored noopener noreferrer"><MapPin size={21}/><div><strong>Noclegi</strong><span>Booking.com w {city}</span></div><ArrowRight size={16}/></a>
          <a className="trip-market-link" href={esim} target="_blank" rel="sponsored noopener noreferrer"><Smartphone size={21}/><div><strong>Internet / eSIM</strong><span>Internet na wyjazd bez szukania lokalnej karty SIM</span></div><ArrowRight size={16}/></a>
          <a className="trip-market-link" href={parking} target="_blank" rel="sponsored noopener noreferrer"><Car size={21}/><div><strong>Parking przy lotnisku</strong><span>Zarezerwuj przed wyjazdem</span></div><ArrowRight size={16}/></a>
          <a className="trip-market-link" href={kiwi} target="_blank" rel="sponsored noopener noreferrer"><Plane size={21}/><div><strong>Loty</strong><span>Porównaj połączenia i alternatywne terminy</span></div><ArrowRight size={16}/></a>
          <a className="trip-market-link" href={`https://www.google.com/search?q=${encodeURIComponent(`${city} travel insurance ${country}`)}`} target="_blank" rel="noopener noreferrer"><ShieldCheck size={21}/><div><strong>Ubezpieczenie</strong><span>Porównaj zakres ochrony pod konkretny wyjazd</span></div><ArrowRight size={16}/></a>
        </div>
        <div className="trip-service-disclosure">Linki do GetYourGuide, Booking.com, Fonia, Parklot i Kiwi mogą być linkami afiliacyjnymi Tripowni. Cena dla użytkownika nie powinna się przez to zwiększać.</div>
      </section>
    </>
  );
}