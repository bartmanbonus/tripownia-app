import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewYearOffers from "@/components/NewYearOffers";
import SearchHub from "@/components/SearchHub";

export const metadata: Metadata = {
  title: "City break na Sylwestra 2026/2027 — aktualne oferty i lot + hotel",
  description: "City break na Sylwestra 2026/2027: aktualne oferty na 3–6 nocy, lot + hotel, krótkie wyjazdy do Europy i opcje na przełom roku.",
  alternates: { canonical: "/sylwester" },
};

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="seasonal-hero shell newyear-hero-premium">
        <div className="kicker">SYLWESTER 2026/2027</div>
        <h1>Nie trzy pomysły. Cała mapa możliwości na przełom roku.</h1>
        <p>Łączymy nasze wyselekcjonowane kierunki z aktualnymi pakietami. Krótkie city breaki, tydzień w cieple i dalsze wyjazdy — w jednym miejscu.</p>
        <div className="newyear-type-nav">
          <a href="#city-break">City break 3–6 nocy</a>
          <a href="#dluzsze">Dłuższe 7–12 nocy</a>
        </div>
        <div className="seo-related-links" style={{ marginTop: 16 }}>
          <Link href="/gdzie-na-sylwestra-2026-2027-15-kierunkow">Gdzie na Sylwestra? 15 kierunków →</Link>
          <Link href="/sylwester-2026-2027-za-granica-gdzie-poleciec-na-nowy-rok">Ciepłe kraje na Sylwestra →</Link>
        </div>
      </section>

      <section className="section shell" id="szukaj-sylwester">
        <div className="section-heading">
          <div>
            <div className="kicker">SZUKAJ PO SWOJEMU</div>
            <h2>Wybierz kierunek, lotnisko i termin na przełom roku</h2>
            <p>Możesz wybrać konkretny kierunek albo Gdziekolwiek, jedno lub kilka lotnisk oraz własny zakres dat.</p>
          </div>
        </div>
        <div className="single-partner-search-wrap">
          <SearchHub
            embedded
            initialTab="Wakacje"
            initialDateMode="range"
            initialDateFrom="2026-12-27"
            initialDateTo="2027-01-03"
          />
        </div>
      </section>

      <NewYearOffers />
      <SiteFooter />
    </main>
  );
}
