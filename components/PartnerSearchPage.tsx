"use client";

import { useMemo, useState } from "react";
import { BedDouble, CalendarDays, MapPin, Plane, Search } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { partners } from "@/lib/partners";

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildFlightUrl(origin: string, destination: string, adults: number) {
  const url = new URL("https://www.kiwi.com/pl/");
  if (origin.trim()) url.searchParams.set("origin", slug(origin));
  if (destination.trim()) url.searchParams.set("destination", slug(destination));
  url.searchParams.set("adults", String(Math.max(1, adults)));
  url.searchParams.set("currency", "PLN");
  return partners.kiwi.buildUrl(url.toString());
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
  const [origin, setOrigin] = useState("Warszawa, Polska");
  const [destination, setDestination] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [adults, setAdults] = useState(2);

  const targetUrl = useMemo(() => {
    return isFlights
      ? buildFlightUrl(origin, destination, adults)
      : buildHotelUrl(destination, checkin, checkout, adults);
  }, [isFlights, origin, destination, checkin, checkout, adults]);

  const ready = destination.trim().length >= 2;

  return (
    <main>
      <SiteHeader />
      <section className="shell service-page">
        <div className="kicker">{isFlights ? "LOTY" : "HOTELE"}</div>
        <h1>{isFlights ? "Znajdź lot bez wychodzenia z Tripowni" : "Znajdź hotel bez przypadkowego klikania"}</h1>
        <p className="hub-lead">
          {isFlights
            ? "Najpierw podaj kierunek. Tripownia przygotuje wyszukiwanie, a do Kiwi przejdziesz dopiero na końcu z ustawionymi parametrami."
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
                <input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="np. Warszawa" />
              </label>
            )}

            <label className="search-v3-field search-v3-destination">
              <span><MapPin size={15}/> Dokąd?</span>
              <input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder={isFlights ? "np. Rzym, Włochy" : "np. Hoi An, Wietnam"} />
            </label>

            {!isFlights && (
              <>
                <label className="search-v3-field">
                  <span><CalendarDays size={15}/> Przyjazd</span>
                  <input type="date" value={checkin} onChange={(event) => setCheckin(event.target.value)} />
                </label>
                <label className="search-v3-field">
                  <span><CalendarDays size={15}/> Wyjazd</span>
                  <input type="date" min={checkin || undefined} value={checkout} onChange={(event) => setCheckout(event.target.value)} />
                </label>
              </>
            )}

            <label className="search-v3-field">
              <span>Podróżni</span>
              <select value={adults} onChange={(event) => setAdults(Number(event.target.value))}>
                {[1,2,3,4,5,6].map((value) => <option key={value} value={value}>{value} {value === 1 ? "osoba" : "osoby"}</option>)}
              </select>
            </label>
          </div>

          <div className="account-card" style={{ marginTop: 18 }}>
            <div className="account-card-title">
              {isFlights ? <Plane size={21}/> : <BedDouble size={21}/>}
              <div><small>OSTATNI KROK</small><strong>{isFlights ? "Sprawdź loty w Kiwi.com" : "Sprawdź noclegi w Booking.com"}</strong></div>
            </div>
            <p>{ready ? "Parametry są gotowe. Partner otworzy się w nowej karcie." : "Wpisz kierunek, aby przygotować wyszukiwanie."}</p>
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
