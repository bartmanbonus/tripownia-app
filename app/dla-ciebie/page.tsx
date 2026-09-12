"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { offers } from "@/lib/offers";
import { DEFAULT_TRAVEL_PROFILE, readTravelProfile, type TravelProfile } from "@/lib/travelProfile";

function scoreOffer(offer: (typeof offers)[number], profile: TravelProfile) {
  let score = offer.score * 10;
  const departure = offer.departure.toLowerCase();
  const preferredDeparture = profile.departure.toLowerCase();
  if (preferredDeparture && departure.includes(preferredDeparture)) score += 24;
  if (offer.price <= profile.budget) score += 20;
  else score -= Math.min(25, Math.round((offer.price - profile.budget) / 100));
  for (const style of profile.styles) if (offer.category.includes(style)) score += 8;
  if (profile.warmOnly && offer.category.includes("cieplo")) score += 12;
  if (profile.standard === "budget" && offer.category.includes("tanio")) score += 8;
  if (profile.standard === "premium" && /4★|5★/i.test(offer.hotel)) score += 8;
  if (offer.availabilityStatus === "expired") score -= 100;
  return score;
}

export default function ForYouPage() {
  const [profile, setProfile] = useState<TravelProfile>(DEFAULT_TRAVEL_PROFILE);

  useEffect(() => {
    const load = () => setProfile(readTravelProfile());
    load();
    window.addEventListener("tripownia-profile-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("tripownia-profile-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const matches = useMemo(() => offers
    .filter((offer) => offer.availabilityStatus !== "expired")
    .map((offer) => ({ offer, match: scoreOffer(offer, profile) }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 8), [profile]);

  return (
    <main>
      <SiteHeader />
      <section className="shell hub-page favorites-page">
        <div className="app-alerts-hero">
          <div className="app-alerts-icon"><Sparkles size={28} /></div>
          <div>
            <div className="kicker">PERSONALIZOWANE</div>
            <h1>Dla Ciebie</h1>
            <p>Wybraliśmy oferty najlepiej pasujące do Twojego budżetu, miejsca wylotu i stylu podróżowania.</p>
          </div>
        </div>

        <div className="for-you-summary">
          <span>Wylot: <strong>{profile.departure}</strong></span>
          <span>Budżet: <strong>do {profile.budget.toLocaleString("pl-PL")} zł</strong></span>
          <span>Styl: <strong>{profile.styles.length ? profile.styles.join(", ") : "dowolny"}</strong></span>
          <Link href="/profil"><SlidersHorizontal size={16} /> Zmień profil</Link>
        </div>

        <div className="cards-grid">
          {matches.map(({ offer }) => <OfferCard key={offer.id} offer={offer} />)}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
