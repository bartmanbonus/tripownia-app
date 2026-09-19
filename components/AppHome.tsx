"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Circle, Compass, Heart, MapPinned, Sparkles, UserRound, ArrowRight, Scale, Ticket, BookOpen, Wifi, Car, ParkingCircle, ListChecks } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import SearchHub from "@/components/SearchHub";
import { offers } from "@/lib/offers";
import { TRAVEL_PROFILE_KEY } from "@/lib/travelProfile";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import { touristDestinationKey } from "@/lib/destinationGrouping";

type TripOffer = (typeof offers)[number];
type TripState = { offerId?: number; offerSnapshot?: TripOffer; departureAt?: string; checklist?: Record<string, boolean> };
type AlertState = { departure?: string; destinations?: string; maxPrice?: string | number };

function onePerDirection(rows: TripOffer[]) {
  const seen = new Set<string>();
  return rows.filter((offer) => {
    const key = touristDestinationKey(offer);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function AppHome() {
  const [profileReady, setProfileReady] = useState(false);
  const [trip, setTrip] = useState<TripState>({});
  const [alerts, setAlerts] = useState<AlertState>({});
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [liveOffers, setLiveOffers] = useState<TripOffer[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      setProfileReady(Boolean(localStorage.getItem(TRAVEL_PROFILE_KEY)));
      try {
        setTrip(JSON.parse(localStorage.getItem("tripownia-my-trip") || "{}"));
        setAlerts(JSON.parse(localStorage.getItem("tripownia-alert-settings") || "{}"));
        const ids = JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[];
        setFavoriteCount(ids.length);
      } catch {
        setTrip({});
        setAlerts({});
        setFavoriteCount(0);
      }
    };

    load();
    window.addEventListener("tripownia-profile-updated", load as EventListener);
    window.addEventListener("tripownia-my-trip-updated", load as EventListener);
    window.addEventListener("tripownia-favorites-updated", load as EventListener);
    window.addEventListener("tripownia-alerts-updated", load as EventListener);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("tripownia-profile-updated", load as EventListener);
      window.removeEventListener("tripownia-my-trip-updated", load as EventListener);
      window.removeEventListener("tripownia-favorites-updated", load as EventListener);
      window.removeEventListener("tripownia-alerts-updated", load as EventListener);
      window.removeEventListener("storage", load);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLiveLoading(true);

    fetch("/api/today-offers?broad=1", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("today-offers")))
      .then((data) => {
        const rows = Array.isArray(data?.offers) ? data.offers : [];
        const clean = onePerDirection(rows
          .filter((offer: TripOffer) => offer?.price > 0 && offer?.affiliateUrl)
          .filter((offer: TripOffer) => isTravelDestinationAllowed(offer.city, offer.country))
        );
        setLiveOffers(clean.slice(0, 6));
      })
      .catch(() => setLiveOffers([]))
      .finally(() => setLiveLoading(false));

    return () => controller.abort();
  }, []);

  const tripOffer = useMemo(
    () => trip.offerSnapshot || offers.find((offer) => offer.id === trip.offerId),
    [trip.offerId, trip.offerSnapshot]
  );
  const topOffers = useMemo(() => liveOffers.slice(0, 3), [liveOffers]);
  const alertsReady = Boolean(alerts.maxPrice || alerts.destinations || alerts.departure);
  const checklistDone = Object.values(trip.checklist || {}).filter(Boolean).length;
  const onboarding = [
    { done: profileReady, href: "/profil", label: "Ustaw profil podróżnika" },
    { done: alertsReady, href: "/alerty", label: "Ustaw pierwszy alert" },
    { done: Boolean(tripOffer), href: "/gdzie-leciec", label: "Wybierz pierwszą podróż" },
  ];
  const completedSteps = onboarding.filter((step) => step.done).length;

  const tripCopy = tripOffer ? `${tripOffer.city} · ${tripOffer.dates}` : "Nie masz jeszcze wybranej podróży";
  const alertCopy = alerts.maxPrice || alerts.destinations
    ? `${alerts.destinations || "Dowolny kierunek"}${alerts.maxPrice ? ` · do ${alerts.maxPrice} zł` : ""}`
    : "Ustaw kierunki, budżet i miejsce wylotu";

  return (
    <main>
      <SiteHeader />
      <section className="shell app-home-page">
        <div className="app-home-hero">
          <div>
            <div className="kicker">MOJA TRIPOWNIA</div>
            <h1>{tripOffer ? `Twój wyjazd do ${tripOffer.city} jest tutaj.` : "Od pomysłu do gotowego wyjazdu."}</h1>
            <p>{tripOffer
              ? `${tripOffer.dates} · sprawdź, co masz już ogarnięte i co warto zrobić teraz.`
              : "Znajdź ofertę, zapisz podróż, dopnij checklistę, atrakcje, transfer, internet i plan dnia — wszystko w jednym miejscu."}</p>
          </div>
          <div className="app-home-hero-actions">
            {tripOffer ? (
              <>
                <Link className="primary-cta" href="/moja-podroz"><MapPinned size={18}/> Kontynuuj podróż</Link>
                <Link className="secondary-cta" href="#wyszukiwarka"><Compass size={18}/> Szukaj następnej</Link>
              </>
            ) : (
              <>
                <Link className="primary-cta" href="#wyszukiwarka"><Compass size={18}/> Znajdź wyjazd</Link>
                <Link className="secondary-cta" href="/dodaj-podroz"><MapPinned size={18}/> Dodaj własną podróż</Link>
              </>
            )}
          </div>
        </div>

        {!tripOffer && <SearchHub initialTab="Inspiracje" />}

        {tripOffer && (
          <section className="app-trip-now">
            <div>
              <div className="kicker">TWÓJ WYJAZD</div>
              <h2>{tripOffer.city}, {tripOffer.country}</h2>
              <p>{tripOffer.dates} · {tripOffer.nights} nocy · wylot: {tripOffer.departure}</p>
            </div>
            <div className="app-trip-now-status">
              <span><ListChecks size={17}/><strong>{checklistDone}</strong> zadań odhaczonych</span>
              <Link href="/moja-podroz">Kontynuuj plan <ArrowRight size={16}/></Link>
            </div>
          </section>
        )}

        {tripOffer && <SearchHub initialTab="Inspiracje" />}

        {completedSteps < onboarding.length && (
          <section className="app-onboarding">
            <div className="app-onboarding-head">
              <div><div className="kicker">START</div><h2>3 kroki do własnej Tripowni</h2></div>
              <strong>{completedSteps}/3</strong>
            </div>
            <div className="app-onboarding-steps">
              {onboarding.map((step) => (
                <Link key={step.label} href={step.href} className={step.done ? "done" : ""}>
                  {step.done ? <CheckCircle2 size={18}/> : <Circle size={18}/>}
                  <span>{step.label}</span>
                  <ArrowRight size={16}/>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="app-pretrip-section">
          <div className="section-heading">
            <div><div className="kicker">PRZED WYJAZDEM</div><h2>Ogarnij rzeczy, o których najłatwiej zapomnieć</h2><p>Najważniejsze narzędzia podróżnika są teraz pod ręką, nie na końcu strony.</p></div>
          </div>
          <div className="app-pretrip-grid">
            <Link href="/moja-podroz"><ListChecks size={21}/><strong>Plan i checklista</strong><span>Dokumenty, odprawa, rezerwacje, notatki i plan dnia.</span></Link>
            <Link href="/atrakcje"><Ticket size={21}/><strong>Atrakcje</strong><span>Znajdź bilety, rejsy, wycieczki i rzeczy do zrobienia na miejscu.</span></Link>
            <Link href="/transfery"><Car size={21}/><strong>Transfer</strong><span>Zaplanuj dojazd z lotniska i nie szukaj go po przylocie.</span></Link>
            <Link href="/parkingi"><ParkingCircle size={21}/><strong>Parking</strong><span>Zostaw auto przy lotnisku i miej jedną rzecz mniej do ogarnięcia.</span></Link>
            <Link href="/esim"><Wifi size={21}/><strong>Internet / eSIM</strong><span>Przygotuj internet przed lądowaniem, szczególnie poza UE.</span></Link>
            <Link href="/poradniki"><BookOpen size={21}/><strong>Poradniki</strong><span>Bagaż, dokumenty, bezpieczeństwo, pieniądze i praktyczne wskazówki.</span></Link>
          </div>
        </section>

        <div className="app-home-grid">
          <Link href="/dla-ciebie" className="app-home-tile app-home-tile-primary"><Sparkles size={22}/><div><strong>Dla Ciebie</strong><span>{profileReady ? "Oferty dopasowane do Twojego profilu" : "Uzupełnij profil, żeby lepiej dopasować oferty"}</span></div><ArrowRight size={18}/></Link>
          <Link href="/moja-podroz" className="app-home-tile"><MapPinned size={22}/><div><strong>Moja podróż</strong><span>{tripCopy}</span></div><ArrowRight size={18}/></Link>
          <Link href="/alerty" className="app-home-tile"><Bell size={22}/><div><strong>Alerty</strong><span>{alertCopy}</span></div><ArrowRight size={18}/></Link>
          <Link href="/ulubione" className="app-home-tile"><Heart size={22}/><div><strong>Ulubione</strong><span>{favoriteCount ? `${favoriteCount} zapisanych ofert` : "Zapisz oferty, do których chcesz wrócić"}</span></div><ArrowRight size={18}/></Link>
          <Link href="/porownaj" className="app-home-tile"><Scale size={22}/><div><strong>Porównaj</strong><span>Zestaw 2–3 wyjazdy i zobacz realny koszt</span></div><ArrowRight size={18}/></Link>
          <Link href="/profil" className="app-home-tile"><UserRound size={22}/><div><strong>Profil podróżnika</strong><span>Budżet, lotnisko, styl, preferencje i prywatność</span></div><ArrowRight size={18}/></Link>
        </div>

        <section className="app-home-recommendations">
          <div className="section-heading">
            <div>
              <div className="kicker">DZISIAJ</div>
              <h2>Najtańsze aktualne propozycje</h2>
              <p>{liveLoading ? "Sprawdzamy dzisiejsze oferty…" : topOffers.length ? "Różne kierunki z aktualnego feedu Tripowni — najpierw cena, potem inspiracja." : "Nie pokazujemy starych kart, jeśli feed nie potwierdzi aktualnych ofert."}</p>
            </div>
            <Link href="/okazje">Zobacz Okazje <ArrowRight size={16}/></Link>
          </div>
          {!liveLoading && topOffers.length > 0 && <div className="cards-grid">{topOffers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div>}
          {!liveLoading && topOffers.length === 0 && <div className="self-search-empty"><strong>Aktualizujemy oferty.</strong><span>Wróć do wyszukiwarki powyżej albo sprawdź inspiracje — nie podstawiamy niezweryfikowanych cen.</span></div>}
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
