"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPinned, Plane, BedDouble, Ticket, ListChecks, WalletCards } from "lucide-react";
import MyTrip from "@/components/MyTrip";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { offers, type Offer } from "@/lib/offers";
import { accountAuthEventName, ensureFreshAccountSession, readAccountSession } from "@/lib/accountAuth";

type StoredTrip = {
  offerId?: number;
  offerSnapshot?: Offer;
};

function hydrateStoredOffer() {
  try {
    const saved = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null") as StoredTrip | null;
    const snapshot = saved?.offerSnapshot;
    if (!snapshot?.id || !snapshot.city || !snapshot.country) return "static";

    const index = offers.findIndex((offer) => offer.id === snapshot.id);
    if (index >= 0) offers[index] = { ...offers[index], ...snapshot };
    else offers.push(snapshot);

    return `live-${snapshot.id}-${snapshot.priceCheckedAt || snapshot.price || "saved"}`;
  } catch {
    return "static";
  }
}

function PlannerEmptyState({ signedIn }: { signedIn: boolean }) {
  return <main>
    <SiteHeader/>
    <section className="shell my-trip-page">
      <div className="my-trip-hero">
        <div className="my-trip-icon"><MapPinned size={30}/></div>
        <div>
          <div className="kicker">MOJA PODRÓŻ</div>
          <h1>Nie masz jeszcze aktywnej podróży.</h1>
          <p>{signedIn
            ? "Dodaj pierwszy wyjazd. Zapiszemy go na Twoim koncie razem z planem dnia, checklistą, rezerwacjami, wydatkami i organizerem."
            : "Dodaj wyjazd lokalnie albo zaloguj się, żeby zachować podróże i wracać do nich na innych urządzeniach."}</p>
          <div className="planner-preview-actions">
            <Link className="primary-cta" href="/dodaj-podroz">+ Dodaj podróż</Link>
            <Link className="secondary-cta" href="/#wyszukiwarka">Znajdź wyjazd</Link>
          </div>
        </div>
      </div>

      <div className="favorites-empty">
        <h2>Twoje plany pojawią się tutaj.</h2>
        <p>Każda podróż ma własny plan, checklistę, notatki, rezerwacje, wydatki i przygotowanie. Możesz mieć ich kilka i wracać do nich później.</p>
        {!signedIn && <Link href="/konto?next=/moja-podroz">Zaloguj się, aby synchronizować między urządzeniami →</Link>}
      </div>
    </section>
    <SiteFooter/>
  </main>;
}

export default function MyTripResolver() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [tripKey, setTripKey] = useState("static");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const session = await ensureFreshAccountSession(readAccountSession());
      if (cancelled) return;
      setSignedIn(Boolean(session));
      setTripKey(session ? hydrateStoredOffer() : "static");
      setReady(true);
    };

    void load();
    const eventName = accountAuthEventName();
    const reload = () => void load();
    window.addEventListener("tripownia-my-trip-updated", reload as EventListener);
    window.addEventListener("storage", reload);
    window.addEventListener(eventName, reload);
    return () => {
      cancelled = true;
      window.removeEventListener("tripownia-my-trip-updated", reload as EventListener);
      window.removeEventListener("storage", reload);
      window.removeEventListener(eventName, reload);
    };
  }, []);

  if (!ready) return null;
  if (tripKey === "static") return <PlannerEmptyState signedIn={signedIn}/>;
  return <MyTrip key={tripKey}/>;
}
