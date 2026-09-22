"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Car,
  CheckCircle2,
  ExternalLink,
  ListChecks,
  MapPinned,
  NotebookPen,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ACTIVE_TRIP_KEY, upsertTripArchive } from "@/lib/tripArchive";
import { ensureFreshAccountSession, readAccountSession, saveTripowniaUserState, type AccountSession } from "@/lib/accountAuth";
import { collectLocalAccountState } from "@/lib/accountState";
import { partners } from "@/lib/partners";

type PieceKey = "flight" | "hotel" | "transfer" | "attractions";
type PieceState = Record<PieceKey, boolean>;

const initialPieces: PieceState = {
  flight: false,
  hotel: false,
  transfer: false,
  attractions: false,
};

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

function norm(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function slug(value: string) {
  return norm(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function kiwiOrigin(value: string) {
  const n = norm(value);
  if (n.includes("krak")) return "krakow-polska";
  if (n.includes("katow")) return "katowice-polska";
  if (n.includes("gdansk")) return "gdansk-polska";
  if (n.includes("wrocl")) return "wroclaw-polska";
  if (n.includes("poznan")) return "poznan-polska";
  return "warszawa-polska";
}

function buildSuggestions(city: string, country: string, start: string, end: string, departure: string) {
  const place = [city.trim(), country.trim()].filter(Boolean).join(", ");

  const kiwi = new URL("https://www.kiwi.com/pl/");
  kiwi.searchParams.set("origin", kiwiOrigin(departure));
  kiwi.searchParams.set("destination", slug(city || country));
  if (start) kiwi.searchParams.set("outboundDate", start);
  if (end) kiwi.searchParams.set("inboundDate", end);
  kiwi.searchParams.set("adults", "2");
  kiwi.searchParams.set("currency", "PLN");

  const booking = new URL("https://www.booking.com/searchresults.pl.html");
  booking.searchParams.set("ss", place);
  if (start) booking.searchParams.set("checkin", start);
  if (end) booking.searchParams.set("checkout", end);
  booking.searchParams.set("group_adults", "2");
  booking.searchParams.set("no_rooms", "1");

  const attractions = new URL("https://www.getyourguide.pl/s/");
  attractions.searchParams.set("q", `${place} atrakcje`);

  return {
    flight: partners.kiwi.buildUrl(kiwi.toString()),
    hotel: partners.booking.buildUrl(booking.toString()),
    attractions: partners.getyourguide.buildUrl(attractions.toString()),
    transfer: partners.kiwitaxi.buildUrl(),
    transferAlt: partners.gettransfer.buildUrl(),
  };
}

function PieceToggle({
  icon,
  title,
  checked,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`trip-piece-toggle${checked ? " active" : ""}`} onClick={onClick}>
      {icon}
      <span><strong>{title}</strong><small>{checked ? "Mam już — pomiń propozycje" : "Nie mam — pokaż propozycje"}</small></span>
      {checked ? <CheckCircle2 size={19}/> : <span className="trip-piece-dot"/>}
    </button>
  );
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
  const [pieces, setPieces] = useState<PieceState>(initialPieces);
  const [selectedProvider, setSelectedProvider] = useState<Partial<Record<PieceKey, string>>>({});
  const [error, setError] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [session, setSession] = useState<AccountSession | null>(null);

  const nights = useMemo(() => nightsBetween(startDate, endDate), [startDate, endDate]);
  const suggestions = useMemo(
    () => buildSuggestions(city, country, startDate, endDate, departure),
    [city, country, startDate, endDate, departure],
  );
  const basicsReady = Boolean(city.trim() && country.trim() && startDate && endDate);
  const missingCount = Object.values(pieces).filter((value) => !value).length;
  const resolvedCount = (Object.keys(pieces) as PieceKey[]).filter((key) => pieces[key] || selectedProvider[key]).length;
  const plannerStep = !basicsReady ? 1 : resolvedCount < 4 ? 2 : notes.trim() ? 4 : 3;

  useEffect(() => {
    let cancelled = false;
    void ensureFreshAccountSession(readAccountSession()).then((currentSession) => {
      if (cancelled) return;
      setSession(currentSession);
      setSignedIn(Boolean(currentSession));
      setAuthReady(true);

      if (currentSession) {
        try {
          const raw = sessionStorage.getItem("tripownia-pending-offer-v1");
          const pending = raw ? JSON.parse(raw) as Record<string, unknown> : null;
          if (pending) {
            if (typeof pending.city === "string") setCity(pending.city);
            if (typeof pending.country === "string") setCountry(pending.country);
            if (typeof pending.departure === "string") setDeparture(pending.departure);
            if (typeof pending.hotel === "string") setHotel(pending.hotel);
            if (typeof pending.startDateISO === "string") setStartDate(pending.startDateISO);
            if (typeof pending.endDateISO === "string") setEndDate(pending.endDateISO);
            setPieces({
              flight: true,
              hotel: true,
              transfer: Boolean(pending.transferIncluded),
              attractions: false,
            });
            sessionStorage.removeItem("tripownia-pending-offer-v1");
          }
        } catch {
          sessionStorage.removeItem("tripownia-pending-offer-v1");
        }
      }
    });
    return () => { cancelled = true; };
  }, []);

  function togglePiece(key: PieceKey) {
    setPieces((current) => ({ ...current, [key]: !current[key] }));
    setSelectedProvider((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function chooseProvider(key: PieceKey, provider: string) {
    setSelectedProvider((current) => ({ ...current, [key]: provider }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!signedIn) {
      window.location.href = "/konto?next=/dodaj-podroz";
      return;
    }

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
      departure: departure.trim() || "Do ustalenia",
      airportCode: "",
      nights,
      weather: "",
      score: 0,
      tag: "OKAZJA" as const,
      reason: "Własna podróż ułożona bezpłatnie w Tripowni.",
      image: "/tripownia-app-icon-v2.png",
      category: [],
      hotel: hotel.trim() || (pieces.hotel ? "Nocleg użytkownika" : "Nocleg do wyboru"),
      board: "",
      dates: dateLabel(startDate, endDate),
      partner: "kiwi" as const,
      affiliateUrl: "/moja-podroz",
      manual: true,
      transferIncluded: pieces.transfer,
    };

    const trip = {
      tripId,
      offerId,
      offerSnapshot: snapshot,
      departureAt: departureAt || `${startDate}T08:00`,
      flight: pieces.flight ? flight.trim() : "",
      hotel: pieces.hotel ? hotel.trim() : "",
      notes: notes.trim(),
      checklist: {
        "Sprawdź transfer z lotniska i taxi na miejscu": pieces.transfer,
        "Zarezerwuj najważniejsze atrakcje": pieces.attractions,
      },
      dayPlan: [],
      journeyPieces: {
        flight: { status: pieces.flight ? "owned" : selectedProvider.flight ? "selected" : "missing", provider: selectedProvider.flight || "" },
        hotel: { status: pieces.hotel ? "owned" : selectedProvider.hotel ? "selected" : "missing", provider: selectedProvider.hotel || "" },
        transfer: { status: pieces.transfer ? "owned" : selectedProvider.transfer ? "selected" : "missing", provider: selectedProvider.transfer || "" },
        attractions: { status: pieces.attractions ? "owned" : selectedProvider.attractions ? "selected" : "missing", provider: selectedProvider.attractions || "" },
      },
      suggestedLinks: suggestions,
    };

    localStorage.setItem(ACTIVE_TRIP_KEY, JSON.stringify(trip));
    upsertTripArchive(trip);
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));

    if (session) {
      try {
        await saveTripowniaUserState(session, collectLocalAccountState());
      } catch {
        setError("Plan zapisano na tym urządzeniu, ale synchronizacja konta chwilowo się nie udała. Spróbuj ponownie za moment.");
        return;
      }
    }

    window.location.href = "/moja-podroz";
  }

  return (
    <main>
      <SiteHeader />
      <section className="shell add-trip-page">
        {authReady && !signedIn && (
          <div className="account-message" role="status">
            Plan jest prywatny i przypisany do konta. Możesz przejść cały kreator, ale zapis wymaga logowania.{" "}
            <Link href="/konto?next=/dodaj-podroz">Zaloguj się →</Link>
          </div>
        )}

        <header className="add-trip-hero">
          <div className="add-trip-icon"><Route size={28}/></div>
          <div>
            <div className="kicker">TWÓJ PLAN — 0 ZŁ</div>
            <h1>My układamy. Ty tylko wybierasz.</h1>
            <p>Tak jak w płatnych planach podróży — tylko u nas za darmo. Podajesz kierunek i termin, zaznaczasz co już masz, a Tripownia pokazuje brakujące elementy i gotowe miejsca, gdzie możesz je dobrać.</p>
          </div>
        </header>

        <div className="add-trip-promise">
          <div><Sparkles size={18}/><span><strong>Gotowe podpowiedzi</strong><small>nie musisz szukać każdej rzeczy osobno</small></span></div>
          <div><ListChecks size={18}/><span><strong>Pomijamy to, co już masz</strong><small>nie sprzedajemy drugi raz tej samej usługi</small></span></div>
          <div><Ticket size={18}/><span><strong>Cały wyjazd w jednym planie</strong><small>lot, nocleg, transfer, atrakcje i przygotowanie</small></span></div>
          <div><ShieldCheck size={18}/><span><strong>0 zł za planner</strong><small>Tripownia zarabia na afiliacji partnerów</small></span></div>
        </div>

        <form className="add-trip-form" onSubmit={submit}>
          <div className="add-trip-progress" aria-label={`Krok ${plannerStep} z 4`}>
            {[1,2,3,4].map((step) => <span key={step} className={step <= plannerStep ? "done" : ""}/>)}
          </div>
          <div className="add-trip-progress-copy"><span>Krok {plannerStep} z 4</span><span>{plannerStep === 1 ? "Kierunek" : plannerStep === 2 ? "Co już masz" : plannerStep === 3 ? "Uzupełniamy braki" : "Zapis planu"}</span></div>
          <section className="add-trip-section">
            <div className="add-trip-section-title"><MapPinned size={20}/><div><strong>1. Dokąd i kiedy?</strong><span>To wystarczy, żeby Tripownia zaczęła układać wyjazd.</span></div></div>
            <div className="add-trip-grid two">
              <label><span>Miasto / region *</span><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="np. Hanoi" autoComplete="address-level2" /></label>
              <label><span>Kraj *</span><input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="np. Wietnam" autoComplete="country-name" /></label>
            </div>
            <div className="add-trip-grid three">
              <label><span>Wyjazd *</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
              <label><span>Powrót *</span><input type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
              <label><span>Skąd ruszasz?</span><input value={departure} onChange={(event) => setDeparture(event.target.value)} placeholder="np. Warszawa" /></label>
            </div>
            {startDate && endDate && <div className="add-trip-summary"><CalendarDays size={16}/><span>{dateLabel(startDate, endDate)} · {nights} {nights === 1 ? "noc" : "nocy"}</span></div>}
          </section>

          <section className="add-trip-section">
            <div className="add-trip-section-title"><CheckCircle2 size={20}/><div><strong>2. Co już masz?</strong><span>Zaznacz gotowe elementy. Tripownia nie będzie ich proponować ponownie.</span></div></div>
            <div className="trip-piece-grid">
              <PieceToggle icon={<Plane size={20}/>} title="Lot / transport do celu" checked={pieces.flight} onClick={() => togglePiece("flight")} />
              <PieceToggle icon={<BedDouble size={20}/>} title="Hotel / nocleg" checked={pieces.hotel} onClick={() => togglePiece("hotel")} />
              <PieceToggle icon={<Car size={20}/>} title="Transfer z lotniska" checked={pieces.transfer} onClick={() => togglePiece("transfer")} />
              <PieceToggle icon={<Ticket size={20}/>} title="Atrakcje / bilety" checked={pieces.attractions} onClick={() => togglePiece("attractions")} />
            </div>

            {(pieces.flight || pieces.hotel) && (
              <div className="add-trip-grid two trip-owned-details">
                {pieces.flight && <label><span>Numer lotu / szczegóły</span><input value={flight} onChange={(event) => setFlight(event.target.value)} placeholder="np. QR 260 — opcjonalnie" /></label>}
                {pieces.hotel && <label><span>Hotel / adres</span><input value={hotel} onChange={(event) => setHotel(event.target.value)} placeholder="np. nazwa hotelu — opcjonalnie" /></label>}
                {pieces.flight && <label><span>Godzina startu</span><input type="datetime-local" value={departureAt} onChange={(event) => setDepartureAt(event.target.value)} /></label>}
              </div>
            )}
          </section>

          <section className="add-trip-section trip-plan-suggestions">
            <div className="add-trip-section-title"><Sparkles size={20}/><div><strong>3. Tripownia uzupełnia brakujące elementy</strong><span>{basicsReady ? `Brakuje ${missingCount} z 4 elementów. Wybierz propozycję albo zostaw ją na później.` : "Najpierw wpisz kierunek i daty, żeby przygotować właściwe linki."}</span></div></div>

            {!basicsReady ? (
              <div className="trip-plan-waiting">Uzupełnij kierunek i termin — wtedy pokażemy gotowe propozycje lotu, noclegu, transferu i atrakcji.</div>
            ) : (
              <div className="trip-plan-option-grid">
                {!pieces.flight && (
                  <article className={`trip-plan-option${selectedProvider.flight ? " selected" : ""}`}>
                    <Plane size={22}/>
                    <div><small>LOT</small><h3>Kiwi.com</h3><p>Lot dopasowany do kierunku i terminu. Otwieramy gotowe wyszukiwanie.</p></div>
                    <div className="trip-plan-option-actions">
                      <a href={suggestions.flight} target="_blank" rel="sponsored noopener noreferrer">1. Sprawdź loty <ExternalLink size={14}/></a>
                      <button className="trip-confirm-choice" type="button" onClick={() => chooseProvider("flight", "Kiwi.com")}>{selectedProvider.flight ? "Dodane do planu ✓" : "2. Dodaj wybraną opcję do planu"}</button>
                    </div>
                  </article>
                )}

                {!pieces.hotel && (
                  <article className={`trip-plan-option${selectedProvider.hotel ? " selected" : ""}`}>
                    <BedDouble size={22}/>
                    <div><small>NOCLEG</small><h3>Booking.com</h3><p>Noclegi w Twoim kierunku i terminie. Nie musisz zaczynać wyszukiwania od zera.</p></div>
                    <div className="trip-plan-option-actions">
                      <a href={suggestions.hotel} target="_blank" rel="sponsored noopener noreferrer">1. Sprawdź noclegi <ExternalLink size={14}/></a>
                      <button className="trip-confirm-choice" type="button" onClick={() => chooseProvider("hotel", "Booking.com")}>{selectedProvider.hotel ? "Dodane do planu ✓" : "2. Dodaj wybraną opcję do planu"}</button>
                    </div>
                  </article>
                )}

                {!pieces.transfer && (
                  <article className={`trip-plan-option${selectedProvider.transfer ? " selected" : ""}`}>
                    <Car size={22}/>
                    <div><small>TRANSFER</small><h3>Kiwitaxi / GetTransfer</h3><p>Jeśli transferu nie ma w pakiecie, wybierz dojazd z lotniska do noclegu.</p></div>
                    <div className="trip-plan-option-actions">
                      <a href={suggestions.transfer} target="_blank" rel="sponsored noopener noreferrer">Sprawdź Kiwitaxi <ExternalLink size={14}/></a>
                      <a href={suggestions.transferAlt} target="_blank" rel="sponsored noopener noreferrer">Sprawdź GetTransfer <ExternalLink size={14}/></a>
                      <button className="trip-confirm-choice" type="button" onClick={() => chooseProvider("transfer", "Kiwitaxi")}>{selectedProvider.transfer ? "Transfer dodany do planu ✓" : "Mam wybraną opcję — dodaj do planu"}</button>
                    </div>
                  </article>
                )}

                {!pieces.attractions && (
                  <article className={`trip-plan-option${selectedProvider.attractions ? " selected" : ""}`}>
                    <Ticket size={22}/>
                    <div><small>ATRAKCJE</small><h3>GetYourGuide</h3><p>Najpopularniejsze bilety i wycieczki dla wybranego miejsca. Dodajesz tylko te, które chcesz.</p></div>
                    <div className="trip-plan-option-actions">
                      <a href={suggestions.attractions} target="_blank" rel="sponsored noopener noreferrer">1. Sprawdź atrakcje <ExternalLink size={14}/></a>
                      <button className="trip-confirm-choice" type="button" onClick={() => chooseProvider("attractions", "GetYourGuide")}>{selectedProvider.attractions ? "Dodane do planu ✓" : "2. Dodaj wybrane atrakcje do planu"}</button>
                    </div>
                  </article>
                )}

                {missingCount === 0 && (
                  <div className="trip-plan-complete"><CheckCircle2 size={22}/><div><strong>Masz już komplet podstaw.</strong><span>Przechodzimy dalej do dokumentów, pogody, planu dnia, checklisty i informacji na miejscu.</span></div></div>
                )}
              </div>
            )}
          </section>

          <section className="add-trip-section">
            <div className="add-trip-section-title"><NotebookPen size={20}/><div><strong>4. Co jeszcze zapamiętać?</strong><span>Opcjonalna notatka. Resztę będziesz uzupełniać już w swoim planie.</span></div></div>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="np. późny przylot, dziecko w podróży, chcemy dużo zwiedzać..." rows={4} />
          </section>

          {error && <div className="add-trip-error" role="alert">{error}</div>}
          <div className="add-trip-actions">
            <button type="submit" className="primary-cta">{signedIn ? "Zapisz mój darmowy plan" : "Zaloguj się i zapisz plan"} <ArrowRight size={17}/></button>
            <Link href="/#wyszukiwarka">Najpierw chcę znaleźć cały wyjazd</Link>
          </div>
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}
