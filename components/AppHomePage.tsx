"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Compass,
  Heart,
  MapPinned,
  Plus,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  Car,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";
import { readActiveTrip, TRIP_ARCHIVE_EVENT, type TripArchiveSnapshot } from "@/lib/tripArchive";

type OfferSnapshot = {
  city?: string;
  country?: string;
  dates?: string;
  departure?: string;
};

function activeTripLabel(trip: TripArchiveSnapshot | null) {
  const offer = trip?.offerSnapshot as OfferSnapshot | undefined;
  if (!offer?.city) return "Twoja aktywna podróż";
  return `${offer.city}${offer.country ? `, ${offer.country}` : ""}`;
}

export default function AppHomePage() {
  const [activeTrip, setActiveTrip] = useState<TripArchiveSnapshot | null>(null);

  useEffect(() => {
    const load = () => setActiveTrip(readActiveTrip());
    load();
    window.addEventListener(TRIP_ARCHIVE_EVENT, load as EventListener);
    window.addEventListener("tripownia-my-trip-updated", load as EventListener);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(TRIP_ARCHIVE_EVENT, load as EventListener);
      window.removeEventListener("tripownia-my-trip-updated", load as EventListener);
      window.removeEventListener("storage", load);
    };
  }, []);

  const progress = useMemo(() => {
    if (!activeTrip) return 0;
    return Object.values(activeTrip.checklist || {}).filter(Boolean).length;
  }, [activeTrip]);

  const offer = activeTrip?.offerSnapshot as OfferSnapshot | undefined;

  const tiles = [
    { href: "/moje-podroze", icon: MapPinned, title: "Moje podróże", text: "Aktywne i zapisane plany w jednym miejscu." },
    { href: activeTrip ? "/moja-podroz" : "/dodaj-podroz", icon: CheckCircle2, title: "Mój planer", text: activeTrip ? "Otwórz plan, checklistę i organizer wyjazdu." : "Dodaj pierwszy wyjazd i utwórz plan." },
    { href: "/dla-ciebie", icon: Compass, title: "Dla Ciebie", text: "Kierunki i oferty dopasowane do Twoich preferencji." },
    { href: "/ulubione", icon: Heart, title: "Ulubione", text: "Wróć do ofert zapisanych do późniejszej decyzji." },
    { href: "/alerty", icon: Bell, title: "Alerty", text: "Ustaw warunki i wracaj do obserwowanych wyjazdów." },
    { href: "/profil", icon: UserRound, title: "Profil podróżnika", text: "Budżet, lotniska, styl podróży i preferencje." },
  ];

  return (
    <main>
      <SiteHeader />

      <section className="shell app-home-page">
        <div className="app-home-hero">
          <div>
            <div className="kicker">TWOJA TRIPOWNIA</div>
            <h1>Podróże, plan i zapisane rzeczy w jednym miejscu.</h1>
            <p>Tu wracasz do swoich wyjazdów. Bez przekopywania strony głównej za każdym razem.</p>
          </div>
          <div className="app-home-hero-actions">
            <Link className="primary-cta" href="/dodaj-podroz"><Plus size={17}/> Dodaj podróż</Link>
            <Link className="secondary-cta" href="#wyszukiwarka"><Search size={17}/> Znajdź wyjazd</Link>
          </div>
        </div>

        {activeTrip ? (
          <section className="app-trip-now" aria-label="Aktywna podróż">
            <div>
              <div className="kicker light">AKTYWNA PODRÓŻ</div>
              <h2>{activeTripLabel(activeTrip)}</h2>
              <p>{offer?.dates || "Termin w Twoim planie"}{offer?.departure ? ` · start: ${offer.departure}` : ""}</p>
            </div>
            <div className="app-trip-now-status">
              <span><CheckCircle2 size={16}/> {progress} odhaczonych zadań</span>
              <Link href="/moja-podroz">Otwórz planer <ArrowRight size={15}/></Link>
            </div>
          </section>
        ) : (
          <section className="app-onboarding" aria-label="Zacznij korzystać z Tripowni">
            <div className="app-onboarding-head">
              <div>
                <div className="kicker">ZACZNIJ OD JEDNEJ RZECZY</div>
                <h2>Dodaj wyjazd albo znajdź nowy.</h2>
              </div>
              <Sparkles size={22}/>
            </div>
            <div className="app-onboarding-steps">
              <Link href="/dodaj-podroz"><Plus size={18}/><span>Dodaj wyjazd, który już masz</span><ArrowRight size={15}/></Link>
              <Link href="#wyszukiwarka"><Search size={18}/><span>Znajdź nowy wyjazd</span><ArrowRight size={15}/></Link>
              <Link href="/profil"><UserRound size={18}/><span>Ustaw swoje preferencje</span><ArrowRight size={15}/></Link>
            </div>
          </section>
        )}

        <div className="app-home-grid" aria-label="Najważniejsze funkcje Tripowni">
          {tiles.map(({ href, icon: Icon, title, text }) => (
            <Link className="app-home-tile" href={href} key={href}>
              <Icon size={22}/>
              <div><strong>{title}</strong><span>{text}</span></div>
              <ArrowRight size={16}/>
            </Link>
          ))}
        </div>

        <section className="app-pretrip-section" aria-labelledby="app-before-trip-title">
          <div className="section-heading">
            <div>
              <div className="kicker">PRZED WYJAZDEM</div>
              <h2 id="app-before-trip-title">Domknij praktyczne rzeczy.</h2>
            </div>
          </div>
          <div className="app-pretrip-grid">
            <Link href="/ubezpieczenia"><ShieldCheck size={21}/><strong>Ubezpieczenie</strong><span>Sprawdź ochronę przed podróżą.</span></Link>
            <Link href="/esim"><Smartphone size={21}/><strong>eSIM</strong><span>Przygotuj internet jeszcze przed lądowaniem.</span></Link>
            <Link href="/parkingi"><Car size={21}/><strong>Parking</strong><span>Zaplanuj auto przy lotnisku bez nerwów.</span></Link>
          </div>
        </section>

        <section className="app-home-recommendations" id="wyszukiwarka" aria-labelledby="app-search-title">
          <div className="section-heading">
            <div>
              <div className="kicker">NASTĘPNY WYJAZD</div>
              <h2 id="app-search-title">Znajdź coś nowego.</h2>
            </div>
            <Link href="/okazje">Wszystkie okazje <ArrowRight size={16}/></Link>
          </div>
          <SearchHub embedded />
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}
