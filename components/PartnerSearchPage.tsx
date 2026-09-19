"use client";

import { useMemo, useState } from "react";
import { BedDouble, CalendarDays, MapPin, Plane, Search } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { airportOptions } from "@/lib/offers";
import { buildKiwiFlightSearchUrl, partners } from "@/lib/partners";

type FlightPlace = { label: string; code: string };

const FLIGHT_DESTINATIONS: FlightPlace[] = [
  { label: "Amsterdam, Holandia", code: "AMS" },
  { label: "Ateny, Grecja", code: "ATH" },
  { label: "Barcelona, Hiszpania", code: "BCN" },
  { label: "Bergamo, Włochy", code: "BGY" },
  { label: "Berlin, Niemcy", code: "BER" },
  { label: "Budapeszt, Węgry", code: "BUD" },
  { label: "Dublin, Irlandia", code: "DUB" },
  { label: "Dubrownik, Chorwacja", code: "DBV" },
  { label: "Edynburg, Wielka Brytania", code: "EDI" },
  { label: "Florencja, Włochy", code: "FLR" },
  { label: "Fuerteventura, Hiszpania", code: "FUE" },
  { label: "Helsinki, Finlandia", code: "HEL" },
  { label: "Kopenhaga, Dania", code: "CPH" },
  { label: "Lizbona, Portugalia", code: "LIS" },
  { label: "Londyn, Wielka Brytania", code: "LON" },
  { label: "Madera, Portugalia", code: "FNC" },
  { label: "Madryt, Hiszpania", code: "MAD" },
  { label: "Majorka, Hiszpania", code: "PMI" },
  { label: "Malaga, Hiszpania", code: "AGP" },
  { label: "Malta", code: "MLA" },
  { label: "Mediolan, Włochy", code: "MIL" },
  { label: "Neapol, Włochy", code: "NAP" },
  { label: "Nicea, Francja", code: "NCE" },
  { label: "Pafos, Cypr", code: "PFO" },
  { label: "Paryż, Francja", code: "PAR" },
  { label: "Porto, Portugalia", code: "OPO" },
  { label: "Praga, Czechy", code: "PRG" },
  { label: "Reykjavik, Islandia", code: "KEF" },
  { label: "Rodos, Grecja", code: "RHO" },
  { label: "Rzym, Włochy", code: "ROM" },
  { label: "Santorini, Grecja", code: "JTR" },
  { label: "Sewilla, Hiszpania", code: "SVQ" },
  { label: "Teneryfa, Hiszpania", code: "TFS" },
  { label: "Wenecja, Włochy", code: "VCE" },
  { label: "Wiedeń, Austria", code: "VIE" },
  { label: "Zadar, Chorwacja", code: "ZAD" },
  { label: "Zurych, Szwajcaria", code: "ZRH" },
  { label: "Djerba, Tunezja", code: "DJE" },
  { label: "Kair, Egipt", code: "CAI" },
  { label: "Kapsztad, RPA", code: "CPT" },
  { label: "Marrakesz, Maroko", code: "RAK" },
  { label: "Marsa Alam, Egipt", code: "RMF" },
  { label: "Mauritius", code: "MRU" },
  { label: "Seszele", code: "SEZ" },
  { label: "Zanzibar, Tanzania", code: "ZNZ" },
  { label: "Abu Dhabi, ZEA", code: "AUH" },
  { label: "Doha, Katar", code: "DOH" },
  { label: "Dubaj, ZEA", code: "DXB" },
  { label: "Stambuł, Turcja", code: "IST" },
  { label: "Bali, Indonezja", code: "DPS" },
  { label: "Bangkok, Tajlandia", code: "BKK" },
  { label: "Hanoi, Wietnam", code: "HAN" },
  { label: "Ho Chi Minh, Wietnam", code: "SGN" },
  { label: "Hoi An / Da Nang, Wietnam", code: "DAD" },
  { label: "Kuala Lumpur, Malezja", code: "KUL" },
  { label: "Malediwy", code: "MLE" },
  { label: "Pekin, Chiny", code: "PEK" },
  { label: "Phuket, Tajlandia", code: "HKT" },
  { label: "Singapur", code: "SIN" },
  { label: "Tokio, Japonia", code: "TYO" },
  { label: "Cancún, Meksyk", code: "CUN" },
  { label: "Los Angeles, USA", code: "LAX" },
  { label: "Miami, USA", code: "MIA" },
  { label: "Nowy Jork, USA", code: "NYC" },
  { label: "San Francisco, USA", code: "SFO" },
  { label: "Toronto, Kanada", code: "YTO" },
  { label: "Buenos Aires, Argentyna", code: "BUE" },
  { label: "Rio de Janeiro, Brazylia", code: "RIO" },
  { label: "Auckland, Nowa Zelandia", code: "AKL" },
  { label: "Melbourne, Australia", code: "MEL" },
  { label: "Sydney, Australia", code: "SYD" },
  { label: "Tahiti, Polinezja Francuska", code: "PPT" },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function resolveFlightCode(value: string) {
  const raw = value.trim();
  if (/^[a-zA-Z]{3}$/.test(raw)) return raw.toUpperCase();
  const normalized = normalize(raw);
  const match = FLIGHT_DESTINATIONS.find((item) => {
    const city = item.label.split(",")[0];
    return normalize(item.label) === normalized || normalize(city) === normalized;
  });
  return match?.code || "";
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
  const [originCode, setOriginCode] = useState("WAW");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [adults, setAdults] = useState(2);

  const destinationCode = useMemo(() => isFlights ? resolveFlightCode(destination) : "", [destination, isFlights]);
  const hotelDatesValid = !checkin || !checkout || new Date(checkout).getTime() > new Date(checkin).getTime();
  const flightDatesValid = !departureDate || !returnDate || new Date(returnDate).getTime() >= new Date(departureDate).getTime();

  const targetUrl = useMemo(() => {
    if (isFlights) {
      if (!destinationCode) return "";
      return buildKiwiFlightSearchUrl({
        from: originCode,
        to: destinationCode,
        departure: departureDate || undefined,
        returnDate: returnDate || undefined,
      });
    }
    return buildHotelUrl(destination, checkin, checkout, adults);
  }, [isFlights, originCode, destinationCode, departureDate, returnDate, destination, checkin, checkout, adults]);

  const ready = isFlights
    ? Boolean(destinationCode && flightDatesValid)
    : Boolean(destination.trim().length >= 2 && hotelDatesValid);

  const validationCopy = isFlights
    ? !destination.trim()
      ? "Wybierz kierunek z listy albo wpisz 3-literowy kod lotniska/miasta."
      : !destinationCode
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
