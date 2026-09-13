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

  const { offers, source, loading, checkedAt, notice, refresh } = useLiveOffers(endpoint);

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

  const strictMatches = useMemo(() => rankOffersForProfile(offers, profile, true).slice(0, 8), [offers, profile]);
  const relaxedMatches = useMemo(() => rankOffersForProfile(offers, profile, false).slice(0, 8), [offers, profile]);
  const matches = strictMatches.length ? strictMatches : relaxedMatches;
  const relaxed = !strictMatches.length && relaxedMatches.length > 0;

  const sourceLabel = source === "live"
    ? `Aktualne oferty${checkedAt ? ` · sprawdzone ${new Date(checkedAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}` : ""}`
    : "Tryb awaryjny — pokazujemy ostatnią dostępną pulę";

  return (
    <main>
      <SiteHeader />
      <section className="shell hub-page favorites-page">
        <div className="app-alerts-hero">
          <div className="app-alerts-icon"><Sparkles size={28} /></div>
          <div>
            <div className="kicker">PERSONALIZOWANE</div>
            <h1>Dla Ciebie</h1>
            <p>Tripownia dopasowuje aktualne oferty do Twojego budżetu, miejsca wylotu i stylu podróżowania.</p>
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

        {(relaxed || notice) && (
          <p className="app-results-notice">
            {relaxed
              ? "Nie ma teraz ofert spełniających wszystkie ustawienia jednocześnie. Poniżej pokazujemy najbliższe dopasowania, uporządkowane według Twojego profilu."
              : notice}
          </p>
        )}

        {!loading && matches.length === 0 && (
          <div className="search-v3-empty">
            <strong>Brak dobrych dopasowań do profilu.</strong>
            <span>Zmień budżet, miejsce wylotu albo styl podróży — nie dokładamy przypadkowych ofert tylko po to, żeby zapełnić ekran.</span>
          </div>
        )}

        <div className="cards-grid">
          {matches.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
