import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Wakacje lipiec 2027 – gdzie lecieć? All Inclusive i rodzinne kierunki";
const description = "Wakacje w lipcu 2027: Grecja, Turcja, Egipt, Cypr i rodzinne All Inclusive. Porównaj kierunki, ceny i aktualne oferty z polskich lotnisk.";

export const metadata: Metadata = { title, description, alternates: { canonical: "/wakacje-lipiec-2027" } };

export default function July2027Page(){
  return <main>
    <SiteHeader/>
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Wakacje 2027", url: "https://tripownia.pl/wakacje-2027" },
      { name: "Lipiec 2027", url: "https://tripownia.pl/wakacje-lipiec-2027" },
    ]}/>
    <section className="shopping-hero shell">
      <div className="kicker">LIPIEC 2027</div>
      <h1>Wakacje w lipcu 2027: gdzie lecieć w środku sezonu?</h1>
      <p>Lipiec to szczyt sezonu rodzinnego. Największą różnicę robi wcześniejsze porównanie regionów, hoteli i lotnisk wylotu, szczególnie przy pokojach rodzinnych i popularnych terminach.</p>
    </section>
    <section className="shell seo-copy-section">
      <h2>Grecja, Turcja, Egipt czy Cypr?</h2>
      <p>Grecja i Cypr sprawdzą się dla osób, które chcą połączyć plażę ze zwiedzaniem. Turcja daje bardzo szeroki wybór All Inclusive, szczególnie dla rodzin. Egipt warto rozważyć, jeśli wysoka temperatura nie jest problemem i zależy Ci na resortowym wypoczynku.</p>
      <p>Przy lipcowym wyjeździe sprawdź również ekspozycję pokoju, klimatyzację, zacienienie przy basenie i długość transferu.</p>
    </section>
    <section className="shell seo-related-block">
      <div className="kicker">LIPIEC 2027</div>
      <div className="seo-related-links">
        <Link href="/grecja-2027">Grecja 2027 →</Link>
        <Link href="/turcja-2027">Turcja 2027 →</Link>
        <Link href="/egipt-2027">Egipt 2027 →</Link>
        <Link href="/wakacje-z-dziecmi">Wakacje z dziećmi →</Link>
        <Link href="/wakacje-czerwiec-2027">Czerwiec 2027 →</Link>
        <Link href="/wakacje-sierpien-2027">Sierpień 2027 →</Link>
      </div>
    </section>
    <section className="section shell"><div className="section-heading"><div><div className="kicker">SPRAWDŹ OFERTY</div><h2>Wakacje w lipcu 2027</h2></div></div><div className="single-partner-search-wrap"><SearchHub embedded initialTab="Wakacje" initialDateMode="month" initialMonth="2027-07" /></div></section>
    <SiteFooter/>
  </main>;
}
