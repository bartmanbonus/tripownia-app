"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BedDouble, CheckCircle2, Circle, MapPinned, Plane, Ticket, WalletCards, NotebookPen, ArrowRight, Clock3, Map, Plus, Trash2, CloudSun, BellRing, ExternalLink, Sparkles, Landmark, UtensilsCrossed, Waves, ShieldCheck, Wifi, Car, Camera, FileCheck2, Cloud, UserRound, RefreshCw } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TripToolkit from "@/components/TripToolkit";
import { inferOfferStartDate, offers, publishedOfferOverrides, type Offer } from "@/lib/offers";
import { accountAuthEventName, ensureFreshAccountSession, readAccountSession } from "@/lib/accountAuth";
import { estimateTripCost } from "@/lib/tripCost";
import { getOfferOverride } from "@/lib/clientOfferOverrides";
import { upsertTripArchive } from "@/lib/tripArchive";
import { partners } from "@/lib/partners";

type DayPlanItem = { id: string; time: string; title: string; note?: string };
type WeatherDay = { date: string; min: number; max: number; code: number; rain: number };
type WeatherState = { temperature: number; apparent: number; code: number; wind: number; location?: string; daily?: WeatherDay[]; loading?: boolean; error?: string } | null;
type ReminderItem = { label: string; due: string; active: boolean };
type AttractionPick = { title: string; subtitle: string; query: string; icon: "landmark" | "food" | "water" | "sparkles" };

type TripState = {
  tripId?: string;
  offerId?: number;
  offerSnapshot?: Offer;
  flight?: string;
  departureAt?: string;
  hotel?: string;
  notes?: string;
  checklist?: Record<string, boolean>;
  dayPlan?: DayPlanItem[];
  remindersEnabled?: boolean;
  journeyPieces?: Partial<Record<"flight" | "hotel" | "transfer" | "attractions" | "esim" | "parking", { status?: "owned" | "selected" | "missing"; provider?: string; label?: string; price?: number; href?: string; selectedAt?: string; bookedAt?: string }>>;
  suggestedLinks?: Partial<Record<"flight" | "hotel" | "transfer" | "transferAlt" | "attractions" | "esim" | "parking", string>>;
  searchPreferences?: { startDate?: string; endDate?: string; dateMode?: string; destinationPending?: boolean };
};

const LEGACY_TOOLKIT_KEY = "tripownia-trip-toolkit";

