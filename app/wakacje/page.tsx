import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import { offers, isOfferExpired } from "@/lib/offers";

export const metadata: Metadata = {
  title: "Wakacje 2026 — All Inclusive, lot + hotel i aktualne oferty | Tripownia.pl",
  description: "Porównaj aktualne wakacje 2026: All Inclusive, lot + hotel, plaża i egzotyka. Sprawdź oferty z różnych źródeł i przejdź do rezerwacji u partnera.",
  alternates: { canonical: "/wakacje" },
  openGraph: {
    type: "website",
    title: "Wakacje 2026 — aktualne oferty | Tripownia.pl",
    description: "All Inclusive, lot + hotel, rodzinne wakacje i egzotyka — porównaj aktualne propozycje w jednym miejscu.",
    url: "https://tripownia.pl/wakacje",
  },
};

export default function WakacjePage() {
  const holidayOffers = offers.filter(o => !isOfferExpired(o) && !o.category.includes("city")).slice(0, 12);
  return <main><SiteHeader/>
    <section className="shopping-hero shell">
      <div className="kicker">WAKACJE 2026 — PEŁNA OFERTA</div>
      <h1>Wakacje 2026: All Inclusive, lot + hotel i aktualne pakiety.</h1>
      <p>Porównaj All Inclusive, rodzinne wakacje, plażę, egzotykę i klasyczne pakiety. Tripownia pokazuje wybrane oferty i pozwala sprawdzić szerszą bazę u partnerów — bez ograniczania się do jednego źródła.</p>
    </section>
    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">WYBRANE PRZEZ NAS</div><h2>Aktualne wakacje warte sprawdzenia</h2><p>Porównuj nie tylko cenę startową, ale też termin, liczbę nocy, wyżywienie i koszt całej podróży.</p></div></div>
      <div className="city-shopping-row">{holidayOffers.map(o => <OfferCard key={o.id} offer={o}/>)}</div>
      <div className="single-partner-search-wrap"><UnifiedPartnerSearch mode="holiday" /></div>
    </section>
    <SiteFooter/>
  </main>;
}
