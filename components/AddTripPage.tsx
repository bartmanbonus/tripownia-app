"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CalendarDays,
  Car,
  CheckCircle2,
  MapPinned,
  NotebookPen,
  Plane,
  Route,
  Smartphone,
  ParkingCircle,
  Sparkles,
  Ticket,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TravelImage from "@/components/TravelImage";
import { ACTIVE_TRIP_KEY, upsertTripArchive } from "@/lib/tripArchive";
import { ensureFreshAccountSession, readAccountSession, saveTripowniaUserState, type AccountSession } from "@/lib/accountAuth";
import { collectLocalAccountState } from "@/lib/accountState";
import { offers, type Offer } from "@/lib/offers";
import { trackEvent } from "@/lib/analytics";
import { trackMetaCustomEvent } from "@/lib/metaPixel";
import { partners } from "@/lib/partners";
import styles from "@/components/AddTripPage.module.css";

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

const cityCountryHints: Record<string, string> = {
  rzym: "Włochy",
  roma: "Włochy",
  mediolan: "Włochy",
  bergamo: "Włochy",
  neapol: "Włochy",
  wenecja: "Włochy",
  florencja: "Włochy",
  barcelona: "Hiszpania",
  madryt: "Hiszpania",
  malaga: "Hiszpania",
  sewilla: "Hiszpania",
  alicante: "Hiszpania",
  paryz: "Francja",
  nicea: "Francja",
  lizbona: "Portugalia",
  porto: "Portugalia",
  aten: "Grecja",
  ateny: "Grecja",
  saloniki: "Grecja",
  hanoi: "Wietnam",
  sajgon: "Wietnam",
  "ho chi minh": "Wietnam",
  bangkok: "Tajlandia",
  phuket: "Tajlandia",
  krabi: "Tajlandia",
  dubaj: "ZEA",
  marrakesz: "Maroko",
  praga: "Czechy",
  budapeszt: "Węgry",
  wieden: "Austria",
  londyn: "Wielka Brytania",
  amsterdam: "Holandia",
  kopenhaga: "Dania",
};

function inferCountryFromCity(city: string, country: string) {
  const explicit = country.trim();
  if (explicit) return explicit;
  return cityCountryHints[norm(city)] || "";
}

type EditableTrip = {
  tripId?: string;
  offerId?: number;
  offerSnapshot?: Offer;
  flight?: string;
  departureAt?: string;
  hotel?: string;
  notes?: string;
  checklist?: Record<string, boolean>;
  dayPlan?: Array<Record<string, unknown>>;
  journeyPieces?: Partial<Record<PieceKey, { status?: "owned" | "selected" | "missing"; provider?: string }>>;
  searchPreferences?: {
    destinationMode?: "open" | "known";
    dateMode?: "flexible" | "range" | "month";
    travelMonth?: string;
    flexNights?: string;
    weekendRequired?: boolean;
    departureMode?: "any" | "selected";
    departureOptions?: string[];
  };
};

function originIata(value: string): string {
  const n = norm(value);
  if (n.includes("modlin") || /\bwmi\b/.test(n)) return "WMI";
  if (n.includes("radom") || /\brdo\b/.test(n)) return "RDO";
  if (n.includes("chopin") || /\bwaw\b/.test(n) || n === "warszawa") return "WAW";
  if (n.includes("krak") || /\bkrk\b/.test(n)) return "KRK";
  if (n.includes("katow") || /\bktw\b/.test(n)) return "KTW";
  if (n.includes("gdansk") || /\bgdn\b/.test(n)) return "GDN";
  if (n.includes("wrocl") || /\bwro\b/.test(n)) return "WRO";
  if (n.includes("poznan") || /\bpoz\b/.test(n)) return "POZ";
  if (n.includes("rzesz") || /\brze\b/.test(n)) return "RZE";
  if (n.includes("lublin") || /\bluz\b/.test(n)) return "LUZ";
  if (n.includes("szczec") || /\bszz\b/.test(n)) return "SZZ";
  if (n.includes("lodz") || n.includes("łodz") || n.includes("łódź") || /\blcj\b/.test(n)) return "LCJ";
  if (n.includes("warsz")) return "WAW";
  return "WAW";
}

