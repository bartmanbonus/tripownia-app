import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Majówka 2027 – gdzie lecieć? City break i ciepłe kierunki";
const description = "Majówka 2027 za granicą: pomysły na city break, plażę i All Inclusive. Sprawdź kierunki, loty i wakacje na długi weekend majowy.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/majowka-2027" },
};

export default function Majowka2027Page() {
  return <main>
    <SiteHeader/>
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Majówka 2027", url: "https://tripownia.pl/majowka-2027" },
    ]}/>
    <section className="shopping-hero shell">
      <div className="kicker">MAJÓWKA 2027</div>
      <h1>Majówka 2027: gdzie polecieć na kilka dni?</h1>
      <p>Długi weekend majowy można wykorzystać na city break, kilka dni nad morzem albo pełny tydzień All Inclusive. Największą różnicę robi nie tylko kierunek, ale godziny lotów i liczba realnych dni na miejscu.</p>
    </section>

    <section className="shell seo-copy-section">
      <div className="kicker">POMYSŁY NA MAJÓWKĘ</div>
      <h2>Krótki lot czy tydzień w słońcu?</h2>
      <p>Na 3–4 dni warto szukać kierunków z krótkim transferem i lotem o dobrych godzinach: Rzym, Ateny, Malta, Barcelona, Sewilla, Porto lub Lizbona. Przy 7 dniach można szerzej porównywać Grecję, Cypr, Turcję, Egipt i Wyspy Kanaryjskie.</p>
      <p>W maju temperatury i warunki nad morzem mogą mocno różnić się między regionami. Przy wyborze plażowego wyjazdu sprawdź nie tylko średnią pogodę dla kraju, ale konkretną wyspę lub wybrzeże.</p>
    </section>

    <section className="shell seo-related-block">
      <div className="kicker">SZUKAJ KONKRETNIE</div>
      <h2>Majówka 2027 z Tripownią</h2>
      <div className="seo-related-links">
        <Link href="/city-break">City break →</Link>
        <Link href="/tanie-loty">Tanie loty →</Link>
        <Link href="/wakacje-2027">Wakacje 2027 →</Link>
        <Link href="/malta">Malta →</Link>
        <Link href="/grecja">Grecja →</Link>
        <Link href="/cypr">Cypr →</Link>
      </div>
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">PORÓWNAJ WYJAZD</div><h2>Sprawdź aktualne opcje na majówkę</h2></div></div>
      <div className="single-partner-search-wrap"><SearchHub embedded initialTab="City break" initialDateMode="range" initialDateFrom="2027-04-29" initialDateTo="2027-05-05" /></div>
    </section>

    <section className="shell seo-copy-section">
      <h2>Jak nie przepłacić za majówkę?</h2>
      <p>Porównaj wylot dzień wcześniej lub powrót dzień później, jeżeli masz taką możliwość. Przy krótkim wyjeździe policz pełny koszt lotu z bagażem i transferem do centrum. Tańszy bilet na odległe lotnisko może być gorszy niż droższy lot bezpośrednio do miasta.</p>
      <p>Jeżeli ceny popularnych city breaków rosną, porównaj kilka kierunków dla tego samego terminu zamiast szukać jednego miasta za wszelką cenę.</p>
    </section>
    <SiteFooter/>
  </main>;
}