function createTripId(offerId?: number) {
  return `trip-${offerId ?? "custom"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toolkitStorageKey(tripId: string) {
  return `tripownia-trip-toolkit:${tripId}`;
}

const checklistItems = [
  "Sprawdź dokumenty i wymagania wjazdowe",
  "Zrób odprawę online",
  "Dodaj ubezpieczenie",
  "Sprawdź transfer z lotniska i taxi na miejscu",
  "Zarezerwuj najważniejsze atrakcje",
  "Sprawdź internet / eSIM",
  "Zarezerwuj parking przy lotnisku",
  "Sprawdź prognozę pogody",
  "Zapisz najważniejsze adresy i numery rezerwacji",
  "Dodaj miejsca na jedzenie i zakupy",
  "Przygotuj checklistę bagażu",
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
    { title: `Najważniejsze miejsca: ${city}`, subtitle: "Top atrakcje i bilety bez szukania po wielu stronach", query: `${city} top attractions`, icon: "landmark" },
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
  const [weatherRefresh, setWeatherRefresh] = useState(0);
  const [accountStatus, setAccountStatus] = useState<"loading" | "guest" | "signed-in">("loading");
  const [accountEmail, setAccountEmail] = useState("");
  const [notificationStatus, setNotificationStatus] = useState("");
  const [offerRevision, setOfferRevision] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null") as TripState | null;
      if (!saved) return;

      const tripId = saved.tripId || createTripId(saved.offerId);
      const normalized: TripState = { checklist: {}, dayPlan: [], ...saved, tripId };
      const scopedToolkitKey = toolkitStorageKey(tripId);
      const legacyToolkit = localStorage.getItem(LEGACY_TOOLKIT_KEY);

      if (legacyToolkit && !localStorage.getItem(scopedToolkitKey)) {
        localStorage.setItem(scopedToolkitKey, legacyToolkit);
        localStorage.removeItem(LEGACY_TOOLKIT_KEY);
      }

      if (!saved.tripId) localStorage.setItem("tripownia-my-trip", JSON.stringify(normalized));
      setTrip(normalized);
    } catch {}
  }, []);

  useEffect(() => {
    const refresh = () => setOfferRevision((value) => value + 1);
    window.addEventListener("tripownia-offer-overrides-updated", refresh);
    return () => window.removeEventListener("tripownia-offer-overrides-updated", refresh);
  }, []);

  const offer = useMemo(
    () => offers.find((item) => item.id === trip.offerId) || trip.offerSnapshot,
    [trip.offerId, trip.offerSnapshot]
  );
  const destinationPending = Boolean(offer?.manual && ((!offer.city && !offer.country) || offer.city === "Gdziekolwiek" || offer.city === "Kierunek jeszcze nie wybrany" || offer.country === "Dowolny kierunek"));
  const destinationName = offer ? (offer.city?.trim() || offer.country?.trim() || "") : "";
  const destinationTitle = !offer
    ? "Twój darmowy plan podróży"
    : destinationPending
      ? "Kierunek jeszcze nie wybrany"
      : [offer.city, offer.country].filter(Boolean).join(", ");
  const tripMeta = offer
    ? [offer.dates, offer.nights > 0 ? `${offer.nights} ${offer.nights === 1 ? "noc" : offer.nights < 5 ? "noce" : "nocy"}` : "", offer.departure ? `wylot: ${offer.departure}` : ""].filter(Boolean).join(" · ")
    : "";
  const displayPrice = useMemo(() => {
    if (!offer) return 0;
    if (offer.manual || offer.id < 0) return offer.price || 0;
    const client = getOfferOverride(offer.id);
    const published = publishedOfferOverrides[String(offer.id)] || {};
    return client.price ?? published.price ?? offer.price;
  }, [offer, offerRevision]);
  const cost = offer && !offer.manual && offer.id > 0 ? estimateTripCost(offer, displayPrice) : null;
  const dayPlan = useMemo(() => [...(trip.dayPlan || [])].sort((a, b) => a.time.localeCompare(b.time)), [trip.dayPlan]);
  const reminder = reminderText(trip.departureAt);
  const reminders = useMemo(() => buildReminders(trip.departureAt), [trip.departureAt]);
  const attractions = useMemo(() => offer && destinationName ? attractionPicks(destinationName, offer.category) : [], [offer, destinationName]);
  const tripStartDate = useMemo(() => {
    const stored = trip.searchPreferences?.startDate?.trim();
    if (stored && /^\d{4}-\d{2}-\d{2}$/.test(stored)) return stored;
    const inferred = inferOfferStartDate(offer?.dates);
    return inferred && !Number.isNaN(inferred.getTime()) ? inferred.toISOString().slice(0, 10) : "";
  }, [trip.searchPreferences?.startDate, offer?.dates]);
  const tripEndDate = useMemo(() => {
    const stored = trip.searchPreferences?.endDate?.trim();
    if (stored && /^\d{4}-\d{2}-\d{2}$/.test(stored)) return stored;
    if (!tripStartDate || !offer?.nights) return tripStartDate;
    const date = new Date(`${tripStartDate}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + Math.max(0, offer.nights));
    return date.toISOString().slice(0, 10);
  }, [trip.searchPreferences?.endDate, tripStartDate, offer?.nights]);
  const daysUntilTrip = useMemo(() => {
    if (!tripStartDate) return null;
    const start = new Date(`${tripStartDate}T12:00:00`).getTime();
    return Number.isNaN(start) ? null : Math.ceil((start - Date.now()) / 86400000);
  }, [tripStartDate]);
  const tripForecastDays = useMemo(() => {
    if (!weather?.daily?.length || !tripStartDate) return [];
    const end = tripEndDate || tripStartDate;
    return weather.daily.filter((day) => day.date >= tripStartDate && day.date <= end).slice(0, 4);
  }, [weather?.daily, tripStartDate, tripEndDate]);
  const transferReady = useMemo(() => {
    const status = trip.journeyPieces?.transfer?.status;
    return Boolean(offer?.transferIncluded || status === "owned" || status === "selected" || trip.checklist?.["Sprawdź transfer z lotniska i taxi na miejscu"]);
  }, [offer?.transferIncluded, trip.journeyPieces, trip.checklist]);

  const flightReady = useMemo(() => {
    const status = trip.journeyPieces?.flight?.status;
    return Boolean(
      trip.flight?.trim() ||
      status === "owned" ||
      status === "selected" ||
      (offer && !offer.manual && offer.departure)
    );
  }, [trip.flight, trip.journeyPieces, offer]);

  const hotelReady = useMemo(() => {
    const status = trip.journeyPieces?.hotel?.status;
    return Boolean(
      trip.hotel?.trim() ||
      status === "owned" ||
      status === "selected" ||
      (offer && !offer.manual && offer.hotel)
    );
  }, [trip.hotel, trip.journeyPieces, offer]);

  const attractionsReady = useMemo(() => {
    const status = trip.journeyPieces?.attractions?.status;
    return Boolean(status === "owned" || status === "selected" || trip.checklist?.["Zarezerwuj najważniejsze atrakcje"]);
  }, [trip.journeyPieces, trip.checklist]);

  const parkingReady = useMemo(() => {
    const status = trip.journeyPieces?.parking?.status;
    return Boolean(status === "owned" || status === "selected" || trip.checklist?.["Zarezerwuj parking przy lotnisku"]);
  }, [trip.journeyPieces, trip.checklist]);

  const esimReady = useMemo(() => {
    const status = trip.journeyPieces?.esim?.status;
    return Boolean(status === "owned" || status === "selected" || trip.checklist?.["Sprawdź internet / eSIM"]);
  }, [trip.journeyPieces, trip.checklist]);

  const tripCartItems = useMemo(() => [
    { key: "flight" as const, label: "Lot / transport", done: flightReady, href: trip.suggestedLinks?.flight || "/loty", icon: Plane },
    { key: "hotel" as const, label: "Nocleg", done: hotelReady, href: trip.suggestedLinks?.hotel || "/hotele", icon: BedDouble },
    { key: "transfer" as const, label: "Transfer", done: transferReady, href: trip.suggestedLinks?.transfer || "/transfery", icon: Car },
    { key: "attractions" as const, label: "Atrakcje", done: attractionsReady, href: trip.suggestedLinks?.attractions || "/atrakcje", icon: Ticket },
    { key: "esim" as const, label: "Internet / eSIM", done: esimReady, href: trip.suggestedLinks?.esim || "/przed-wyjazdem#internet", icon: Wifi },
    { key: "parking" as const, label: "Parking", done: parkingReady, href: trip.suggestedLinks?.parking || "/przed-wyjazdem#parking", icon: Car },
  ], [flightReady, hotelReady, transferReady, attractionsReady, esimReady, parkingReady, trip.suggestedLinks]);

  const airHelpHref = `/out/airhelp?url=${encodeURIComponent(partners.airhelp.buildUrl())}&source=my_trip_flight_help`;
  const nextCartStep = tripCartItems.find((item) => !item.done);
  const tripCartDone = tripCartItems.filter((item) => item.done).length;

  const readiness = useMemo(() => {
    const checks = [
      flightReady,
      hotelReady,
      Boolean(trip.departureAt),
      Boolean((trip.dayPlan || []).length),
      Boolean(trip.checklist?.["Sprawdź dokumenty i wymagania wjazdowe"]),
      Boolean(trip.checklist?.["Dodaj ubezpieczenie"]),
      transferReady,
      attractionsReady,
      Boolean(trip.checklist?.["Sprawdź internet / eSIM"]),
      parkingReady,
      Boolean(trip.checklist?.["Przygotuj checklistę bagażu"]),
    ];
    const done = checks.filter(Boolean).length;
    return { done, total: checks.length, percent: Math.round((done / checks.length) * 100) };
  }, [flightReady, hotelReady, trip.departureAt, trip.dayPlan, trip.checklist, transferReady, attractionsReady, parkingReady]);
  const nextSteps = useMemo(() => {
    const steps = [
      { done: flightReady, label: "Znajdź lub dodaj lot", href: trip.suggestedLinks?.flight || "/loty", icon: Plane },
      { done: hotelReady, label: "Znajdź lub dodaj nocleg", href: trip.suggestedLinks?.hotel || "/hotele", icon: BedDouble },
      { done: Boolean(trip.checklist?.["Sprawdź dokumenty i wymagania wjazdowe"]), label: "Sprawdź dokumenty i wymagania wjazdowe", href: "/przed-wyjazdem", icon: FileCheck2 },
      { done: Boolean(trip.checklist?.["Dodaj ubezpieczenie"]), label: "Uzupełnij ubezpieczenie", href: "/ubezpieczenia", icon: ShieldCheck },
      { done: transferReady, label: "Sprawdź transfer i taxi", href: "/transfery", icon: Car },
      { done: Boolean(trip.checklist?.["Sprawdź internet / eSIM"]), label: "Przygotuj internet / eSIM", href: "/esim", icon: Wifi },
      { done: attractionsReady, label: "Dodaj najważniejsze atrakcje", href: "/atrakcje", icon: Ticket },
      { done: parkingReady, label: "Ogarnij parking przy lotnisku", href: "/parkingi", icon: Car },
      { done: Boolean((trip.dayPlan || []).length), label: "Dodaj pierwszy punkt planu dnia", href: "#plan-dnia", icon: MapPinned },
    ];
    return steps.filter((step) => !step.done).slice(0, 4);
  }, [trip.checklist, trip.dayPlan, trip.suggestedLinks, flightReady, hotelReady, transferReady, attractionsReady, parkingReady]);

  useEffect(() => {
    let cancelled = false;

    async function refreshAccount() {
      const session = await ensureFreshAccountSession(readAccountSession()).catch(() => null);
      if (cancelled) return;
      setAccountStatus(session ? "signed-in" : "guest");
      setAccountEmail(session?.user?.email || "");
    }

    const handleAccountChange = () => { void refreshAccount(); };
    void refreshAccount();
    const authEvent = accountAuthEventName();
    window.addEventListener(authEvent, handleAccountChange);
    window.addEventListener("storage", handleAccountChange);
    return () => {
      cancelled = true;
      window.removeEventListener(authEvent, handleAccountChange);
      window.removeEventListener("storage", handleAccountChange);
    };
  }, []);

  useEffect(() => {
    if (!offer || !destinationName || destinationPending) {
      setWeather(null);
      return;
    }

    let cancelled = false;
    async function loadWeather() {
      setWeather({ temperature: 0, apparent: 0, code: 0, wind: 0, loading: true });
      try {
        const candidates = Array.from(new Set([offer!.city?.trim(), offer!.country?.trim()].filter(Boolean) as string[]));
        let place: { latitude: number; longitude: number; name?: string; country?: string } | null = null;

        for (const candidate of candidates) {
          const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(candidate)}&count=5&language=pl&format=json`);
          if (!geoResponse.ok) continue;
          const geo = await geoResponse.json();
          const results = Array.isArray(geo?.results) ? geo.results : [];
          place = results[0] || null;
          if (place) break;
        }

        if (!place) throw new Error("Nie znaleziono lokalizacji");
        const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=16&timezone=auto`);
        if (!forecastResponse.ok) throw new Error("Brak odpowiedzi pogodowej");
        const forecast = await forecastResponse.json();
        if (cancelled) return;

        const times = Array.isArray(forecast.daily?.time) ? forecast.daily.time : [];
        const daily: WeatherDay[] = times.map((date: string, index: number) => ({
          date,
          min: Math.round(Number(forecast.daily?.temperature_2m_min?.[index] ?? 0)),
          max: Math.round(Number(forecast.daily?.temperature_2m_max?.[index] ?? 0)),
          code: Number(forecast.daily?.weather_code?.[index] ?? 0),
          rain: Math.round(Number(forecast.daily?.precipitation_probability_max?.[index] ?? 0)),
        }));

        const current = forecast.current || {};
        const fallbackTemperature = daily.length ? Math.round((daily[0].min + daily[0].max) / 2) : 0;
        setWeather({
          temperature: Math.round(Number(current.temperature_2m ?? fallbackTemperature)),
          apparent: Math.round(Number(current.apparent_temperature ?? current.temperature_2m ?? fallbackTemperature)),
          code: Number(current.weather_code ?? daily[0]?.code ?? 0),
          wind: Math.round(Number(current.wind_speed_10m ?? 0)),
          location: place.name || destinationName,
          daily,
        });
      } catch {
        if (!cancelled) setWeather({ temperature: 0, apparent: 0, code: 0, wind: 0, error: "Nie udało się teraz pobrać aktualnej pogody." });
      }
    }

    void loadWeather();
    return () => { cancelled = true; };
  }, [offer?.city, offer?.country, destinationName, destinationPending, weatherRefresh]);

  function save(next: TripState) {
    const normalized: TripState = { ...next, tripId: next.tripId || trip.tripId || createTripId(next.offerId) };
    setTrip(normalized);
    localStorage.setItem("tripownia-my-trip", JSON.stringify(normalized));
    upsertTripArchive(normalized);
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));
  }

  function markJourneyPieceOwned(key: "flight" | "hotel" | "transfer" | "attractions" | "esim" | "parking") {
    const checklistKey: Partial<Record<typeof key, string>> = {
      transfer: "Sprawdź transfer z lotniska i taxi na miejscu",
      attractions: "Zarezerwuj najważniejsze atrakcje",
      esim: "Sprawdź internet / eSIM",
      parking: "Zarezerwuj parking przy lotnisku",
    };
    const nextChecklist = { ...(trip.checklist || {}) };
    const mappedChecklist = checklistKey[key];
    if (mappedChecklist) nextChecklist[mappedChecklist] = true;

    save({
      ...trip,
      checklist: nextChecklist,
      journeyPieces: {
        ...(trip.journeyPieces || {}),
        [key]: {
          ...(trip.journeyPieces?.[key] || {}),
          status: "owned",
        },
      },
    });
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
      await registration?.showNotification("Tripownia pilnuje wyjazdu ✈️", { body: reminder, icon: "/tripownia-app-icon-v2.png", tag: `tripownia-trip-reminder-${trip.tripId || "active"}` });
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
          <div><div className="kicker">MOJA PODRÓŻ</div><h1>{destinationTitle}</h1><p>{offer ? tripMeta : "Dodaj własny wyjazd albo wybierz ofertę z Tripowni. Planner pomoże Ci krok po kroku zebrać wszystko w jednym miejscu — bez opłat."}</p>{offer?.manual && <div className="my-trip-edit-actions"><Link href="/dodaj-podroz?edit=active" className="secondary-cta">{destinationPending ? "Wybierz kierunek" : "Edytuj kierunek i termin"}</Link><Link href="/moje-podroze">Moje podróże →</Link></div>}</div>
        </div>

        {offer && (
          <section className="trip-readiness">
            <div className="trip-readiness-main">
              <div className="trip-readiness-score"><strong>{readiness.percent}%</strong><span>gotowe</span></div>
              <div className="trip-readiness-copy">
                <small>TWÓJ WYJAZD</small>
                <h2>{readiness.percent >= 90 ? "Prawie wszystko gotowe." : readiness.percent >= 60 ? "Jesteś na dobrej drodze." : "Zaczynamy od najważniejszych rzeczy."}</h2>
                <p>{readiness.done} z {readiness.total} kluczowych elementów masz już ogarniętych.</p>
              </div>
            </div>
            <div className="trip-readiness-bar"><span style={{width:`${readiness.percent}%`}} /></div>
            {nextSteps.length > 0 && <div className="trip-next-steps">
              <div className="trip-next-steps-head"><Sparkles size={17}/><strong>Co teraz?</strong></div>
              {nextSteps.map(({label,href,icon:Icon}) => <Link key={label} href={href}><Icon size={17}/><span>{label}</span><ArrowRight size={15}/></Link>)}
            </div>}
          </section>
        )}

        {offer && (
          <section className="trip-cart" aria-label="Koszyk podróży">
            <div className="trip-cart-head">
              <div>
                <small>KOSZYK PODRÓŻY · {tripCartDone}/{tripCartItems.length} GOTOWE</small>
                <h2>{nextCartStep ? "Domknij wyjazd krok po kroku." : "Wyjazd jest kompletny."}</h2>
                <p>{nextCartStep ? "Tripownia pamięta, co już masz i prowadzi tylko do kolejnego brakującego elementu." : "Lot, nocleg i dodatki są oznaczone jako gotowe. Teraz możesz skupić się już na samym wyjeździe."}</p>
              </div>
              <Link href="/dodaj-podroz?edit=active">Edytuj wyjazd</Link>
            </div>

            {nextCartStep ? (
              <div className="trip-cart-next">
                <div className="trip-cart-next-copy">
                  <span>NASTĘPNY KROK</span>
                  <strong>{nextCartStep.label}</strong>
                  <small>Najpierw domknij to. Potem pokażemy kolejny brakujący element.</small>
                </div>
                <div className="trip-cart-next-actions">
                  <Link href={nextCartStep.href}>Dodaj teraz <ArrowRight size={15}/></Link>
                  <button type="button" onClick={() => markJourneyPieceOwned(nextCartStep.key)}>Mam już</button>
                </div>
              </div>
            ) : (
              <div className="trip-cart-complete"><CheckCircle2 size={20}/><strong>Wszystkie elementy podróży oznaczone jako gotowe.</strong></div>
            )}

            <div className="trip-cart-grid">
              {tripCartItems.map(({key,label,done,href,icon:Icon}) => {
                const piece = trip.journeyPieces?.[key];
                const providerLabel = piece?.provider
                  ? piece.provider === "booking" ? "Booking"
                    : piece.provider === "getyourguide" ? "GetYourGuide"
                    : piece.provider === "kiwitaxi" ? "KiwiTaxi"
                    : piece.provider === "gettransfer" ? "GetTransfer"
                    : piece.provider.toUpperCase()
                  : "";
                const detail = [providerLabel, piece?.label, piece?.price ? `${piece.price.toLocaleString("pl-PL")} zł` : ""].filter(Boolean).join(" · ");
                return (
                  <div key={key} className={`trip-cart-item ${done ? "is-done" : "is-missing"} ${nextCartStep?.key === key ? "is-next" : ""}`}>
                    <div className="trip-cart-item-icon"><Icon size={19}/></div>
                    <div className="trip-cart-item-copy">
                      <strong>{label}</strong>
                      <span>{done ? "Masz" : piece?.status === "selected" ? "Wybrane · czeka na potwierdzenie" : nextCartStep?.key === key ? "Teraz to" : "Brakuje"}</span>
                      {detail && <small>{detail}</small>}
                    </div>
                    {done ? (
                      <CheckCircle2 size={19}/>
                    ) : (
                      <div className="trip-cart-item-actions">
                        <Link href={piece?.href || href}>{piece?.status === "selected" ? "Wróć do oferty" : "Dodaj"} <ArrowRight size={14}/></Link>
                        <button type="button" onClick={() => markJourneyPieceOwned(key)}>Mam już</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {offer && accountStatus !== "loading" && (
          <section className={`trip-account-panel ${accountStatus === "signed-in" ? "is-synced" : "is-guest"}`} aria-label="Zapis planu na koncie">
            <div className="trip-account-panel-icon">{accountStatus === "signed-in" ? <Cloud size={21}/> : <UserRound size={21}/>}</div>
            <div className="trip-account-panel-copy">
              <small>{accountStatus === "signed-in" ? "PLAN ZABEZPIECZONY" : "NIE ZGUB TEGO PLANU"}</small>
              <strong>{accountStatus === "signed-in" ? "Ta podróż zapisuje się na Twoim koncie." : "Zapisz podróż na darmowym koncie Tripowni."}</strong>
              <p>{accountStatus === "signed-in" ? `${accountEmail ? `${accountEmail} · ` : ""}checklista, notatki, plan dnia i organizer synchronizują się automatycznie.` : "Po założeniu konta wrócisz dokładnie do tego planu. Zachowamy podróż, checklistę, notatki, plan dnia i organizer także na innych urządzeniach."}</p>
            </div>
            <Link href={accountStatus === "signed-in" ? "/konto" : "/konto?mode=register&next=/moja-podroz"}>
              {accountStatus === "signed-in" ? "Konto" : "Załóż konto"} <ArrowRight size={15}/>
            </Link>
          </section>
        )}

        {!offer ? (
          <div className="favorites-empty"><MapPinned size={30} /><h2>Zacznij od wyjazdu, który już masz — albo znajdź nowy.</h2><p>Nie musisz kupować przez Tripownię. Dodaj kierunek i termin, a potem ogarniaj dokumenty, pogodę, transport, atrakcje, jedzenie, checklistę i plan dnia w jednym miejscu.</p><div className="my-trip-empty-actions"><Link className="primary-cta" href="/dodaj-podroz">+ Dodaj własny wyjazd</Link><Link className="secondary-cta" href="/gdzie-leciec">Znajdź wyjazd <ArrowRight size={17}/></Link></div></div>
        ) : (
          <>
            <section className="trip-mode-grid">
              <div className="trip-mode-card trip-mode-reminder">
                <div className="trip-mode-title"><BellRing size={20}/><strong>Przed wylotem</strong></div>
                <p>{reminder}</p>
                <label><span>Data i godzina wylotu</span><input type="datetime-local" value={trip.departureAt || ""} onChange={(e) => save({ ...trip, departureAt: e.target.value })} /></label>
                <button className="trip-reminder-button" onClick={enableReminders}><BellRing size={16}/>{trip.remindersEnabled ? "Przypomnienia włączone" : "Włącz przypomnienia"}</button>
                {notificationStatus && <small>{notificationStatus}</small>}
              </div>

              <div className="trip-mode-card trip-weather-card">
                <div className="trip-mode-title"><CloudSun size={20}/><strong>Pogoda dla wyjazdu</strong>{!weather?.loading && !destinationPending && <button type="button" className="trip-weather-refresh" onClick={() => setWeatherRefresh((value) => value + 1)} aria-label="Odśwież pogodę"><RefreshCw size={14}/></button>}</div>
                {destinationPending ? (
                  <p>Wybierz kierunek, a pokażemy aktualną pogodę i prognozę na termin podróży.</p>
                ) : weather?.loading ? (
                  <p>Sprawdzam pogodę w {destinationName}…</p>
                ) : weather?.error ? (
                  <div className="trip-weather-message">
                    <p>{offer.weather ? `Orientacyjnie dla kierunku: ${offer.weather}. Dokładną prognozę pobierzemy przy kolejnym odświeżeniu.` : weather.error}</p>
                    <button type="button" onClick={() => setWeatherRefresh((value) => value + 1)}>Spróbuj ponownie</button>
                  </div>
                ) : weather ? (
                  <>
                    <div className="trip-weather"><strong>{weather.temperature}°C</strong><div><span>{weatherLabel(weather.code)}{weather.location ? ` · ${weather.location}` : ""}</span><small>Odczuwalna {weather.apparent}°C · wiatr {weather.wind} km/h</small></div></div>
                    {tripForecastDays.length > 0 ? (
                      <div className="trip-weather-forecast" aria-label="Prognoza na wyjazd">
                        <div className="trip-weather-forecast-title">Na termin wyjazdu</div>
                        <div className="trip-weather-days">{tripForecastDays.map((day) => <div key={day.date}><span>{new Date(`${day.date}T12:00:00`).toLocaleDateString("pl-PL", { weekday: "short", day: "numeric", month: "short" })}</span><strong>{day.max}° / {day.min}°</strong><small>{weatherLabel(day.code)}{day.rain > 0 ? ` · deszcz ${day.rain}%` : ""}</small></div>)}</div>
                      </div>
                    ) : tripStartDate && daysUntilTrip !== null && daysUntilTrip > 15 ? (
                      <div className="trip-weather-note"><strong>Dokładna prognoza pojawi się bliżej wyjazdu.</strong><span>Termin: {new Date(`${tripStartDate}T12:00:00`).toLocaleDateString("pl-PL", { day: "numeric", month: "long" })}{tripEndDate && tripEndDate !== tripStartDate ? ` – ${new Date(`${tripEndDate}T12:00:00`).toLocaleDateString("pl-PL", { day: "numeric", month: "long" })}` : ""}. Teraz pokazujemy warunki na miejscu.</span>{offer.weather && <small>Orientacyjnie dla kierunku: {offer.weather}</small>}</div>
                    ) : offer.weather ? (
                      <div className="trip-weather-note"><span>Orientacyjnie dla kierunku: <strong>{offer.weather}</strong>. Dane aktualne są powyżej.</span></div>
                    ) : null}
                  </>
                ) : <p>Odśwież pogodę, żeby pobrać dane dla {destinationName}.</p>}
              </div>

              <div className="trip-mode-card">
                <div className="trip-mode-title"><Plane size={20}/><strong>Lot</strong></div>
                {trip.flight?.trim() ? (
                  <>
                    <p><strong>{trip.flight}</strong></p>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(`${trip.flight} flight status`)}`} target="_blank" rel="noopener noreferrer">Sprawdź aktualny status <ExternalLink size={15}/></a>
                  </>
                ) : (
                  <>
                    <p>Nie masz jeszcze dodanego numeru lotu.</p>
                    <a href="#transport">Dodaj lot w szczegółach podróży <ArrowRight size={15}/></a>
                  </>
                )}
              </div>
            </section>

            <section className="trip-essentials">
              <div className="trip-essentials-head">
                <div><small>WSZYSTKO DO TEGO WYJAZDU</small><h2>{offer.manual ? "Uzupełnij tylko to, czego jeszcze nie masz." : "Pakiet jest bazą. Tripownia uzupełnia tylko braki."}</h2></div>
                <span>Twój plan zostaje w Tripowni</span>
              </div>
              <div className="trip-essentials-grid">
                {flightReady
                  ? <div className="trip-essential-done"><Plane size={20}/><span><strong>Lot</strong><small>Już dodany / w wybranym wyjeździe ✓</small></span><CheckCircle2 size={15}/></div>
                  : <Link href={trip.suggestedLinks?.flight || "/loty"}><Plane size={20}/><span><strong>Lot</strong><small>Znajdź połączenie do tego planu</small></span><ArrowRight size={15}/></Link>}
                {hotelReady
                  ? <div className="trip-essential-done"><BedDouble size={20}/><span><strong>Nocleg</strong><small>Już dodany / w wybranym wyjeździe ✓</small></span><CheckCircle2 size={15}/></div>
                  : <Link href={trip.suggestedLinks?.hotel || "/hotele"}><BedDouble size={20}/><span><strong>Nocleg</strong><small>Znajdź nocleg do tego planu</small></span><ArrowRight size={15}/></Link>}
                <Link href="/ubezpieczenia"><ShieldCheck size={20}/><span><strong>Ubezpieczenie</strong><small>Sprawdź przed wyjazdem</small></span><ArrowRight size={15}/></Link>
                <Link href="/esim"><Wifi size={20}/><span><strong>eSIM</strong><small>Internet na miejscu</small></span><ArrowRight size={15}/></Link>
                {transferReady
                  ? <div className="trip-essential-done"><Car size={20}/><span><strong>Transfer</strong><small>{offer.transferIncluded ? "W cenie pakietu ✓" : "Już ogarnięty ✓"}</small></span><CheckCircle2 size={15}/></div>
                  : <Link href="/transfery"><Car size={20}/><span><strong>Transfer</strong><small>Lotnisko → hotel</small></span><ArrowRight size={15}/></Link>}
                {attractionsReady
                  ? <div className="trip-essential-done"><Ticket size={20}/><span><strong>Atrakcje</strong><small>Wybrane / już masz ✓</small></span><CheckCircle2 size={15}/></div>
                  : <Link href="/atrakcje"><Ticket size={20}/><span><strong>Atrakcje</strong><small>Bilety i rezerwacje</small></span><ArrowRight size={15}/></Link>}
                {parkingReady
                  ? <div className="trip-essential-done"><Car size={20}/><span><strong>Parking</strong><small>Już ogarnięty ✓</small></span><CheckCircle2 size={15}/></div>
                  : <Link href={trip.suggestedLinks?.parking || "/parkingi"}><Car size={20}/><span><strong>Parking</strong><small>Przy lotnisku</small></span><ArrowRight size={15}/></Link>}
                <Link href="/wynajem-auta"><Car size={20}/><span><strong>Auto</strong><small>Wynajem na miejscu</small></span><ArrowRight size={15}/></Link>
                <Link href="/przed-wyjazdem"><FileCheck2 size={20}/><span><strong>Dokumenty</strong><small>Co sprawdzić</small></span><ArrowRight size={15}/></Link>
              </div>
            </section>

            {reminders.length > 0 && <section className="trip-reminders-strip">{reminders.map((item) => <div key={item.label} className={item.active ? "active" : ""}><span>{item.due}</span><strong>{item.label}</strong>{item.active && <em>TERAZ</em>}</div>)}</section>}

            <div className="my-trip-grid">
              <section className="my-trip-card" id="transport"><div className="my-trip-card-head"><Plane size={20}/><h2>Transport</h2></div><p><strong>{offer.departure}</strong> → {destinationPending ? "kierunek do wyboru" : destinationName}</p><input value={trip.flight || ""} onChange={(e) => save({ ...trip, flight: e.target.value })} placeholder="Dodaj numer lotu / godzinę" />{!flightReady && <Link className="my-trip-card-action" href={trip.suggestedLinks?.flight || "/loty"}>Znajdź lot dla tej podróży <ArrowRight size={15}/></Link>}</section>
              <section className="my-trip-card"><div className="my-trip-card-head"><BedDouble size={20}/><h2>Nocleg</h2></div><p><strong>{offer.hotel}</strong>{offer.board ? ` · ${offer.board}` : ""}</p><input value={trip.hotel || ""} onChange={(e) => save({ ...trip, hotel: e.target.value })} placeholder="Dodaj nazwę / numer rezerwacji" />{!hotelReady && <Link className="my-trip-card-action" href={trip.suggestedLinks?.hotel || "/hotele"}>Znajdź nocleg dla tej podróży <ArrowRight size={15}/></Link>}</section>
              <section className="my-trip-card"><div className="my-trip-card-head"><WalletCards size={20}/><h2>Budżet</h2></div>{offer.manual || offer.id < 0 ? <p>Własny wyjazd — dodawaj koszty poniżej w sekcji wydatków.</p> : <><div className="my-trip-budget"><span>Oferta</span><strong>{displayPrice.toLocaleString("pl-PL")} zł</strong></div>{cost && <div className="my-trip-budget total"><span>Szacowany pełny koszt</span><strong>{cost.total.toLocaleString("pl-PL")} zł / os.</strong></div>}<Link href="/porownaj">Porównaj z innymi ofertami →</Link></>}</section>
              <section className="my-trip-card"><div className="my-trip-card-head"><Ticket size={20}/><h2>Co ogarnąć</h2></div><div className="my-trip-checklist">{checklistItems.map((item) => { const checked = Boolean(trip.checklist?.[item]); return <button key={item} onClick={() => toggleChecklist(item)}>{checked ? <CheckCircle2 size={18}/> : <Circle size={18}/>}<span>{item}</span></button>; })}</div></section>
            </div>

            <section className="my-trip-card my-trip-today" id="plan-dnia">
              <div className="my-trip-card-head"><Clock3 size={20}/><h2>Co robić dziś</h2></div>
              <p className="my-trip-subcopy">Ułóż prosty plan dnia i miej go pod ręką w telefonie.</p>
              <div className="my-trip-plan-add"><input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} aria-label="Godzina" /><input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addPlanItem(); }} placeholder="np. Koloseum, plaża, kolacja w centrum" /><button onClick={addPlanItem}><Plus size={17}/> Dodaj</button></div>
              {dayPlan.length ? <div className="my-trip-timeline">{dayPlan.map((item) => <div className="my-trip-timeline-item" key={item.id}><span className="my-trip-time">{item.time}</span><div><strong>{item.title}</strong>{item.note ? <small>{item.note}</small> : null}</div><button onClick={() => removePlanItem(item.id)} aria-label={`Usuń ${item.title}`}><Trash2 size={16}/></button></div>)}</div> : <div className="my-trip-empty-line">Dodaj pierwszy punkt dnia.</div>}
              <div className="my-trip-quick-links"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${destinationName} attractions`)}`} target="_blank" rel="noopener noreferrer"><Map size={17}/> Atrakcje na mapie</a><Link href="/inspiracje"><Ticket size={17}/> Inspiracje Tripowni</Link></div>
            </section>

            <section className="my-trip-card trip-attractions">
              <div className="my-trip-card-head"><Sparkles size={20}/><h2>Co warto zrobić — {destinationName}</h2></div>
              <div className="trip-attraction-grid">{attractions.map((pick) => { const Icon = pick.icon === "landmark" ? Landmark : pick.icon === "food" ? UtensilsCrossed : pick.icon === "water" ? Waves : Sparkles; const href = `/atrakcje?q=${encodeURIComponent(pick.query)}`; return <Link key={pick.title} href={href}><Icon size={20}/><div><strong>{pick.title}</strong><span>{pick.subtitle}</span></div><ArrowRight size={16}/></Link>; })}</div>
            </section>

            <TripToolkit city={offer.city || offer.country} country={offer.country} tripId={trip.tripId || `trip-${offer.id}`} />

            {flightReady && (
              <section className="my-trip-card" aria-label="Pomoc po problemach z lotem">
                <div className="my-trip-card-head"><ShieldCheck size={20}/><h2>Lot opóźniony albo odwołany?</h2></div>
                <p>Jeśli coś pójdzie nie tak z lotem, możesz od razu sprawdzić, czy przysługuje Ci odszkodowanie. To dodatkowa opcja — nie wpływa na Twój plan podróży.</p>
                <div className="my-trip-quick-links">
                  <Link href={airHelpHref} prefetch={false}><ExternalLink size={17}/> Sprawdź odszkodowanie</Link>
                </div>
              </section>
            )}

            <section className="my-trip-card my-trip-notes"><div className="my-trip-card-head"><NotebookPen size={20}/><h2>Notatki</h2></div><textarea value={trip.notes || ""} onChange={(e) => save({ ...trip, notes: e.target.value })} placeholder="Restauracje, atrakcje, adresy, pomysły..." rows={5} /></section>
          </>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}