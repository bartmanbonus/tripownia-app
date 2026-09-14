"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Circle,
  FileText,
  HeartPulse,
  Landmark,
  ListChecks,
  Luggage,
  MapPinned,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  WalletCards,
} from "lucide-react";

type ReservationState = {
  flightRef: string;
  hotelRef: string;
  insuranceRef: string;
  transferRef: string;
  emergencyContact: string;
};

type ItineraryItem = {
  id: string;
  day: number;
  time: string;
  title: string;
};

type OrganizerState = {
  reservations: ReservationState;
  packing: Record<string, boolean>;
  itinerary: ItineraryItem[];
};

const EMPTY_RESERVATIONS: ReservationState = {
  flightRef: "",
  hotelRef: "",
  insuranceRef: "",
  transferRef: "",
  emergencyContact: "",
};

function storageKey(tripId: string) {
  return `tripownia-organizer:${tripId}`;
}

function defaultPacking(country: string, categories: string[], weather: string) {
  const normalized = `${country} ${categories.join(" ")} ${weather}`.toLowerCase();
  const items = [
    "Dokument tożsamości / paszport",
    "Karta płatnicza + zapasowa metoda płatności",
    "Ładowarka i powerbank",
    "Leki przyjmowane na stałe",
    "Potwierdzenia rezerwacji zapisane offline",
  ];

  if (/cieplo|pla[zż]a|sun|hot|egipt|turcj|grecj|cypr|hiszpan|wloch|włoch/.test(normalized)) {
    items.push("Krem SPF", "Okulary przeciwsłoneczne", "Strój kąpielowy");
  }
  if (/trek|gory|góry|active|hike|wietnam|madera/.test(normalized)) {
    items.push("Wygodne buty", "Lekka kurtka przeciwdeszczowa");
  }
  if (/chlod|chłod|winter|snow|island|norweg|finland/.test(normalized)) {
    items.push("Ciepła warstwa", "Kurtka odporna na wiatr/deszcz");
  }
  if (!/ue|europa|polska|niemcy|francja|hiszpan|wloch|włoch|grecj|portugal|czech|austria|wegr|węgr|chorwac|bulgari|rumuni|slowac|słowac|slowen|słowen|litwa|lotwa|łotwa|estoni|malta|cypr/.test(normalized)) {
    items.push("Adapter do gniazdka — sprawdź standard dla kraju", "eSIM / pakiet internetu przed wylotem");
  }

  return [...new Set(items)];
}

function readOrganizer(tripId: string): OrganizerState {
  if (typeof window === "undefined") return { reservations: EMPTY_RESERVATIONS, packing: {}, itinerary: [] };
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(tripId)) || "null") as Partial<OrganizerState> | null;
    return {
      reservations: { ...EMPTY_RESERVATIONS, ...(parsed?.reservations || {}) },
      packing: parsed?.packing && typeof parsed.packing === "object" ? parsed.packing : {},
      itinerary: Array.isArray(parsed?.itinerary) ? parsed.itinerary : [],
    };
  } catch {
    return { reservations: EMPTY_RESERVATIONS, packing: {}, itinerary: [] };
  }
}

