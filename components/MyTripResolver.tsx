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

function PlannerPreview() {
  return <main>
    <SiteHeader/>
    <section className="shell my-trip-page">
      <div className="my-trip-hero">
        <div className="my-trip-icon"><MapPinned size={30}/></div>
        <div>
          <div className="kicker">TWÓJ PRYWATNY PLANER</div>
          <h1>Cała podróż w jednym miejscu — nawet jeśli kupiłeś ją gdzie indziej.</h1>
          <p>To podgląd możliwości. Po zalogowaniu tworzysz własny prywatny plan przypisany do konta. Nie pokazujemy tu planu żadnego użytkownika.</p>
        </div>
      </div>

      <section className="trip-readiness">
        <div className="trip-readiness-main">
          <div className="trip-readiness-score"><strong>Demo</strong><span>planera</span></div>
          <div className="trip-readiness-copy">
            <small>JEDEN WYJAZD · JEDNO MIEJSCE</small>
            <h2>Zbierasz to, czego normalnie szukasz w kilku aplikacjach.</h2>
            <p>Lot, hotel, dokumenty, pogoda, transfer, atrakcje, plan dnia, wydatki, notatki i checklista zostają przy konkretnej podróży.</p>
          </div>
        </div>
      </section>

      <div className="my-trip-grid">
        <section className="my-trip-card"><div className="my-trip-card-head"><Plane size={20}/><h2>Transport</h2></div><p>Dodaj własny lot, numer rejsu i godzinę startu. Nie musisz kupować biletu przez Tripownię.</p></section>
        <section className="my-trip-card"><div className="my-trip-card-head"><BedDouble size={20}/><h2>Nocleg</h2></div><p>Zapisz hotel lub apartament kupiony gdziekolwiek i miej adres oraz informacje przy wyjeździe.</p></section>
        <section className="my-trip-card"><div className="my-trip-card-head"><ListChecks size={20}/><h2>Przygotowanie</h2></div><p>Dokumenty, ubezpieczenie, eSIM, transfer, bagaż i rzeczy do zrobienia przed wyjazdem.</p></section>
        <section className="my-trip-card"><div className="my-trip-card-head"><Ticket size={20}/><h2>Plan na miejscu</h2></div><p>Atrakcje, bilety, restauracje, plan dnia i własne notatki w jednym planie.</p></section>
        <section className="my-trip-card"><div className="my-trip-card-head"><WalletCards size={20}/><h2>Budżet i rezerwacje</h2></div><p>Zbieraj koszty i informacje dotyczące konkretnej podróży bez przerzucania się między notatkami.</p></section>
        <section className="my-trip-card"><div className="my-trip-card-head"><CheckCircle2 size={20}/><h2>Wracasz na każdym urządzeniu</h2></div><p>Po zalogowaniu plan synchronizuje się z Twoim kontem i jest odseparowany od planów innych użytkowników.</p></section>
      </div>

      <div className="favorites-empty">
        <h2>Masz już wyjazd? Dodaj go. Nie masz? Najpierw go znajdź.</h2>
        <p>Tripownia ma działać także wtedy, gdy lot, hotel lub całą podróż kupujesz poza nami.</p>
        <div className="my-trip-empty-actions">
          <Link className="primary-cta" href="/konto?next=/dodaj-podroz">Zaloguj się i utwórz plan <ArrowRight size={17}/></Link>
          <Link className="secondary-cta" href="/#wyszukiwarka">Najpierw znajdź wyjazd</Link>
        </div>
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
  if (!signedIn) return <PlannerPreview/>;
  return <MyTrip key={tripKey}/>;
}
