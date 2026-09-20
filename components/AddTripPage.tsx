"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPinned, Plane, BedDouble, NotebookPen, Route } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ACTIVE_TRIP_KEY, readActiveTrip, upsertTripArchive } from "@/lib/tripArchive";

function dateLabel(start: string, end: string) {
  if (!start) return "Termin do uzupełnienia";
  const formatter = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });
  const startDate = new Date(`${start}T12:00:00`);
  if (!end) return formatter.format(startDate);
  const endDate = new Date(`${end}T12:00:00`);
  return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
}

function nightsBetween(start: string, end: string) {
  if (!start || !end) return 1;
  const from = new Date(`${start}T12:00:00`).getTime();
  const to = new Date(`${end}T12:00:00`).getTime();
  return Math.max(1, Math.round((to - from) / 86400000));
}

export default function AddTripPage() {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departureAt, setDepartureAt] = useState("");
  const [departure, setDeparture] = useState("");
  const [flight, setFlight] = useState("");
  const [hotel, setHotel] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const nights = useMemo(() => nightsBetween(startDate, endDate), [startDate, endDate]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!city.trim() || !country.trim() || !startDate || !endDate) {
      setError("Uzupełnij kierunek oraz daty podróży.");
      return;
    }

    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      setError("Data powrotu nie może być wcześniejsza niż data wyjazdu.");
      return;
    }

    const createdAt = Date.now();
    const offerId = -createdAt;
    const tripId = `trip-custom-${createdAt}-${Math.random().toString(36).slice(2, 8)}`;
    const snapshot = {
      id: offerId,
      flag: "🌍",
      city: city.trim(),
      country: country.trim(),
      price: 0,
      departure: departure.trim() || "Własny transport",
      airportCode: "",
      nights,
      weather: "",
      score: 0,
      tag: "OKAZJA" as const,
      reason: "Własna podróż dodana do organizera Tripowni.",
      image: "/tripownia-app-icon-v2.png",
      category: [],
      hotel: hotel.trim() || "Nocleg do uzupełnienia",
      board: "",
      dates: dateLabel(startDate, endDate),
      startDateISO: startDate,
      endDateISO: endDate,
      partner: "kiwi" as const,
      affiliateUrl: "/organizer",
      manual: true,
    };
    const trip = {
      tripId,
      offerId,
      offerSnapshot: snapshot,
      departureAt: departureAt || `${startDate}T08:00`,
      flight: flight.trim(),
      hotel: hotel.trim(),
      notes: notes.trim(),
      checklist: {},
      dayPlan: [],
    };

    const previous = readActiveTrip();
    if (previous?.tripId && previous.tripId !== tripId) upsertTripArchive(previous, false);
    localStorage.setItem(ACTIVE_TRIP_KEY, JSON.stringify(trip));
    upsertTripArchive(trip);
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));
    window.location.href = "/organizer";
  }

  return (
    <main>
      <SiteHeader />
      <section className="shell add-trip-page">
        <header className="add-trip-hero">
          <div className="add-trip-icon"><Route size={28}/></div>
          <div>
            <div className="kicker">MASZ JUŻ WYJAZD?</div>
            <h1>Dodaj własną podróż</h1>
            <p>Lot i hotel możesz mieć kupione gdziekolwiek. Tripownia uporządkuje termin, rezerwacje, pakowanie, plan dnia i rzeczy do zrobienia przed wylotem.</p>
          </div>
        </header>

        <form className="add-trip-form" onSubmit={submit}>
          <section className="add-trip-section">
            <div className="add-trip-section-title"><MapPinned size={20}/><div><strong>Gdzie jedziesz?</strong><span>Wystarczą podstawowe dane. Resztę możesz uzupełniać później.</span></div></div>
            <div className="add-trip-grid two">
              <label><span>Miasto / region *</span><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="np. Hanoi" autoComplete="address-level2" /></label>
              <label><span>Kraj *</span><input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="np. Wietnam" autoComplete="country-name" /></label>
            </div>
          </section>

          <section className="add-trip-section">
            <div className="add-trip-section-title"><CalendarDays size={20}/><div><strong>Kiedy?</strong><span>Daty pozwolą Tripowni ustawić priorytety przed wyjazdem i liczbę dni planu.</span></div></div>
            <div className="add-trip-grid three">
              <label><span>Wyjazd *</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
              <label><span>Powrót *</span><input type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
              <label><span>Wylot / start podróży</span><input type="datetime-local" value={departureAt} onChange={(event) => setDepartureAt(event.target.value)} /></label>
            </div>
            {startDate && endDate && <div className="add-trip-summary"><CalendarDays size={16}/><span>{dateLabel(startDate, endDate)} · {nights} {nights === 1 ? "noc" : "nocy"}</span></div>}
          </section>

          <section className="add-trip-section">
            <div className="add-trip-section-title"><Plane size={20}/><div><strong>Transport i nocleg</strong><span>Opcjonalnie — przydadzą się potem w trybie podróży.</span></div></div>
            <div className="add-trip-grid two">
              <label><span>Skąd wyruszasz?</span><input value={departure} onChange={(event) => setDeparture(event.target.value)} placeholder="np. Warszawa Chopina" /></label>
              <label><span>Numer lotu</span><input value={flight} onChange={(event) => setFlight(event.target.value)} placeholder="np. QR 260" /></label>
              <label className="wide"><span><BedDouble size={14}/> Hotel / nocleg</span><input value={hotel} onChange={(event) => setHotel(event.target.value)} placeholder="np. nazwa hotelu albo dzielnica" /></label>
            </div>
          </section>

          <section className="add-trip-section">
            <div className="add-trip-section-title"><NotebookPen size={20}/><div><strong>Notatka</strong><span>Bez haseł i pełnych danych dokumentów — te informacje zostają na tym urządzeniu.</span></div></div>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="np. odbiór z lotniska, numer terminala, ważna informacja dla współpodróżnych" rows={4} />
          </section>

          {error && <div className="add-trip-error" role="alert">{error}</div>}
          <div className="add-trip-actions">
            <button type="submit" className="primary-cta">Utwórz podróż <ArrowRight size={17}/></button>
            <Link href="/okazje">Jeszcze szukam wyjazdu</Link>
          </div>
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}
