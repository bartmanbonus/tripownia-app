"use client";

import { useEffect, useMemo, useState } from "react";
import { BedDouble, CalendarDays, MapPin, Plane, Search } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { airportOptions } from "@/lib/offers";
import { buildKiwiFlightSearchUrl, partners } from "@/lib/partners";

type FlightPlace = { label: string; code: string; slug: string };

const FLIGHT_DESTINATIONS: FlightPlace[] = [
  { label: "Amsterdam, Holandia", code: "AMS", slug: "amsterdam-netherlands" },
  { label: "Ateny, Grecja", code: "ATH", slug: "athens-greece" },
  { label: "Barcelona, Hiszpania", code: "BCN", slug: "barcelona-spain" },
  { label: "Bergamo, Włochy", code: "BGY", slug: "bergamo-italy" },
  { label: "Berlin, Niemcy", code: "BER", slug: "berlin-germany" },
  { label: "Budapeszt, Węgry", code: "BUD", slug: "budapest-hungary" },
  { label: "Dublin, Irlandia", code: "DUB", slug: "dublin-ireland" },
  { label: "Dubrownik, Chorwacja", code: "DBV", slug: "dubrovnik-croatia" },
  { label: "Edynburg, Wielka Brytania", code: "EDI", slug: "edinburgh-united-kingdom" },
  { label: "Florencja, Włochy", code: "FLR", slug: "florence-italy" },
  { label: "Fuerteventura, Hiszpania", code: "FUE", slug: "fuerteventura-spain" },
  { label: "Helsinki, Finlandia", code: "HEL", slug: "helsinki-finland" },
  { label: "Kopenhaga, Dania", code: "CPH", slug: "copenhagen-denmark" },
  { label: "Lizbona, Portugalia", code: "LIS", slug: "lisbon-portugal" },
  { label: "Londyn, Wielka Brytania", code: "LON", slug: "london-united-kingdom" },
  { label: "Madera, Portugalia", code: "FNC", slug: "madeira-portugal" },
  { label: "Madryt, Hiszpania", code: "MAD", slug: "madrid-spain" },
  { label: "Majorka, Hiszpania", code: "PMI", slug: "palma-mallorca-spain" },
  { label: "Malaga, Hiszpania", code: "AGP", slug: "malaga-spain" },
  { label: "Malta", code: "MLA", slug: "malta-malta" },
  { label: "Mediolan, Włochy", code: "MIL", slug: "milan-italy" },
  { label: "Neapol, Włochy", code: "NAP", slug: "naples-italy" },
  { label: "Nicea, Francja", code: "NCE", slug: "nice-france" },
  { label: "Pafos, Cypr", code: "PFO", slug: "paphos-cyprus" },
  { label: "Paryż, Francja", code: "PAR", slug: "paris-france" },
  { label: "Porto, Portugalia", code: "OPO", slug: "porto-portugal" },
  { label: "Praga, Czechy", code: "PRG", slug: "prague-czechia" },
  { label: "Reykjavik, Islandia", code: "KEF", slug: "reykjavik-iceland" },
  { label: "Rodos, Grecja", code: "RHO", slug: "rhodes-greece" },
  { label: "Rzym, Włochy", code: "ROM", slug: "rome-italy" },
  { label: "Santorini, Grecja", code: "JTR", slug: "santorini-greece" },
  { label: "Sewilla, Hiszpania", code: "SVQ", slug: "seville-spain" },
  { label: "Teneryfa, Hiszpania", code: "TFS", slug: "tenerife-spain" },
  { label: "Wenecja, Włochy", code: "VCE", slug: "venice-italy" },
  { label: "Wiedeń, Austria", code: "VIE", slug: "vienna-austria" },
  { label: "Zadar, Chorwacja", code: "ZAD", slug: "zadar-croatia" },
  { label: "Zurych, Szwajcaria", code: "ZRH", slug: "zurich-switzerland" },
  { label: "Djerba, Tunezja", code: "DJE", slug: "djerba-tunisia" },
  { label: "Kair, Egipt", code: "CAI", slug: "cairo-egypt" },
  { label: "Kapsztad, RPA", code: "CPT", slug: "cape-town-south-africa" },
  { label: "Marrakesz, Maroko", code: "RAK", slug: "marrakesh-morocco" },
  { label: "Marsa Alam, Egipt", code: "RMF", slug: "marsa-alam-egypt" },
  { label: "Mauritius", code: "MRU", slug: "mauritius-mauritius" },
  { label: "Seszele", code: "SEZ", slug: "seychelles-seychelles" },
  { label: "Zanzibar, Tanzania", code: "ZNZ", slug: "zanzibar-tanzania" },
  { label: "Abu Dhabi, ZEA", code: "AUH", slug: "abu-dhabi-united-arab-emirates" },
  { label: "Doha, Katar", code: "DOH", slug: "doha-qatar" },
  { label: "Dubaj, ZEA", code: "DXB", slug: "dubai-united-arab-emirates" },
  { label: "Stambuł, Turcja", code: "IST", slug: "istanbul-turkey" },
  { label: "Bali, Indonezja", code: "DPS", slug: "bali-indonesia" },
  { label: "Bangkok, Tajlandia", code: "BKK", slug: "bangkok-thailand" },
  { label: "Hanoi, Wietnam", code: "HAN", slug: "hanoi-vietnam" },
  { label: "Ho Chi Minh, Wietnam", code: "SGN", slug: "ho-chi-minh-city-vietnam" },
  { label: "Hoi An / Da Nang, Wietnam", code: "DAD", slug: "da-nang-vietnam" },
  { label: "Kuala Lumpur, Malezja", code: "KUL", slug: "kuala-lumpur-malaysia" },
  { label: "Malediwy", code: "MLE", slug: "male-maldives" },
  { label: "Pekin, Chiny", code: "PEK", slug: "beijing-china" },
  { label: "Phuket, Tajlandia", code: "HKT", slug: "phuket-thailand" },
  { label: "Singapur", code: "SIN", slug: "singapore-singapore" },
  { label: "Tokio, Japonia", code: "TYO", slug: "tokyo-japan" },
  { label: "Cancún, Meksyk", code: "CUN", slug: "cancun-mexico" },
  { label: "Los Angeles, USA", code: "LAX", slug: "los-angeles-united-states" },
  { label: "Miami, USA", code: "MIA", slug: "miami-united-states" },
  { label: "Nowy Jork, USA", code: "NYC", slug: "new-york-city-united-states" },
  { label: "San Francisco, USA", code: "SFO", slug: "san-francisco-united-states" },
  { label: "Toronto, Kanada", code: "YTO", slug: "toronto-canada" },
  { label: "Buenos Aires, Argentyna", code: "BUE", slug: "buenos-aires-argentina" },
  { label: "Rio de Janeiro, Brazylia", code: "RIO", slug: "rio-de-janeiro-brazil" },
  { label: "Auckland, Nowa Zelandia", code: "AKL", slug: "auckland-new-zealand" },
  { label: "Melbourne, Australia", code: "MEL", slug: "melbourne-australia" },
  { label: "Sydney, Australia", code: "SYD", slug: "sydney-australia" },
  { label: "Tahiti, Polinezja Francuska", code: "PPT", slug: "papeete-french-polynesia" },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function resolveFlightPlace(value: string) {
  const raw = value.trim();
  if (/^[a-zA-Z]{3}$/.test(raw)) {
    const code = raw.toUpperCase();
    return FLIGHT_DESTINATIONS.find((item) => item.code === code) || null;
  }
  const normalized = normalize(raw);
  return FLIGHT_DESTINATIONS.find((item) => {
    const city = item.label.split(",")[0];
    return normalize(item.label) === normalized || normalize(city) === normalized;
  }) || null;
}

const ORIGIN_SLUGS: Record<string, string> = {
  WAW: "warsaw-poland",
  WMI: "warsaw-poland",
  KRK: "krakow-poland",
  KTW: "katowice-poland",
  GDN: "gdansk-poland",
  WRO: "wroclaw-poland",
  POZ: "poznan-poland",
  RZE: "rzeszow-poland",
  LCJ: "lodz-poland",
  LUZ: "lublin-poland",
  SZZ: "szczecin-poland",
  BZG: "bydgoszcz-poland",
  IEG: "zielona-gora-poland",
};

function resolveOriginCode(value: string) {
  const raw = value.trim().toUpperCase();
  if (airportOptions.some((airport) => airport.code === raw)) return raw;

  const normalized = normalize(value);
  const aliases: Array<[string, string[]]> = [
    ["WMI", ["modlin"]],
    ["WAW", ["warszawa", "warsaw", "chopin"]],
    ["KRK", ["krakow", "kraków"]],
    ["KTW", ["katowice"]],
    ["GDN", ["gdansk", "gdańsk"]],
    ["WRO", ["wroclaw", "wrocław"]],
    ["POZ", ["poznan", "poznań"]],
    ["RZE", ["rzeszow", "rzeszów"]],
    ["LCJ", ["lodz", "łódź"]],
    ["LUZ", ["lublin"]],
    ["SZZ", ["szczecin"]],
    ["BZG", ["bydgoszcz"]],
    ["IEG", ["zielona gora", "zielona góra"]],
  ];

  return aliases.find(([, patterns]) => patterns.some((pattern) => normalized.includes(normalize(pattern))))?.[0] || "";
}

function buildHotelUrl(destination: string, checkin: string, checkout: string, adults: number) {
  const url = new URL("https://www.booking.com/searchresults.pl.html");
  if (destination.trim()) url.searchParams.set("ss", destination.trim());
  if (checkin) url.searchParams.set("checkin", checkin);
  if (checkout) url.searchParams.set("checkout", checkout);
  url.searchParams.set("group_adults", String(Math.max(1, adults)));
  url.searchParams.set("no_rooms", "1");
  url.searchParams.set("group_children", "0");
  return partners.booking.buildUrl(url.toString());
}

export default function PartnerSearchPage({ mode }: { mode: "flights" | "hotels" }) {
  const isFlights = mode === "flights";
  const [originCode, setOriginCode] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [adults, setAdults] = useState(2);

  useEffect(() => {
    try {
      const query = new URLSearchParams(window.location.search).get("q")?.trim();
      const trip = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null");
      const snapshot = trip?.offerSnapshot;

      if (query) {
        setDestination(query);
      } else if (snapshot?.city) {
        setDestination(isFlights
          ? String(snapshot.city)
          : `${snapshot.city}${snapshot.country ? `, ${snapshot.country}` : ""}`);
      }

      if (!snapshot) return;

      const airportCode = String(snapshot.airportCode || "").toUpperCase();
      if (isFlights) {
        const inferredOrigin = airportOptions.some((airport) => airport.code === airportCode)
          ? airportCode
          : resolveOriginCode(String(snapshot.departure || ""));
        if (inferredOrigin) setOriginCode(inferredOrigin);
      }

      const start = String(trip?.departureAt || "").slice(0, 10);
      const nights = Number(snapshot.nights || 0);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return;

      const startDate = new Date(`${start}T12:00:00Z`);
      if (!Number.isFinite(startDate.getTime())) return;
      const endDate = new Date(startDate.getTime() + Math.max(1, nights) * 86400000);
      const end = endDate.toISOString().slice(0, 10);

      if (isFlights) {
        setDepartureDate(start);
        setReturnDate(end);
      } else {
        setCheckin(start);
        setCheckout(end);
      }
    } catch {
      // Query and active trip prefill are optional.
    }
  }, [isFlights]);

  const destinationPlace = useMemo(() => isFlights ? resolveFlightPlace(destination) : null, [destination, isFlights]);
  const hotelDatesValid = !checkin || !checkout || new Date(checkout).getTime() > new Date(checkin).getTime();
  const flightDatesValid = !departureDate || !returnDate || new Date(returnDate).getTime() >= new Date(departureDate).getTime();

  const targetUrl = useMemo(() => {
    if (isFlights) {
      if (!destinationPlace || !originCode || !ORIGIN_SLUGS[originCode]) return "";
      return buildKiwiFlightSearchUrl({
        from: ORIGIN_SLUGS[originCode],
        to: destinationPlace.slug,
        departure: departureDate || undefined,
        returnDate: returnDate || undefined,
      });
    }
    return buildHotelUrl(destination, checkin, checkout, adults);
  }, [isFlights, originCode, destinationPlace, departureDate, returnDate, destination, checkin, checkout, adults]);

  const ready = isFlights
    ? Boolean(originCode && destinationPlace && flightDatesValid)
    : Boolean(destination.trim().length >= 2 && hotelDatesValid);

  const validationCopy = isFlights
    ? !originCode
      ? "Wybierz lotnisko wylotu."
      : !destination.trim()
        ? "Wybierz kierunek z listy albo wpisz 3-literowy kod lotniska/miasta."
      : !destinationPlace
        ? "Nie rozpoznaliśmy tego kierunku. Wybierz podpowiedź z listy albo wpisz kod IATA, np. ROM."
        : !flightDatesValid
          ? "Data powrotu nie może być wcześniejsza niż data wylotu."
          : "Kierunek jest gotowy. Daty możesz zostawić puste, jeśli chcesz szukać elastycznie."
    : !hotelDatesValid
      ? "Data wyjazdu musi być późniejsza niż data przyjazdu."
      : "Daty są opcjonalne — możesz przejść do Booking.com także bez terminu.";

  return (
    <main>
      <SiteHeader />
      <section className="shell service-page">
        <div className="kicker">{isFlights ? "LOTY" : "HOTELE"}</div>
        <h1>{isFlights ? "Znajdź lot i dopiero potem przejdź do Kiwi" : "Znajdź hotel bez przypadkowego klikania"}</h1>
        <p className="hub-lead">
          {isFlights
            ? "Ustaw lotnisko, kierunek i opcjonalnie termin. Tripownia buduje prawidłowy deep link Kiwi, więc partner otwiera od razu właściwe wyszukiwanie."
            : "Najpierw ustaw miejsce i termin. Do Booking.com przejdziesz dopiero z gotowym wyszukiwaniem i naszym linkiem partnerskim."}
        </p>

        <div className="search-v3">
          <div className="search-v3-head">
            <div>
              <small>{isFlights ? "WYSZUKIWARKA LOTÓW" : "WYSZUKIWARKA NOCLEGÓW"}</small>
              <h2>{isFlights ? "Skąd i dokąd?" : "Gdzie chcesz spać?"}</h2>
            </div>
          </div>

          <div className="search-v3-form">
            {isFlights && (
              <label className="search-v3-field">
                <span><Plane size={15}/> Skąd?</span>
                <select value={originCode} onChange={(event) => setOriginCode(event.target.value)}>
                  <option value="">Wybierz lotnisko</option>
                  {airportOptions.map((airport) => <option key={airport.code} value={airport.code}>{airport.label}</option>)}
                </select>
              </label>
            )}

            <label className="search-v3-field search-v3-destination">
              <span><MapPin size={15}/> Dokąd?</span>
              <input
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder={isFlights ? "np. Rzym, Włochy" : "np. Hoi An, Wietnam"}
                list={isFlights ? "tripownia-flight-destinations" : undefined}
                autoComplete="off"
              />
              {isFlights && (
                <datalist id="tripownia-flight-destinations">
                  {FLIGHT_DESTINATIONS.map((place) => <option key={place.code} value={place.label}>{place.code}</option>)}
                </datalist>
              )}
            </label>

            {isFlights ? (
              <>
                <label className="search-v3-field">
                  <span><CalendarDays size={15}/> Wylot</span>
                  <input type="date" value={departureDate} onChange={(event) => {
                    const next = event.target.value;
                    setDepartureDate(next);
                    if (returnDate && next && returnDate < next) setReturnDate("");
                  }} />
                </label>
                <label className="search-v3-field">
                  <span><CalendarDays size={15}/> Powrót</span>
                  <input type="date" min={departureDate || undefined} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} />
                </label>
              </>
            ) : (
              <>
                <label className="search-v3-field">
                  <span><CalendarDays size={15}/> Przyjazd</span>
                  <input type="date" value={checkin} onChange={(event) => {
                    const next = event.target.value;
                    setCheckin(next);
                    if (checkout && next && checkout <= next) setCheckout("");
                  }} />
                </label>
                <label className="search-v3-field">
                  <span><CalendarDays size={15}/> Wyjazd</span>
                  <input type="date" min={checkin || undefined} value={checkout} onChange={(event) => setCheckout(event.target.value)} />
                </label>
                <label className="search-v3-field">
                  <span>Podróżni</span>
                  <select value={adults} onChange={(event) => setAdults(Number(event.target.value))}>
                    {[1,2,3,4,5,6].map((value) => <option key={value} value={value}>{value} {value === 1 ? "osoba" : "osoby"}</option>)}
                  </select>
                </label>
              </>
            )}
          </div>

          <div className="account-card" style={{ marginTop: 18 }}>
            <div className="account-card-title">
              {isFlights ? <Plane size={21}/> : <BedDouble size={21}/>}
              <div><small>OSTATNI KROK</small><strong>{isFlights ? "Sprawdź loty w Kiwi.com" : "Sprawdź noclegi w Booking.com"}</strong></div>
            </div>
            <p>{validationCopy}</p>
            <a
              className="account-primary-button"
              href={ready ? targetUrl : undefined}
              aria-disabled={!ready}
              onClick={(event) => { if (!ready) event.preventDefault(); }}
              target="_blank"
              rel="sponsored noopener noreferrer"
              style={!ready ? { opacity: .55, pointerEvents: "none" } : undefined}
            >
              <Search size={17}/>{isFlights ? "Pokaż loty" : "Pokaż hotele"}
            </a>
            <small className="account-footnote">Cena i dostępność są potwierdzane u partnera. Tripownia nie zmienia ceny ani parametrów po kliknięciu.</small>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
