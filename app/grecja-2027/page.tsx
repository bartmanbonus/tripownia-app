import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Grecja 2027 – wakacje, All Inclusive i greckie wyspy";
const description = "Grecja 2027: porównaj Kretę, Rodos, Zakynthos, Korfu i Chalkidiki. Sprawdź wakacje All Inclusive, wyjazdy rodzinne i oferty z polskich lotnisk.";

export const metadata: Metadata = { title, description, alternates: { canonical: "/grecja-2027" } };

export default function Grecja2027Page() {
  return <main>
    <SiteHeader/>
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Wakacje 2027", url: "https://tripownia.pl/wakacje-2027" },
      { name: "Grecja 2027", url: "https://tripownia.pl/grecja-2027" },
    ]}/>
    <section className="shopping-hero shell">
      <div className="kicker">GRECJA 2027</div>
      <h1>Grecja 2027: Kreta, Rodos, Zakynthos, Korfu czy Chalkidiki?</h1>
      <p>Wybierz wyspę pod styl wyjazdu, nie tylko pod najniższą cenę. Porównaj plaże, zwiedzanie, długość transferu, lokalizację hotelu i dostępne lotniska wylotu z Polski.</p>
    </section>
    <section className="shell seo-copy-section">
      <h2>Którą część Grecji wybrać?</h2>
      <p>Kreta daje największą różnorodność i dobrze sprawdza się przy zwiedzaniu autem. Rodos łączy plaże z zabytkami i prostą logistyką. Zakynthos i Korfu są dobrym wyborem, jeśli zależy Ci na wyspiarskich widokach, a Chalkidiki warto porównać przy rodzinnym wypoczynku i hotelach resortowych.</p>
      <p>Przy krótszym pobycie sprawdź transfer i godziny lotów. Przy tygodniu lub dłużej większe znaczenie ma region wyspy, dostęp do plaży oraz możliwość samodzielnego zwiedzania.</p>
    </section>
    <section className="shell seo-related-block">
      <div className="kicker">GRECJA W 2027</div>
      <h2>Wybierz miesiąc albo konkretny typ wakacji</h2>
      <div className="seo-related-links">
        <Link href="/wakacje-czerwiec-2027">Czerwiec 2027 →</Link>
        <Link href="/wakacje-lipiec-2027">Lipiec 2027 →</Link>
        <Link href="/wakacje-sierpien-2027">Sierpień 2027 →</Link>
        <Link href="/wakacje-z-dziecmi">Wakacje z dziećmi →</Link>
        <Link href="/wakacje-2027">Wakacje 2027 →</Link>
        <Link href="/grecja">Którą wyspę w Grecji wybrać? →</Link>
      </div>
    </section>
    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">AKTUALNE OFERTY</div><h2>Sprawdź Grecję 2027</h2></div></div>
      <div className="single-partner-search-wrap"><UnifiedPartnerSearch mode="holiday" initialDestination="Grecja" /></div>
    </section>
    <SiteFooter/>
  </main>;
}
