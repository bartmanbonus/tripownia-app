import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SalesCollectionSchema from "@/components/SalesCollectionSchema";
import SearchHub from "@/components/SearchHub";
import LiveSalesRail from "@/components/LiveSalesRail";
import { homepageFallbackOffers } from "@/lib/offers";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import ProgressiveLinkCloud from "@/components/ProgressiveLinkCloud";

export const metadata: Metadata = {
  title: "Last Minute 2026 — tanie wakacje lot + hotel i All Inclusive",
  description: "Oferty Last Minute lot + hotel, wakacje i All Inclusive z polskich lotnisk. Porównaj aktualne ceny, terminy i przejdź do rezerwacji.",
  alternates: { canonical: "/last-minute" },
  openGraph: {
    type: "website",
    title: "Last Minute 2026 — aktualne wakacje | Tripownia.pl",
    description: "Aktualne Last Minute, All Inclusive i wakacyjne pakiety z konkretną ceną, terminem i kierunkiem.",
    url: "https://tripownia.pl/last-minute",
  },
  twitter: {
    card: "summary_large_image",
    title: "Last Minute 2026 — aktualne wakacje | Tripownia.pl",
    description: "Aktualne Last Minute, All Inclusive i wakacyjne pakiety z konkretną ceną, terminem i kierunkiem.",
  },
};

export default function LastMinuteOffersPage() {
  return <main>
    <SiteHeader/>
    <SalesCollectionSchema name="Last Minute 2026" description="Aktualne Last Minute 2026, wakacje i All Inclusive z polskich lotnisk." path="/last-minute" about={["last minute","wakacje","All Inclusive","pakiety wakacyjne"]} />
    <section className="shopping-hero shell last-minute-shopping-hero">
      <div>
        <div className="kicker">⚡ LAST MINUTE 2026</div>
        <h1>Last Minute 2026: tanie wakacje lot + hotel i All Inclusive do sprawdzenia teraz.</h1>
        <p>Porównaj konkretne oferty Last Minute lot + hotel, All Inclusive i wakacje z ceną, terminem oraz kierunkiem. Tripownia pokazuje najtańsze sensowne opcje na początku i pozwala przeszukać szerszą bazę bez skakania między wieloma stronami.</p>
      </div>
      <Link className="editorial-link" href="/magazyn-podrozniczy/last-minute-2026">📚 Jak kupować last minute — poradnik →</Link>
    </section>

    <section className="section shell last-minute-live-section">
      <div className="section-heading"><div><div className="kicker">WYBRANE PRZEZ TRIPOWNIĘ</div><h2>Aktualne oferty Last Minute</h2><p>Sortujemy od najniższej ceny. Sprawdź termin, liczbę nocy, wyżywienie i lotnisko wylotu przed przejściem do rezerwacji.</p></div></div>
      <LiveSalesRail mode="lastminute" limit={10} initialOffers={homepageFallbackOffers}/>
    </section>
    <section className="section shell"><FacebookFollowCTA placement="last_minute_after_offers" compact /></section>

    <section className="section shell partner-search-shopping">
      <SearchHub embedded initialTab="Last minute" />
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">NIE MA NIC NA JUŻ?</div><h2>Sprawdź szerszą bazę i sąsiednie terminy</h2><p>Nie oznaczamy zwykłych wakacji jako Last Minute. Jeśli nie ma wyjazdu w najbliższych 45 dniach, użyj wyszukiwarki powyżej.</p></div></div>
    </section>
    <section className="shell seo-related-block">
      <div className="kicker">SZUKAJ DOKŁADNIEJ</div>
      <h2>Last Minute według lotniska i budżetu</h2>
      <ProgressiveLinkCloud
        visible={8}
        items={[
          { href: "/podroze/last-minute-z-poznania", label: "Last Minute z Poznania" },
          { href: "/podroze/last-minute-z-krakowa", label: "Last Minute z Krakowa" },
          { href: "/podroze/last-minute-z-gdanska", label: "Last Minute z Gdańska" },
          { href: "/podroze/last-minute-z-warszawy", label: "Last Minute z Warszawy" },
          { href: "/podroze/last-minute-z-katowic", label: "Last Minute z Katowic" },
          { href: "/podroze/last-minute-z-wroclawia", label: "Last Minute z Wrocławia" },
          { href: "/podroze/last-minute-do-2000-zl", label: "Last Minute do 2000 zł" },
          { href: "/podroze/last-minute-do-2500-zl", label: "Last Minute do 2500 zł" },
          { href: "/podroze/last-minute-do-3000-zl", label: "Last Minute do 3000 zł" },
          { href: "/podroze/last-minute-z-lublina", label: "Last Minute z Lublina" },
          { href: "/podroze/last-minute-z-rzeszowa", label: "Last Minute z Rzeszowa" },
          { href: "/podroze/last-minute-ze-szczecina", label: "Last Minute ze Szczecina" },
          { href: "/podroze/last-minute-z-warszawy-do-2000-zl", label: "Z Warszawy do 2000 zł" },
          { href: "/podroze/last-minute-z-katowic-do-2000-zl", label: "Z Katowic do 2000 zł" },
        ]}
      />
    </section>
    <SiteFooter/>
  </main>;
}
