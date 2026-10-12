"use client";

import { TrainFront, Hotel, ArrowUpRight } from "lucide-react";
import { partners } from "@/lib/partners";
import { saveAffiliateReturnContext } from "@/lib/affiliateReturn";

type Props = {
  destination: string;
  departures: string[];
  month: string;
  duration: string;
  dateFrom?: string;
  dateTo?: string;
};

const RAIL_ORIGINS: Record<string, string> = {
  WAW: "Warszawy",
  WMI: "Warszawy",
  WAWA: "Warszawy",
  KRK: "Krakowa",
  KTW: "Katowic",
  GDN: "Gdańska",
  WRO: "Wrocławia",
  POZ: "Poznania",
  RZE: "Rzeszowa",
  LUZ: "Lublina",
  SZZ: "Szczecina",
  LCJ: "Łodzi",
  BZG: "Bydgoszczy",
};

type Stay = { from: string; to: string; label: string };

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateLabel(from: string, to: string) {
  const formatter = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", timeZone: "UTC" });
  return `${formatter.format(new Date(`${from}T12:00:00Z`))} – ${formatter.format(new Date(`${to}T12:00:00Z`))}`;
}

/** Suggested search dates only, never advertised as confirmed inventory. */
function suggestedStays(month: string, duration: string, dateFrom = "", dateTo = ""): Stay[] {
  // In the Tripownia search, from/to is the *allowed departure window*,
  // not a hotel's check-in and check-out dates.
  const requestedMonth = /^2026-(11|12)$/.test(month)
    ? month
    : /^2026-(11|12)-\d{2}$/.test(dateFrom) ? dateFrom.slice(0, 7) : "";
  if (!requestedMonth) return [];

  const [year, monthNumber] = requestedMonth.split("-").map(Number);
  const monthEnd = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const monthStartISO = `${requestedMonth}-01`;
  const monthEndISO = `${requestedMonth}-${String(monthEnd).padStart(2, "0")}`;
  const earliest = [monthStartISO, "2026-11-25", dateFrom || monthStartISO, new Date().toISOString().slice(0, 10)].sort().at(-1) || "";
  const latest = [monthEndISO, "2026-12-24", dateTo || monthEndISO].sort()[0] || "";
  const nights = Math.max(2, Math.min(7, Number(duration.match(/^\d+/)?.[0] || 2)));
  if (!earliest || earliest > latest) return [];

  const result: Stay[] = [];
  const tryStart = (date: Date) => {
    const from = isoDate(date);
    const to = isoDate(new Date(date.getTime() + nights * 86_400_000));
    if (from >= earliest && to <= latest && !result.some((stay) => stay.from === from)) {
      result.push({ from, to, label: dateLabel(from, to) });
    }
  };
  const first = Date.parse(`${earliest}T12:00:00Z`);
  const last = Date.parse(`${latest}T12:00:00Z`);
  for (let time = first; time <= last && result.length < 3; time += 86_400_000) {
    const date = new Date(time);
    if (date.getUTCDay() === 5) tryStart(date); // prefer Friday departures
  }
  if (!result.length) {
    for (let time = first; time <= last && result.length < 3; time += 86_400_000) {
      tryStart(new Date(time));
    }
  }
  return result;
}

function hotelSearchLink(stay?: Stay) {
  const booking = new URL("https://www.booking.com/searchresults.pl.html");
  booking.searchParams.set("ss", "Drezno, Niemcy");
  if (stay) {
    booking.searchParams.set("checkin", stay.from);
    booking.searchParams.set("checkout", stay.to);
  }
  const target = partners.booking.buildUrl(booking.toString());
  return `/sprawdz-oferte?${new URLSearchParams({
    partner: "booking",
    target,
    source: "dresden_ground_city_break",
    destination: "Drezno",
  }).toString()}`;
}

export default function DresdenCityBreakOptions({
  destination, departures, month, duration, dateFrom = "", dateTo = "",
}: Props) {
  if (!/^(drezno|dresden)(?:\s*,|$)/i.test(destination.trim())) return null;

  const stations = [...new Set(departures.map((code) => RAIL_ORIGINS[code]).filter(Boolean))];
  const origin = stations.length === 1 ? stations[0] : "Polski";
  const stays = suggestedStays(month, duration, dateFrom, dateTo);

  return (
    <aside className="search-v3-ground-option" aria-label="Drezno: dojazd pociągiem i noclegi">
      <span className="search-v3-ground-eyebrow"><TrainFront size={15} aria-hidden="true" /> ALTERNATYWA DLA LOTU + HOTELU</span>
      <h4>Drezno: sprawdź też pociąg + nocleg</h4>
      <p>
        Dla tego kierunku może brakować gotowych pakietów lotniczych z wybranego lotniska.
        Sprawdź dojazd kolejowy z {origin} i nocleg w Dreźnie.
        To dwa osobne wyszukiwania, bez obietnicy dostępności lub ceny pakietu.
      </p>
      <div className="search-v3-ground-actions">
        <a href="https://www.intercity.pl/" target="_blank" rel="noopener noreferrer">
          <TrainFront size={16} aria-hidden="true" /> Sprawdź połączenia kolejowe <ArrowUpRight size={14} aria-hidden="true" />
        </a>
        <a
          href={`/sprawdz-oferte?${new URLSearchParams({
            partner: "klook",
            target: partners.klook.buildUrl(),
            source: "dresden_rail_alternative",
            destination: "Drezno",
          }).toString()}`}
          rel="sponsored"
          onClick={() => saveAffiliateReturnContext({
            partner: "klook",
            source: "dresden_rail_alternative",
            destination: "Drezno",
            tripKind: "package",
          })}
        >
          <TrainFront size={16} aria-hidden="true" /> Sprawdź europejskie bilety kolejowe
        </a>
        {stays.length ? stays.map((stay) => (
          <a key={stay.from} href={hotelSearchLink(stay)} rel="sponsored">
            <Hotel size={16} aria-hidden="true" /> Noclegi {stay.label}
          </a>
        )) : (
          <a href={hotelSearchLink()} rel="sponsored">
            <Hotel size={16} aria-hidden="true" /> Sprawdź noclegi w Dreźnie
          </a>
        )}
      </div>
      <small>Terminy noclegów są propozycjami wyszukiwania. Klook otwiera ogólną ofertę partnera, nie potwierdzoną trasę Warszawa–Drezno. Cenę, dostępność i rozkład potwierdza dostawca.</small>
    </aside>
  );
}
