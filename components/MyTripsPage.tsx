"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Archive, ArrowRight, CalendarDays, MapPinned, Plus, RotateCcw, Trash2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  TRIP_ARCHIVE_EVENT,
  activateArchivedTrip,
  readActiveTrip,
  readTripArchive,
  removeArchivedTrip,
  type TripArchiveSnapshot,
} from "@/lib/tripArchive";

type OfferSnapshot = {
  city?: string;
  country?: string;
  dates?: string;
  departure?: string;
  manual?: boolean;
};

type TripProgress = {
  reservations: number;
  itinerary: number;
  packed: number;
};

function tripLabel(trip: TripArchiveSnapshot) {
  const offer = trip.offerSnapshot as OfferSnapshot | undefined;
  if (offer?.city) return `${offer.city}${offer.country ? `, ${offer.country}` : ""}`;
  return "Podróż bez nazwy";
}

export default function MyTripsPage() {
  const [trips, setTrips] = useState<TripArchiveSnapshot[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, TripProgress>>({});

  const load = () => {
    const active = readActiveTrip();
    const archive = readTripArchive();
    const nextProgress: Record<string, TripProgress> = {};

    archive.forEach((trip) => {
      try {
        const organizer = JSON.parse(localStorage.getItem(`tripownia-organizer:${trip.tripId}`) || "null") as { packing?: Record<string, boolean>; itinerary?: unknown[] } | null;
        const toolkit = JSON.parse(localStorage.getItem(`tripownia-trip-toolkit:${trip.tripId}`) || "null") as { reservations?: unknown[] } | null;
        nextProgress[trip.tripId] = {
          reservations: Array.isArray(toolkit?.reservations) ? toolkit.reservations.length : 0,
          itinerary: Array.isArray(organizer?.itinerary) ? organizer.itinerary.length : 0,
          packed: organizer?.packing ? Object.values(organizer.packing).filter(Boolean).length : 0,
        };
      } catch {
        nextProgress[trip.tripId] = { reservations: 0, itinerary: 0, packed: 0 };
      }
    });

    setActiveId(active?.tripId || null);
    setTrips(archive);
    setProgress(nextProgress);
  };

  useEffect(() => {
    load();
    window.addEventListener(TRIP_ARCHIVE_EVENT, load as EventListener);
    window.addEventListener("tripownia-my-trip-updated", load as EventListener);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(TRIP_ARCHIVE_EVENT, load as EventListener);
      window.removeEventListener("tripownia-my-trip-updated", load as EventListener);
      window.removeEventListener("storage", load);
    };
  }, []);

  const ordered = useMemo(() => {
    return [...trips].sort((a, b) => {
      if (a.tripId === activeId) return -1;
      if (b.tripId === activeId) return 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [trips, activeId]);

  function activate(tripId: string) {
    if (activateArchivedTrip(tripId)) window.location.href = "/moja-podroz";
  }

  function remove(tripId: string) {
    if (tripId === activeId) return;
    removeArchivedTrip(tripId);
    load();
  }

  return (
    <main>
      <SiteHeader />
      <section className="shell my-trips-page">
        <div className="my-trips-hero">
          <div className="my-trips-icon"><Archive size={28}/></div>
          <div>
            <div className="kicker">TWOJA TRIPOWNIA</div>
            <h1>Moje podróże</h1>
            <p>Aktywny wyjazd i poprzednie plany w jednym miejscu. Archiwum zapisuje się lokalnie na tym urządzeniu.</p>
          </div>
        </div>

        <div className="my-trips-top-actions">
          <Link className="primary-cta" href="/dodaj-podroz"><Plus size={17}/> Dodaj własną podróż</Link>
          <Link href="/okazje">Znajdź nowy wyjazd <ArrowRight size={16}/></Link>
        </div>

        {ordered.length ? (
          <div className="my-trips-list">
            {ordered.map((trip) => {
              const offer = trip.offerSnapshot as OfferSnapshot | undefined;
              const active = trip.tripId === activeId;
              const completed = Object.values(trip.checklist || {}).filter(Boolean).length;
              return (
                <article key={trip.tripId} className={`my-trip-archive-card${active ? " active" : ""}`}>
                  <div>
                    <div className="my-trip-archive-topline">
                      <span>{active ? "AKTYWNA PODRÓŻ" : offer?.manual ? "WŁASNY PLAN" : "ZAPISANY PLAN"}</span>
                      {offer?.dates && <small><CalendarDays size={13}/>{offer.dates}</small>}
                    </div>
                    <h2>{tripLabel(trip)}</h2>
                    <p>{offer?.departure ? `Wylot / start: ${offer.departure}` : "Plan zapisany lokalnie"} · {completed} odhaczonych zadań</p>
                    <div className="my-trip-archive-progress">
                      <span>Rezerwacje <strong>{progress[trip.tripId]?.reservations || 0}</strong></span>
                      <span>Plan <strong>{progress[trip.tripId]?.itinerary || 0}</strong></span>
                      <span>Spakowane <strong>{progress[trip.tripId]?.packed || 0}</strong></span>
                    </div>
                  </div>
                  <div className="my-trip-archive-actions">
                    {active ? (
                      <Link href="/moja-podroz"><MapPinned size={16}/> Otwórz plan <ArrowRight size={15}/></Link>
                    ) : (
                      <button type="button" onClick={() => activate(trip.tripId)}><RotateCcw size={16}/> Ustaw jako aktywną</button>
                    )}
                    {!active && <button type="button" className="danger" onClick={() => remove(trip.tripId)}><Trash2 size={15}/> Usuń</button>}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="favorites-empty">
            <Archive size={30}/>
            <h2>Nie masz jeszcze zapisanych podróży</h2>
            <p>Możesz dodać wyjazd znaleziony w Tripowni albo własny lot i hotel kupione gdziekolwiek indziej.</p>
            <div className="my-trips-empty-actions">
              <Link className="primary-cta" href="/dodaj-podroz"><Plus size={17}/> Dodaj własną podróż</Link>
              <Link href="/okazje">Znajdź okazję <ArrowRight size={17}/></Link>
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
