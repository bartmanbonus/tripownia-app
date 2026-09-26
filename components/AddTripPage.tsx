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
  Smartphone,
  ParkingCircle,
  Sparkles,
  Ticket,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ACTIVE_TRIP_KEY, upsertTripArchive } from "@/lib/tripArchive";
import { ensureFreshAccountSession, readAccountSession, saveTripowniaUserState, type AccountSession } from "@/lib/accountAuth";
import { collectLocalAccountState } from "@/lib/accountState";
import { partners } from "@/lib/partners";
import { offers, type Offer } from "@/lib/offers";
import { trackEvent } from "@/lib/analytics";
import { trackMetaCustomEvent } from "@/lib/metaPixel";

type PieceKey = "flight" | "hotel" | "transfer" | "attractions" | "esim" | "parking";
type PieceState = Record<PieceKey, boolean>;

const initialPieces: PieceState = {
  flight: false,
  hotel: false,
  transfer: false,
  attractions: false,
  esim: false,
  parking: false,
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

function kiwiOrigin(value: string): string | null {
  const n = norm(value);
  if (n.includes("krak")) return "krakow-polska";
  if (n.includes("katow")) return "katowice-polska";
  if (n.includes("gdansk")) return "gdansk-polska";
  if (n.includes("wrocl")) return "wroclaw-polska";
  if (n.includes("poznan")) return "poznan-polska";
  if (n.includes("warsz") || n.includes("chopin") || n.includes("modlin")) return "warszawa-polska";
  return null;
}

function buildSuggestions(city: string, country: string, start: string, end: string, departure: string) {
  const place = [city.trim(), country.trim()].filter(Boolean).join(", ");

  const kiwi = new URL("https://www.kiwi.com/pl/");
  const origin = kiwiOrigin(departure);
  if (origin) kiwi.searchParams.set("origin", origin);
  if (city.trim() || country.trim()) kiwi.searchParams.set("destination", slug(city || country));
  if (start) kiwi.searchParams.set("outboundDate", start);
  if (end) kiwi.searchParams.set("inboundDate", end);
  kiwi.searchParams.set("adults", "2");
  kiwi.searchParams.set("currency", "PLN");

  const booking = new URL("https://www.booking.com/searchresults.pl.html");
  if (place) booking.searchParams.set("ss", place);
  if (start) booking.searchParams.set("checkin", start);
  if (end) booking.searchParams.set("checkout", end);
  booking.searchParams.set("group_adults", "2");
  booking.searchParams.set("no_rooms", "1");

  const attractions = new URL("https://www.getyourguide.pl/s/");
  if (place) attractions.searchParams.set("q", `${place} atrakcje`);

  return {
    flight: partners.kiwi.buildUrl(kiwi.toString()),
    hotel: partners.booking.buildUrl(booking.toString()),
    attractions: partners.getyourguide.buildUrl(attractions.toString()),
    transfer: partners.kiwitaxi.buildUrl(),
    transferAlt: partners.gettransfer.buildUrl(),
    esim: partners.fonia.buildUrl(),
    parking: partners.parklot.buildUrl(),
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
    <button type="button" aria-pressed={checked} className={`trip-piece-toggle${checked ? " active" : ""}`} onClick={onClick}>
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
  const [destinationMode, setDestinationMode] = useState<"open" | "known">("open");
  const [skipDestinationChoice, setSkipDestinationChoice] = useState(false);
  const [dateMode, setDateMode] = useState<"flexible" | "range" | "month">("flexible");
  const [travelMonth, setTravelMonth] = useState("");
  const [flexNights, setFlexNights] = useState("3-7");
  const [weekendRequired, setWeekendRequired] = useState(false);
  const [departureMode, setDepartureMode] = useState<"any" | "selected">("any");
  const [departureOptions, setDepartureOptions] = useState<string[]>([]);
  const [flight, setFlight] = useState("");
  const [hotel, setHotel] = useState("");
  const [notes, setNotes] = useState("");
  const [pieces, setPieces] = useState<PieceState>(initialPieces);
  const [selectedProvider, setSelectedProvider] = useState<Partial<Record<PieceKey, string>>>({});
  const [error, setError] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [ownedMode, setOwnedMode] = useState(false);
  const [session, setSession] = useState<AccountSession | null>(null);

  const nights = useMemo(() => nightsBetween(startDate, endDate), [startDate, endDate]);
  const suggestions = useMemo(
    () => buildSuggestions(city, country, startDate, endDate, departure),
    [city, country, startDate, endDate, departure],
  );
  const hasSpecificDestination = Boolean(city.trim() || country.trim());
  const hasDates = dateMode === "flexible" || (dateMode === "month" ? Boolean(travelMonth) : Boolean(startDate && endDate));
  const basicsReady = hasSpecificDestination && hasDates;
  const openOfferSuggestions = useMemo(
    () => [...offers]
      .filter((offer) => offer.partner !== "wakacje" && offer.availabilityStatus !== "expired")
      .sort((a, b) => (b.score - a.score) || (a.price - b.price))
      .slice(0, 6),
    [],
  );
  const missingCount = Object.values(pieces).filter((value) => !value).length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const owned = new URLSearchParams(window.location.search).get("mode") === "owned";
    setOwnedMode(owned);
    if (owned) { setDestinationMode("known"); setDateMode("range"); }
  }, []);

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
              esim: false,
              parking: false,
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("source") !== "sport") return;

    const sportCity = (params.get("city") || "").trim();
    const sportCountry = (params.get("country") || "").trim();
    const sportStart = (params.get("start") || "").trim();
    const sportEnd = (params.get("end") || "").trim();
    const sportDeparture = (params.get("departure") || "").trim();
    const match = (params.get("match") || "").trim();
    const venue = (params.get("venue") || "").trim();
    const ticket = (params.get("ticket") || "").trim();

    if (sportCity || sportCountry) {
      setDestinationMode("known");
      setCity(sportCity);
      setCountry(sportCountry);
    }
    if (sportStart && sportEnd) {
      setDateMode("range");
      setStartDate(sportStart);
      setEndDate(sportEnd);
    }
    if (sportDeparture) {
      setDepartureMode("selected");
      setDeparture(sportDeparture);
      setDepartureOptions([sportDeparture]);
    }

    const noteParts = [
      match ? `Wyjazd na mecz: ${match}` : "Wyjazd sportowy",
      venue ? `Miejsce: ${venue}` : "",
      ticket ? `Oficjalne bilety: ${ticket}` : "",
    ].filter(Boolean);
    setNotes(noteParts.join("\n"));
    setPieces({
      flight: false,
      hotel: false,
      transfer: false,
      attractions: false,
      esim: false,
      parking: false,
    });
  }, []);

  function chooseOpenOffer(offer: Offer) {
    setCity(offer.city);
    setCountry(offer.country);
    setDestinationMode("known");
    setSkipDestinationChoice(false);
    trackEvent("planner_open_destination_selected", { offer_id: offer.id, city: offer.city, partner: offer.partner });
  }

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
    trackEvent("planner_submit", { destination_mode: destinationMode, date_mode: dateMode, signed_in: signedIn });
    trackMetaCustomEvent("PlannerStart", { destination_mode: destinationMode, date_mode: dateMode, signed_in: signedIn });

    if (destinationMode === "known" && !city.trim() && !country.trim()) {
      setError("Wpisz miasto, region albo kraj — albo wybierz opcję „Gdziekolwiek”.");
      return;
    }

    if (dateMode === "range" && (!startDate || !endDate)) {
      setError("Wybierz zakres dat albo przełącz termin na elastyczny.");
      return;
    }

    if (dateMode === "month" && !travelMonth) {
      setError("Wybierz miesiąc albo przełącz termin na elastyczny.");
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
      city: city.trim() || (destinationMode === "open" ? "Gdziekolwiek" : "Do wyboru"),
      country: country.trim() || (destinationMode === "open" ? "Dowolny kierunek" : "Do wyboru"),
      price: 0,
      departure: departureMode === "any" ? "Polska — dowolne lotnisko" : (departureOptions.join(", ") || departure.trim() || "Do ustalenia"),
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
      dates: dateMode === "range" ? dateLabel(startDate, endDate) : dateMode === "month" ? `${travelMonth} · ${flexNights} nocy${weekendRequired ? " · z weekendem" : ""}` : `Elastycznie · ${flexNights} nocy${weekendRequired ? " · z weekendem" : ""}`,
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
        "Sprawdź internet / eSIM na wyjazd": pieces.esim,
        "Zarezerwuj parking przy lotnisku": pieces.parking,
      },
      dayPlan: [],
      journeyPieces: {
        flight: { status: pieces.flight ? "owned" : selectedProvider.flight ? "selected" : "missing", provider: selectedProvider.flight || "" },
        hotel: { status: pieces.hotel ? "owned" : selectedProvider.hotel ? "selected" : "missing", provider: selectedProvider.hotel || "" },
        transfer: { status: pieces.transfer ? "owned" : selectedProvider.transfer ? "selected" : "missing", provider: selectedProvider.transfer || "" },
        attractions: { status: pieces.attractions ? "owned" : selectedProvider.attractions ? "selected" : "missing", provider: selectedProvider.attractions || "" },
        esim: { status: pieces.esim ? "owned" : selectedProvider.esim ? "selected" : "missing", provider: selectedProvider.esim || "" },
        parking: { status: pieces.parking ? "owned" : selectedProvider.parking ? "selected" : "missing", provider: selectedProvider.parking || "" },
      },
      suggestedLinks: suggestions,
    };

    const tripWithPreferences = { ...trip, searchPreferences: { destinationMode, dateMode, travelMonth, flexNights, weekendRequired, departureMode, departureOptions } };
    localStorage.setItem(ACTIVE_TRIP_KEY, JSON.stringify(tripWithPreferences));
    upsertTripArchive(tripWithPreferences);
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));

    if (session) {
      try {
        await saveTripowniaUserState(session, collectLocalAccountState());
      } catch {
        setError("Plan zapisano na tym urządzeniu, ale synchronizacja konta chwilowo się nie udała. Spróbuj ponownie za moment.");
        return;
      }
    }

    trackEvent("planner_created", { destination_mode: destinationMode, date_mode: dateMode, signed_in: signedIn, missing_count: missingCount });
    trackMetaCustomEvent("PlannerCreated", { destination_mode: destinationMode, date_mode: dateMode, signed_in: signedIn, missing_count: missingCount });
    window.location.href = "/moja-podroz";
  }

  return (
    <main>
      <SiteHeader />
      <section className="shell add-trip-page">
        {authReady && !signedIn && (
          <div className="account-message" role="status">
            <strong>Plan możesz ułożyć bez konta.</strong> Zostanie na tym urządzeniu. Konto jest opcjonalne — przydaje się, jeśli chcesz wracać do planów, checklist i preferencji na innych urządzeniach.{" "}
            <Link href="/konto?next=/dodaj-podroz">Utwórz konto / zaloguj się →</Link>
          </div>
        )}

        <header className="add-trip-hero">
          <div className="add-trip-icon"><Route size={28}/></div>
          <div>
            <div className="kicker">{ownedMode ? "MASZ JUŻ WYJAZD" : "TWÓJ PLAN — 0 ZŁ"}</div>
            <h1>{ownedMode ? "Dodaj to, co już masz. Resztę ułożymy wokół Twojej podróży." : "My układamy. Ty tylko wybierasz."}</h1>
            <p>{ownedMode ? "Nie szukamy Ci nowego wyjazdu. Wpisz kierunek, termin i elementy, które masz już kupione — lot, hotel lub oba. Tripownia zbuduje planner, checklistę i podpowie tylko brakujące rzeczy." : "Tak jak w płatnych planach podróży — tylko u nas za darmo. Podajesz kierunek i termin, zaznaczasz co już masz, a Tripownia pokazuje brakujące elementy i gotowe miejsca, gdzie możesz je dobrać."}</p>
          </div>
        </header>

        <div className="add-trip-promise">
          <div><Sparkles size={18}/><span><strong>Gotowe podpowiedzi</strong><small>nie musisz szukać każdej rzeczy osobno</small></span></div>
          <div><ListChecks size={18}/><span><strong>Pomijamy to, co już masz</strong><small>nie sprzedajemy drugi raz tej samej usługi</small></span></div>
          <div><Ticket size={18}/><span><strong>Cały wyjazd w jednym planie</strong><small>lot, nocleg, transfer, atrakcje i przygotowanie</small></span></div>
          <div><ShieldCheck size={18}/><span><strong>0 zł za planner</strong><small>Tripownia zarabia na afiliacji partnerów</small></span></div>
        </div>

        <form className="add-trip-form" onSubmit={submit}>
          <section className="add-trip-section">
            <div className="add-trip-section-title"><MapPinned size={20}/><div><strong>1. Zacznij od tego, co chcesz podać</strong><span>{ownedMode ? "Wpisz tylko informacje, które już masz. Pozostałe elementy możesz pominąć." : "Nie musisz znać kierunku ani dokładnych dat. Każdy element tego kroku jest opcjonalny."}</span></div></div>

            <div className="planner-mode-row">
              <button type="button" className={destinationMode === "open" ? "active" : ""} onClick={() => { setDestinationMode("open"); setSkipDestinationChoice(false); }}>🌍 Lecę gdziekolwiek</button>
              <button type="button" className={destinationMode === "known" ? "active" : ""} onClick={() => { setDestinationMode("known"); setSkipDestinationChoice(false); }}>📍 Wiem dokąd chcę</button>
            </div>
            {destinationMode === "known" && <div className="add-trip-grid two">
              <label><span>Miasto / region</span><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="np. Hanoi, Kreta, Mediolan" autoComplete="address-level2" /></label>
              <label><span>Kraj — opcjonalnie</span><input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="np. Wietnam" autoComplete="country-name" /></label>
            </div>}
            {!ownedMode && destinationMode === "open" && !skipDestinationChoice && (
              <div className="trip-open-suggestions">
                <div className="planner-subtitle"><Sparkles size={17}/><strong>Nie masz kierunku? To my zaczynamy.</strong></div>
                <p className="planner-helper">Wybierz jedną z konkretnych propozycji poniżej. Dopiero wtedy pokażemy lot, nocleg, transfer i atrakcje dopasowane do miejsca.</p>
                <div className="trip-plan-option-grid">
                  {openOfferSuggestions.map((offer) => (
                    <article className="trip-plan-option" key={`open-${offer.id}`}>
                      <MapPinned size={22}/>
                      <div>
                        <small>{offer.flag} {offer.country}</small>
                        <h3>{offer.city}</h3>
                        <p>{offer.hotel} · {offer.dates} · od {offer.price.toLocaleString("pl-PL")} zł/os.</p>
                      </div>
                      <div className="trip-plan-option-actions">
                        <button type="button" onClick={() => chooseOpenOffer(offer)}>Wybieram ten kierunek</button>
                        <a href={offer.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer">Sprawdź ofertę <ExternalLink size={14}/></a>
                      </div>
                    </article>
                  ))}
                </div>
                <button type="button" className="secondary-cta" onClick={() => setSkipDestinationChoice(true)}>
                  Pomiń kierunek i przejdź dalej
                </button>
              </div>
            )}
            {!ownedMode && destinationMode === "open" && skipDestinationChoice && (
              <div className="trip-plan-waiting">
                Kierunek pominięty. Możesz zbudować pusty plan i uzupełnić miejsce później.
                <button type="button" className="text-link-button" onClick={() => setSkipDestinationChoice(false)}>Pokaż propozycje kierunków</button>
              </div>
            )}

            <div className="planner-subtitle"><CalendarDays size={17}/><strong>Kiedy?</strong></div>
            <div className="planner-mode-row">
              <button type="button" className={dateMode === "flexible" ? "active" : ""} onClick={() => setDateMode("flexible")}>Elastycznie</button>
              <button type="button" className={dateMode === "month" ? "active" : ""} onClick={() => setDateMode("month")}>Cały miesiąc</button>
              <button type="button" className={dateMode === "range" ? "active" : ""} onClick={() => setDateMode("range")}>Od–do</button>
            </div>
            {dateMode === "month" && <div className="add-trip-grid two"><label><span>Miesiąc</span><input type="month" value={travelMonth} onChange={(event) => setTravelMonth(event.target.value)} /></label></div>}
            {dateMode === "range" && <div className="add-trip-grid two">
              <label><span>{ownedMode ? "Data wyjazdu" : "Najwcześniej"}</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
              <label><span>{ownedMode ? "Data powrotu" : "Najpóźniej"}</span><input type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
            </div>}
            {!ownedMode && <div className="add-trip-grid two planner-flex-options">
              <label><span>Na ile?</span><select value={flexNights} onChange={(event) => setFlexNights(event.target.value)}><option value="1-3">1–3 noce</option><option value="3-7">3–7 nocy</option><option value="5-10">5–10 nocy</option><option value="7-14">7–14 nocy</option><option value="14+">14+ nocy</option></select></label>
              <label className="planner-weekend-check"><input type="checkbox" checked={weekendRequired} onChange={(event) => setWeekendRequired(event.target.checked)} /><span>Pobyt ma zawierać weekend</span></label>
            </div>}

            <div className="planner-subtitle"><Plane size={17}/><strong>Skąd ruszasz?</strong></div>
            <div className="planner-mode-row">
              <button type="button" className={departureMode === "any" ? "active" : ""} onClick={() => setDepartureMode("any")}>🇵🇱 Obojętnie skąd w Polsce</button>
              <button type="button" className={departureMode === "selected" ? "active" : ""} onClick={() => setDepartureMode("selected")}>Wybiorę lotniska</button>
            </div>
            {departureMode === "selected" && <div className="planner-airports">
              {["Warszawa","Kraków","Katowice","Gdańsk","Wrocław","Poznań"].map((airport) => <button type="button" key={airport} className={departureOptions.includes(airport) ? "active" : ""} onClick={() => setDepartureOptions((current) => current.includes(airport) ? current.filter((x) => x !== airport) : [...current, airport])}>{airport}</button>)}
            </div>}
          </section>
          <section className="add-trip-section">
            <div className="add-trip-section-title"><CheckCircle2 size={20}/><div><strong>2. Co już masz? <em>(opcjonalnie)</em></strong><span>Masz lot, hotel albo transfer? Zaznacz. Nie masz nic — pomiń cały krok.</span></div></div>
            <div className="trip-piece-grid">
              <PieceToggle icon={<Plane size={20}/>} title="Lot / transport do celu" checked={pieces.flight} onClick={() => togglePiece("flight")} />
              <PieceToggle icon={<BedDouble size={20}/>} title="Hotel / nocleg" checked={pieces.hotel} onClick={() => togglePiece("hotel")} />
              <PieceToggle icon={<Car size={20}/>} title="Transfer z lotniska" checked={pieces.transfer} onClick={() => togglePiece("transfer")} />
              <PieceToggle icon={<Ticket size={20}/>} title="Atrakcje / bilety" checked={pieces.attractions} onClick={() => togglePiece("attractions")} />
              <PieceToggle icon={<Smartphone size={20}/>} title="Internet / eSIM" checked={pieces.esim} onClick={() => togglePiece("esim")} />
              <PieceToggle icon={<ParkingCircle size={20}/>} title="Parking przy lotnisku" checked={pieces.parking} onClick={() => togglePiece("parking")} />
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
            <div className="add-trip-section-title"><Sparkles size={20}/><div><strong>3. Tripownia uzupełnia brakujące elementy <em>(opcjonalnie)</em></strong><span>{basicsReady ? `Brakuje ${missingCount} z 6 elementów. Wybierz propozycję albo pomiń — możesz wrócić później.` : hasSpecificDestination ? "Ustaw termin albo zostaw go elastyczny, a pokażemy dopasowane propozycje." : "Pominęłaś kierunek. Nie będziemy zgadywać lotu ani hotelu — możesz zapisać plan i dodać miejsce później."}</span></div></div>

            {!basicsReady ? (
              <div className="trip-plan-waiting">{hasSpecificDestination ? "Uzupełnij termin lub zostaw go elastyczny — wtedy pokażemy gotowe propozycje." : "Dodaj kierunek, kiedy będziesz gotowa. Do tego czasu ten krok pozostaje pominięty."}</div>
            ) : (
              <div className="trip-plan-option-grid">
                {!pieces.flight && (
                  <article className={`trip-plan-option${selectedProvider.flight ? " selected" : ""}`}>
                    <Plane size={22}/>
                    <div><small>LOT</small><h3>Kiwi.com</h3><p>Lot dopasowany do kierunku i terminu. Otwieramy gotowe wyszukiwanie.</p></div>
                    <div className="trip-plan-option-actions">
                      <button type="button" onClick={() => chooseProvider("flight", "Kiwi.com")}>{selectedProvider.flight ? "Wybrane ✓" : "Wybieram"}</button>
                      <a href={suggestions.flight} target="_blank" rel="sponsored noopener noreferrer">Sprawdź loty <ExternalLink size={14}/></a>
                    </div>
                  </article>
                )}

                {!pieces.hotel && (
                  <article className={`trip-plan-option${selectedProvider.hotel ? " selected" : ""}`}>
                    <BedDouble size={22}/>
                    <div><small>NOCLEG</small><h3>Booking.com</h3><p>Noclegi w Twoim kierunku i terminie. Nie musisz zaczynać wyszukiwania od zera.</p></div>
                    <div className="trip-plan-option-actions">
                      <button type="button" onClick={() => chooseProvider("hotel", "Booking.com")}>{selectedProvider.hotel ? "Wybrane ✓" : "Wybieram"}</button>
                      <a href={suggestions.hotel} target="_blank" rel="sponsored noopener noreferrer">Sprawdź noclegi <ExternalLink size={14}/></a>
                    </div>
                  </article>
                )}

                {!pieces.transfer && (
                  <article className={`trip-plan-option${selectedProvider.transfer ? " selected" : ""}`}>
                    <Car size={22}/>
                    <div><small>TRANSFER</small><h3>Kiwitaxi / GetTransfer</h3><p>Jeśli transferu nie ma w pakiecie, wybierz dojazd z lotniska do noclegu.</p></div>
                    <div className="trip-plan-option-actions">
                      <button type="button" onClick={() => chooseProvider("transfer", "Kiwitaxi")}>{selectedProvider.transfer ? "Wybrane ✓" : "Wybieram Kiwitaxi"}</button>
                      <a href={suggestions.transfer} target="_blank" rel="sponsored noopener noreferrer">Kiwitaxi <ExternalLink size={14}/></a>
                      <a href={suggestions.transferAlt} target="_blank" rel="sponsored noopener noreferrer">GetTransfer <ExternalLink size={14}/></a>
                    </div>
                  </article>
                )}

                {!pieces.attractions && (
                  <article className={`trip-plan-option${selectedProvider.attractions ? " selected" : ""}`}>
                    <Ticket size={22}/>
                    <div><small>ATRAKCJE</small><h3>GetYourGuide</h3><p>Najpopularniejsze bilety i wycieczki dla wybranego miejsca. Dodajesz tylko te, które chcesz.</p></div>
                    <div className="trip-plan-option-actions">
                      <button type="button" onClick={() => chooseProvider("attractions", "GetYourGuide")}>{selectedProvider.attractions ? "Wybrane ✓" : "Wybieram"}</button>
                      <a href={suggestions.attractions} target="_blank" rel="sponsored noopener noreferrer">Sprawdź atrakcje <ExternalLink size={14}/></a>
                    </div>
                  </article>
                )}

                {!pieces.esim && (
                  <article className={`trip-plan-option${selectedProvider.esim ? " selected" : ""}`}>
                    <Smartphone size={22}/>
                    <div><small>INTERNET / eSIM</small><h3>Fonia eSIM</h3><p>Internet na wyjazd bez szukania lokalnej karty SIM po przylocie.</p></div>
                    <div className="trip-plan-option-actions">
                      <button type="button" onClick={() => chooseProvider("esim", "Fonia eSIM")}>{selectedProvider.esim ? "Wybrane ✓" : "Wybieram"}</button>
                      <a href={suggestions.esim} target="_blank" rel="sponsored noopener noreferrer">Sprawdź eSIM <ExternalLink size={14}/></a>
                    </div>
                  </article>
                )}

                {!pieces.parking && (
                  <article className={`trip-plan-option${selectedProvider.parking ? " selected" : ""}`}>
                    <ParkingCircle size={22}/>
                    <div><small>PARKING</small><h3>Parklot.pl</h3><p>Parking przy lotnisku wylotu — przydatny, jeśli jedziesz na lotnisko samochodem.</p></div>
                    <div className="trip-plan-option-actions">
                      <button type="button" onClick={() => chooseProvider("parking", "Parklot.pl")}>{selectedProvider.parking ? "Wybrane ✓" : "Wybieram"}</button>
                      <a href={suggestions.parking} target="_blank" rel="sponsored noopener noreferrer">Sprawdź parking <ExternalLink size={14}/></a>
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
            <div className="add-trip-section-title"><NotebookPen size={20}/><div><strong>4. Co jeszcze zapamiętać? <em>(opcjonalnie)</em></strong><span>Nie musisz nic wpisywać. Notatkę możesz dodać teraz albo później w swoim planie.</span></div></div>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="np. późny przylot, dziecko w podróży, chcemy dużo zwiedzać..." rows={4} />
          </section>

          {error && <div className="add-trip-error" role="alert">{error}</div>}
          <div className="add-trip-actions">
            <button type="submit" className="primary-cta">{signedIn ? "Zapisz plan z tym, co podałam" : "Utwórz plan z tym, co podałam"} <ArrowRight size={17}/></button>
            <Link href="/#wyszukiwarka">Najpierw chcę znaleźć cały wyjazd</Link>
          </div>
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}
