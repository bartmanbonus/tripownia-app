"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, MapPin, Search, Sparkles } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { partners } from "@/lib/partners";

function getYourGuideSearchUrl(destination: string) {
  const url = new URL("https://www.getyourguide.pl/s/");
  url.searchParams.set("q", destination.trim());
  return partners.getyourguide.buildUrl(url.toString());
}

function seePlacesSearchUrl(destination: string) {
  const url = new URL("https://seeplaces.com/");
  if (destination.trim()) url.searchParams.set("q", destination.trim());
  return partners.seeplaces.buildUrl(url.toString());
}

export default function AttractionSearchPage() {
  const [destination, setDestination] = useState("");

  useEffect(() => {
    try {
      const trip = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null");
      const snapshot = trip?.offerSnapshot;
      if (!snapshot?.city) return;
      setDestination(`${snapshot.city}${snapshot.country ? `, ${snapshot.country}` : ""}`);
    } catch {
      // Active trip prefill is optional.
    }
  }, []);
  const ready = destination.trim().length >= 2;

  const getYourGuideUrl = useMemo(() => getYourGuideSearchUrl(destination), [destination]);
  const seePlacesUrl = useMemo(() => seePlacesSearchUrl(destination), [destination]);

  return (
    <main>
      <SiteHeader />
      <section className="shell service-page">
        <div className="kicker">ATRAKCJE</div>
        <h1>Znajdź atrakcje w miejscu, do którego jedziesz.</h1>
        <p className="hub-lead">Wpisz miasto, wyspę albo region. Tripownia przygotuje wyszukiwanie i dopiero wtedy przejdziesz do partnera z gotowym kierunkiem.</p>

        <div className="search-v3">
          <div className="search-v3-head">
            <div>
              <small>ATRAKCJE I WYCIECZKI</small>
              <h2>Co chcesz zobaczyć na miejscu?</h2>
              <p>Bilety, wycieczki, rejsy, punkty widokowe i lokalne aktywności.</p>
            </div>
          </div>

          <div className="search-v3-form">
            <label className="search-v3-field search-v3-destination">
              <span><MapPin size={15}/> Gdzie?</span>
              <input
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="np. Sapa, Wietnam"
                autoComplete="off"
              />
            </label>
          </div>

          <div className="account-grid" style={{ marginTop: 18 }}>
            <div className="account-card">
              <div className="account-card-title">
                <Sparkles size={21}/>
                <div><small>NAJWIĘKSZY WYBÓR</small><strong>GetYourGuide</strong></div>
              </div>
              <p>Wycieczki, bilety, rejsy i atrakcje w wybranym kierunku.</p>
              <a
                className="account-primary-button"
                href={ready ? getYourGuideUrl : undefined}
                aria-disabled={!ready}
                onClick={(event) => { if (!ready) event.preventDefault(); }}
                target="_blank"
                rel="sponsored noopener noreferrer"
                style={!ready ? { opacity: .55, pointerEvents: "none" } : undefined}
              >
                <Search size={17}/> Pokaż atrakcje
              </a>
            </div>

            <div className="account-card">
              <div className="account-card-title">
                <Building2 size={21}/>
                <div><small>DRUGIE ŹRÓDŁO</small><strong>SeePlaces</strong></div>
              </div>
              <p>Sprawdź dodatkowe lokalne atrakcje i aktywności.</p>
              <a
                className="account-social-button"
                href={ready ? seePlacesUrl : undefined}
                aria-disabled={!ready}
                onClick={(event) => { if (!ready) event.preventDefault(); }}
                target="_blank"
                rel="sponsored noopener noreferrer"
                style={!ready ? { opacity: .55, pointerEvents: "none" } : undefined}
              >
                <Search size={16}/> Sprawdź SeePlaces
              </a>
            </div>
          </div>

          {!ready && <div className="account-message" role="status">Wpisz kierunek, żeby przygotować wyszukiwanie atrakcji.</div>}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
