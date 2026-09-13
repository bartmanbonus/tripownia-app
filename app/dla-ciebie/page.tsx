"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Sparkles, SlidersHorizontal } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { DEFAULT_TRAVEL_PROFILE, readTravelProfile, type TravelProfile } from "@/lib/travelProfile";
import { departureCodeForProfile, rankOffersForProfile } from "@/lib/offerPersonalization";
import { useLiveOffers } from "@/lib/useLiveOffers";

export default function ForYouPage() {
  const [profile, setProfile] = useState<TravelProfile>(DEFAULT_TRAVEL_PROFILE);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams({ mode: "search", broad: "1" });
    const departureCode = departureCodeForProfile(profile.departure);
    if (departureCode) params.set("from", departureCode);
    if (profile.budget > 0) params.set("maxPrice", String(profile.budget));
    return `/api/today-offers?${params.toString()}`;
  }, [profile.departure, profile.budget]);

  const { offers, source, loading, checkedAt, refresh } = useLiveOffers(endpoint);

  useEffect(() => {
    const loadProfile = () => setProfile(readTravelProfile());
    loadProfile();
    window.addEventListener("tripownia-profile-updated", loadProfile);
    window.addEventListener("storage", loadProfile);
    return () => {
      window.removeEventListener("tripownia-profile-updated", loadProfile);
      window.removeEventListener("storage", loadProfile);
    };
  }, []);

  const matches = useMemo(() => rankOffersForProfile(offers, profile, true).slice(0, 8), [offers, profile]);

  const sourceLabel = source === "live"
    ? `Aktualne oferty${checkedAt ? ` · sprawdzone ${new Date(checkedAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}` : ""}`
    : "Tryb awaryjny — sprawdzamy ostatnią dostępną pulę według tych samych filtrów";

  return (
    <main>
      <SiteHeader />
      <section className="shell hub-page favorites-page">
        <div className="app-alerts-hero">
          <div className="app-alerts-icon"><Sparkles size={28} /></div>
          <div>
            <div className="kicker">PERSONALIZOWANE</div>
            <h1>Dla Ciebie</h1>
            <p>Tripownia pokazuje tylko oferty zgodne z zapisanym budżetem, miejscem wylotu i wybranym stylem podróżowania.</p>
          </div>
        </div>

        <div className="for-you-summary">
          <span>Wylot: <strong>{profile.departure}</strong></span>
          <span>Budżet: <strong>do {profile.budget.toLocaleString("pl-PL")} zł</strong></span>
          <span>Styl: <strong>{profile.styles.length ? profile.styles.join(", ") : "dowolny"}</strong></span>
          <span>{sourceLabel}</span>
          <button type="button" onClick={refresh} className="app-secondary-button"><RefreshCw size={16} /> {loading ? "Odświeżam…" : "Odśwież"}</button>
          <Link href="/profil"><SlidersHorizontal size={16} /> Zmień profil</Link>
        </div>

        {!loading && matches.length === 0 && (
          <div className="search-v3-empty">
            <strong>Teraz nie ma pełnego dopasowania do Twojego profilu.</strong>
            <span>Zmień budżet, miejsce wylotu albo styl podróży. Nie pokazujemy przypadkowych ofert spoza ustawionych preferencji.</span>
          </div>
        )}

        {matches.length > 0 && (
          <div className="cards-grid">
            {matches.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
