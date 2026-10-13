"use client";

import { useState, type RefObject } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";

export type HotelDatePreferences = {
  mode: "dates" | "months";
  flexDays: 0 | 1 | 2 | 3 | 7;
  months: string[];
  stayLength: "weekend" | "week" | "month" | "custom";
  nights: number;
};

export const DEFAULT_HOTEL_DATE_PREFERENCES: HotelDatePreferences = {
  mode: "dates",
  flexDays: 0,
  months: [],
  stayLength: "weekend",
  nights: 3,
};

type Props = {
  preferences: HotelDatePreferences;
  onPreferencesChange: (next: HotelDatePreferences) => void;
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
  from, to, open, onOpenChange, onChange, containerRef, preferences, onPreferencesChange,
}: Props) {
  const now = new Date();
  const today = isoLocal(now);
  const currentMonth = today.slice(0, 7);
  const [visibleMonth, setVisibleMonth] = useState(() => from?.slice(0, 7) || currentMonth);
  const month = visibleMonth < currentMonth ? currentMonth : visibleMonth;
  const nights = nightsBetween(from, to);
  const selectedMonthNames = preferences.months.map((key) => monthTitle(key).replace(" ", " ")).join(", ");
  const flexStayLabel = preferences.stayLength === "weekend" ? "weekend"
    : preferences.stayLength === "week" ? "tydzień"
    : preferences.stayLength === "month" ? "miesiąc"
    : nightsLabel(preferences.nights);
  const summary = preferences.mode === "months"
    ? preferences.months.length ? `${selectedMonthNames} · ${flexStayLabel}` : "Wybierz miesiące"
    : from && to
      ? `${shortDate(from)} – ${shortDate(to)} · ${nightsLabel(nights)}${preferences.flexDays ? ` · ±${preferences.flexDays} dni` : ""}`
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
    onPreferencesChange({ ...preferences, mode: "dates", flexDays: 0 });
  }

  function toggleMonth(key: string) {
    const selected = preferences.months.includes(key);
    const months = selected
      ? preferences.months.filter((item) => item !== key)
      : preferences.months.length < 3 ? [...preferences.months, key].sort() : preferences.months;
    onPreferencesChange({ ...preferences, mode: "months", months });
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
          <div className="hotel-stay-mode-tabs" role="tablist" aria-label="Sposób wyboru dat">
            <button type="button" role="tab" aria-selected={preferences.mode === "dates"} className={preferences.mode === "dates" ? "active" : ""} onClick={() => onPreferencesChange({ ...preferences, mode: "dates" })}>Konkretne daty</button>
            <button type="button" role="tab" aria-selected={preferences.mode === "months"} className={preferences.mode === "months" ? "active" : ""} onClick={() => onPreferencesChange({ ...preferences, mode: "months" })}>Dowolny termin</button>
          </div>
          {preferences.mode === "months" ? (
            <div className="hotel-stay-flex-months">
              <strong>Na jak długo?</strong>
              <div className="hotel-stay-length-options" role="group" aria-label="Długość pobytu">
                {([
                  ["weekend", "Weekend"],
                  ["week", "Tydzień"],
                  ["month", "Miesiąc"],
                  ["custom", "Własna liczba nocy"],
                ] as const).map(([key, label]) => (
                  <button key={key} type="button" aria-pressed={preferences.stayLength === key}
                    className={preferences.stayLength === key ? "active" : ""}
                    onClick={() => onPreferencesChange({ ...preferences, stayLength: key })}>{label}</button>
                ))}
              </div>
              {preferences.stayLength === "custom" && (
                <label className="hotel-stay-custom-nights">Liczba nocy
                  <input type="number" min={1} max={30} value={preferences.nights}
                    onChange={(event) => onPreferencesChange({
                      ...preferences, nights: Math.max(1, Math.min(30, Number(event.target.value) || 1))
                    })}/>
                </label>
              )}
              <strong>Kiedy chcesz wyjechać?</strong>
              <p>Wybierz maksymalnie 3 miesiące. Możesz zaznaczyć miesiące nieobok siebie.</p>
              <div className="hotel-stay-month-options" role="group" aria-label="Miesiące podróży">
                {Array.from({ length: 16 }, (_, index) => addMonths(currentMonth, index)).map((key) => {
                  const selected = preferences.months.includes(key);
                  return <button type="button" key={key}
                    aria-pressed={selected}
                    disabled={!selected && preferences.months.length >= 3}
                    className={selected ? "active" : ""}
                    onClick={() => toggleMonth(key)}>
                    <span>{monthTitle(key).split(" ")[0]}</span><small>{key.slice(0, 4)}</small>
                  </button>;
                })}
              </div>
              <p className="hotel-stay-month-count">{preferences.months.length}/3 miesiące</p>
            </div>
          ) : (
          <>
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
              onPreferencesChange({ ...preferences, flexDays: 0 });
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
          <div className="hotel-stay-flex-days" role="group" aria-label="Elastyczność dat">
            <strong>Elastyczność dat</strong>
            <div>
              {([0, 1, 2, 3, 7] as const).map((days) => (
                <button type="button" key={days} aria-pressed={preferences.flexDays === days}
                  className={preferences.flexDays === days ? "active" : ""}
                  onClick={() => onPreferencesChange({ ...preferences, mode: "dates", flexDays: days })}>
                  {days === 0 ? "Dokładnie" : `±${days} ${days === 1 ? "dzień" : "dni"}`}
                </button>
              ))}
            </div>
          </div>
          </>
          )}
          <div className="hotel-stay-footer">
            <span>{preferences.mode === "months"
              ? preferences.months.length ? `${preferences.months.length} mies. · ${flexStayLabel}` : "Wybierz przynajmniej jeden miesiąc"
              : nights ? `Pobyt: ${nightsLabel(nights)}` : from ? "Teraz wybierz wymeldowanie" : "Wybierz daty pobytu"}</span>
            <button type="button" onClick={() => onOpenChange(false)}
              disabled={preferences.mode === "months" ? !preferences.months.length : !nights}>
              Zastosuj termin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
