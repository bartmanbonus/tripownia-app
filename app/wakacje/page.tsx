import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import { offers, isOfferExpired } from "@/lib/offers";

export const metadata: Metadata = {
  title: "Tanie wakacje 2026 — All Inclusive, last minute i lot + hotel",
  description: "Tanie wakacje 2026 z polskich lotnisk: All Inclusive, last minute i lot + hotel. Porównaj aktualne oferty, terminy i pełny koszt wyjazdu.",
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
      <h1>Tanie wakacje 2026: All Inclusive, last minute i lot + hotel.</h1>
      <p>Porównaj All Inclusive, rodzinne wakacje, plażę, egzotykę i klasyczne pakiety. Tripownia pokazuje wybrane oferty i pozwala sprawdzić szerszą bazę u partnerów — bez ograniczania się do jednego źródła.</p>
    </section>
    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">WYBRANE PRZEZ NAS</div><h2>Aktualne wakacje warte sprawdzenia</h2><p>Porównuj nie tylko cenę startową, ale też termin, liczbę nocy, wyżywienie i koszt całej podróży.</p></div></div>
      <div className="city-shopping-row">{holidayOffers.map(o => <OfferCard key={o.id} offer={o}/>)}</div>
      <div className="single-partner-search-wrap"><UnifiedPartnerSearch mode="holiday" /></div>
    </section>
    <section className="shell seo-related-block">
      <div className="kicker">SZUKAJ DOKŁADNIEJ</div>
      <h2>Wakacje według lotniska i terminu</h2>
      <div className="seo-related-links">
        <Link href="/podroze/wakacje-z-warszawy">Wakacje z Warszawy →</Link>
        <Link href="/podroze/wakacje-z-krakowa">Wakacje z Krakowa →</Link>
        <Link href="/podroze/all-inclusive-z-warszawy">All Inclusive z Warszawy →</Link>
        <Link href="/podroze/last-minute-z-warszawy">Last Minute z Warszawy →</Link>
        <Link href="/podroze/cieple-wakacje-listopad-2026">Ciepłe wakacje w listopadzie →</Link>
        <Link href="/podroze/cieple-wakacje-grudzien-2026">Ciepłe wakacje w grudniu →</Link>
      </div>
    </section>
    <SiteFooter/>
  </main>;
}
