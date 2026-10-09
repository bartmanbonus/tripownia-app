"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, BedDouble, Bell, CarFront, Check, CheckCircle2,
  Compass, MapPinned, ParkingCircle, Plane, Plus, ShieldCheck,
  Smartphone, Sparkles, TicketCheck,
  type LucideIcon,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { readActiveTrip, TRIP_ARCHIVE_EVENT, type TripArchiveSnapshot } from "@/lib/tripArchive";
import { updateActiveTripJourneyPiece, type JourneyPieceKey, type JourneyPieceMeta } from "@/lib/tripJourney";

type CommandTrip = TripArchiveSnapshot & {
  journeyPieces?: Partial<Record<JourneyPieceKey, JourneyPieceMeta>>;
};
type Service = {
  key: JourneyPieceKey;
  icon: LucideIcon;
  name: string;
  description: string;
};
type ServiceStatus = "owned" | "selected" | "missing";

const SERVICES: Service[] = [
  { key: "flight", icon: Plane, name: "Lot", description: "Wybierz połączenie i lotnisko." },
  { key: "hotel", icon: BedDouble, name: "Nocleg", description: "Dobierz hotel do kierunku." },
  { key: "transfer", icon: MapPinned, name: "Transfer", description: "Z lotniska do miejsca pobytu." },
  { key: "attractions", icon: TicketCheck, name: "Atrakcje", description: "Bilety i przeżycia na miejscu." },
  { key: "car", icon: CarFront, name: "Samochód", description: "Auto, jeśli przyda się na trasie." },
  { key: "esim", icon: Smartphone, name: "Internet", description: "Połączenie z siecią po przylocie." },
  { key: "parking", icon: ParkingCircle, name: "Parking", description: "Miejsce przy lotnisku wylotu." },
];

function serviceHref(piece: JourneyPieceKey, place: string) {
  const q = encodeURIComponent(place);
  if (piece === "flight") return place ? "/loty?q=" + q : "/loty";
  if (piece === "hotel") return place ? "/hotele?q=" + q : "/hotele";
  if (piece === "transfer") return place ? "/transfery?destination=" + q : "/transfery";
  if (piece === "attractions") return place ? "/atrakcje?q=" + q : "/atrakcje";
  if (piece === "car") return "/wynajem-auta";
  if (piece === "esim") return "/przed-wyjazdem#internet";
  return "/przed-wyjazdem#parking";
}

function currentStatus(trip: CommandTrip | null, piece: JourneyPieceKey): ServiceStatus {
  const status = trip?.journeyPieces?.[piece]?.status;
  if (status === "owned" || status === "selected" || status === "missing") return status;
  // Earlier manually added trips may have reservations without journeyPieces.
  if (piece === "flight" && typeof trip?.flight === "string" && trip.flight.trim()) return "owned";
  if (piece === "hotel" && typeof trip?.hotel === "string" && trip.hotel.trim()) return "owned";
  return "missing";
}

