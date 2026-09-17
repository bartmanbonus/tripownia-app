"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Sparkles, SlidersHorizontal } from "lucide-react";
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

function onePerDirection<T extends { offer: Offer }>(rows: T[]) {
  const seen = new Set<string>();
  return rows.filter(({ offer }) => {
    const key = touristDestinationKey(offer);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

  const recommendationGroups = useMemo(() => {
    const ranked = offers
      .filter((offer) => offer.availabilityStatus !== "expired")
      .filter((offer) => isTravelDestinationAllowed(offer.city, offer.country))
      .filter((offer) => Number(offer.price) > 0)
      .map((offer) => ({ offer, match: scoreOffer(offer, profile) }));

    const exact = onePerDirection(
      ranked
        .filter(({ offer }) => Number(offer.price) <= profile.budget)
        .filter(({ offer }) => !profile.warmOnly || offer.category.includes("cieplo"))
        .sort((a, b) => b.match - a.match || a.offer.price - b.offer.price),
    ).slice(0, 6);

    const exactIds = new Set(exact.map(({ offer }) => offer.id));
    const flexibleBudget = Math.round(profile.budget * 1.25);
    const alternatives = onePerDirection(
      ranked
        .filter(({ offer }) => !exactIds.has(offer.id))
        .filter(({ offer }) => Number(offer.price) <= flexibleBudget)
        .filter(({ offer }) => !profile.warmOnly || offer.category.includes("cieplo"))
        .sort((a, b) => {
          const overA = Math.max(0, Number(a.offer.price) - profile.budget);
          const overB = Math.max(0, Number(b.offer.price) - profile.budget);
          if (overA !== overB) return overA - overB;
          return b.match - a.match || a.offer.price - b.offer.price;
        }),
    ).slice(0, Math.max(0, 6 - exact.length));

    const used = new Set([...exact, ...alternatives].map(({ offer }) => offer.id));
    const inspirations = onePerDirection(
      ranked
        .filter(({ offer }) => !used.has(offer.id))
        .sort((a, b) => b.match - a.match || a.offer.price - b.offer.price),
    ).slice(0, 4);

    return { exact, alternatives, inspirations, flexibleBudget };
  }, [offers, profile]);

  const sourceLabel = source === "live"
    ? `Aktualne oferty${checkedAt ? ` · sprawdzone ${new Date(checkedAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}` : ""}`
    : offers.length
      ? `Ostatnia poprawna pula${checkedAt ? ` · sprawdzona ${new Date(checkedAt).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}` : ""}`
      : "Brak potwierdzonej puli — odświeżamy dane";

  const totalShown = recommendationGroups.exact.length + recommendationGroups.alternatives.length;

  return (
    <main>
      <SiteHeader />
      <section className="shell hub-page favorites-page for-you-guided">
        <div className="app-alerts-hero">
          <div className="app-alerts-icon"><Sparkles size={28} /></div>
          <div>
            <div className="kicker">TRIPOWNIA DOBIERA</div>
            <h1>Wybrałam dla Ciebie.</h1>
            <p>Najpierw pokazujemy oferty, które mieszczą się w Twoich warunkach. Jeśli ich jest mało, dokładamy najbliższe sensowne alternatywy i jasno mówimy, gdzie jest kompromis.</p>
          </div>
        </div>

        <div className="for-you-summary">
          <span>Wylot: <strong>{profile.departure}</strong></span>
          <span>Budżet: <strong>do {profile.budget.toLocaleString("pl-PL")} zł</strong></span>
          <span>Styl: <strong>{profile.styles.length ? profile.styles.join(", ") : "dowolny"}</strong></span>
          {profile.warmOnly && <span>Klimat: <strong>tylko ciepło</strong></span>}
          <span>{sourceLabel}</span>
          <button type="button" onClick={refresh} className="app-secondary-button"><RefreshCw size={16} /> {loading ? "Odświeżam…" : "Odśwież"}</button>
          <Link href="/profil"><SlidersHorizontal size={16} /> Zmień preferencje</Link>
        </div>

        {!loading && totalShown > 0 && (
          <div className="for-you-guidance">
            <div>
              <small>JAK CZYTAĆ WYNIKI</small>
              <strong>{recommendationGroups.exact.length ? `${recommendationGroups.exact.length} ofert spełnia Twój budżet` : "Brak idealnego trafienia w budżet"}</strong>
              <span>{recommendationGroups.alternatives.length
                ? `Dalej pokazujemy ${recommendationGroups.alternatives.length} najbliższe opcje do ${recommendationGroups.flexibleBudget.toLocaleString("pl-PL")} zł, żeby nie zostawiać Cię bez rozwiązania.`
                : "Nie dokładamy przypadkowych kierunków — pokazujemy tylko sensowne dopasowania."}</span>
            </div>
            <a href="#dopasowane">Zobacz wybór <ArrowRight size={16}/></a>
          </div>
        )}

        {recommendationGroups.exact.length > 0 && (
          <div id="dopasowane" className="for-you-section">
            <div className="for-you-section-head"><small>NAJLEPSZE DOPASOWANIE</small><h2>Najpierw to, co spełnia Twoje warunki</h2></div>
            <div className="cards-grid">{recommendationGroups.exact.map(({ offer }) => <OfferCard key={offer.id} offer={offer} />)}</div>
          </div>
        )}

        {recommendationGroups.alternatives.length > 0 && (
          <div className="for-you-section for-you-alternatives">
            <div className="for-you-section-head"><small>WARTO ROZWAŻYĆ</small><h2>Najbliższe sensowne alternatywy</h2><p>Trochę większy budżet, ale nadal podobny styl i dobre dopasowanie. Pokazujemy je dopiero po ofertach spełniających Twoje warunki.</p></div>
            <div className="cards-grid">{recommendationGroups.alternatives.map(({ offer }) => <OfferCard key={offer.id} offer={offer} />)}</div>
          </div>
        )}

        {!loading && totalShown === 0 && recommendationGroups.inspirations.length > 0 && (
          <div className="for-you-section">
            <div className="for-you-section-head"><small>PLAN B</small><h2>Nie mamy dziś dobrego dopasowania. Oto najlepsze aktualne opcje.</h2><p>Nie udajemy, że spełniają wszystkie warunki — traktuj je jako inspirację do zmiany budżetu lub kierunku.</p></div>
            <div className="cards-grid">{recommendationGroups.inspirations.map(({ offer }) => <OfferCard key={offer.id} offer={offer} />)}</div>
          </div>
        )}

        {!loading && !offers.length && (
          <div className="self-search-empty">
            <strong>Nie mamy teraz potwierdzonej puli ofert.</strong>
            <span>Odśwież dane lub wróć za chwilę — nie pokazujemy starych cen jako aktualnych.</span>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
