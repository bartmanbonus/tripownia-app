"use client";

import { useMemo, useState } from "react";
import { BedDouble, Plane, Search, Sun, Package, MapPin, SlidersHorizontal, ArrowRight } from "lucide-react";
import EskyLiveWidget from "@/components/EskyLiveWidget";
import { partners } from "@/lib/partners";

type Tab = "package" | "city" | "holiday" | "flights" | "hotels";

type SearchOffer = {
  id: number;
  city: string;
  country: string;
  price: number;
  departure: string;
  nights: number;
  hotel: string;
  board: string;
  dates: string;
  image?: string;
  affiliateUrl?: string;
};

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "package", label: "Lot + Hotel", icon: <Package size={17} /> },
  { key: "city", label: "City Break", icon: <Plane size={17} /> },
  { key: "holiday", label: "Wakacje", icon: <Sun size={17} /> },
  { key: "flights", label: "Loty", icon: <Plane size={17} /> },
  { key: "hotels", label: "Hotele", icon: <BedDouble size={17} /> },
];

const departures = [
  { key: "WAWA", short: "WAW + WMI", label: "Warszawa", kiwi: "warszawa-polska" },
  { key: "KRK", short: "KRK", label: "Kraków", kiwi: "krakow-polska" },
  { key: "KTW", short: "KTW", label: "Katowice", kiwi: "katowice-polska" },
  { key: "GDN", short: "GDN", label: "Gdańsk", kiwi: "gdansk-polska" },
  { key: "WRO", short: "WRO", label: "Wrocław", kiwi: "wroclaw-polska" },
  { key: "POZ", short: "POZ", label: "Poznań", kiwi: "poznan-polska" },
];

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildFlightUrl(origin: string, destination: string) {
  const url = new URL("https://www.kiwi.com/pl/");
  url.searchParams.set("origin", origin);
  if (destination.trim()) url.searchParams.set("destination", slug(destination));
  url.searchParams.set("currency", "PLN");
  return partners.kiwi.buildUrl(url.toString());
}