export default function TripOrganizer({
  tripId,
  city,
  country,
  nights,
  categories,
  weather,
}: {
  tripId: string;
  city: string;
  country: string;
  nights: number;
  categories: string[];
  weather: string;
}) {
  const [state, setState] = useState<OrganizerState>({ reservations: EMPTY_RESERVATIONS, packing: {}, itinerary: [] });
  const [day, setDay] = useState(1);
  const [time, setTime] = useState("10:00");
  const [title, setTitle] = useState("");

  useEffect(() => {
    setState(readOrganizer(tripId));
    setDay(1);
  }, [tripId]);

  function save(next: OrganizerState) {
    setState(next);
    localStorage.setItem(storageKey(tripId), JSON.stringify(next));
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));
  }

  function setReservation(field: keyof ReservationState, value: string) {
    save({ ...state, reservations: { ...state.reservations, [field]: value } });
  }

  const packingItems = useMemo(() => defaultPacking(country, categories, weather), [country, categories, weather]);
  const packedCount = packingItems.filter((item) => state.packing[item]).length;
  const dayCount = Math.max(2, Math.min(22, Number(nights || 1) + 1));
  const dayItems = useMemo(
    () => state.itinerary.filter((item) => item.day === day).sort((a, b) => a.time.localeCompare(b.time)),
    [state.itinerary, day],
  );

  function togglePacking(item: string) {
    save({ ...state, packing: { ...state.packing, [item]: !state.packing[item] } });
  }

  function addItineraryItem() {
    const clean = title.trim();
    if (!clean) return;
    const item: ItineraryItem = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, day, time, title: clean };
    save({ ...state, itinerary: [...state.itinerary, item] });
    setTitle("");
  }

  function removeItineraryItem(id: string) {
    save({ ...state, itinerary: state.itinerary.filter((item) => item.id !== id) });
  }

  const officialTravelHref = "https://www.gov.pl/web/dyplomacja/informacje-dla-podrozujacych";

  return (
    <section className="trip-organizer" aria-label={`Organizer podróży do ${city}`}>
      <div className="trip-organizer-head">
        <div>
          <div className="kicker">ORGANIZER WYJAZDU</div>
          <h2>Wszystko, co chcesz mieć pod ręką przed i w trakcie podróży</h2>
          <p>Dane zapisują się tylko na tym urządzeniu i są przypisane do tej konkretnej podróży.</p>
        </div>
        <Link href="/moje-podroze">Moje podróże <ChevronRight size={16}/></Link>
      </div>

      <div className="trip-organizer-grid">
        <article className="trip-organizer-card trip-organizer-reservations">
          <div className="trip-organizer-title"><FileText size={20}/><div><strong>Rezerwacje i ważne numery</strong><span>Wpisuj skróty lub numery rezerwacji — nie zapisuj tu haseł ani pełnych danych dokumentów.</span></div></div>
          <div className="trip-organizer-fields">
            <label><span>Lot / kod rezerwacji</span><input value={state.reservations.flightRef} onChange={(e) => setReservation("flightRef", e.target.value)} placeholder="np. ABC123" /></label>
            <label><span>Hotel / kod rezerwacji</span><input value={state.reservations.hotelRef} onChange={(e) => setReservation("hotelRef", e.target.value)} placeholder="np. numer Booking" /></label>
            <label><span>Ubezpieczenie / polisa</span><input value={state.reservations.insuranceRef} onChange={(e) => setReservation("insuranceRef", e.target.value)} placeholder="np. numer polisy" /></label>
            <label><span>Transfer / parking</span><input value={state.reservations.transferRef} onChange={(e) => setReservation("transferRef", e.target.value)} placeholder="np. numer rezerwacji" /></label>
            <label className="wide"><span>Kontakt awaryjny</span><input value={state.reservations.emergencyContact} onChange={(e) => setReservation("emergencyContact", e.target.value)} placeholder="np. imię + telefon" /></label>
          </div>
        </article>

        <article className="trip-organizer-card trip-organizer-packing">
          <div className="trip-organizer-title"><Luggage size={20}/><div><strong>Pakowanie</strong><span>{packedCount}/{packingItems.length} gotowe · lista dopasowana do kierunku i charakteru wyjazdu</span></div></div>
          <div className="trip-packing-progress"><span style={{ width: `${packingItems.length ? Math.round((packedCount / packingItems.length) * 100) : 0}%` }} /></div>
          <div className="trip-packing-list">
            {packingItems.map((item) => {
              const checked = Boolean(state.packing[item]);
              return <button key={item} type="button" className={checked ? "done" : ""} onClick={() => togglePacking(item)}>{checked ? <CheckCircle2 size={18}/> : <Circle size={18}/>}<span>{item}</span></button>;
            })}
          </div>
        </article>
      </div>

      <article className="trip-organizer-card trip-itinerary-card">
        <div className="trip-organizer-title"><MapPinned size={20}/><div><strong>Plan dzień po dniu</strong><span>{city} · do {dayCount} dni planu</span></div></div>
        <div className="trip-day-tabs" role="tablist" aria-label="Dni podróży">
          {Array.from({ length: dayCount }, (_, index) => index + 1).map((value) => (
            <button key={value} type="button" className={value === day ? "active" : ""} onClick={() => setDay(value)}>Dzień {value}</button>
          ))}
        </div>
        <div className="trip-itinerary-add">
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Godzina planu" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addItineraryItem(); }} placeholder={`Co robimy w ${city}?`} />
          <button type="button" onClick={addItineraryItem}><Plus size={17}/> Dodaj</button>
        </div>
        {dayItems.length ? (
          <div className="trip-itinerary-list">
            {dayItems.map((item) => <div key={item.id}><time>{item.time}</time><strong>{item.title}</strong><button type="button" aria-label={`Usuń ${item.title}`} onClick={() => removeItineraryItem(item.id)}><Trash2 size={16}/></button></div>)}
          </div>
        ) : <div className="trip-organizer-empty">Ten dzień jest jeszcze pusty. Dodaj pierwszy punkt planu.</div>}
      </article>

      <article className="trip-organizer-card trip-guide-card">
        <div className="trip-organizer-title"><BookOpen size={20}/><div><strong>Praktyczny poradnik: {country}</strong><span>Najważniejsze rzeczy do sprawdzenia przed wyjazdem — bez zgadywania aktualnych przepisów.</span></div></div>
        <div className="trip-guide-grid">
          <a href={officialTravelHref} target="_blank" rel="noopener noreferrer"><ShieldCheck size={20}/><div><strong>Dokumenty i wjazd</strong><span>Sprawdź aktualne wymagania i komunikaty MSZ przed podróżą.</span></div><ChevronRight size={16}/></a>
          <Link href="/esim"><Smartphone size={20}/><div><strong>Internet</strong><span>Sprawdź roaming i przygotuj eSIM, jeśli będzie potrzebny.</span></div><ChevronRight size={16}/></Link>
          <Link href="/transfery"><BriefcaseBusiness size={20}/><div><strong>Lotnisko → nocleg</strong><span>Zaplanuj transfer zanim wylądujesz.</span></div><ChevronRight size={16}/></Link>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${city} pharmacy hospital`)}`} target="_blank" rel="noopener noreferrer"><HeartPulse size={20}/><div><strong>Zdrowie i pomoc</strong><span>Zobacz apteki i placówki w okolicy pobytu.</span></div><ChevronRight size={16}/></a>
          <a href={`https://www.google.com/search?q=${encodeURIComponent(`${country} currency official`)}`} target="_blank" rel="noopener noreferrer"><WalletCards size={20}/><div><strong>Płatności i waluta</strong><span>Zweryfikuj walutę i przygotuj zapasową metodę płatności.</span></div><ChevronRight size={16}/></a>
          <Link href="/atrakcje"><Landmark size={20}/><div><strong>Atrakcje</strong><span>Zapisz najważniejsze miejsca i bilety przed wyjazdem.</span></div><ChevronRight size={16}/></Link>
        </div>
        <div className="trip-guide-note"><BadgeCheck size={17}/><span>Przepisy wjazdowe, zdrowotne i bezpieczeństwa mogą się zmieniać. Tripownia kieruje do aktualnych źródeł zamiast utrwalać stare informacje.</span></div>
      </article>
    </section>
  );
}