function buildSuggestions(city: string, country: string, start: string, end: string, departure: string) {
  const place = [city.trim(), country.trim()].filter(Boolean).join(", ");
  const origin = originIata(departure);

  const flight = new URLSearchParams();
  if (place) flight.set("destination", place);
  if (origin) flight.set("origin", origin);
  if (start) flight.set("outbound", start);
  if (end) flight.set("inbound", end);

  const hotel = new URLSearchParams();
  if (place) hotel.set("q", place);
  if (origin) hotel.set("origin", origin);
  if (start) hotel.set("from", start);
  if (end) hotel.set("to", end);

  const attractions = new URLSearchParams();
  if (place) attractions.set("q", place);

  const transfer = new URLSearchParams();
  if (place) transfer.set("destination", place);

  return {
    flight: `/loty?${flight.toString()}`,
    hotel: `/hotele?${hotel.toString()}`,
    attractions: `/atrakcje?${attractions.toString()}`,
    transfer: `/transfery?${transfer.toString()}`,
    transferAlt: `/transfery?${transfer.toString()}`,
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
      <span><strong>{title}</strong><small>{checked ? "Mam" : "Brakuje"}</small></span>
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
  const [editingTrip, setEditingTrip] = useState<EditableTrip | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [sourceType, setSourceType] = useState("");
  const [sourceKind, setSourceKind] = useState("");
  const [sportMatch, setSportMatch] = useState("");
  const [sportVenue, setSportVenue] = useState("");
  const [sportTicket, setSportTicket] = useState("");

  const nights = useMemo(() => nightsBetween(startDate, endDate), [startDate, endDate]);
  const suggestions = useMemo(
    () => buildSuggestions(city, country, startDate, endDate, departure),
    [city, country, startDate, endDate, departure],
  );
  const openOfferSuggestions = useMemo(
    () => [...offers]
      .filter((offer) => offer.availabilityStatus !== "expired")
      .sort((a, b) => (b.score - a.score) || (a.price - b.price))
      .slice(0, 4),
    [],
  );
  const missingCount = Object.values(pieces).filter((value) => !value).length;
  const quickOwnedFlow = ownedMode && (sourceType === "external" || sourceType === "affiliate") && Boolean(city || country);
  const quickSportFlow = sourceType === "sport" && Boolean(city || country) && Boolean(startDate && endDate);
  const quickOwnedText = pieces.flight && pieces.hotel
    ? "Lot i hotel są już zaznaczone."
    : pieces.flight
      ? "Lot / transport jest już zaznaczony."
      : pieces.hotel
        ? "Nocleg jest już zaznaczony."
        : "Wyjazd jest gotowy do zapisania.";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const owned = mode === "owned";
    const known = mode === "known";
    const open = mode === "open";
    const editActive = params.get("edit") === "active";
    setOwnedMode(owned);

    const source = params.get("source");
    setSourceType(source || "");
    if (source === "affiliate" || source === "external") {
      const affiliateCity = (params.get("city") || "").trim();
      const affiliateCountry = (params.get("country") || "").trim();
      const affiliateKind = (params.get("kind") || "package").trim();
      const affiliatePartner = (params.get("partner") || "").trim();
      setSourceKind(affiliateKind);
      const sourceStart = (params.get("start") || "").trim();
      const sourceEnd = (params.get("end") || "").trim();
      const sourceDeparture = (params.get("departure") || "").trim();

      setDestinationMode("known");
      setSkipDestinationChoice(false);
      setCity(affiliateCity);
      setCountry(affiliateCountry);
      setOwnedMode(true);
      setDateMode(sourceStart && sourceEnd ? "range" : "flexible");
      if (sourceStart) setStartDate(sourceStart);
      if (sourceEnd) setEndDate(sourceEnd);
      if (sourceDeparture) {
        setDepartureMode("selected");
        setDeparture(sourceDeparture);
        setDepartureOptions([sourceDeparture]);
      }
      setPieces({
        flight: affiliateKind === "flight" || affiliateKind === "package",
        hotel: affiliateKind === "hotel" || affiliateKind === "package",
        transfer: false,
        attractions: false,
        esim: false,
        parking: false,
      });
      if (affiliatePartner) {
        setSelectedProvider({
          flight: affiliateKind === "flight" || affiliateKind === "package" ? affiliatePartner : undefined,
          hotel: affiliateKind === "hotel" || affiliateKind === "package" ? affiliatePartner : undefined,
        });
      }
      if (source === "affiliate") setNotes("Rezerwacja rozpoczęta przez Tripownię");
    }

    if (editActive) {
      try {
        const saved = JSON.parse(localStorage.getItem(ACTIVE_TRIP_KEY) || "null") as EditableTrip | null;
        const snapshot = saved?.offerSnapshot;
        if (saved && snapshot) {
          setEditingTrip(saved);
          const pendingDestination = !snapshot.city || snapshot.city === "Gdziekolwiek" || snapshot.city === "Kierunek jeszcze nie wybrany";
          setDestinationMode(pendingDestination ? "open" : "known");
          setSkipDestinationChoice(pendingDestination);
          setCity(pendingDestination ? "" : snapshot.city || "");
          setCountry(["Dowolny kierunek", "Do wyboru"].includes(snapshot.country || "") ? "" : snapshot.country || "");

          const prefs = saved.searchPreferences || {};
          setDateMode(prefs.dateMode || (snapshot.dates?.startsWith("Elastycznie") ? "flexible" : "flexible"));
          setTravelMonth(prefs.travelMonth || "");
          setFlexNights(prefs.flexNights || "3-7");
          setWeekendRequired(Boolean(prefs.weekendRequired));
          setDepartureMode(prefs.departureMode || "any");
          setDepartureOptions(Array.isArray(prefs.departureOptions) ? prefs.departureOptions : []);

          setFlight(saved.flight || "");
          setHotel(saved.hotel || "");
          setNotes(saved.notes || "");
          const journey = saved.journeyPieces || {};
          setPieces({
            flight: Boolean(saved.flight) || journey.flight?.status === "owned",
            hotel: Boolean(saved.hotel) || journey.hotel?.status === "owned",
            transfer: journey.transfer?.status === "owned",
            attractions: journey.attractions?.status === "owned",
            esim: journey.esim?.status === "owned",
            parking: journey.parking?.status === "owned",
          });
          setSelectedProvider({
            flight: journey.flight?.provider || undefined,
            hotel: journey.hotel?.provider || undefined,
            transfer: journey.transfer?.provider || undefined,
            attractions: journey.attractions?.provider || undefined,
            esim: journey.esim?.provider || undefined,
            parking: journey.parking?.provider || undefined,
          });
          setDepartureAt(saved.departureAt || "");
        }
      } catch {
        setEditingTrip(null);
      }
      return;
    }

    if (owned) {
      setDestinationMode("known");
      setDateMode("range");
    } else if (known) {
      setDestinationMode("known");
      setSkipDestinationChoice(false);
    } else if (open) {
      setDestinationMode("open");
      setSkipDestinationChoice(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const explicitSource = params?.get("source") || "";
    const hasExplicitSourceDestination = Boolean(
      ((params?.get("city") || "").trim() || (params?.get("country") || "").trim())
      && ["affiliate", "external", "experience", "sport"].includes(explicitSource)
    );
    void ensureFreshAccountSession(readAccountSession()).then((currentSession) => {
      if (cancelled) return;
      setSession(currentSession);
      setSignedIn(Boolean(currentSession));
      setAuthReady(true);

      if (currentSession && !hasExplicitSourceDestination) {
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
    if (params.get("source") !== "experience") return;

    const experienceCity = (params.get("city") || "").trim();
    const experienceCountry = (params.get("country") || "").trim();
    const experienceStart = (params.get("start") || "").trim();
    const experienceEnd = (params.get("end") || "").trim();
    const experienceName = (params.get("experience") || "").trim();

    if (experienceCity || experienceCountry) {
      setDestinationMode("known");
      setSkipDestinationChoice(false);
      setCity(experienceCity);
      setCountry(experienceCountry);
    }
    if (experienceStart && experienceEnd) {
      setDateMode("range");
      setStartDate(experienceStart);
      setEndDate(experienceEnd);
    }
    if (experienceName) {
      setNotes(`Inspiracja Tripowni: ${experienceName}`);
    }
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

    setSportMatch(match);
    setSportVenue(venue);
    setSportTicket(ticket);

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

  function moveToStep(next: 1 | 2) {
    setStep(next);
    setError("");
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        document.getElementById("trip-form-start")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function leavePlanner(fallback = "/app") {
    if (typeof window === "undefined") return;
    try {
      const referrer = document.referrer ? new URL(document.referrer) : null;
      if (referrer?.origin === window.location.origin && window.history.length > 1) {
        window.history.back();
        return;
      }
    } catch {}
    window.location.assign(fallback);
  }

  function handlePlannerBack() {
    if (step === 2) {
      moveToStep(1);
      return;
    }
    leavePlanner();
  }

  function continueToPieces() {
    setError("");

    if (destinationMode === "known" && !city.trim() && !country.trim()) {
      setError("Wpisz kierunek albo wybierz „Gdziekolwiek”.");
      return;
    }

    if (!ownedMode && dateMode === "range" && (!startDate || !endDate)) {
      setError("Wybierz daty albo termin elastyczny.");
      return;
    }

    if (!ownedMode && dateMode === "month" && !travelMonth) {
      setError("Wybierz miesiąc albo termin elastyczny.");
      return;
    }

    if (startDate && endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
      setError("Powrót nie może być przed wyjazdem.");
      return;
    }

    trackEvent("planner_step_1_complete", { destination_mode: destinationMode, date_mode: dateMode, owned_mode: ownedMode });
    moveToStep(2);
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

    if (!ownedMode && dateMode === "range" && (!startDate || !endDate)) {
      setError("Wybierz zakres dat albo przełącz termin na elastyczny.");
      return;
    }

    if (!ownedMode && dateMode === "month" && !travelMonth) {
      setError("Wybierz miesiąc albo przełącz termin na elastyczny.");
      return;
    }

    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      setError("Data powrotu nie może być wcześniejsza niż data wyjazdu.");
      return;
    }

    const createdAt = Date.now();
    const offerId = editingTrip?.offerId ?? -createdAt;
    const tripId = editingTrip?.tripId || `trip-custom-${createdAt}-${Math.random().toString(36).slice(2, 8)}`;
    const resolvedCountry = inferCountryFromCity(city, country);
    const destinationPending = !city.trim() && !resolvedCountry;
    const snapshot = {
      ...(editingTrip?.offerSnapshot || {}),
      id: offerId,
      flag: editingTrip?.offerSnapshot?.flag || "🌍",
      city: city.trim() || "Kierunek jeszcze nie wybrany",
      country: resolvedCountry,
      price: editingTrip?.offerSnapshot?.price || 0,
      departure: departureMode === "any" ? "Polska — dowolne lotnisko" : (departureOptions.join(", ") || departure.trim() || "Do ustalenia"),
      airportCode: "",
      nights: dateMode === "range" ? nights : 0,
      weather: "",
      score: 0,
      tag: "OKAZJA" as const,
      reason: sourceType === "sport"
        ? `Wyjazd na mecz${sportMatch ? `: ${sportMatch}` : ""}.`
        : "Własna podróż ułożona bezpłatnie w Tripowni.",
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
      ...(editingTrip || {}),
      tripId,
      offerId,
      offerSnapshot: snapshot,
      departureAt: departureAt || editingTrip?.departureAt || (startDate ? `${startDate}T08:00` : ""),
      flight: pieces.flight ? flight.trim() : (editingTrip?.flight || ""),
      hotel: pieces.hotel ? hotel.trim() : (editingTrip?.hotel || ""),
      notes: notes.trim() || editingTrip?.notes || "",
      checklist: editingTrip?.checklist || {
        "Sprawdź transfer z lotniska i taxi na miejscu": pieces.transfer,
        "Zarezerwuj najważniejsze atrakcje": pieces.attractions,
        "Sprawdź internet / eSIM na wyjazd": pieces.esim,
        "Zarezerwuj parking przy lotnisku": pieces.parking,
      },
      dayPlan: editingTrip?.dayPlan || [],
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

    const tripWithPreferences = { ...trip, searchPreferences: { destinationMode, dateMode, travelMonth, flexNights, weekendRequired, departureMode, departureOptions, destinationPending } };
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

  if (quickSportFlow) {
    return (
      <main>
        <SiteHeader />
        <div className={styles.mobileProcessBar} aria-label="Nawigacja planera">
          <button type="button" className={styles.mobileProcessBack} onClick={() => leavePlanner("/wydarzenia")}>
            <ArrowLeft size={15}/> Wstecz
          </button>
          <span className={styles.mobileStepLabel}>Plan meczu</span>
          <span className={styles.mobileFreeBadge}>0 zł</span>
        </div>
        <section className={"shell add-trip-page " + styles.confirmPage}>
          <form className={styles.confirmCard} onSubmit={submit}>
            <div className={styles.confirmMedia}>
              <TravelImage
                city={city}
                country={country}
                alt={[city, country].filter(Boolean).join(", ")}
              />
            </div>

            <div className={styles.confirmContent}>
              <div className={styles.confirmEyebrow}>WYJAZD NA MECZ</div>
              <h1>{sportMatch || `Mecz w ${city || country}`}</h1>
              <div className={styles.confirmCountry}>{[city, country].filter(Boolean).join(", ")}</div>

              <div className={styles.confirmIncluded}>
                <span><CalendarDays size={16}/> {dateLabel(startDate, endDate)}</span>
                {sportVenue && <span><MapPinned size={16}/> {sportVenue}</span>}
              </div>

              <div className={styles.confirmHint}>
                Termin i kierunek są już ustawione pod ten mecz. Nie wracamy do ogólnej wyszukiwarki.
              </div>

              <div className="planner-preview-actions">
                <Link className="secondary-cta" href={suggestions.flight}><Plane size={17}/> Sprawdź lot</Link>
                <Link className="secondary-cta" href={suggestions.hotel}><BedDouble size={17}/> Znajdź nocleg</Link>
                {sportTicket && (
                  <a className="secondary-cta" href={sportTicket} rel="noopener noreferrer">
                    <Ticket size={17}/> Oficjalne bilety
                  </a>
                )}
              </div>

              {error && <div className="add-trip-error" role="alert">{error}</div>}

              <button type="submit" className={"primary-cta " + styles.confirmPrimary}>
                Dodaj ten mecz do planu <ArrowRight size={18}/>
              </button>

              <Link href="/wydarzenia" className={styles.confirmHint}>← Wróć do listy meczów</Link>
            </div>
          </form>
        </section>
        <SiteFooter />
      </main>
    );
  }

  if (quickOwnedFlow) {
    return (
      <main>
        <SiteHeader />
        <div className={styles.mobileProcessBar} aria-label="Nawigacja planera">
          <button type="button" className={styles.mobileProcessBack} onClick={() => leavePlanner()}>
            <ArrowLeft size={15}/> Wstecz
          </button>
          <span className={styles.mobileStepLabel}>Dodaj wyjazd</span>
          <span className={styles.mobileFreeBadge}>0 zł</span>
        </div>
        <section className={"shell add-trip-page " + styles.confirmPage}>
          <form className={styles.confirmCard} onSubmit={submit}>
            <div className={styles.confirmMedia}>
              <TravelImage
                city={city}
                country={country}
                alt={[city, country].filter(Boolean).join(", ")}
              />
            </div>

            <div className={styles.confirmContent}>
              <div className={styles.confirmEyebrow}>TWÓJ WYJAZD</div>
              <h1>{city || country}</h1>
              {city && country && <div className={styles.confirmCountry}>{country}</div>}

              <div className={styles.confirmIncluded}>
                {pieces.flight && <span><CheckCircle2 size={16}/> Lot / transport</span>}
                {pieces.hotel && <span><CheckCircle2 size={16}/> Nocleg</span>}
                {!pieces.flight && !pieces.hotel && <span><CheckCircle2 size={16}/> Wyjazd gotowy</span>}
              </div>

              {error && <div className="add-trip-error" role="alert">{error}</div>}

              <button type="submit" className={"primary-cta " + styles.confirmPrimary}>
                Dodaj wyjazd <ArrowRight size={18}/>
              </button>

              <details className={styles.confirmDetails}>
                <summary>Uzupełnij daty i szczegóły</summary>
                <div className={styles.confirmDetailsBody}>
                  <div className={styles.confirmDetailSection}>
                    <strong>Termin</strong>
                    <div className="add-trip-grid two">
                      <label><span>Wyjazd</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
                      <label><span>Powrót</span><input type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
                    </div>
                  </div>

                  <div className={styles.confirmDetailSection}>
                    <strong>Rezerwacja</strong>
                    <div className="add-trip-grid two">
                      {pieces.flight && <label><span>Lot / transport</span><input value={flight} onChange={(event) => setFlight(event.target.value)} placeholder="np. numer lotu" /></label>}
                      {pieces.hotel && <label><span>Hotel</span><input value={hotel} onChange={(event) => setHotel(event.target.value)} placeholder="np. nazwa hotelu" /></label>}
                    </div>
                  </div>

                  <div className={styles.confirmDetailSection}>
                    <strong>Kierunek</strong>
                    <div className="add-trip-grid two">
                      <label><span>Miasto / region</span><input value={city} onChange={(event) => setCity(event.target.value)} /></label>
                      <label><span>Kraj</span><input value={country} onChange={(event) => setCountry(event.target.value)} /></label>
                    </div>
                  </div>

                  <div className={styles.confirmDetailSection}>
                    <strong>Notatka</strong>
                    <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Opcjonalnie" rows={3} />
                  </div>
                </div>
              </details>

              <div className={styles.confirmHint}>Wszystko możesz uzupełnić później.</div>
            </div>
          </form>
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main>
      <SiteHeader />
      <section className={"shell add-trip-page " + styles.page} id="trip-form-start">
        <div className={styles.topline}>
          <button type="button" className={styles.mobileProcessBack} onClick={handlePlannerBack}>
            <ArrowLeft size={15}/> Wstecz
          </button>
          <div className={styles.progress} aria-label={"Krok " + step + " z 2"}>
            <span className={step === 1 ? styles.progressActive : styles.progressDone}><b>1</b> Podstawy</span>
            <span className={styles.progressLine} />
            <span className={step === 2 ? styles.progressActive : styles.progressIdle}><b>2</b> Co już masz</span>
          </div>
          <span className={styles.mobileStepLabel}>Krok {step} z 2</span>
          <span className={styles.freeBadge}>Plan 0 zł</span>
        </div>

        {authReady && !signedIn && (
          <div className={styles.accountNote} role="status">
            <span>Bez konta też działa.</span>
            <Link href="/konto?next=/dodaj-podroz">Zaloguj, żeby synchronizować</Link>
          </div>
        )}

        <header className={"add-trip-hero " + styles.hero}>
          <div className="add-trip-icon"><Route size={24}/></div>
          <div>
            <div className="kicker">{editingTrip ? "EDYCJA PLANU" : ownedMode ? "DODAJ SWÓJ WYJAZD" : "PLAN PODRÓŻY"}</div>
            <h1>{editingTrip ? "Uzupełnij podróż" : ownedMode ? (city ? "Dodaj " + city + " do planu" : "Dodaj swój wyjazd") : "Ułóżmy Twój wyjazd"}</h1>
            <p>{editingTrip ? "Zmień tylko to, czego potrzebujesz." : ownedMode ? "Kilka danych i gotowe. Brakujące elementy pokażemy później." : "Wybierz kierunek i termin. Resztę ogarniemy krok po kroku."}</p>
          </div>
        </header>

        <div className={styles.trustLine}>
          <span>bez opłat</span>
          <span>bez obowiązkowego konta</span>
          <span>możesz dokończyć później</span>
        </div>

        <form className={"add-trip-form " + styles.form} onSubmit={submit}>
          {step === 1 && (
            <section className={"add-trip-section " + styles.stepCard}>
              <div className={styles.sectionHead}>
                <span className={styles.stepNumber}>1</span>
                <div>
                  <strong>Podstawy</strong>
                  <span>{ownedMode ? "Sprawdź kierunek i dodaj termin, jeśli go znasz." : "Gdzie i kiedy?"}</span>
                </div>
              </div>

              {ownedMode && (city || country) ? (
                <>
                  <div className={styles.prefilled}>
                    <MapPinned size={20}/>
                    <div>
                      <small>Kierunek</small>
                      <strong>{[city, country].filter(Boolean).join(", ")}</strong>
                    </div>
                  </div>
                  <details className={styles.editDetails}>
                    <summary>Zmień kierunek</summary>
                    <div className={"add-trip-grid two " + styles.editGrid}>
                      <label><span>Miasto / region</span><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="np. Durrës" autoComplete="address-level2" /></label>
                      <label><span>Kraj</span><input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="np. Albania" autoComplete="country-name" /></label>
                    </div>
                  </details>
                </>
              ) : (
                <div className={styles.fieldBlock}>
                  <div className={styles.blockHeader}><strong>Kierunek</strong>{ownedMode && <small>podaj miejsce</small>}</div>
                  {!ownedMode && (
                    <div className={"planner-mode-row " + styles.modeRow}>
                      <button type="button" className={destinationMode === "open" ? "active" : ""} onClick={() => { setDestinationMode("open"); setSkipDestinationChoice(false); }}>🌍 Gdziekolwiek</button>
                      <button type="button" className={destinationMode === "known" ? "active" : ""} onClick={() => { setDestinationMode("known"); setSkipDestinationChoice(false); }}>📍 Mam kierunek</button>
                    </div>
                  )}

                  {destinationMode === "known" && (
                    <div className="add-trip-grid two">
                      <label><span>Miasto / region</span><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="np. Hanoi, Kreta, Mediolan" autoComplete="address-level2" /></label>
                      <label><span>Kraj</span><input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="opcjonalnie" autoComplete="country-name" /></label>
                    </div>
                  )}

                  {!ownedMode && destinationMode === "open" && !skipDestinationChoice && (
                    <div className={styles.quickSuggestions}>
                      <div className={styles.destinationChips}>
                        {openOfferSuggestions.slice(0, 4).map((offer) => (
                          <button type="button" key={"open-" + offer.id} onClick={() => chooseOpenOffer(offer)}>
                            <TravelImage city={offer.city} country={offer.country} overrideSrc={offer.image} alt={offer.city + ", " + offer.country} />
                            <span><strong>{offer.city}</strong><small>od {offer.price.toLocaleString("pl-PL")} zł/os.</small></span>
                          </button>
                        ))}
                      </div>
                      <button type="button" className={styles.textAction} onClick={() => setSkipDestinationChoice(true)}>Wybiorę kierunek później</button>
                    </div>
                  )}

                  {!ownedMode && destinationMode === "open" && skipDestinationChoice && (
                    <div className={styles.skippedLine}>
                      <span>Kierunek wybierzesz później.</span>
                      <button type="button" onClick={() => setSkipDestinationChoice(false)}>Pokaż propozycje</button>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.fieldBlock}>
                <div className={styles.blockHeader}><strong>Termin</strong>{ownedMode && <small>opcjonalnie</small>}</div>
                {!ownedMode && (
                  <div className={"planner-mode-row " + styles.modeRow}>
                    <button type="button" className={dateMode === "flexible" ? "active" : ""} onClick={() => setDateMode("flexible")}>Elastycznie</button>
                    <button type="button" className={dateMode === "month" ? "active" : ""} onClick={() => setDateMode("month")}>Miesiąc</button>
                    <button type="button" className={dateMode === "range" ? "active" : ""} onClick={() => setDateMode("range")}>Dokładne daty</button>
                  </div>
                )}

                {dateMode === "month" && !ownedMode && (
                  <div className="add-trip-grid two">
                    <label><span>Miesiąc</span><input type="month" value={travelMonth} onChange={(event) => setTravelMonth(event.target.value)} /></label>
                  </div>
                )}

                {dateMode === "range" && (
                  <div className="add-trip-grid two">
                    <label><span>{ownedMode ? "Wyjazd" : "Od"}</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
                    <label><span>{ownedMode ? "Powrót" : "Do"}</span><input type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
                  </div>
                )}

                {!ownedMode && dateMode !== "range" && (
                  <div className={"add-trip-grid two planner-flex-options " + styles.flexOptions}>
                    <label><span>Na ile?</span><select value={flexNights} onChange={(event) => setFlexNights(event.target.value)}><option value="1-3">1–3 noce</option><option value="3-7">3–7 nocy</option><option value="5-10">5–10 nocy</option><option value="7-14">7–14 nocy</option><option value="14+">14+ nocy</option></select></label>
                    <label className="planner-weekend-check"><input type="checkbox" checked={weekendRequired} onChange={(event) => setWeekendRequired(event.target.checked)} /><span>Z weekendem</span></label>
                  </div>
                )}
              </div>

              <div className={styles.fieldBlock}>
                <div className={styles.blockHeader}><strong>Skąd ruszasz?</strong><small>opcjonalnie</small></div>
                <div className={"planner-mode-row " + styles.modeRow}>
                  <button type="button" className={departureMode === "any" ? "active" : ""} onClick={() => setDepartureMode("any")}>Dowolne lotnisko</button>
                  <button type="button" className={departureMode === "selected" ? "active" : ""} onClick={() => setDepartureMode("selected")}>Wybierz lotniska</button>
                </div>
                {departureMode === "selected" && (
                  <div className={"planner-airports " + styles.airports}>
                    {["Warszawa","Kraków","Katowice","Gdańsk","Wrocław","Poznań"].map((airport) => (
                      <button type="button" key={airport} className={departureOptions.includes(airport) ? "active" : ""} onClick={() => setDepartureOptions((current) => current.includes(airport) ? current.filter((x) => x !== airport) : [...current, airport])}>{airport}</button>
                    ))}
                  </div>
                )}
              </div>

              {error && <div className="add-trip-error" role="alert">{error}</div>}

              <div className={styles.stepActions}>
                <button type="button" className={"primary-cta " + styles.primaryButton} onClick={continueToPieces}>Dalej <ArrowRight size={17}/></button>
                {!ownedMode && <Link href="/#wyszukiwarka" className={styles.secondaryLink}>Najpierw chcę znaleźć wyjazd</Link>}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className={"add-trip-section " + styles.stepCard}>
              <div className={styles.sectionHead}>
                <span className={styles.stepNumber}>2</span>
                <div>
                  <strong>Co już masz?</strong>
                  <span>Kliknij elementy, które są już załatwione.</span>
                </div>
              </div>

              {ownedMode && pieces.flight && pieces.hotel && (
                <div className={styles.detectedBadge}><CheckCircle2 size={16}/> Pakiet: lot + hotel zaznaczone</div>
              )}

              <div className="trip-piece-grid">
                <PieceToggle icon={<Plane size={20}/>} title="Lot / transport" checked={pieces.flight} onClick={() => togglePiece("flight")} />
                <PieceToggle icon={<BedDouble size={20}/>} title="Nocleg" checked={pieces.hotel} onClick={() => togglePiece("hotel")} />
                <PieceToggle icon={<Car size={20}/>} title="Transfer" checked={pieces.transfer} onClick={() => togglePiece("transfer")} />
                <PieceToggle icon={<Ticket size={20}/>} title="Atrakcje" checked={pieces.attractions} onClick={() => togglePiece("attractions")} />
                <PieceToggle icon={<Smartphone size={20}/>} title="Internet / eSIM" checked={pieces.esim} onClick={() => togglePiece("esim")} />
                <PieceToggle icon={<ParkingCircle size={20}/>} title="Parking" checked={pieces.parking} onClick={() => togglePiece("parking")} />
              </div>

              {(pieces.flight || pieces.hotel) && (
                <details className={styles.detailsPanel}>
                  <summary>Dodaj szczegóły rezerwacji <span>opcjonalnie</span></summary>
                  <div className={"add-trip-grid two trip-owned-details " + styles.detailsGrid}>
                    {pieces.flight && <label><span>Numer lotu / szczegóły</span><input value={flight} onChange={(event) => setFlight(event.target.value)} placeholder="np. FR 1234" /></label>}
                    {pieces.hotel && <label><span>Hotel / adres</span><input value={hotel} onChange={(event) => setHotel(event.target.value)} placeholder="np. nazwa hotelu" /></label>}
                    {pieces.flight && <label><span>Godzina startu</span><input type="datetime-local" value={departureAt} onChange={(event) => setDepartureAt(event.target.value)} /></label>}
                  </div>
                </details>
              )}

              <details className={styles.detailsPanel}>
                <summary>Dodaj notatkę <span>opcjonalnie</span></summary>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="np. późny przylot, podróż z dzieckiem..." rows={3} />
              </details>

              {error && <div className="add-trip-error" role="alert">{error}</div>}

              <div className={styles.finalActions}>
                <button type="button" className={styles.backButton} onClick={() => moveToStep(1)}><ArrowLeft size={17}/> Wstecz</button>
                <button type="submit" className={"primary-cta " + styles.primaryButton}>{editingTrip ? "Zapisz plan" : "Utwórz plan"} <ArrowRight size={17}/></button>
              </div>
            </section>
          )}
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}