import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import { offers, isOfferExpired } from "@/lib/offers";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";

export const metadata: Metadata = {
  title: "Last Minute 2026 — aktualne wakacje i All Inclusive",
  description: "Sprawdź aktualne Last Minute 2026: wakacje, All Inclusive i pakiety z polskich lotnisk. Porównaj kierunki, terminy i przejdź do rezerwacji u partnera.",
  alternates: { canonical: "/last-minute" },
  openGraph: {
    type: "website",
    title: "Last Minute 2026 — aktualne wakacje | Tripownia.pl",
    description: "Aktualne Last Minute, All Inclusive i wakacyjne pakiety z konkretną ceną, terminem i kierunkiem.",
    url: "https://tripownia.pl/last-minute",
  },
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
        <div className="kicker">⚡ LAST MINUTE 2026</div>
        <h1>Last Minute 2026: aktualne wakacje i All Inclusive do sprawdzenia teraz.</h1>
        <p>Porównaj konkretne pakiety z ceną, terminem i kierunkiem. Tripownia pokazuje najtańsze sensowne opcje na początku i pozwala przeszukać szerszą bazę bez zamykania się na jednego partnera.</p>
      </div>
      <Link className="editorial-link" href="/magazyn-podrozniczy/last-minute-2026">📚 Jak kupować last minute — poradnik →</Link>
    </section>

    <section className="section shell last-minute-live-section">
      <div className="section-heading"><div><div className="kicker">WYBRANE PRZEZ TRIPOWNIĘ</div><h2>Aktualne oferty Last Minute</h2><p>Sortujemy od najniższej ceny. Sprawdź termin, liczbę nocy, wyżywienie i lotnisko wylotu przed przejściem do rezerwacji.</p></div></div>
      <div className="last-minute-offer-rail">{featured.map(o=><OfferCard key={o.id} offer={o}/>)}</div>
    </section>

    <section className="section shell partner-search-shopping">
      <UnifiedPartnerSearch mode="lastminute" initialDestination=""/>
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">WIĘCEJ OKAZJI</div><h2>Kolejne Last Minute do sprawdzenia</h2></div></div>
      <div className="last-minute-offer-rail">{more.map(o=><OfferCard key={o.id} offer={o}/>)}</div>
    </section>
    <section className="section shell"><FacebookFollowCTA placement="last_minute" compact /></section>
    <SiteFooter/>
  </main>;
}
