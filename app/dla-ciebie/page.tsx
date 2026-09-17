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

type TimedOffer = Offer & { startDateISO?: string; endDateISO?: string };
type RankedOffer = { offer: TimedOffer; match: number; workdays: number | null };

const CAPITALS = new Set([
  "amsterdam","ateny","bangkok","berlin","bratyslawa","brukselа","budapeszt","bukareszt","dublin","helsinki","kair","kopenhaga","lizbona","londyn","madryt","marrakesz","oslo","paryz","praga","reykjavik","ryga","rzym","seul","singapur","sofia","sztokholm","tallinn","tirana","tokio","walencja","wieden","wilno","zagrzeb",
]);

const FAR_COUNTRIES = new Set([
  "australia","brazylia","chiny","dominikana","indonezja","jamajka","japonia","kenia","kolumbia","kostaryka","kuba","malediwy","mauritius","meksyk","peru","seszele","singapur","sri lanka","tajlandia","tanzania","usa","wietnam","zanzibar","zjednoczone emiraty arabskie",
]);

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function workdaysTouched(offer: TimedOffer) {
  if (!offer.startDateISO || !offer.endDateISO) return null;
  const start = new Date(`${offer.startDateISO}T12:00:00Z`);
  const end = new Date(`${offer.endDateISO}T12:00:00Z`);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start) return null;
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end && count < 40) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) count += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

function durationMatches(offer: TimedOffer, profile: TravelProfile) {
  if (profile.durationPreference === "short") return offer.nights >= 2 && offer.nights <= 4;
  if (profile.durationPreference === "week") return offer.nights >= 5 && offer.nights <= 8;
  if (profile.durationPreference === "long") return offer.nights >= 9;
  return true;
}

