import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SalesCollectionSchema from "@/components/SalesCollectionSchema";
import SearchHub from "@/components/SearchHub";
import LiveSalesRail from "@/components/LiveSalesRail";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";

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
  return <main>
    <SiteHeader/>
    <SalesCollectionSchema name="Last Minute 2026" description="Aktualne Last Minute 2026, wakacje i All Inclusive z polskich lotnisk." path="/last-minute" about={["last minute","wakacje","All Inclusive","pakiety wakacyjne"]} />
    <section className="shopping-hero shell last-minute-shopping-hero">
      <div>
        <div className="kicker">⚡ LAST MINUTE 2026</div>
        <h1>Last Minute 2026: aktualne wakacje i All Inclusive do sprawdzenia teraz.</h1>
        <p>Porównaj konkretne pakiety z ceną, terminem i kierunkiem. Tripownia pokazuje najtańsze sensowne opcje na początku i pozwala przeszukać szerszą bazę bez zamykania się na jednego partnera.</p>
      </div>
      <Link className="editorial-link" href="/magazyn-podrozniczy/last-minute-2026">📚 Jak kupować last minute — poradnik →</Link>
      <div className="seo-related-links" style={{ marginTop: 16 }}>
        <Link href="/podroze/last-minute-z-poznania">Last Minute z Poznania →</Link>
        <Link href="/podroze/last-minute-z-krakowa">Last Minute z Krakowa →</Link>
        <Link href="/podroze/last-minute-z-katowic">Last Minute z Katowic →</Link>
        <Link href="/podroze/last-minute-z-gdanska">Last Minute z Gdańska →</Link>
        <Link href="/podroze/last-minute-z-lublina">Last Minute z Lublina →</Link>
        <Link href="/podroze/last-minute-z-rzeszowa">Last Minute z Rzeszowa →</Link>
        <Link href="/podroze/last-minute-ze-szczecina">Last Minute ze Szczecina →</Link>
        <Link href="/podroze/last-minute-z-warszawy">Last Minute z Warszawy →</Link>
      </div>
    </section>

    <section className="section shell last-minute-live-section">
      <div className="section-heading"><div><div className="kicker">WYBRANE PRZEZ TRIPOWNIĘ</div><h2>Aktualne oferty Last Minute</h2><p>Sortujemy od najniższej ceny. Sprawdź termin, liczbę nocy, wyżywienie i lotnisko wylotu przed przejściem do rezerwacji.</p></div></div>
      <LiveSalesRail mode="lastminute" limit={10}/>
    </section>

    <section className="section shell partner-search-shopping">
      <SearchHub embedded initialTab="Last minute" />
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">NIE MA NIC NA JUŻ?</div><h2>Sprawdź szerszą bazę i sąsiednie terminy</h2><p>Nie oznaczamy zwykłych wakacji jako Last Minute. Jeśli nie ma wyjazdu w najbliższych 45 dniach, użyj wyszukiwarki powyżej.</p></div></div>
    </section>
    <section className="section shell"><FacebookFollowCTA placement="last_minute" compact /></section>
    <SiteFooter/>
  </main>;
}
