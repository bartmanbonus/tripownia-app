"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BedDouble, CheckCircle2, Circle, MapPinned, Plane, Ticket, WalletCards, NotebookPen, ArrowRight, Clock3, Map, Plus, Trash2, CloudSun, BellRing, ExternalLink, Sparkles, Landmark, UtensilsCrossed, Waves } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { offers } from "@/lib/offers";
import { estimateTripCost } from "@/lib/tripCost";
import { partners } from "@/lib/partners";

type DayPlanItem = { id: string; time: string; title: string; note?: string };
type WeatherState = { temperature: number; apparent: number; code: number; wind: number; loading?: boolean; error?: string } | null;
type ReminderItem = { label: string; due: string; active: boolean };
type AttractionPick = { title: string; subtitle: string; query: string; icon: "landmark" | "food" | "water" | "sparkles" };

type TripState = {
  offerId?: number;
  flight?: string;
  departureAt?: string;
  hotel?: string;
  notes?: string;
  checklist?: Record<string, boolean>;
  dayPlan?: DayPlanItem[];
  remindersEnabled?: boolean;
};

const checklistItems = [
  "Sprawdź dokumenty",
  "Zrób odprawę online",
  "Dodaj ubezpieczenie",
  "Sprawdź transfer z lotniska",
  "Zarezerwuj atrakcje",
  "Sprawdź internet / eSIM",
];

function weatherLabel(code: number) {
  if (code === 0) return "Bezchmurnie";
  if ([1, 2, 3].includes(code)) return "Częściowe zachmurzenie";
  if ([45, 48].includes(code)) return "Mgła";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Deszcz";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Śnieg";
  if ([95, 96, 99].includes(code)) return "Burze";
  return "Warunki zmienne";
}

function hoursUntil(departureAt?: string) {
  if (!departureAt) return null;
  const departure = new Date(departureAt);
  const hours = Math.round((departure.getTime() - Date.now()) / 3600000);
  return Number.isNaN(hours) ? null : hours;
}

function reminderText(departureAt?: string) {
  const hours = hoursUntil(departureAt);
  if (hours === null) return "Dodaj datę i godzinę wylotu, a Tripownia pokaże, co zrobić przed podróżą.";
  if (hours < -6) return "Wyjazd już się rozpoczął — przełączamy się w tryb podróży.";
  if (hours <= 0) return "To dziś. Sprawdź dokumenty, boarding pass i dojazd na lotnisko.";
  if (hours <= 24) return `Wylot za około ${hours} h. Czas na odprawę i ostatnie sprawdzenie bagażu.`;
  const days = Math.ceil(hours / 24);
  if (days <= 3) return `Wylot za ${days} dni. Sprawdź odprawę, transfer i prognozę pogody.`;
  if (days <= 7) return `Wylot za ${days} dni. Dobry moment na ubezpieczenie, atrakcje i eSIM.`;
  return `Do wyjazdu około ${days} dni. Możesz spokojnie domknąć plan i rezerwacje.`;
}

function buildReminders(departureAt?: string): ReminderItem[] {
  const hours = hoursUntil(departureAt);
  if (hours === null) return [];
  return [
    { label: "Ubezpieczenie, eSIM i atrakcje", due: "7 dni przed", active: hours <= 24 * 7 && hours > 24 * 3 },
    { label: "Transfer i prognoza pogody", due: "3 dni przed", active: hours <= 24 * 3 && hours > 24 },
    { label: "Odprawa online i bagaż", due: "24 h przed", active: hours <= 24 && hours > 4 },
    { label: "Dokumenty i dojazd na lotnisko", due: "4 h przed", active: hours <= 4 && hours >= 0 },
  ];
}

