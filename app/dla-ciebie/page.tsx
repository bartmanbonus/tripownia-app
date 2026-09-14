"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Sparkles, SlidersHorizontal } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { type Offer } from "@/lib/offers";
import { DEFAULT_TRAVEL_PROFILE, readTravelProfile, type TravelProfile } from "@/lib/travelProfile";
import { useLiveOffers } from "@/lib/useLiveOffers";
import { recommendationScore } from "@/lib/offerQuality";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import { touristDestinationKey } from "@/lib/destinationGrouping";

function scoreOffer(offer: Offer, profile: TravelProfile) {
  let score = recommendationScore(offer, "all");
  const departure = offer.departure.toLowerCase();
  const preferredDeparture = profile.departure.toLowerCase();

  if (preferredDeparture && departure.includes(preferredDeparture)) score += 24;
  for (const style of profile.styles) if (offer.category.includes(style)) score += 8;
  if (profile.warmOnly && offer.category.includes("cieplo")) score += 12;
  if (profile.standard === "budget" && offer.category.includes("tanio")) score += 8;
  if (profile.standard === "premium" && /4★|5★/i.test(offer.hotel)) score += 8;
  return score;
}

export default function ForYouPage() {
  const [profile, setProfile] = useState<TravelProfile>(DEFAULT_TRAVEL_PROFILE);
  const { offers, source, loading, checkedAt, refresh } = useLiveOffers("/api/today-offers?mode=search&broad=1");

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

  const matches = useMemo(() => {
    const ranked = offers
      .filter((offer) => offer.availabilityStatus !== "expired")
      .filter((offer) => isTravelDestinationAllowed(offer.city, offer.country))
      .filter((offer) => Number(offer.price) > 0 && Number(offer.price) <= profile.budget)
      .filter((offer) => !profile.warmOnly || offer.category.includes("cieplo"))
      .map((offer) => ({ offer, match: scoreOffer(offer, profile) }))
      .sort((a, b) => b.match - a.match || a.offer.price - b.offer.price);

    const seen = new Set<string>();
    return ranked.filter(({ offer }) => {
      const key = touristDestinationKey(offer);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);
  }, [offers, profile]);

  const sourceLabel = source === "live"
    ? `Aktualne oferty${checkedAt ? ` · sprawdzone ${new Date(checkedAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}` : ""}`
    : offers.length
      ? `Ostatnia poprawna pula${checkedAt ? ` · sprawdzona ${new Date(checkedAt).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}` : ""}`
      : "Brak potwierdzonej puli — odświeżamy dane";

  const emptyCopy = profile.warmOnly
    ? `Nie mamy teraz potwierdzonej ciepłej oferty do ${profile.budget.toLocaleString("pl-PL")} zł.`
    : `Nie mamy teraz potwierdzonej oferty do ${profile.budget.toLocaleString("pl-PL")} zł.`;

  return (
    <main>
      <SiteHeader />
      <section className="shell hub-page favorites-page">
        <div className="app-alerts-hero">
          <div className="app-alerts-icon"><Sparkles size={28} /></div>
          <div>
            <div className="kicker">PERSONALIZOWANE</div>
            <h1>Dla Ciebie</h1>
            <p>Tripownia respektuje Twój budżet i ustawienie „tylko ciepło”, a potem układa wyniki według miejsca wylotu, stylu podróży i jakości danych oferty.</p>
          </div>
        </div>

        <div className="for-you-summary">
          <span>Wylot: <strong>{profile.departure}</strong></span>
          <span>Budżet: <strong>do {profile.budget.toLocaleString("pl-PL")} zł</strong></span>
          <span>Styl: <strong>{profile.styles.length ? profile.styles.join(", ") : "dowolny"}</strong></span>
          {profile.warmOnly && <span>Klimat: <strong>tylko ciepło</strong></span>}
          <span>{sourceLabel}</span>
          <button type="button" onClick={refresh} className="app-secondary-button"><RefreshCw size={16} /> {loading ? "Odświeżam…" : "Odśwież"}</button>
          <Link href="/profil"><SlidersHorizontal size={16} /> Zmień profil</Link>
        </div>

        {matches.length > 0 ? (
          <div className="cards-grid">
            {matches.map(({ offer }) => <OfferCard key={offer.id} offer={offer} />)}
          </div>
        ) : !loading ? (
          <div className="self-search-empty">
            <strong>{emptyCopy}</strong>
            <span>Odśwież dane albo zmień profil — nie pokazujemy droższych lub niespełniających warunków ofert tylko po to, żeby zapełnić ekran.</span>
          </div>
        ) : null}
      </section>
      <SiteFooter />
    </main>
  );
}
