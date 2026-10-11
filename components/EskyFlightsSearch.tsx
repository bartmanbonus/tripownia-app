"use client";

import { FormEvent, useState } from "react";

type Place = {
  code: string;
  name: string;
  country?: string;
};

function cleanIata(value: string) {
  const code = value.trim().toUpperCase().replace(/[^A-Z]/g, "");
  return /^[A-Z]{3}$/.test(code) ? code : "";
}

async function resolvePlace(value: string) {
  const direct = cleanIata(value);
  if (direct) return direct;

  const response = await fetch("/api/flight-places?q=" + encodeURIComponent(value.trim()), {
    cache: "no-store",
  });
  const data = await response.json();
  const places = Array.isArray(data?.places) ? data.places as Place[] : [];
  return cleanIata(places[0]?.code || "");
}

function eskyUrl(origin: string, destination: string, departureDate: string, returnDate: string, adults: number) {
  const originType = origin === "WAW" ? "mp" : "ap";
  const originCode = origin === "WAW" ? "WAWA" : origin;
  const url = new URL(`https://www2.esky.pl/flights/search/${originType}/${originCode}/ap/${destination}`);
  url.searchParams.set("departureDate", departureDate);
  url.searchParams.set("returnDate", returnDate);
  url.searchParams.set("pa", String(adults));
  url.searchParams.set("py", "0");
  url.searchParams.set("pc", "0");
  url.searchParams.set("pi", "0");
  url.searchParams.set("sc", "economy");
  url.searchParams.set("partner_id", "TRIPOWNIAPL");
  url.searchParams.set("flexDatesOffset", "0");
  return url.toString();
}

export default function EskyFlightsSearch({
  initialOrigin = "WAW",
  initialDestination = "",
  initialOutbound = "",
  initialInbound = "",
}: {
  initialOrigin?: string;
  initialDestination?: string;
  initialOutbound?: string;
  initialInbound?: string;
}) {
  const [origin, setOrigin] = useState(initialOrigin || "WAW");
  const [destination, setDestination] = useState(initialDestination);
  const [departureDate, setDepartureDate] = useState(initialOutbound);
  const [returnDate, setReturnDate] = useState(initialInbound);
  const [adults, setAdults] = useState(1);
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("Sprawdzamy trasę…");

    try {
      const [originCode, destinationCode] = await Promise.all([
        resolvePlace(origin),
        resolvePlace(destination),
      ]);

      if (!originCode || !destinationCode) {
        setStatus("Wpisz poprawne miasto lub kod lotniska.");
        return;
      }
      if (!departureDate || !returnDate) {
        setStatus("Wybierz datę wylotu i powrotu.");
        return;
      }

      const target = eskyUrl(originCode, destinationCode, departureDate, returnDate, adults);
      const tracked = new URLSearchParams({
        target,
        partner: "esky",
        source: "flight_exact_search",
        offer: `${originCode}-${destinationCode}-${departureDate}-${returnDate}`,
        destination: destination,
        page: "/loty",
      });

      window.location.href = "/go/live?" + tracked.toString();
    } catch {
      setStatus("Nie udało się rozpoznać trasy. Spróbuj ponownie.");
    }
  }

  return (
    <form className="flight-hunt flight-hunt-clean" onSubmit={submit}>
      <div className="flight-hunt-controls-clean">
        <label className="flight-hunt-field">
          <span>Skąd</span>
          <input
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            placeholder="Warszawa lub WAW"
            autoComplete="off"
          />
        </label>

        <label className="flight-hunt-field">
          <span>Dokąd</span>
          <input
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="Barcelona lub BCN"
            autoComplete="off"
          />
        </label>

        <label className="flight-hunt-field">
          <span>Wylot</span>
          <input type="date" value={departureDate} onChange={(event) => setDepartureDate(event.target.value)} />
        </label>

        <label className="flight-hunt-field">
          <span>Powrót</span>
          <input type="date" value={returnDate} min={departureDate || undefined} onChange={(event) => setReturnDate(event.target.value)} />
        </label>

        <label className="flight-hunt-field">
          <span>Dorośli</span>
          <select value={adults} onChange={(event) => setAdults(Number(event.target.value))}>
            {[1,2,3,4,5,6].map((value) => <option value={value} key={value}>{value}</option>)}
          </select>
        </label>

        <button type="submit" className="flight-hunt-submit">Sprawdź aktualne loty</button>
      </div>
      {status && <div className="flight-hunt-widget-loading">{status}</div>}
      <div className="tpwl-tripownia-note">
        Najpierw ustawiasz trasę w Tripowni. Do partnera przechodzisz dopiero po kliknięciu wyszukiwania.
      </div>
    </form>
  );
}
