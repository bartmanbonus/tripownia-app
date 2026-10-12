"use client";

import { useState, type RefObject } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  from: string;
  to: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (from: string, to: string) => void;
  containerRef: RefObject<HTMLDivElement | null>;
};

const weekdays = ["pon.", "wt.", "śr.", "czw.", "pt.", "sob.", "niedz."];

function isoLocal(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function addDays(value: string, offset: number) {
  const [year, month, day] = value.split("-").map(Number);
  return isoLocal(new Date(year, month - 1, day + offset));
}

function addMonths(value: string, offset: number) {
  const [year, month] = value.split("-").map(Number);
  const result = new Date(year, month - 1 + offset, 1);
  return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, "0")}`;
}

function shortDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  return new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}

function monthTitle(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

function nightsBetween(from: string, to: string) {
  if (!from || !to || to <= from) return 0;
  const start = Date.parse(`${from}T12:00:00Z`);
  const end = Date.parse(`${to}T12:00:00Z`);
  return Math.round((end - start) / 86400000);
}

function nightsLabel(nights: number) {
  return `${nights} ${nights === 1 ? "noc" : nights >= 2 && nights <= 4 ? "noce" : "nocy"}`;
}

function monthDays(key: string) {
  const [year, month] = key.split("-").map(Number);
  const first = new Date(year, month - 1, 1).getDay();
  const offset = (first + 6) % 7;
  const length = new Date(year, month, 0).getDate();
  const days: Array<string | null> = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= length; day++) {
    days.push(`${key}-${String(day).padStart(2, "0")}`);
  }
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export default function HotelStayPicker({
  from, to, open, onOpenChange, onChange, containerRef,
}: Props) {
  const now = new Date();
  const today = isoLocal(now);
  const currentMonth = today.slice(0, 7);
  const [visibleMonth, setVisibleMonth] = useState(() => from?.slice(0, 7) || currentMonth);
  const month = visibleMonth < currentMonth ? currentMonth : visibleMonth;
  const nights = nightsBetween(from, to);
  const summary = from && to
    ? `${shortDate(from)} – ${shortDate(to)} · ${nightsLabel(nights)}`
    : from ? `Od ${shortDate(from)} · wybierz wyjazd` : "Wybierz daty";

  function chooseDay(day: string) {
    if (!from || to || day <= from) {
      onChange(day, "");
    } else {
      onChange(from, day);
    }
  }

  function preset(daysUntilFriday: number) {
    const friday = addDays(today, daysUntilFriday);
    onChange(friday, addDays(friday, 2));
    setVisibleMonth(friday.slice(0, 7));
  }

  const fridayOffset = (5 - now.getDay() + 7) % 7;
  const tomorrow = addDays(today, 1);

  return (
    <div className={`search-v3-field hotel-stay-field${open ? " is-open" : ""}`} ref={containerRef}>
      <span><CalendarDays size={15} aria-hidden="true"/> Pobyt</span>
      <button
        type="button"
        className="hotel-stay-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => { if (!open && from) setVisibleMonth(from.slice(0, 7)); onOpenChange(!open); }}
      >
        <strong>{summary}</strong><ChevronDown size={15} aria-hidden="true"/>
      </button>

      {open && (
        <div className="hotel-stay-panel" role="dialog" aria-label="Wybierz termin noclegu">
          <div className="hotel-stay-header">
            <div><strong>Termin pobytu</strong><small>Wybierz dzień zameldowania i wymeldowania.</small></div>
            <button type="button" onClick={() => onOpenChange(false)} aria-label="Zamknij kalendarz"><X size={19}/></button>
          </div>
          <div className="hotel-stay-inputs">
            <label>Zameldowanie
              <input type="date" min={today} value={from} onChange={(event) => {
                const next = event.target.value;
                onChange(next, to && to > next ? to : "");
                if (next) setVisibleMonth(next.slice(0, 7));
              }}/>
            </label>
            <label>Wymeldowanie
              <input type="date" min={from ? addDays(from, 1) : tomorrow} value={to} onChange={(event) => {
                const next = event.target.value;
                if (from && next > from) onChange(from, next);
              }}/>
            </label>
          </div>
          <div className="hotel-stay-presets" aria-label="Szybkie terminy">
            <button type="button" onClick={() => preset(fridayOffset)}>Najbliższy weekend</button>
            <button type="button" onClick={() => preset(fridayOffset + 7)}>Kolejny weekend</button>
            <button type="button" onClick={() => {
              onChange(tomorrow, addDays(tomorrow, 7));
              setVisibleMonth(tomorrow.slice(0, 7));
            }}>7 nocy od jutra</button>
          </div>
          <div className="hotel-stay-navigation">
            <button type="button" aria-label="Poprzedni miesiąc" disabled={month <= currentMonth} onClick={() => setVisibleMonth(addMonths(month, -1))}><ChevronLeft size={19}/></button>
            <span>Wybierz daty na kalendarzu</span>
            <button type="button" aria-label="Następny miesiąc" onClick={() => setVisibleMonth(addMonths(month, 1))}><ChevronRight size={19}/></button>
          </div>
          <div className="hotel-stay-months">
            {[month, addMonths(month, 1)].map((key) => (
              <section key={key} aria-label={monthTitle(key)}>
                <h3>{monthTitle(key)}</h3>
                <div className="hotel-stay-days" aria-hidden="true">{weekdays.map((d) => <span key={d}>{d}</span>)}</div>
                <div className="hotel-stay-days">
                  {monthDays(key).map((day, index) => day ? (
                    <button
                      key={day}
                      type="button"
                      disabled={day < today}
                      className={`${day === from || day === to ? "selected" : ""}${from && to && day > from && day < to ? " in-range" : ""}`}
                      aria-label={`${day === from ? "Zameldowanie " : day === to ? "Wymeldowanie " : ""}${day}`}
                      aria-pressed={day === from || day === to}
                      onClick={() => chooseDay(day)}
                    >
                      {Number(day.slice(-2))}
                    </button>
                  ) : <span key={`empty-${key}-${index}`}/>)}
                </div>
              </section>
            ))}
          </div>
          <div className="hotel-stay-footer">
            <span>{nights ? `Pobyt: ${nightsLabel(nights)}` : from ? "Teraz wybierz wymeldowanie" : "Wybierz daty pobytu"}</span>
            <button type="button" onClick={() => onOpenChange(false)} disabled={!nights}>
              Zastosuj termin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