export default function SelfSearchLegacy() {
  const [tab, setTab] = useState<Tab>("package");
  const [from, setFrom] = useState("WAWA");
  const [destination, setDestination] = useState("");
  const [nights, setNights] = useState("any");
  const [budget, setBudget] = useState("any");
  const [board, setBoard] = useState("any");
  const [results, setResults] = useState<SearchOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const activeDeparture = departures.find((item) => item.key === from) || departures[0];
  const packageUrl = partners.esky.buildUrl("https://www2.esky.pl/lot+hotel/portfolio?context=pl-packages&sort[TotalPrice]=asc");
  const hotelUrl = partners.booking.buildUrl(destination.trim() ? `https://www.booking.com/searchresults.pl.html?ss=${encodeURIComponent(destination.trim())}` : "https://www.booking.com/");
  const flightUrl = useMemo(() => buildFlightUrl(activeDeparture.kiwi, destination), [activeDeparture.kiwi, destination]);

  async function searchOrganized() {
    setLoading(true);
    setSubmitted(true);
    try {
      const params = new URLSearchParams({
        mode: tab === "city" ? "citybreak" : "search",
        provider: "exim",
        from,
      });
      if (destination.trim()) params.set("q", destination.trim());
      if (nights !== "any") params.set("nights", nights);
      if (budget !== "any") params.set("maxPrice", budget);
      if (board !== "any") params.set("board", board);

      const response = await fetch(`/api/today-offers?${params.toString()}`, { cache: "no-store" });
      const data = response.ok ? await response.json() : null;
      setResults(Array.isArray(data?.offers) ? data.offers : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function changeTab(next: Tab) {
    setTab(next);
    setResults([]);
    setSubmitted(false);
  }

  const showDeparture = tab === "city" || tab === "holiday" || tab === "flights";
  const showFilters = tab === "city" || tab === "holiday";

  return (
    <section className="legacy-self-search self-search-premium" id="szukaj-samodzielnie">
      <div className="legacy-self-search-head">
        <small>SZUKAJ PO SWOJEMU</small>
        <h2>Ty ustawiasz plan. My prowadzimy prosto do najlepszych dostępnych opcji.</h2>
        <p>Wybierz typ wyjazdu, miejsce startu i najważniejsze parametry. Bez przekopywania się przez dziesiątki przypadkowych wyników.</p>
      </div>

      <div className="legacy-search-card self-search-card-premium">
        <div className="legacy-search-tabs" role="tablist" aria-label="Samodzielne wyszukiwanie podróży">
          {tabs.map((item) => (
            <button key={item.key} type="button" role="tab" aria-selected={tab === item.key} className={tab === item.key ? "active" : ""} onClick={() => changeTab(item.key)}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="legacy-search-panel self-search-panel-premium">
          {showDeparture && (
            <div className="search-departure-block">
              <div className="search-mini-label"><MapPin size={14}/> Skąd chcesz lecieć?</div>
              <div className="search-airport-chips">
                {departures.map((item) => (
                  <button key={item.key} type="button" className={from === item.key ? "active" : ""} onClick={() => setFrom(item.key)}>
                    <strong>{item.short}</strong><span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(tab === "city" || tab === "holiday" || tab === "flights" || tab === "hotels") && (
            <div className="search-destination-row">
              <label>
                <span>Kierunek</span>
                <div><Search size={16}/><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder={tab === "flights" ? "np. Mediolan, Bangkok, Nowy Jork" : "np. Rzym, Malta, Egipt"}/></div>
              </label>
            </div>
          )}

          {showFilters && (
            <div className="search-filter-grid">
              <div className="search-filter-title"><SlidersHorizontal size={15}/> Dopasuj wyjazd</div>
              <label><span>Długość</span><select value={nights} onChange={(event) => setNights(event.target.value)}><option value="any">Dowolna</option><option value="2-3">2–3 noce</option><option value="4-5">4–5 nocy</option><option value="6-8">6–8 nocy</option><option value="9+">9+ nocy</option></select></label>
              <label><span>Budżet / os.</span><select value={budget} onChange={(event) => setBudget(event.target.value)}><option value="any">Dowolny</option><option value="1500">do 1 500 zł</option><option value="2500">do 2 500 zł</option><option value="3500">do 3 500 zł</option><option value="5000">do 5 000 zł</option><option value="7500">do 7 500 zł</option></select></label>
              <label><span>Wyżywienie</span><select value={board} onChange={(event) => setBoard(event.target.value)}><option value="any">Dowolne</option><option value="allinclusive">All Inclusive</option><option value="breakfast">Śniadania</option><option value="halfboard">Half Board</option></select></label>
            </div>
          )}

          {tab === "package" && (
            <>
              <div className="legacy-search-panel-copy"><strong>Lot + hotel w jednym kroku</strong><span>Ustaw miasto wylotu, termin i liczbę osób bezpośrednio w wyszukiwarce.</span></div>
              <div className="legacy-widget-box"><EskyLiveWidget mode="packages" /></div>
              <a className="legacy-search-open premium-search-cta" href={packageUrl} target="_blank" rel="sponsored noopener noreferrer"><Search size={17}/> Otwórz pełne wyszukiwanie <ArrowRight size={16}/></a>
            </>
          )}

          {(tab === "city" || tab === "holiday") && (
            <>
              <div className="organized-search-intro">
                <div><strong>{tab === "city" ? "Krótki wyjazd, gotowy do rezerwacji" : "Pełne wakacje w jednym pakiecie"}</strong><span>{tab === "city" ? "Pokazujemy krótkie wyjazdy 2–5 nocy z lotem i hotelem." : "Lot, hotel i dostępne wyżywienie w jednym miejscu."}</span></div>
                <button type="button" onClick={searchOrganized} disabled={loading}>{loading ? "Szukamy…" : "Pokaż oferty"}<ArrowRight size={17}/></button>
              </div>

              {submitted && !loading && results.length === 0 && <div className="self-search-empty"><strong>Nie znaleźliśmy dobrego dopasowania.</strong><span>Zmień kierunek, lotnisko lub poluzuj filtry.</span></div>}

              {results.length > 0 && (
                <div className="self-search-results">
                  {results.slice(0, 8).map((offer) => (
                    <article key={offer.id} className="self-search-result-card">
                      <div className="self-search-result-image" style={{ backgroundImage: `url(${offer.image || "/images/destinations/djerba.jpg"})` }} />
                      <div className="self-search-result-body">
                        <div className="self-search-result-place"><strong>{offer.city}</strong><span>{offer.country}</span></div>
                        <h3>{offer.hotel}</h3>
                        <div className="self-search-result-meta"><span>✈️ {offer.departure}</span><span>🌙 {offer.nights} nocy</span><span>🍽️ {offer.board}</span></div>
                        <small>{offer.dates}</small>
                        <div className="self-search-result-bottom"><div><strong>{Number(offer.price).toLocaleString("pl-PL")} zł</strong><span>/ os.</span></div>{offer.affiliateUrl && <a href={offer.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer">Zobacz ofertę <ArrowRight size={15}/></a>}</div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "flights" && (
            <div className="legacy-cta-box self-search-single-cta"><div><strong>Znajdź najlepsze połączenie</strong><span>Start: {activeDeparture.label}. {destination.trim() ? `Kierunek: ${destination.trim()}.` : "Wpisz kierunek albo przejdź do pełnego wyszukiwania."}</span></div><a href={flightUrl} target="_blank" rel="sponsored noopener noreferrer">Szukaj lotów <ArrowRight size={16}/></a></div>
          )}

          {tab === "hotels" && (
            <div className="legacy-cta-box self-search-single-cta"><div><strong>Masz już transport?</strong><span>{destination.trim() ? `Pokaż noclegi w: ${destination.trim()}.` : "Wpisz kierunek i przejdź do dostępnych noclegów."}</span></div><a href={hotelUrl} target="_blank" rel="sponsored noopener noreferrer">Szukaj noclegów <ArrowRight size={16}/></a></div>
          )}
        </div>
      </div>
    </section>
  );
}
