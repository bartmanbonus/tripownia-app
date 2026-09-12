"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BedDouble, CheckCircle2, Circle, MapPinned, Plane, Ticket, WalletCards, NotebookPen, ArrowRight, Clock3, Map, Plus, Trash2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { offers } from "@/lib/offers";
import { estimateTripCost } from "@/lib/tripCost";

type DayPlanItem = { id: string; time: string; title: string; note?: string };

type TripState = {
  offerId?: number;
  flight?: string;
  hotel?: string;
  notes?: string;
  checklist?: Record<string, boolean>;
  dayPlan?: DayPlanItem[];
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
  const [trip, setTrip] = useState<TripState>({ checklist: {}, dayPlan: [] });
  const [newTime, setNewTime] = useState("10:00");
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null") as TripState | null;
      if (saved) setTrip({ checklist: {}, dayPlan: [], ...saved });
    } catch {}
  }, []);

  const offer = useMemo(() => offers.find((item) => item.id === trip.offerId), [trip.offerId]);
  const cost = offer ? estimateTripCost(offer) : null;
  const dayPlan = useMemo(() => [...(trip.dayPlan || [])].sort((a, b) => a.time.localeCompare(b.time)), [trip.dayPlan]);

  function save(next: TripState) {
    setTrip(next);
    localStorage.setItem("tripownia-my-trip", JSON.stringify(next));
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));
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

            <section className="my-trip-card my-trip-today">
              <div className="my-trip-card-head"><Clock3 size={20}/><h2>Co robić dziś</h2></div>
              <p className="my-trip-subcopy">Ułóż prosty plan dnia i miej go pod ręką w telefonie.</p>
              <div className="my-trip-plan-add">
                <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} aria-label="Godzina" />
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addPlanItem(); }} placeholder="np. Koloseum, plaża, kolacja w centrum" />
                <button onClick={addPlanItem}><Plus size={17}/> Dodaj</button>
              </div>

              {dayPlan.length ? (
                <div className="my-trip-timeline">
                  {dayPlan.map((item) => (
                    <div className="my-trip-timeline-item" key={item.id}>
                      <span className="my-trip-time">{item.time}</span>
                      <div><strong>{item.title}</strong>{item.note ? <small>{item.note}</small> : null}</div>
                      <button onClick={() => removePlanItem(item.id)} aria-label={`Usuń ${item.title}`}><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              ) : <div className="my-trip-empty-line">Dodaj pierwszy punkt dnia.</div>}

              <div className="my-trip-quick-links">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${offer.city} attractions`)}`} target="_blank" rel="noopener noreferrer"><Map size={17}/> Atrakcje na mapie</a>
                <Link href="/inspiracje"><Ticket size={17}/> Inspiracje Tripowni</Link>
              </div>
            </section>

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
