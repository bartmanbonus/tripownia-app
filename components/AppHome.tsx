"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Compass, Heart, MapPinned, Plane, Sparkles, UserRound, ArrowRight, Scale } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { offers, isOfferExpired } from "@/lib/offers";
import { readTravelProfile } from "@/lib/travelProfile";

type TripState = { offerId?: number; departureAt?: string };
type AlertState = { departure?: string; destinations?: string; maxPrice?: number };

export default function AppHome() {
  const [profileReady, setProfileReady] = useState(false);
  const [trip, setTrip] = useState<TripState>({});
  const [alerts, setAlerts] = useState<AlertState>({});
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    const profile = readTravelProfile();
    setProfileReady(Boolean(profile));
    try {
      setTrip(JSON.parse(localStorage.getItem("tripownia-my-trip") || "{}"));
      setAlerts(JSON.parse(localStorage.getItem("tripownia-alert-settings") || "{}"));
      const ids = JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[];
      setFavoriteCount(ids.length);
    } catch {}
  }, []);

  const tripOffer = useMemo(() => offers.find((offer) => offer.id === trip.offerId), [trip.offerId]);
  const topOffers = useMemo(() => offers.filter((offer) => offer.partner !== "esky" && !isOfferExpired(offer)).sort((a,b) => b.score - a.score).slice(0, 3), []);

  const tripCopy = tripOffer ? `${tripOffer.city} · ${tripOffer.dates}` : "Nie masz jeszcze wybranej podróży";
  const alertCopy = alerts.maxPrice || alerts.destinations ? `${alerts.destinations || "Dowolny kierunek"}${alerts.maxPrice ? ` · do ${alerts.maxPrice} zł` : ""}` : "Ustaw kierunki, budżet i miejsce wylotu";

  return (
    <main>
      <SiteHeader />
      <section className="shell app-home-page">
        <div className="app-home-hero">
          <div>
            <div className="kicker">MOJA TRIPOWNIA</div>
            <h1>Wszystko, czego potrzebujesz do podróży — w jednym miejscu.</h1>
            <p>Znajdź kierunek, zapisz wyjazd, pilnuj ceny, przygotuj plan i wracaj tu przed podróżą.</p>
          </div>
          <Link className="primary-cta" href="/gdzie-leciec"><Compass size={18}/> Nie wiem gdzie lecieć</Link>
        </div>

        <div className="app-home-grid">
          <Link href="/dla-ciebie" className="app-home-tile app-home-tile-primary"><Sparkles size={22}/><div><strong>Dla Ciebie</strong><span>{profileReady ? "Oferty dopasowane do Twojego profilu" : "Uzupełnij profil, żeby lepiej dopasować oferty"}</span></div><ArrowRight size={18}/></Link>
          <Link href="/moja-podroz" className="app-home-tile"><MapPinned size={22}/><div><strong>Moja podróż</strong><span>{tripCopy}</span></div><ArrowRight size={18}/></Link>
          <Link href="/alerty" className="app-home-tile"><Bell size={22}/><div><strong>Alerty</strong><span>{alertCopy}</span></div><ArrowRight size={18}/></Link>
          <Link href="/ulubione" className="app-home-tile"><Heart size={22}/><div><strong>Ulubione</strong><span>{favoriteCount ? `${favoriteCount} zapisanych ofert` : "Zapisz oferty, do których chcesz wrócić"}</span></div><ArrowRight size={18}/></Link>
          <Link href="/porownaj" className="app-home-tile"><Scale size={22}/><div><strong>Porównaj</strong><span>Zestaw 2–3 wyjazdy i zobacz realny koszt</span></div><ArrowRight size={18}/></Link>
          <Link href="/profil" className="app-home-tile"><UserRound size={22}/><div><strong>Profil podróżnika</strong><span>Budżet, lotnisko, styl i preferencje</span></div><ArrowRight size={18}/></Link>
        </div>

        <section className="app-home-recommendations">
          <div className="section-heading"><div><div className="kicker">NA START</div><h2>Najmocniejsze propozycje</h2><p>Trzy aktualne oferty z wysoką oceną Tripowni.</p></div><Link href="/podroze">Zobacz wszystkie <ArrowRight size={16}/></Link></div>
          <div className="cards-grid">{topOffers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