function attractionPicks(city: string, categories: string[]): AttractionPick[] {
  const picks: AttractionPick[] = [
    { title: `Najważniejsze miejsca w ${city}`, subtitle: "Top atrakcje i bilety bez szukania po wielu stronach", query: `${city} top attractions`, icon: "landmark" },
    { title: "Jedzenie i lokalne smaki", subtitle: "Food tour, degustacje i miejsca warte zapisania", query: `${city} food tour`, icon: "food" },
  ];
  if (categories.includes("plaza") || categories.includes("cieplo")) picks.push({ title: "Woda i aktywności", subtitle: "Rejsy, snorkeling, plaże i wycieczki po okolicy", query: `${city} boat tour water activities`, icon: "water" });
  else picks.push({ title: "Coś poza oczywistą trasą", subtitle: "Małe grupy, lokalne wycieczki i mniej oczywiste miejsca", query: `${city} hidden gems tour`, icon: "sparkles" });
  return picks;
}

export default function MyTrip() {
  const [trip, setTrip] = useState<TripState>({ checklist: {}, dayPlan: [] });
  const [newTime, setNewTime] = useState("10:00");
  const [newTitle, setNewTitle] = useState("");
  const [weather, setWeather] = useState<WeatherState>(null);
  const [notificationStatus, setNotificationStatus] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null") as TripState | null;
      if (saved) setTrip({ checklist: {}, dayPlan: [], ...saved });
    } catch {}
  }, []);

  const offer = useMemo(() => offers.find((item) => item.id === trip.offerId), [trip.offerId]);
  const cost = offer ? estimateTripCost(offer) : null;
  const dayPlan = useMemo(() => [...(trip.dayPlan || [])].sort((a, b) => a.time.localeCompare(b.time)), [trip.dayPlan]);
  const reminder = reminderText(trip.departureAt);
  const reminders = useMemo(() => buildReminders(trip.departureAt), [trip.departureAt]);
  const attractions = useMemo(() => offer ? attractionPicks(offer.city, offer.category) : [], [offer]);

  useEffect(() => {
    if (!offer?.city) {
      setWeather(null);
      return;
    }

    let cancelled = false;
    async function loadWeather() {
      setWeather({ temperature: 0, apparent: 0, code: 0, wind: 0, loading: true });
      try {
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(offer!.city)}&count=1&language=pl&format=json`);
        const geo = await geoResponse.json();
        const place = geo?.results?.[0];
        if (!place) throw new Error("Nie znaleziono lokalizacji");
        const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`);
        const forecast = await forecastResponse.json();
        if (cancelled) return;
        setWeather({ temperature: Math.round(forecast.current.temperature_2m), apparent: Math.round(forecast.current.apparent_temperature), code: forecast.current.weather_code, wind: Math.round(forecast.current.wind_speed_10m) });
      } catch {
        if (!cancelled) setWeather({ temperature: 0, apparent: 0, code: 0, wind: 0, error: "Nie udało się pobrać pogody." });
      }
    }

    loadWeather();
    return () => { cancelled = true; };
  }, [offer?.city]);

  function save(next: TripState) {
    setTrip(next);
    localStorage.setItem("tripownia-my-trip", JSON.stringify(next));
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));
  }

  async function enableReminders() {
    if (!("Notification" in window)) {
      setNotificationStatus("Ta przeglądarka nie obsługuje powiadomień.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setNotificationStatus("Powiadomienia nie zostały włączone.");
      return;
    }
    save({ ...trip, remindersEnabled: true });
    setNotificationStatus("Przypomnienia są włączone na tym urządzeniu.");
    try {
      const registration = await navigator.serviceWorker?.ready;
      await registration?.showNotification("Tripownia pilnuje wyjazdu ✈️", { body: reminder, icon: "/tripownia-app-icon.svg", tag: "tripownia-trip-reminder" });
    } catch {}
  }

  function toggleChecklist(item: string) {
    save({ ...trip, checklist: { ...(trip.checklist || {}), [item]: !trip.checklist?.[item] } });
  }

  function addPlanItem() {
    const title = newTitle.trim();
    if (!title) return;
    const item: DayPlanItem = { id: `${Date.now()}`, time: newTime, title };
    save({ ...trip, dayPlan: [...(trip.dayPlan || []), item] });
    setNewTitle("");
  }

  function removePlanItem(id: string) {
    save({ ...trip, dayPlan: (trip.dayPlan || []).filter((item) => item.id !== id) });
  }

  return (
    <main>
      <SiteHeader />
      <section className="shell my-trip-page">
        <div className="my-trip-hero">
          <div className="my-trip-icon"><MapPinned size={30} /></div>
          <div><div className="kicker">MOJA PODRÓŻ</div><h1>{offer ? `${offer.city}, ${offer.country}` : "Zaplanuj wyjazd z Tripownią"}</h1><p>{offer ? `${offer.dates} · ${offer.nights} noce · wylot: ${offer.departure}` : "Dodaj wybraną ofertę, a Tripownia pomoże Ci ogarnąć cały wyjazd w jednym miejscu."}</p></div>
        </div>

        {!offer ? (
          <div className="favorites-empty"><MapPinned size={30} /><h2>Nie masz jeszcze zapisanej podróży</h2><p>Przy wybranej ofercie kliknij „Dodaj do Mojej podróży”.</p><Link className="primary-cta" href="/dla-ciebie">Znajdź wyjazd <ArrowRight size={17}/></Link></div>
        ) : (
          <>
            <section className="trip-mode-grid">
              <div className="trip-mode-card trip-mode-reminder">
                <div className="trip-mode-title"><BellRing size={20}/><strong>Co teraz?</strong></div>
                <p>{reminder}</p>
                <label><span>Data i godzina wylotu</span><input type="datetime-local" value={trip.departureAt || ""} onChange={(e) => save({ ...trip, departureAt: e.target.value })} /></label>
                <button className="trip-reminder-button" onClick={enableReminders}><BellRing size={16}/>{trip.remindersEnabled ? "Przypomnienia włączone" : "Włącz przypomnienia"}</button>
                {notificationStatus && <small>{notificationStatus}</small>}
              </div>

              <div className="trip-mode-card">
                <div className="trip-mode-title"><CloudSun size={20}/><strong>Pogoda teraz</strong></div>
                {weather?.loading ? <p>Sprawdzam pogodę w {offer.city}…</p> : weather?.error ? <p>{weather.error}</p> : weather ? <div className="trip-weather"><strong>{weather.temperature}°C</strong><div><span>{weatherLabel(weather.code)}</span><small>Odczuwalna {weather.apparent}°C · wiatr {weather.wind} km/h</small></div></div> : <p>Brak danych pogodowych.</p>}
              </div>

              <div className="trip-mode-card">
                <div className="trip-mode-title"><Plane size={20}/><strong>Status lotu</strong></div>
                <input value={trip.flight || ""} onChange={(e) => save({ ...trip, flight: e.target.value })} placeholder="np. FR 1234" />
                {trip.flight?.trim() ? <a href={`https://www.google.com/search?q=${encodeURIComponent(`${trip.flight} flight status`)}`} target="_blank" rel="noopener noreferrer">Sprawdź status lotu <ExternalLink size={15}/></a> : <small>Dodaj numer rejsu, aby szybko sprawdzić aktualny status.</small>}
              </div>
            </section>

            {reminders.length > 0 && <section className="trip-reminders-strip">{reminders.map((item) => <div key={item.label} className={item.active ? "active" : ""}><span>{item.due}</span><strong>{item.label}</strong>{item.active && <em>TERAZ</em>}</div>)}</section>}

            <div className="my-trip-grid">
              <section className="my-trip-card"><div className="my-trip-card-head"><Plane size={20}/><h2>Transport</h2></div><p><strong>{offer.departure}</strong> → {offer.city}</p><input value={trip.flight || ""} onChange={(e) => save({ ...trip, flight: e.target.value })} placeholder="Dodaj numer lotu / godzinę" /></section>
              <section className="my-trip-card"><div className="my-trip-card-head"><BedDouble size={20}/><h2>Hotel</h2></div><p><strong>{offer.hotel}</strong> · {offer.board}</p><input value={trip.hotel || ""} onChange={(e) => save({ ...trip, hotel: e.target.value })} placeholder="Dodaj numer rezerwacji / adres" /></section>
              <section className="my-trip-card"><div className="my-trip-card-head"><WalletCards size={20}/><h2>Budżet</h2></div><div className="my-trip-budget"><span>Oferta</span><strong>{offer.price.toLocaleString("pl-PL")} zł</strong></div>{cost && <div className="my-trip-budget total"><span>Szacowany pełny koszt</span><strong>{cost.total.toLocaleString("pl-PL")} zł / os.</strong></div>}<Link href="/porownaj">Porównaj z innymi ofertami →</Link></section>
              <section className="my-trip-card"><div className="my-trip-card-head"><Ticket size={20}/><h2>Co ogarnąć</h2></div><div className="my-trip-checklist">{checklistItems.map((item) => { const checked = Boolean(trip.checklist?.[item]); return <button key={item} onClick={() => toggleChecklist(item)}>{checked ? <CheckCircle2 size={18}/> : <Circle size={18}/>}<span>{item}</span></button>; })}</div></section>
            </div>

            <section className="my-trip-card trip-attractions">
              <div className="my-trip-card-head"><Sparkles size={20}/><h2>Co warto zrobić w {offer.city}</h2></div>
              <p className="my-trip-subcopy">Tripownia podpowiada typ atrakcji pasujący do kierunku. Ceny i dostępność sprawdzasz u partnera.</p>
              <div className="trip-attractions-grid">
                {attractions.map((pick) => {
                  const Icon = pick.icon === "landmark" ? Landmark : pick.icon === "food" ? UtensilsCrossed : pick.icon === "water" ? Waves : Sparkles;
                  const destination = `https://www.getyourguide.pl/s/?q=${encodeURIComponent(pick.query)}`;
                  return <a key={pick.title} href={partners.getyourguide.buildUrl(destination)} target="_blank" rel="sponsored noopener noreferrer"><Icon size={20}/><div><strong>{pick.title}</strong><span>{pick.subtitle}</span></div><ExternalLink size={15}/></a>;
                })}
              </div>
            </section>

            <section className="my-trip-card my-trip-today">
              <div className="my-trip-card-head"><Clock3 size={20}/><h2>Co robić dziś</h2></div><p className="my-trip-subcopy">Ułóż prosty plan dnia i miej go pod ręką w telefonie.</p>
              <div className="my-trip-plan-add"><input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} aria-label="Godzina" /><input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addPlanItem(); }} placeholder="np. Koloseum, plaża, kolacja w centrum" /><button onClick={addPlanItem}><Plus size={17}/> Dodaj</button></div>
              {dayPlan.length ? <div className="my-trip-timeline">{dayPlan.map((item) => <div className="my-trip-timeline-item" key={item.id}><span className="my-trip-time">{item.time}</span><div><strong>{item.title}</strong>{item.note ? <small>{item.note}</small> : null}</div><button onClick={() => removePlanItem(item.id)} aria-label={`Usuń ${item.title}`}><Trash2 size={16}/></button></div>)}</div> : <div className="my-trip-empty-line">Dodaj pierwszy punkt dnia.</div>}
              <div className="my-trip-quick-links"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${offer.city} attractions`)}`} target="_blank" rel="noopener noreferrer"><Map size={17}/> Atrakcje na mapie</a><Link href="/inspiracje"><Ticket size={17}/> Inspiracje Tripowni</Link></div>
            </section>

            <section className="my-trip-card my-trip-notes"><div className="my-trip-card-head"><NotebookPen size={20}/><h2>Notatki</h2></div><textarea value={trip.notes || ""} onChange={(e) => save({ ...trip, notes: e.target.value })} placeholder="Restauracje, atrakcje, adresy, pomysły..." rows={5} /></section>
          </>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
