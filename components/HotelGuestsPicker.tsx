"use client";

import { useEffect, useRef, useState } from "react";
import { BedDouble, ChevronDown, Minus, Plus, Users, X } from "lucide-react";

export type HotelGuestsValue = {
  adults: number;
  rooms: number;
  childAges: number[];
};

type Props = {
  value: HotelGuestsValue;
  onChange: (value: HotelGuestsValue) => void;
};

function peopleLabel(count: number) {
  return count === 1 ? "osoba" : count < 5 ? "osoby" : "osób";
}

function roomsLabel(count: number) {
  return count === 1 ? "pokój" : count < 5 ? "pokoje" : "pokoi";
}

export default function HotelGuestsPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const children = value.childAges.length;
  const people = value.adults + children;

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!hostRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

  const setAdults = (adults: number) => {
    const safe = Math.max(1, Math.min(16, adults));
    onChange({ ...value, adults: safe, rooms: Math.min(value.rooms, safe) });
  };
  const setRooms = (rooms: number) => {
    const safe = Math.max(1, Math.min(8, rooms));
    onChange({ ...value, rooms: safe, adults: Math.max(value.adults, safe) });
  };
  const setChildren = (count: number) => {
    const safe = Math.max(0, Math.min(8, count));
    onChange({
      ...value,
      childAges: Array.from({ length: safe }, (_, index) => value.childAges[index] ?? 7),
    });
  };

  return (
    <div className={`search-v3-field hotel-guests-field${open ? " is-open" : ""}`} ref={hostRef}>
      <span><Users size={15} aria-hidden="true"/> Goście i pokoje</span>
      <button
        type="button"
        className="hotel-guests-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
      >
        <strong>{people} {peopleLabel(people)} · {value.rooms} {roomsLabel(value.rooms)}</strong>
        <ChevronDown size={15} aria-hidden="true"/>
      </button>

      {open && (
        <div className="hotel-guests-panel" role="dialog" aria-label="Ustaw liczbę gości i pokoi">
          <div className="hotel-guests-panel-heading">
            <div><strong>Kto jedzie?</strong><small>Ustal skład grupy, aby znaleźć odpowiednie pokoje.</small></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Zamknij wybór gości"><X size={18}/></button>
          </div>

          {[
            { key: "adults", title: "Dorośli", detail: "Od 18 lat", count: value.adults, min: 1, max: 16, update: setAdults },
            { key: "children", title: "Dzieci", detail: "Wiek 0–17 lat", count: children, min: 0, max: 8, update: setChildren },
            { key: "rooms", title: "Pokoje", detail: "Ile pokoi potrzebujesz?", count: value.rooms, min: 1, max: 8, update: setRooms },
          ].map((row) => (
            <div className="hotel-guests-stepper" key={row.key}>
              <div><strong>{row.title}</strong><small>{row.detail}</small></div>
              <div className="hotel-guests-stepper-actions">
                <button type="button" disabled={row.count <= row.min} aria-label={`Mniej: ${row.title.toLowerCase()}`} onClick={() => row.update(row.count - 1)}><Minus size={17}/></button>
                <output aria-label={row.title}>{row.count}</output>
                <button type="button" disabled={row.count >= row.max} aria-label={`Więcej: ${row.title.toLowerCase()}`} onClick={() => row.update(row.count + 1)}><Plus size={17}/></button>
              </div>
            </div>
          ))}

          {children > 0 && (
            <div className="hotel-guests-child-ages">
              <strong>Wiek dzieci w dniu zameldowania</strong>
              <div>
                {value.childAges.map((age, index) => (
                  <label key={index}>
                    Dziecko {index + 1}
                    <select
                      value={age}
                      onChange={(event) => onChange({
                        ...value,
                        childAges: value.childAges.map((current, position) => position === index ? Number(event.target.value) : current),
                      })}
                    >
                      {Array.from({ length: 18 }, (_, year) => <option key={year} value={year}>{year} {year === 1 ? "rok" : year > 1 && year < 5 ? "lata" : "lat"}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button type="button" className="hotel-guests-done" onClick={() => setOpen(false)}>
            <BedDouble size={17}/> Zastosuj · {people} {peopleLabel(people)}, {value.rooms} {roomsLabel(value.rooms)}
          </button>
        </div>
      )}
    </div>
  );
}
