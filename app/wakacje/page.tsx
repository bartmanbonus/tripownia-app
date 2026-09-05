import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import { offers, isOfferExpired } from "@/lib/offers";

export const metadata: Metadata = {
  title: "Wakacje — aktualne pakiety | Tripownia.pl",
  description: "Sprawdź rekomendowane wakacje i skorzystaj z osobnych narzędzi do samodzielnego wyszukiwania.",
  alternates: { canonical: "/wakacje" },
};

export default function WakacjePage() {
  const holidayOffers = offers.filter(o => !isOfferExpired(o) && !o.category.includes("city")).slice(0, 12);
  return <main><SiteHeader/>
    <section className="shopping-hero shell">
      <div className="kicker">WAKACJE — PEŁNA OFERTA</div>
      <h1>Nie tylko to, co poleca Tripownia. Wybierz z całej dostępnej bazy.</h1>
      <p>All Inclusive, rodzinne wakacje, plaża, egzotyka i klasyczne pakiety. Porównaj kilka źródeł i podejmij własną decyzję zakupową.</p>
    </section>
    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">WYBRANE PRZEZ NAS</div><h2>Jeśli chcesz zacząć od konkretów</h2></div></div>
      <div className="city-shopping-row">{holidayOffers.map(o => <OfferCard key={o.id} offer={o}/>)}</div>
      <div className="single-partner-search-wrap"><UnifiedPartnerSearch mode="holiday" /></div>
    </section>
    <SiteFooter/>
  </main>;
}
