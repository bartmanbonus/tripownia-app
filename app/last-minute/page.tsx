import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import PartnerMarketplace from "@/components/PartnerMarketplace";
import { offers, isOfferExpired } from "@/lib/offers";

export const metadata: Metadata = {
  title: "Last minute — wszystkie dostępne oferty | Tripownia.pl",
  description: "Last minute do samodzielnego wyboru: EXIM Tours, Wakacje.pl, eSky, Kiwi i Booking.com oraz wybrane okazje Tripowni.",
  alternates: { canonical: "/last-minute" },
};

export default function LastMinuteOffersPage() {
  const picks = offers.filter(o => !isOfferExpired(o) && (o.partner === "exim" || o.category.includes("wakacje") || String(o.board || "").toLowerCase().includes("all inclusive"))).slice(0, 12);
  return <main><SiteHeader/>
    <section className="shopping-hero shell">
      <div className="kicker">LAST MINUTE — PEŁNA BAZA</div>
      <h1>Sprawdź, co naprawdę jest dostępne na szybki wyjazd.</h1>
      <p>Nie ograniczamy Cię do naszych kart. Pod rekomendacjami znajdziesz jedną wspólną wyszukiwarkę: EXIM, Wakacje.pl, eSky, Kiwi, Booking, eSIM i GetYourGuide.</p>
      <Link className="editorial-link" href="/magazyn-podrozniczy/last-minute-2026">📚 Poradnik: jak kupować last minute →</Link>
    </section>
    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">SZYBKIE TYPY</div><h2>Oferty, od których warto zacząć</h2></div></div>
      <div className="city-shopping-row">{picks.map(o => <OfferCard key={o.id} offer={o}/>)}</div>
      <PartnerMarketplace mode="lastminute" />
    </section>
    <SiteFooter/>
  </main>;
}
