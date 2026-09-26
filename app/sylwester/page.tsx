import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewYearOffers from "@/components/NewYearOffers";

export const metadata: Metadata = {
  title: "City break na Sylwestra 2026/2027 — gdzie polecieć?",
  description: "City break na Sylwestra 2026/2027: sprawdź pomysły na 3–6 nocy, cieplejsze kierunki i dłuższe wyjazdy za granicę oraz aktualne oferty.",
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
      </section>
      <NewYearOffers />
      <SiteFooter />
    </main>
  );
}
