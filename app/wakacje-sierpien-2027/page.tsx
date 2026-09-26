import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Wakacje sierpień 2027 – gdzie lecieć? All Inclusive i ciepłe kierunki";
const description = "Wakacje w sierpniu 2027: porównaj Grecję, Turcję, Egipt, Cypr i inne kierunki. Sprawdź rodzinne All Inclusive i aktualne oferty z Polski.";

export const metadata: Metadata = { title, description, alternates: { canonical: "/wakacje-sierpien-2027" } };

export default function August2027Page(){
  return <main>
    <SiteHeader/>
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Wakacje 2027", url: "https://tripownia.pl/wakacje-2027" },
      { name: "Sierpień 2027", url: "https://tripownia.pl/wakacje-sierpien-2027" },
    ]}/>
    <section className="shopping-hero shell">
      <div className="kicker">SIERPIEŃ 2027</div>
      <h1>Wakacje w sierpniu 2027: wybierz kierunek pod pogodę i styl wyjazdu.</h1>
      <p>Sierpień daje bardzo dużą dostępność wakacyjnych kierunków, ale w wielu miejscach oznacza też najwyższe temperatury i największy ruch. Porównaj region, hotel i godziny lotów przed rezerwacją.</p>
    </section>
    <section className="shell seo-copy-section">
      <h2>Co sprawdzić przed sierpniowym wyjazdem?</h2>
      <p>W Grecji, Turcji i na Cyprze środek lata może oznaczać wysokie temperatury. Jeśli planujesz intensywne zwiedzanie, sprawdź lokalny klimat i rozważ regiony z łatwym dostępem do morza lub bardziej umiarkowanym wiatrem.</p>
      <p>Dla rodzin ważne są zacienienie, klimatyzacja, basen i długość transferu. Przy All Inclusive porównaj także napoje, przekąski i godziny działania restauracji.</p>
    </section>
    <section className="shell seo-related-block">
      <div className="kicker">SIERPIEŃ 2027</div>
      <div className="seo-related-links">
        <Link href="/grecja-2027">Grecja 2027 →</Link>
        <Link href="/turcja-2027">Turcja 2027 →</Link>
        <Link href="/egipt-2027">Egipt 2027 →</Link>
        <Link href="/wakacje-z-dziecmi">Wakacje z dziećmi →</Link>
        <Link href="/wakacje-lipiec-2027">Lipiec 2027 →</Link>
        <Link href="/wakacje-2027">Wakacje 2027 →</Link>
      </div>
    </section>
    <section className="section shell"><div className="section-heading"><div><div className="kicker">SPRAWDŹ OFERTY</div><h2>Wakacje w sierpniu 2027</h2></div></div><div className="single-partner-search-wrap"><SearchHub embedded initialTab="Wakacje" initialDateMode="month" initialMonth="2027-08" /></div></section>
    <SiteFooter/>
  </main>;
}