export default function TripCommandCenter({ compact = false }: { compact?: boolean }) {
  const [trip, setTrip] = useState<CommandTrip | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reload = () => {
      setTrip(readActiveTrip() as CommandTrip | null);
      setReady(true);
    };
    reload();
    window.addEventListener("tripownia-my-trip-updated", reload);
    window.addEventListener(TRIP_ARCHIVE_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener("tripownia-my-trip-updated", reload);
      window.removeEventListener(TRIP_ARCHIVE_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  if (!ready) return null;

  const snapshot = trip?.offerSnapshot as { city?: string; country?: string; dates?: string } | undefined;
  const city = typeof snapshot?.city === "string" ? snapshot.city : "";
  const country = typeof snapshot?.country === "string" ? snapshot.country : "";
  const destination = [city, country].filter(Boolean).join(", ");
  const steps = SERVICES.map((service) => ({ ...service, status: currentStatus(trip, service.key) }));
  const done = steps.filter((service) => service.status === "owned").length;
  const next = steps.find((service) => service.status !== "owned");

  function markService(piece: JourneyPieceKey, status: ServiceStatus) {
    const nextStatus = status === "owned" ? "missing" : "owned";
    const saved = updateActiveTripJourneyPiece(piece, {
      status: nextStatus,
      bookedAt: nextStatus === "owned" ? new Date().toISOString() : undefined,
    }, { requireDestinationMatch: false });
    if (!saved) return;
    trackEvent("trip_center_service_status", {
      service: piece, status: nextStatus, destination, source: compact ? "homepage" : "app",
    });
  }

  function trackOpen(piece: JourneyPieceKey, status: ServiceStatus) {
    trackEvent("trip_center_service_open", {
      service: piece, status, destination, source: compact ? "homepage" : "app",
    });
  }

  if (compact) {
    return (
      <section className="shell trip-command-center trip-command-center-compact" aria-label="Twój aktualny plan podróży">
        <div className="trip-command-compact-icon"><Compass size={24}/></div>
        <div className="trip-command-compact-copy">
          <div className="kicker">JEDNO MIEJSCE · CAŁA PODRÓŻ</div>
          <h2>{trip ? (destination || "Twój wyjazd") : "Twoje centrum podróży"} <span>{trip ? "· " + done + " z " + SERVICES.length + " elementów gotowych" : "· Loty · Noclegi · Atrakcje · Planer"}</span></h2>
          <p>{trip ? (next ? "Kolejny krok: " + next.name.toLocaleLowerCase("pl") + ". Wróć do planu, bez zaczynania od zera." : "Wszystkie elementy oznaczone. Zaplanuj dni i sprawdź checklistę.") : "Wyszukaj ofertę, zarezerwuj u partnera i wróć do jednego planera. Wszystkie ważne sprawy w jednym miejscu."}</p>
        </div>
        <Link className="trip-command-compact-action" href="/app" onClick={() => trackEvent("trip_center_open", { source: "homepage" })}>
          {trip ? "Otwórz moje centrum" : "Poznaj centrum Tripowni"} <ArrowRight size={17}/>
        </Link>
      </section>
    );
  }

  return (
    <section className="trip-command-center" id="centrum-podrozy" aria-labelledby="trip-command-title">
      <div className="trip-command-heading">
        <div>
          <div className="kicker"><Sparkles size={15}/> JEDNO MIEJSCE · CAŁA PODRÓŻ</div>
          <h2 id="trip-command-title">{trip ? (destination || "Twój wyjazd") + " — wszystko pod kontrolą" : "Twoje centrum podróży"}</h2>
          <p>{trip
            ? "Tripownia łączy Twój plan, rezerwacje i brakujące usługi. Samodzielnie zaznaczasz, co już masz."
            : "Znajdź wyjazd albo dodaj ten, który masz już kupiony. Resztę zorganizujesz w jednym panelu."}</p>
        </div>
        {trip ? (
          <div className="trip-command-counter">
            <strong>{done} / {SERVICES.length}</strong>
            <span>elementów oznaczonych jako gotowe</span>
            <div role="progressbar" aria-label="Postęp organizacji podróży" aria-valuemin={0} aria-valuemax={SERVICES.length} aria-valuenow={done}>
              <i style={{ width: (done / SERVICES.length * 100) + "%" }}/>
            </div>
          </div>
        ) : null}
      </div>

      {!trip ? (
        <div className="trip-command-start">
          <Link href="/szukaj" onClick={() => trackEvent("trip_center_start", { intent: "search" })}>
            <Compass size={25}/><strong>Znajdź wyjazd</strong><span>Lot, hotel i aktualne propozycje</span><ArrowRight size={17}/>
          </Link>
          <Link href="/dodaj-podroz?mode=owned" onClick={() => trackEvent("trip_center_start", { intent: "owned" })}>
            <Plus size={25}/><strong>Mam już rezerwację</strong><span>Dodaj podróż i ułóż jej plan</span><ArrowRight size={17}/>
          </Link>
          <Link href="/moje-podroze" onClick={() => trackEvent("trip_center_start", { intent: "archive" })}>
            <MapPinned size={25}/><strong>Moje podróże</strong><span>Wracaj do zapisanych planów</span><ArrowRight size={17}/>
          </Link>
        </div>
      ) : (
        <>
          <div className="trip-command-next" aria-live="polite">
            <span className="trip-command-next-icon">{next ? <Compass size={22}/> : <CheckCircle2 size={22}/>}</span>
            <div>
              <span className="kicker">{next ? "SUGEROWANY KOLEJNY KROK" : "PLAN WYPEŁNIONY"}</span>
              <strong>{next ? "Sprawdź: " + next.name.toLocaleLowerCase("pl") : "Wróć do planera podróży"}</strong>
              <p>{next ? (next.status === "selected" ? "Oglądałeś już opcje. Sprawdź, czy masz rezerwację." : next.description) : "Zorganizuj plan dnia, dokumenty i przygotowania."}</p>
            </div>
            <Link href={next ? serviceHref(next.key, destination) : "/moja-podroz"} onClick={() => { if (next) trackOpen(next.key, next.status); }}>
              {next ? "Przejdź do usługi" : "Otwórz planer"} <ArrowRight size={16}/>
            </Link>
          </div>

          <div className="trip-command-grid" aria-label="Elementy Twojej podróży">
            {steps.map(({ key, icon: Icon, name, description, status }) => (
              <article className={"trip-command-service is-" + status} key={key}>
                <div className="trip-command-service-top">
                  <span className="trip-command-service-icon"><Icon size={20}/></span>
                  <span className="trip-command-service-state">
                    {status === "owned" ? <Check size={13}/> : null}
                    {status === "owned" ? "Mam już" : status === "selected" ? "W trakcie wyboru" : "Do załatwienia"}
                  </span>
                </div>
                <h3>{name}</h3>
                <p>{description}</p>
                <div className="trip-command-service-actions">
                  <Link href={serviceHref(key, destination)} onClick={() => trackOpen(key, status)}>Sprawdź <ArrowRight size={14}/></Link>
                  <button type="button" onClick={() => markService(key, status)} aria-label={(status === "owned" ? "Cofnij oznaczenie: " : "Oznacz jako zarezerwowane: ") + name}>
                    {status === "owned" ? "Cofnij" : "Mam już"}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="trip-command-footer">
            <span><ShieldCheck size={16}/> Oznaczenia dodajesz samodzielnie — nie są potwierdzeniem zakupu przez partnera.</span>
            <div>
              <Link href="/moja-podroz">Planer i dokumenty <ArrowRight size={14}/></Link>
              <Link href="/alerty"><Bell size={15}/> Alerty</Link>
              <Link href="/przed-wyjazdem">Przygotowanie do wyjazdu</Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
