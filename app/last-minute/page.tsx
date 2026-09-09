import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import { offers, isOfferExpired } from "@/lib/offers";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";

export const metadata: Metadata = {
  title: "Okazje Last Minute — aktualne wyjazdy | Tripownia.pl",
  description: "Okazje Last Minute Tripowni: aktualne pakiety, ceny, terminy i szybkie przejście do rezerwacji.",
  alternates: { canonical: "/last-minute" },
};

export default function LastMinuteOffersPage() {
  const active = offers
    .filter(o => !isOfferExpired(o))
    .filter(o => isTravelDestinationAllowed(o.city,o.country));

  const vacationPool = active
    .filter(o => o.partner !== "esky")
    .filter(o => (o.category||[]).some(c=>/wakacje|allinclusive|plaza|cieplo/i.test(c)) || Number(o.nights||0)>=5)
    .sort((a,b)=>Number(a.price||0)-Number(b.price||0));

  const featured = vacationPool.slice(0,12);
  const featuredIds = new Set(featured.map(o=>o.id));
  const more = vacationPool.filter(o=>!featuredIds.has(o.id)).slice(0,12);

  return <main>
    <SiteHeader/>
    <section className="shopping-hero shell last-minute-shopping-hero">
      <div>
        <div className="kicker">⚡ OKAZJE LAST MINUTE</div>
        <h1>Okazje Last Minute. Konkretne wyjazdy, które warto sprawdzić teraz.</h1>
        <p>Pakiety z konkretną ceną, terminem i kierunkiem. Najtańsze sensowne opcje pokazujemy na początku — bez ściany tekstu.</p>
      </div>
      <Link className="editorial-link" href="/magazyn-podrozniczy/last-minute-2026">📚 Jak kupować last minute — poradnik →</Link>
    </section>

    <section className="section shell last-minute-live-section">
      <div className="section-heading"><div><div className="kicker">WYBRANE PRZEZ TRIPOWNIĘ</div><h2>Najlepsze okazje Last Minute</h2><p>Sortujemy od najniższej ceny. Otwórz kartę, żeby pobrać aktualną cenę i przejść do konkretnego wariantu.</p></div></div>
      <div className="last-minute-offer-rail">{featured.map(o=><OfferCard key={o.id} offer={o}/>)}</div>
    </section>

    <section className="section shell partner-search-shopping">
      <UnifiedPartnerSearch mode="lastminute" initialDestination=""/>
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">WIĘCEJ OKAZJI</div><h2>Kolejne Last Minute do sprawdzenia</h2></div></div>
      <div className="last-minute-offer-rail">{more.map(o=><OfferCard key={o.id} offer={o}/>)}</div>
    </section>
    <SiteFooter/>
  </main>;
}