function scoreOffer(offer: TimedOffer, profile: TravelProfile) {
  let score = recommendationScore(offer, "all");
  const departure = normalize(offer.departure);
  const preferredDeparture = normalize(profile.departure);
  const workdays = workdaysTouched(offer);

  if (preferredDeparture && departure.includes(preferredDeparture)) score += 24;
  for (const style of profile.styles) if (offer.category.includes(style)) score += 7;
  if (profile.warmOnly && offer.category.includes("cieplo")) score += 12;
  if (profile.standard === "budget" && offer.category.includes("tanio")) score += 8;
  if (profile.standard === "premium" && /4★|5★/i.test(offer.hotel)) score += 8;

  if (profile.scheduleMode === "weekend") {
    if (workdays !== null) score += workdays === 0 ? 30 : workdays === 1 ? 22 : workdays === 2 ? 6 : -20;
    else if (offer.category.includes("weekend")) score += 16;
    if (offer.nights <= 4) score += 9;
  } else if (profile.scheduleMode === "short_leave") {
    if (workdays !== null) score += workdays <= profile.maxLeaveDays ? 22 : -Math.min(28, (workdays - profile.maxLeaveDays) * 8);
    if (offer.nights <= 5) score += 6;
  } else if (profile.scheduleMode === "leave" && workdays !== null) {
    score += workdays <= profile.maxLeaveDays ? 15 : -Math.min(22, (workdays - profile.maxLeaveDays) * 5);
  }

  if (durationMatches(offer, profile)) score += 14;
  else if (profile.durationPreference !== "any") score -= 7;

  if (profile.tripIntent === "quick") {
    if (offer.nights <= 4) score += 18;
    if (offer.category.includes("city")) score += 7;
  }
  if (profile.tripIntent === "rest") {
    if (offer.nights >= 6) score += 20;
    if (offer.category.includes("plaza") || offer.category.includes("allinclusive")) score += 8;
  }
  if (profile.tripIntent === "capitals") {
    if (CAPITALS.has(normalize(offer.city))) score += 26;
    if (offer.category.includes("city")) score += 7;
  }
  if (profile.tripIntent === "new_country") {
    const visited = new Set(profile.visitedCountries.map(normalize));
    score += visited.has(normalize(offer.country)) ? -12 : 24;
  }
  if (profile.tripIntent === "far") {
    if (FAR_COUNTRIES.has(normalize(offer.country)) || offer.nights >= 9) score += 25;
    else score -= 5;
  }

  if (profile.valuePriority === "price") score -= offer.price / 250;
  if (profile.valuePriority === "time") {
    if (workdays !== null) score -= workdays * 2.5;
    if (offer.nights <= 4 && profile.tripIntent !== "rest") score += 7;
    if (profile.avoidTransfers) score += 3;
  }

  return { score, workdays };
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

function highlightFor(row: RankedOffer, profile: TravelProfile) {
  const { offer, workdays } = row;
  if (profile.tripIntent === "new_country" && !new Set(profile.visitedCountries.map(normalize)).has(normalize(offer.country))) {
    return { label: "Nowy kraj", detail: "nie ma go jeszcze na Twojej liście" };
  }
  if (profile.tripIntent === "capitals" && CAPITALS.has(normalize(offer.city))) {
    return { label: "Stolica", detail: `${offer.city} · ${offer.nights} nocy` };
  }
  if (profile.tripIntent === "far" && FAR_COUNTRIES.has(normalize(offer.country))) {
    return { label: "Dalsza podróż", detail: `${offer.nights} nocy` };
  }
  if (workdays !== null && profile.scheduleMode !== "any") {
    return { label: workdays === 0 ? "Bez dnia roboczego" : `${workdays} ${workdays === 1 ? "dzień roboczy" : "dni robocze"}`, detail: `${offer.nights} nocy` };
  }
  if (profile.tripIntent === "rest" && offer.nights >= 6) return { label: "Na odpoczynek", detail: `${offer.nights} nocy` };
  if (profile.tripIntent === "quick" && offer.nights <= 4) return { label: "Krótki wypad", detail: `${offer.nights} nocy` };
  return undefined;
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
    const ranked: RankedOffer[] = (offers as TimedOffer[])
      .filter((offer) => offer.availabilityStatus !== "expired")
      .filter((offer) => isTravelDestinationAllowed(offer.city, offer.country))
      .filter((offer) => Number(offer.price) > 0)
      .map((offer) => {
        const scored = scoreOffer(offer, profile);
        return { offer, match: scored.score, workdays: scored.workdays };
      });

    const exact = onePerDirection(
      ranked
        .filter(({ offer }) => Number(offer.price) <= profile.budget)
        .filter(({ offer }) => !profile.warmOnly || offer.category.includes("cieplo"))
        .filter(({ offer, workdays }) => {
          if (profile.scheduleMode === "weekend" && workdays !== null) return workdays <= 1;
          if ((profile.scheduleMode === "short_leave" || profile.scheduleMode === "leave") && workdays !== null) return workdays <= profile.maxLeaveDays;
          return true;
        })
        .sort((a, b) => b.match - a.match || a.offer.price - b.offer.price),
    ).slice(0, 6);

    const exactIds = new Set(exact.map(({ offer }) => offer.id));
    const multiplier = profile.valuePriority === "price" ? 1.12 : profile.valuePriority === "time" ? 1.4 : 1.25;
    const flexibleBudget = Math.round(profile.budget * multiplier);
    const alternatives = onePerDirection(
      ranked
        .filter(({ offer }) => !exactIds.has(offer.id))
        .filter(({ offer }) => Number(offer.price) <= flexibleBudget)
        .filter(({ offer }) => !profile.warmOnly || offer.category.includes("cieplo"))
        .sort((a, b) => b.match - a.match || a.offer.price - b.offer.price),
    ).slice(0, Math.max(0, 6 - exact.length));

    const used = new Set([...exact, ...alternatives].map(({ offer }) => offer.id));
    const inspirations = onePerDirection(ranked.filter(({ offer }) => !used.has(offer.id)).sort((a, b) => b.match - a.match || a.offer.price - b.offer.price)).slice(0, 4);

    return { exact, alternatives, inspirations, flexibleBudget };
  }, [offers, profile]);

  const sourceLabel = source === "live"
    ? `Aktualne oferty${checkedAt ? ` · sprawdzone ${new Date(checkedAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}` : ""}`
    : offers.length
      ? `Ostatnia poprawna pula${checkedAt ? ` · sprawdzona ${new Date(checkedAt).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}` : ""}`
      : "Brak potwierdzonej puli — odświeżamy dane";

  const totalShown = recommendationGroups.exact.length + recommendationGroups.alternatives.length;
  const scheduleLabel = profile.scheduleMode === "weekend" ? "weekend" : profile.scheduleMode === "short_leave" ? `max ${profile.maxLeaveDays} dni robocze` : profile.scheduleMode === "leave" ? `urlop · max ${profile.maxLeaveDays} dni roboczych` : "dowolnie";

  return (
    <main>
      <SiteHeader />
      <section className="shell hub-page favorites-page for-you-guided">
        <div className="app-alerts-hero">
          <div className="app-alerts-icon"><Sparkles size={28} /></div>
          <div>
            <div className="kicker">TRIPOWNIA DOBIERA</div>
            <h1>Wyjazdy, które pasują do Twojego życia.</h1>
            <p>Nie sortujemy tylko po cenie. Liczymy budżet, długość, dni robocze, cel wyjazdu i to, czy wolisz oszczędzić pieniądze czy czas.</p>
          </div>
        </div>

        <div className="for-you-summary">
          <span>Wylot: <strong>{profile.departure}</strong></span>
          <span>Budżet: <strong>do {profile.budget.toLocaleString("pl-PL")} zł</strong></span>
          <span>Dostępność: <strong>{scheduleLabel}</strong></span>
          <span>Cel: <strong>{profile.tripIntent}</strong></span>
          <span>{sourceLabel}</span>
          <button type="button" onClick={refresh} className="app-secondary-button"><RefreshCw size={16} /> {loading ? "Odświeżam…" : "Odśwież"}</button>
          <Link href="/profil"><SlidersHorizontal size={16} /> Zmień preferencje</Link>
        </div>

        {!loading && totalShown > 0 && (
          <div className="for-you-guidance">
            <div>
              <small>DLACZEGO TE OFERTY</small>
              <strong>{recommendationGroups.exact.length ? `${recommendationGroups.exact.length} ofert pasuje do Twoich głównych ograniczeń` : "Nie ma dziś idealnego trafienia"}</strong>
              <span>{recommendationGroups.alternatives.length
                ? `Dalej pokazujemy ${recommendationGroups.alternatives.length} najbliższe kompromisy. Przy priorytecie czasu dopuszczamy większy budżet, zamiast wciskać długi lub niewygodny wyjazd.`
                : "Nie dokładamy przypadkowych kierunków tylko po to, żeby zapełnić ekran."}</span>
            </div>
            <a href="#dopasowane">Zobacz wybór <ArrowRight size={16}/></a>
          </div>
        )}

        {recommendationGroups.exact.length > 0 && (
          <div id="dopasowane" className="for-you-section">
            <div className="for-you-section-head"><small>NAJLEPSZE DOPASOWANIE</small><h2>Najpierw te, które naprawdę pasują</h2></div>
            <div className="cards-grid">{recommendationGroups.exact.map((row) => <OfferCard key={row.offer.id} offer={row.offer} priceHighlight={highlightFor(row, profile)} />)}</div>
          </div>
        )}

        {recommendationGroups.alternatives.length > 0 && (
          <div className="for-you-section for-you-alternatives">
            <div className="for-you-section-head"><small>WARTO ROZWAŻYĆ</small><h2>Najlepsze kompromisy</h2><p>Czasem warto dopłacić, czasem wziąć dzień urlopu więcej. Te oferty są blisko Twoich założeń i pokazujemy je dopiero po najlepszych trafieniach.</p></div>
            <div className="cards-grid">{recommendationGroups.alternatives.map((row) => <OfferCard key={row.offer.id} offer={row.offer} priceHighlight={highlightFor(row, profile)} />)}</div>
          </div>
        )}

        {!loading && totalShown === 0 && recommendationGroups.inspirations.length > 0 && (
          <div className="for-you-section">
            <div className="for-you-section-head"><small>PLAN B</small><h2>Nie ma dziś dobrego dopasowania. Oto najbliższe możliwości.</h2><p>Nie udajemy, że spełniają wszystkie warunki — pokazujemy jasno, gdzie trzeba odpuścić budżet, czas albo typ wyjazdu.</p></div>
            <div className="cards-grid">{recommendationGroups.inspirations.map((row) => <OfferCard key={row.offer.id} offer={row.offer} priceHighlight={highlightFor(row, profile)} />)}</div>
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
