"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BedDouble, CheckCircle2, Circle, MapPinned, Plane, Ticket, WalletCards, NotebookPen, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { offers } from "@/lib/offers";
import { estimateTripCost } from "@/lib/tripCost";

type TripState = {
  offerId?: number;
  flight?: string;
  hotel?: string;
  notes?: string;
  checklist?: Record<string, boolean>;
};

const checklistItems = [
  "Sprawdź dokumenty",
  "Zrób odprawę online",
  "Dodaj ubezpieczenie",
  "Sprawdź transfer z lotniska",
  "Zarezerwuj atrakcje",
  "Sprawdź internet / eSIM",
];

export default function MyTrip() {
  const [trip, setTrip] = useState<TripState>({ checklist: {} });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null") as TripState | null;
      if (saved) setTrip({ checklist: {}, ...saved });
    } catch {}
  }, []);

  const offer = useMemo(() => offers.find((item) => item.id === trip.offerId), [trip.offerId]);
  const cost = offer ? estimateTripCost(offer) : null;

  function save(next: TripState) {
    setTrip(next);
    localStorage.setItem("tripownia-my-trip", JSON.stringify(next));
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));
  }

  function toggleChecklist(item: string) {
    save({ ...trip, checklist: { ...(trip.checklist || {}), [item]: !trip.checklist?.[item] } });
  }

  return (
    <main>
      <SiteHeader />
      <section className="shell my-trip-page">
        <div className="my-trip-hero">
          <div className="my-trip-icon"><MapPinned size={30} /></div>
          <div>
            <div className="kicker">MOJA PODRÓŻ</div>
            <h1>{offer ? `${offer.city}, ${offer.country}` : "Zaplanuj wyjazd z Tripownią"}</h1>
            <p>{offer ? `${offer.dates} · ${offer.nights} noce · wylot: ${offer.departure}` : "Dodaj wybraną ofertę, a Tripownia pomoże Ci ogarnąć cały wyjazd w jednym miejscu."}</p>
          </div>
        </div>

        {!offer ? (
          <div className="favorites-empty">
            <MapPinned size={30} />
            <h2>Nie masz jeszcze zapisanej podróży</h2>
            <p>Przy wybranej ofercie kliknij „Dodaj do Mojej podróży”.</p>
            <Link className="primary-cta" href="/dla-ciebie">Znajdź wyjazd <ArrowRight size={17}/></Link>
          </div>
        ) : (
          <>
            <div className="my-trip-grid">
              <section className="my-trip-card">
                <div className="my-trip-card-head"><Plane size={20}/><h2>Transport</h2></div>
                <p><strong>{offer.departure}</strong> → {offer.city}</p>
                <input value={trip.flight || ""} onChange={(e) => save({ ...trip, flight: e.target.value })} placeholder="Dodaj numer lotu / godzinę" />
              </section>

              <section className="my-trip-card">
                <div className="my-trip-card-head"><BedDouble size={20}/><h2>Hotel</h2></div>
                <p><strong>{offer.hotel}</strong> · {offer.board}</p>
                <input value={trip.hotel || ""} onChange={(e) => save({ ...trip, hotel: e.target.value })} placeholder="Dodaj numer rezerwacji / adres" />
              </section>

              <section className="my-trip-card">
                <div className="my-trip-card-head"><WalletCards size={20}/><h2>Budżet</h2></div>
                <div className="my-trip-budget"><span>Oferta</span><strong>{offer.price.toLocaleString("pl-PL")} zł</strong></div>
                {cost && <div className="my-trip-budget total"><span>Szacowany pełny koszt</span><strong>{cost.total.toLocaleString("pl-PL")} zł / os.</strong></div>}
                <Link href="/porownaj">Porównaj z innymi ofertami →</Link>
              </section>

              <section className="my-trip-card">
                <div className="my-trip-card-head"><Ticket size={20}/><h2>Co ogarnąć</h2></div>
                <div className="my-trip-checklist">
                  {checklistItems.map((item) => {
                    const checked = Boolean(trip.checklist?.[item]);
                    return <button key={item} onClick={() => toggleChecklist(item)}>{checked ? <CheckCircle2 size={18}/> : <Circle size={18}/>}<span>{item}</span></button>;
                  })}
                </div>
              </section>
            </div>

            <section className="my-trip-card my-trip-notes">
              <div className="my-trip-card-head"><NotebookPen size={20}/><h2>Notatki</h2></div>
              <textarea value={trip.notes || ""} onChange={(e) => save({ ...trip, notes: e.target.value })} placeholder="Restauracje, atrakcje, adresy, pomysły..." rows={5} />
            </section>
          </>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
