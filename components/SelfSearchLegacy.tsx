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
  const packages = partners.esky.buildUrl("https://www2.esky.pl/lot+hotel/portfolio?context=pl-packages&sort[TotalPrice]=asc");
  const flights = partners.esky.buildUrl("https://www.esky.pl/tanie-loty/");
  const holidayA = partners.exim.buildUrl("https://www.exim.pl/wakacje");
  const holidayB = partners.tui.buildUrl("https://www.tui.pl/wypoczynek");
  const hotels = partners.booking.buildUrl("https://www.booking.com/");

  return (
    <section className="legacy-self-search" id="szukaj-samodzielnie">
      <div className="legacy-self-search-head">
        <small>SZUKAJ SAMODZIELNIE</small>
        <h2>Pełna swoboda, gdy chcesz poszukać po swojemu.</h2>
        <p>To osobne narzędzie poza rekomendacjami Tripowni. Ustawiasz kierunek, termin i wariant, a my przekazujemy Cię prosto do wyszukiwania.</p>
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
                <strong>{tab === "city" ? "Samodzielnie: city break" : "Samodzielnie: lot + hotel"}</strong>
                <span>Ustaw parametry samodzielnie i porównaj dostępne warianty.</span>
              </div>
              <div className="legacy-widget-box"><EskyLiveWidget mode="packages" /></div>
              <a className="legacy-search-open" href={packages} target="_blank" rel="sponsored noopener noreferrer"><Search size={17}/> Otwórz pełne wyszukiwanie</a>
            </>
          )}

          {tab === "holiday" && (
            <>
              <div className="legacy-search-panel-copy"><strong>Wakacje z biurem podróży</strong><span>Dwie pełne bazy ofert — bez ograniczenia do naszej codziennej selekcji.</span></div>
              <div className="legacy-direct-grid">
                <a href={holidayA} target="_blank" rel="sponsored noopener noreferrer"><span>☀️</span><div><strong>Wakacje i All Inclusive</strong><small>Pełna oferta i aktualna dostępność</small></div><b>Sprawdź →</b></a>
                <a href={holidayB} target="_blank" rel="sponsored noopener noreferrer"><span>🌴</span><div><strong>Więcej gotowych pakietów</strong><small>Hotele, wyżywienie i terminy</small></div><b>Sprawdź →</b></a>
              </div>
            </>
          )}

          {tab === "flights" && (
            <div className="legacy-cta-box"><div><strong>Same loty</strong><span>Porównaj połączenia i ustaw wszystkie parametry samodzielnie.</span></div><a href={flights} target="_blank" rel="sponsored noopener noreferrer">Szukaj lotów →</a></div>
          )}

          {tab === "hotels" && (
            <div className="legacy-cta-box"><div><strong>Sam nocleg</strong><span>Masz już lot? Przejdź do pełnej wyszukiwarki hoteli.</span></div><a href={hotels} target="_blank" rel="sponsored noopener noreferrer">Szukaj hoteli →</a></div>
          )}
        </div>
      </div>
    </section>
  );
}
