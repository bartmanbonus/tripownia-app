"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { offers, isOfferExpired, publishedOfferOverrides } from "@/lib/offers";
import { getOfferOverride } from "@/lib/clientOfferOverrides";
import { DEFAULT_TRAVEL_PROFILE, readTravelProfile, type TravelProfile } from "@/lib/travelProfile";

function effectivePrice(offer: (typeof offers)[number]) {
  const client = getOfferOverride(offer.id);
  const published = publishedOfferOverrides[String(offer.id)] || {};
  return client.price ?? published.price ?? offer.price;
}

function scoreOffer(offer: (typeof offers)[number], profile: TravelProfile) {
  let score = offer.score * 10;
  const price = effectivePrice(offer);
  const departure = offer.departure.toLowerCase();
  const preferredDeparture = profile.departure.toLowerCase();
  if (preferredDeparture && departure.includes(preferredDeparture)) score += 24;
  if (price <= profile.budget) score += 20;
  else score -= Math.min(25, Math.round((price - profile.budget) / 100));
  for (const style of profile.styles) if (offer.category.includes(style)) score += 8;
  if (profile.warmOnly && offer.category.includes("cieplo")) score += 12;
  if (profile.standard === "budget" && offer.category.includes("tanio")) score += 8;
  if (profile.standard === "premium" && /4★|5★/i.test(offer.hotel)) score += 8;
  return score;
}

export default function ForYouPage() {
  const [profile, setProfile] = useState<TravelProfile>(DEFAULT_TRAVEL_PROFILE);
  const [offerRevision, setOfferRevision] = useState(0);

  useEffect(() => {
    const loadProfile = () => setProfile(readTravelProfile());
    const refreshOffers = () => setOfferRevision((value) => value + 1);
    loadProfile();
    window.addEventListener("tripownia-profile-updated", loadProfile);
    window.addEventListener("tripownia-offer-overrides-updated", refreshOffers);
    window.addEventListener("storage", loadProfile);
    return () => {
      window.removeEventListener("tripownia-profile-updated", loadProfile);
      window.removeEventListener("tripownia-offer-overrides-updated", refreshOffers);
      window.removeEventListener("storage", loadProfile);
    };
  }, []);

  const matches = useMemo(() => offers
    .filter((offer) => {
      const client = getOfferOverride(offer.id);
      const published = publishedOfferOverrides[String(offer.id)] || {};
      if (client.hidden || published.hidden) return false;
      const availabilityStatus = client.availabilityStatus ?? published.availabilityStatus ?? offer.availabilityStatus;
      return !isOfferExpired({ ...offer, availabilityStatus });
    })
    .map((offer) => ({ offer, match: scoreOffer(offer, profile) }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 8), [profile, offerRevision]);

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
