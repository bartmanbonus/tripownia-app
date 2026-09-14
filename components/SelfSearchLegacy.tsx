"use client";

import { useMemo, useState } from "react";
import { BedDouble, Plane, Search, Sun, Package, MapPin, SlidersHorizontal, ArrowRight, Clock3 } from "lucide-react";
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
  priceCheckedAt?: string;
  linkMatch?: "exact" | "parameters" | "destination" | "unsafe";
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

function directionKey(offer: SearchOffer) {
  return `${slug(offer.city)}|${slug(offer.country)}`;
}

function cheapestPerDirection(rows: SearchOffer[]) {
  const best = new Map<string, SearchOffer>();
  for (const row of rows) {
    const key = directionKey(row);
    const current = best.get(key);
    if (!current || Number(row.price) < Number(current.price)) best.set(key, row);
  }
  return Array.from(best.values()).sort((a, b) => Number(a.price) - Number(b.price));
}

function checkedLabel(value?: string) {
  if (!value) return "Aktualna oferta partnera";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Aktualna oferta partnera";
  return `Sprawdzono ${new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", timeZone: "Europe/Warsaw" }).format(date)}`;
}

export default function SelfSearchLegacy() {
  const [tab, setTab] = useState<Tab>("package");
  const [from, setFrom] = useState<string[]>(["WAWA"]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [destinationDraft, setDestinationDraft] = useState("");
  const [nights, setNights] = useState("any");
  const [budget, setBudget] = useState("any");
  const [board, setBoard] = useState("any");
  const [weekendOnly, setWeekendOnly] = useState(false);
  const [results, setResults] = useState<SearchOffer[]>([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedDepartures = departures.filter((item) => from.includes(item.key));
  const effectiveDestination = destinationDraft.trim() || destinations[0] || "";

  const hotelUrl = partners.booking.buildUrl(
    effectiveDestination
      ? `https://www.booking.com/searchresults.pl.html?ss=${encodeURIComponent(effectiveDestination)}`
      : "https://www.booking.com/"
  );

  const flightUrl = useMemo(
    () => buildFlightUrl(selectedDepartures.map((item) => item.kiwi).join(","), effectiveDestination),
    [selectedDepartures.map((item) => item.kiwi).join(","), effectiveDestination]
  );

  function toggleDeparture(key: string) {
    setFrom((current) => {
      if (current.includes(key)) return current.length === 1 ? current : current.filter((item) => item !== key);
      return [...current, key];
    });
  }

  function addDestination(raw = destinationDraft) {
    const next = raw.split(",").map((item) => item.trim()).filter(Boolean);
    if (!next.length) return;
    setDestinations((current) => Array.from(new Set([...current, ...next])).slice(0, 6));
    setDestinationDraft("");
  }

  function removeDestination(value: string) {
    setDestinations((current) => current.filter((item) => item !== value));
  }

  async function searchOrganized() {
    setLoading(true);
    setSubmitted(true);
    setNotice("");

    try {
      const queryValues = Array.from(new Set([
        ...destinations,
        ...destinationDraft.split(",").map((item) => item.trim()).filter(Boolean),
      ])).slice(0, 6);

      if (destinationDraft.trim()) addDestination(destinationDraft);

      const params = new URLSearchParams({
        mode: tab === "city" ? "citybreak" : "search",
        provider: "exim",
        from: from.join(","),
      });
      if (queryValues.length) params.set("q", queryValues.join(","));
      if (nights !== "any") params.set("nights", nights);
      if (budget !== "any") params.set("maxPrice", budget);
      if (board !== "any") params.set("board", board);
      if (weekendOnly) params.set("weekend", "1");

      const response = await fetch(`/api/today-offers?${params.toString()}`, { cache: "no-store" });
      const data = response.ok ? await response.json() : null;
      const rows = Array.isArray(data?.offers) ? data.offers as SearchOffer[] : [];
      setNotice(typeof data?.notice === "string" ? data.notice : "");
      setResults(cheapestPerDirection(rows.filter((offer) => offer?.price > 0 && offer?.affiliateUrl)).slice(0, 12));
    } catch {
      setResults([]);
      setNotice("Nie udało się teraz pobrać aktualnych wyników. Spróbuj ponownie za chwilę.");
    } finally {
      setLoading(false);
    }
  }

  function changeTab(next: Tab) {
    setTab(next);
    setResults([]);
    setNotice("");
    setSubmitted(false);
  }

  const isTripowniaSearch = tab === "package" || tab === "city" || tab === "holiday";
  const showDeparture = isTripowniaSearch || tab === "flights";
  const showFilters = isTripowniaSearch;

  return (
    <section className="legacy-self-search self-search-premium" id="szukaj-samodzielnie">
      <div className="legacy-self-search-head">
        <small>SZUKAJ PO SWOJEMU</small>
        <h2>Najpierw wyniki w Tripowni. Do partnera przechodzisz dopiero, gdy wybierzesz ofertę.</h2>
        <p>Ustaw kierunek, lotnisko i najważniejsze filtry. Tripownia pokaże dostępne propozycje bez wyrzucania Cię od razu do zewnętrznej wyszukiwarki.</p>
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
                  <button key={item.key} type="button" aria-pressed={from.includes(item.key)} className={from.includes(item.key) ? "active" : ""} onClick={() => toggleDeparture(item.key)}>
                    <strong>{item.short}</strong><span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(isTripowniaSearch || tab === "flights" || tab === "hotels") && (
            <div className="search-destination-row search-destination-multi">
              <label>
                <span>Kierunek <small>— możesz dodać kilka albo zostawić puste</small></span>
                <div>
                  <Search size={16}/>
                  <input
                    value={destinationDraft}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value.includes(",")) addDestination(value);
                      else setDestinationDraft(value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        if (isTripowniaSearch) searchOrganized();
                        else addDestination();
                      }
                    }}
                    onBlur={() => addDestination()}
                    placeholder={tab === "flights" ? "np. Mediolan, Bangkok, Nowy Jork" : "np. Rzym, Malta, Egipt lub zostaw puste"}
                  />
                </div>
              </label>

              {destinations.length > 0 && (
                <div className="search-destination-chips" aria-label="Wybrane kierunki">
                  {destinations.map((item) => (
                    <button key={item} type="button" onClick={() => removeDestination(item)} title={`Usuń ${item}`}>
                      <span>{item}</span><b aria-hidden="true">×</b>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {showFilters && (
            <div className="search-filter-grid search-filter-grid-extended">
              <div className="search-filter-title"><SlidersHorizontal size={15}/> Dopasuj wyjazd</div>

              <label>
                <span>Długość</span>
                <select value={nights} onChange={(event) => setNights(event.target.value)}>
                  <option value="any">Dowolna</option>
                  <option value="1-2">1–2 noce</option>
                  <option value="3-4">3–4 noce</option>
                  <option value="5-7">5–7 nocy</option>
                  <option value="8-10">8–10 nocy</option>
                  <option value="11-14">11–14 nocy</option>
                  <option value="15+">15+ nocy</option>
                </select>
              </label>

              <label>
                <span>Budżet / os.</span>
                <select value={budget} onChange={(event) => setBudget(event.target.value)}>
                  <option value="any">Dowolny</option>
                  <option value="1000">do 1 000 zł</option>
                  <option value="1500">do 1 500 zł</option>
                  <option value="2000">do 2 000 zł</option>
                  <option value="2500">do 2 500 zł</option>
                  <option value="3500">do 3 500 zł</option>
                  <option value="5000">do 5 000 zł</option>
                  <option value="7500">do 7 500 zł</option>
                  <option value="10000">do 10 000 zł</option>
                  <option value="15000">do 15 000 zł</option>
                </select>
              </label>

              <label>
                <span>Wyżywienie</span>
                <select value={board} onChange={(event) => setBoard(event.target.value)}>
                  <option value="any">Dowolne</option>
                  <option value="roomonly">Bez wyżywienia</option>
                  <option value="breakfast">Śniadania</option>
                  <option value="halfboard">Half Board / 2 posiłki</option>
                  <option value="fullboard">Full Board / 3 posiłki</option>
                  <option value="allinclusive">All Inclusive</option>
                  <option value="ultraallinclusive">Ultra All Inclusive</option>
                </select>
              </label>

              <label className={`self-search-weekend-toggle ${weekendOnly ? "active" : ""}`}>
                <input type="checkbox" checked={weekendOnly} onChange={(event) => setWeekendOnly(event.target.checked)}/>
                <span className="self-search-weekend-check">{weekendOnly ? "✓" : ""}</span>
                <span className="self-search-weekend-copy"><strong>Weekend na miejscu</strong><small>Pobyt obejmuje sobotę i niedzielę</small></span>
              </label>
            </div>
          )}

          {isTripowniaSearch && (
            <>
              <div className="organized-search-intro">
                <div>
                  <strong>{tab === "city" ? "Krótki wyjazd z aktualnego feedu" : tab === "holiday" ? "Wakacje z aktualnego feedu" : "Lot + hotel bez opuszczania Tripowni"}</strong>
                  <span>Najpierw pokażemy konkretne dostępne propozycje. Dopiero wybrana karta otworzy stronę rezerwacji partnera.</span>
                </div>
                <button type="button" onClick={searchOrganized} disabled={loading}>{loading ? "Szukamy…" : "Pokaż oferty"}<ArrowRight size={17}/></button>
              </div>

              {notice && results.length > 0 && <div className="self-search-empty"><strong>Wyniki zostały lekko poszerzone.</strong><span>{notice}</span></div>}

              {submitted && !loading && results.length === 0 && (
                <div className="self-search-empty"><strong>Nie znaleźliśmy dziś dobrego dopasowania.</strong><span>{notice || "Zmień kierunek, lotnisko lub poluzuj filtry. Nie pokazujemy przypadkowych wyników tylko po to, żeby zapełnić ekran."}</span></div>
              )}

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
                        <div className="offer-trust-line"><Clock3 size={12}/> {checkedLabel(offer.priceCheckedAt)}</div>
                        <div className="self-search-result-bottom">
                          <div><strong>{Number(offer.price).toLocaleString("pl-PL")} zł</strong><span>/ os.</span></div>
                          {offer.affiliateUrl && <a href={offer.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer">Sprawdź tę ofertę <ArrowRight size={15}/></a>}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "flights" && (
            <div className="legacy-cta-box self-search-single-cta">
              <div><strong>Loty sprawdzamy u Kiwi</strong><span>Tripownia zachowuje Twój kierunek i miasto wylotu, a finalne połączenia pokazuje partner lotniczy.</span></div>
              <a href={flightUrl} target="_blank" rel="sponsored noopener noreferrer">Szukaj lotów <ArrowRight size={16}/></a>
            </div>
          )}

          {tab === "hotels" && (
            <div className="legacy-cta-box self-search-single-cta">
              <div><strong>Noclegi sprawdzamy w Booking.com</strong><span>{effectiveDestination ? `Pokaż noclegi w: ${effectiveDestination}.` : "Dodaj kierunek i przejdź do dostępnych noclegów."}</span></div>
              <a href={hotelUrl} target="_blank" rel="sponsored noopener noreferrer">Szukaj noclegów <ArrowRight size={16}/></a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}