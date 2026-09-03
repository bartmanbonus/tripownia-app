import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import { offers, isOfferExpired } from "@/lib/offers";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";

export const metadata: Metadata = {
  title: "Last minute — aktualne wyjazdy i oferty | Tripownia.pl",
  description: "Żywa sekcja last minute Tripowni: konkretne wyjazdy, EXIM Tours na pierwszym miejscu oraz pełne wyszukiwanie partnerów.",
  alternates: { canonical: "/last-minute" },
};

export default function LastMinuteOffersPage() {
  const active = offers
    .filter(o => !isOfferExpired(o))
    .filter(o => isTravelDestinationAllowed(o.city,o.country));

  const exim = active
    .filter(o => o.partner === "exim")
    .sort((a,b)=>Number(a.price||0)-Number(b.price||0))
    .slice(0,8);

  const more = active
    .filter(o => o.partner !== "exim" && ((o.category||[]).some(c=>/wakacje|allinclusive|plaza|cieplo/i.test(c)) || Number(o.nights||0)>=5))
    .sort((a,b)=>Number(a.price||0)-Number(b.price||0))
    .slice(0,8);

  return <main>
    <SiteHeader/>
    <section className="shopping-hero shell last-minute-shopping-hero">
      <div>
        <div className="kicker">⚡ LAST MINUTE — ŻYWE OFERTY</div>
        <h1>Wylot niedługo? Najpierw sprawdzamy EXIM.</h1>
        <p>To nie jest poradnik. To żywa sekcja zakupowa: konkretne wyjazdy, terminy i ceny. Najpierw EXIM, później Wakacje.pl i pozostałe źródła.</p>
      </div>
      <Link className="editorial-link" href="/magazyn-podrozniczy/last-minute-2026">📚 Jak kupować last minute — poradnik →</Link>
    </section>

    <section className="section shell last-minute-live-section">
      <div className="section-heading"><div><div className="kicker">EXIM TOURS — PIERWSZY WYBÓR</div><h2>Najtańsze gotowe wyjazdy, które warto sprawdzić teraz</h2><p>Sortujemy od najniższej ceny. Otwórz kartę, żeby pobrać aktualną cenę i przejść do konkretnego wariantu.</p></div></div>
      <div className="last-minute-offer-rail">{exim.map(o=><OfferCard key={o.id} offer={o}/>)}</div>
    </section>

    <section className="section shell partner-search-shopping">
      <UnifiedPartnerSearch mode="lastminute" initialDestination=""/>
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">WIĘCEJ OPCJI</div><h2>Porównaj też inne gotowe wakacje</h2></div></div>
      <div className="last-minute-offer-rail">{more.map(o=><OfferCard key={o.id} offer={o}/>)}</div>
    </section>
    <SiteFooter/>
  </main>;
}
