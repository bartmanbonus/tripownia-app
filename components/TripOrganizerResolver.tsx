"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TripOrganizer from "@/components/TripOrganizer";
import { offers, type Offer } from "@/lib/offers";

type ActiveTrip = {
  tripId?: string;
  offerId?: number;
  offerSnapshot?: Offer;
  departureAt?: string;
};

export default function TripOrganizerResolver() {
  const [trip, setTrip] = useState<ActiveTrip | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = () => {
      try {
        const parsed = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null") as ActiveTrip | null;
        setTrip(parsed);
      } catch {
        setTrip(null);
      }
      setReady(true);
    };
    load();
    window.addEventListener("tripownia-my-trip-updated", load as EventListener);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("tripownia-my-trip-updated", load as EventListener);
      window.removeEventListener("storage", load);
    };
  }, []);

  const offer = useMemo(() => {
    if (!trip) return undefined;
    return trip.offerSnapshot || offers.find((item) => item.id === trip.offerId);
  }, [trip]);

  return (
    <main>
      <SiteHeader />
      <section className="shell my-trip-page">
        <div className="my-trip-hero">
          <div className="my-trip-icon"><MapPinned size={30}/></div>
          <div>
            <div className="kicker">MOJA PODRÓŻ</div>
            <h1>Organizer wyjazdu</h1>
            <p>{offer ? `${offer.city}, ${offer.country} · ${offer.dates}` : "Rezerwacje, pakowanie, plan dzień po dniu i praktyczne przygotowanie."}</p>
          </div>
        </div>

        {!ready ? null : offer && trip?.tripId ? (
          <TripOrganizer
            tripId={trip.tripId}
            city={offer.city}
            country={offer.country}
            nights={offer.nights}
            categories={offer.category || []}
            weather={offer.weather || ""}
            departureAt={trip.departureAt}
          />
        ) : (
          <div className="favorites-empty">
            <MapPinned size={30}/>
            <h2>Najpierw wybierz podróż</h2>
            <p>Organizer jest przypisany do konkretnego wyjazdu, żeby checklisty i rezerwacje nie mieszały się między podróżami.</p>
            <Link className="primary-cta" href="/okazje">Znajdź wyjazd <ArrowRight size={17}/></Link>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
