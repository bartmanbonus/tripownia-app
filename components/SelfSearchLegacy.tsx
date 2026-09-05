"use client";

import { useState } from "react";
import { BedDouble, Plane, Search, Sun, Package } from "lucide-react";
import EskyLiveWidget from "@/components/EskyLiveWidget";
import { partners } from "@/lib/partners";

type Tab = "package" | "city" | "holiday" | "flights" | "hotels";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "package", label: "Lot + Hotel", icon: <Package size={17} /> },
  { key: "city", label: "City Break", icon: <Plane size={17} /> },
  { key: "holiday", label: "Wakacje", icon: <Sun size={17} /> },
  { key: "flights", label: "Loty", icon: <Plane size={17} /> },
  { key: "hotels", label: "Hotele", icon: <BedDouble size={17} /> },
];

export default function SelfSearchLegacy() {
  const [tab, setTab] = useState<Tab>("package");
  const eskyPackages = partners.esky.buildUrl("https://www2.esky.pl/lot+hotel/portfolio?context=pl-packages&sort[TotalPrice]=asc");
  const eskyFlights = partners.esky.buildUrl("https://www.esky.pl/tanie-loty/");
  const exim = partners.exim.buildUrl("https://www.exim.pl/wakacje");
  const tui = partners.tui.buildUrl("https://www.tui.pl/wypoczynek");
  const booking = partners.booking.buildUrl("https://www.booking.com/");

  return (
    <section className="legacy-self-search" id="szukaj-samodzielnie">
      <div className="legacy-self-search-head">
        <small>SZUKAJ SAMODZIELNIE</small>
        <h2>Wolisz przejrzeć pełną ofertę po swojemu?</h2>
        <p>Ta część jest niezależna od rekomendacji Tripowni. Wybierasz partnera i samodzielnie ustawiasz kierunek, termin oraz wariant podróży.</p>
      </div>

      <div className="legacy-search-card">
        <div className="legacy-search-tabs" role="tablist" aria-label="Samodzielne wyszukiwanie podróży">
          {tabs.map((item) => (
            <button key={item.key} type="button" role="tab" aria-selected={tab === item.key} className={tab === item.key ? "active" : ""} onClick={() => setTab(item.key)}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="legacy-search-panel">
          {(tab === "package" || tab === "city") && (
            <>
              <div className="legacy-search-panel-copy">
                <strong>{tab === "city" ? "Samodzielne wyszukiwanie city breaku" : "Samodzielne wyszukiwanie lot + hotel"}</strong>
                <span>eSky zostaje tutaj jako dodatkowa wyszukiwarka. Nie zasila naszych rekomendacji ani sekcji okazji.</span>
              </div>
              <div className="legacy-widget-box"><EskyLiveWidget mode="packages" /></div>
              <a className="legacy-search-open" href={eskyPackages} target="_blank" rel="sponsored noopener noreferrer"><Search size={17}/> Otwórz pełną wyszukiwarkę eSky</a>
            </>
          )}

          {tab === "holiday" && (
            <>
              <div className="legacy-search-panel-copy"><strong>Wakacje z biurem podróży</strong><span>Przejdź bezpośrednio do pełnej oferty EXIM Tours lub TUI.</span></div>
              <div className="legacy-direct-grid">
                <a href={exim} target="_blank" rel="sponsored noopener noreferrer"><span>☀️</span><div><strong>EXIM Tours</strong><small>Wakacje, All Inclusive, last minute</small></div><b>Sprawdź →</b></a>
                <a href={tui} target="_blank" rel="sponsored noopener noreferrer"><span>🌴</span><div><strong>TUI</strong><small>Pełna oferta wakacyjna</small></div><b>Sprawdź →</b></a>
              </div>
            </>
          )}

          {tab === "flights" && (
            <div className="legacy-cta-box"><div><strong>Same loty</strong><span>Porównaj połączenia i ustaw wszystkie parametry samodzielnie.</span></div><a href={eskyFlights} target="_blank" rel="sponsored noopener noreferrer">Szukaj lotów w eSky →</a></div>
          )}

          {tab === "hotels" && (
            <div className="legacy-cta-box"><div><strong>Sam nocleg</strong><span>Masz już lot? Przejdź do pełnej wyszukiwarki hoteli.</span></div><a href={booking} target="_blank" rel="sponsored noopener noreferrer">Szukaj hoteli →</a></div>
          )}
        </div>
      </div>
    </section>
  );
}
