import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import { offers, isOfferExpired } from "@/lib/offers";

export const metadata: Metadata = {
  title: "City break — wszystkie oferty lot + hotel | Tripownia.pl",
  description: "City breaki do samodzielnego wyboru: okazje Tripowni oraz pełna oferta EXIM Tours, Wakacje.pl, eSky, Kiwi, Booking.com, eSIM i GetYourGuide.",
  alternates: { canonical: "/city-break" },
};

export default function CityBreakPage() {
  const cityOffers = offers.filter(o => !isOfferExpired(o) && (o.category.includes("city") || o.category.includes("weekend"))).slice(0, 12);
  return <main><SiteHeader/>
    <section className="shopping-hero shell">
      <div className="kicker">CITY BREAK — WYBIERASZ SAM</div>
      <h1>Krótki wyjazd bez ograniczania się do naszych rekomendacji.</h1>
      <p>Najpierw pokazujemy wybrane okazje, a niżej masz jedną wyszukiwarkę Tripowni. Wpisujesz parametry raz, a Tripownia dobiera właściwe źródło i przekazuje dane do partnera.</p>
      <Link className="editorial-link" href="/magazyn-podrozniczy/city-break-2026">📚 Poradnik: jak szukać city breaków →</Link>
    </section>
    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">OKAZJE TRIPOWNI</div><h2>Na początek kilka naszych typów</h2></div></div>
      <div className="city-shopping-row">{cityOffers.map(o => <OfferCard key={o.id} offer={o}/>)}</div>
      <div className="single-partner-search-wrap"><UnifiedPartnerSearch mode="city" /></div>
    </section>
    <SiteFooter/>
  </main>;
}
