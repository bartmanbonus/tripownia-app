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
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateFrom) && /^\d{4}-\d{2}-\d{2}$/.test(dateTo) && dateTo > dateFrom) {
    return [{ from: dateFrom, to: dateTo, label: dateLabel(dateFrom, dateTo) }];
  }

  if (!["2026-11", "2026-12"].includes(month)) return [];
  const requestedNights = Math.max(2, Math.min(7, Number(duration.match(/^\d+/)?.[0] || 2)));
  const start = new Date(`${month}-01T12:00:00Z`);
  const firstDay = Math.max(start.getTime(), Date.UTC(2026, 10, 25, 12));
  const lastDay = Date.UTC(2026, 11, 24, 12);
  const today = new Date().toISOString().slice(0, 10);
  const stays: Stay[] = [];

  for (let time = firstDay; time <= lastDay && stays.length < 3; time += 86_400_000) {
    const date = new Date(time);
    if (date.getUTCDay() !== 5) continue; // weekend starts on Friday
    const from = isoDate(date);
    const end = new Date(time + requestedNights * 86_400_000);
    const to = isoDate(end);
    if (from < today || end.getTime() > lastDay) continue;
    stays.push({ from, to, label: dateLabel(from, to) });
  }
  return stays;
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
            tripKind: "flight",
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
