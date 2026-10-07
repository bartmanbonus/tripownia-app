import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SalesCollectionSchema from "@/components/SalesCollectionSchema";
import SearchHub from "@/components/SearchHub";
import LiveSalesRail from "@/components/LiveSalesRail";
import { homepageFallbackOffers } from "@/lib/offers";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import ReadySearchGrid from "@/components/ReadySearchGrid";

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

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">GOTOWE LAST MINUTE</div><h2>Lotnisko i budżet już ustawione</h2><p>Zamiast klikać w ogólną kategorię, przechodzisz od razu do wyników dopasowanych do konkretnego wariantu.</p></div></div>
      <ReadySearchGrid items={[
        { href: "/podroze/last-minute-z-warszawy", eyebrow: "WARSZAWA · AKTUALNE OFERTY", title: "Last Minute z Warszawy", meta: "WAW + WMI · gotowa strona ofertowa" },
        { href: "/podroze/last-minute-z-katowic", eyebrow: "KATOWICE · AKTUALNE OFERTY", title: "Last Minute z Katowic", meta: "KTW · Pyrzowice · wakacje i All Inclusive" },
        { href: "/podroze/last-minute-z-poznania", eyebrow: "POZNAŃ · AKTUALNE OFERTY", title: "Last Minute z Poznania", meta: "POZ · Ławica · najbliższe terminy" },
        { href: "/podroze/last-minute-z-krakowa", eyebrow: "KRAKÓW · AKTUALNE OFERTY", title: "Last Minute z Krakowa", meta: "KRK · Balice · lot + hotel i All Inclusive" },
        { href: "/szukaj?destination=Egipt&budget=3000&duration=7&board=all%20inclusive&tab=Last%20minute", eyebrow: "EGIPT · 7 NOCY · DO 3 000 ZŁ", title: "Egipt All Inclusive Last Minute", meta: "Pełne wyżywienie · różne lotniska wylotu" },
        { href: "/szukaj?budget=2000&duration=5-9&tab=Last%20minute", eyebrow: "DO 2 000 ZŁ · 5–9 NOCY", title: "Najtańsze Last Minute", meta: "Bez wskazywania kierunku · sortowanie od najniższej ceny" },
      ]} />
    </section>

    <section className="section shell partner-search-shopping">
      <SearchHub embedded initialTab="Last minute" />
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">NIE MA NIC NA JUŻ?</div><h2>Sprawdź szerszą bazę i sąsiednie terminy</h2><p>Nie oznaczamy zwykłych wakacji jako Last Minute. Jeśli nie ma wyjazdu w najbliższych 45 dniach, użyj wyszukiwarki powyżej.</p></div></div>
    </section>

    <SiteFooter/>
  </main>;
}
