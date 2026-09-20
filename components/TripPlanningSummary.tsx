"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, Luggage, TicketCheck } from "lucide-react";

type OrganizerState = {
  packing?: Record<string, boolean>;
  itinerary?: Array<{ id?: string }>;
};

type ToolkitState = {
  reservations?: Array<{ id?: string }>;
};

function readJson<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") as T | null;
  } catch {
    return null;
  }
}

export default function TripPlanningSummary({ tripId }: { tripId: string }) {
  const [organizer, setOrganizer] = useState<OrganizerState | null>(null);
  const [toolkit, setToolkit] = useState<ToolkitState | null>(null);

  useEffect(() => {
    const load = () => {
      setOrganizer(readJson<OrganizerState>(`tripownia-organizer:${tripId}`));
      setToolkit(readJson<ToolkitState>(`tripownia-trip-toolkit:${tripId}`));
    };

    load();
    window.addEventListener("tripownia-my-trip-updated", load as EventListener);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("tripownia-my-trip-updated", load as EventListener);
      window.removeEventListener("storage", load);
    };
  }, [tripId]);

  const packed = useMemo(
    () => Object.values(organizer?.packing || {}).filter(Boolean).length,
    [organizer?.packing],
  );
  const itineraryCount = organizer?.itinerary?.length || 0;
  const reservationCount = toolkit?.reservations?.length || 0;

  return (
    <section className="my-trip-card trip-planning-summary">
      <div className="my-trip-card-head"><CalendarCheck2 size={20}/><h2>Twój organizer</h2></div>
      <p className="my-trip-subcopy">Szybki podgląd tego, co masz już ogarnięte w szczegółowym planie wyjazdu.</p>
      <div className="trip-planning-summary-grid">
        <div><TicketCheck size={18}/><span>Rezerwacje</span><strong>{reservationCount}</strong></div>
        <div><CalendarCheck2 size={18}/><span>Punkty planu</span><strong>{itineraryCount}</strong></div>
        <div><Luggage size={18}/><span>Spakowane</span><strong>{packed}</strong></div>
      </div>
      <Link className="primary-cta" href="/organizer">Otwórz cały organizer <ArrowRight size={17}/></Link>
    </section>
  );
}
