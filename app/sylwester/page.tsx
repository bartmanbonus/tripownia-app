import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewYearOffers from "@/components/NewYearOffers";
import SearchHub from "@/components/SearchHub";

const title = "City break na Sylwestra 2026/2027 — lot + hotel za granicą";
const description = "City break na Sylwestra 2026/2027: lot + hotel, krótkie wyjazdy do Europy i ciepłe kierunki na przełom roku. Porównaj aktualne terminy i oferty.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sylwester" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title,
    description,
    url: "/sylwester",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
};

type PageProps = {
  searchParams: Promise<{
    destination?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedDestination = typeof params.destination === "string" ? params.destination : "";
  const selectedFrom = typeof params.from === "string" ? params.from : "2026-12-27";
  const selectedTo = typeof params.to === "string" ? params.to : "2027-01-03";

  return (
    <main>
      <SiteHeader />
      <section className="seasonal-hero shell newyear-hero-premium">
        <div className="kicker">CITY BREAK NA SYLWESTRA 2026/2027</div>
        <h1>City break na Sylwestra: lot + hotel i krótkie wyjazdy za granicę.</h1>
        <p>Porównaj krótkie city breaki, tydzień w cieple i dalsze wyjazdy na przełom roku. Najpierw realne terminy i ceny, potem wybór kierunku.</p>
        <div className="newyear-type-nav">
          <a href="#city-break">City break 3–6 nocy</a>
          <a href="#dluzsze">Dłuższe 7–12 nocy</a>
        </div>
        <div className="seo-related-links" style={{ marginTop: 16 }}>
          <Link href="/sylwester-all-inclusive-2026-2027-egipt-czy-wyspy-kanaryjskie">Sylwester All Inclusive: Egipt czy Kanary? →</Link>
          <Link href="/podroze/cieple-wakacje-grudzien-2026">Ciepłe wakacje w grudniu 2026 →</Link>
          <Link href="/city-break">City break lot + hotel →</Link>
          <Link href="/podroze/city-break-grudzien-2026">City break grudzień 2026 →</Link>
          <Link href="/podroze/city-break-z-warszawy">City break z Warszawy →</Link>
          <Link href="/podroze/city-break-z-poznania">City break z Poznania →</Link>
          <Link href="/planer-podrozy">Ułóż wyjazd w darmowym planerze →</Link>
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
            key={`${selectedDestination}|${selectedFrom}|${selectedTo}`}
            embedded
            initialTab="Wakacje"
            initialDestinations={selectedDestination ? [selectedDestination] : []}
            initialDateMode="range"
            initialDateFrom={selectedFrom}
            initialDateTo={selectedTo}
            searchRequest={selectedDestination ? 1 : 0}
          />
        </div>
      </section>

      <NewYearOffers />
      <SiteFooter />
    </main>
  );
}
