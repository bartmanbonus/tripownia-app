import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Turcja 2027 – wakacje All Inclusive, Side, Alanya i Antalya";
const description = "Turcja 2027: porównaj All Inclusive w Side, Alanyi, Antalyi, Belek i Bodrum. Sprawdź wakacje z Polski, rodzinne hotele i aktualne oferty.";

export const metadata: Metadata = { title, description, alternates: { canonical: "/turcja-2027" } };

export default function Turcja2027Page() {
  return <main>
    <SiteHeader/>
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Wakacje 2027", url: "https://tripownia.pl/wakacje-2027" },
      { name: "Turcja 2027", url: "https://tripownia.pl/turcja-2027" },
    ]}/>
    <section className="shopping-hero shell">
      <div className="kicker">TURCJA 2027</div>
      <h1>Turcja 2027: All Inclusive w Side, Alanyi, Antalyi, Belek i Bodrum.</h1>
      <p>Turcja ma bardzo szeroki wybór hoteli resortowych, dlatego warto porównywać nie tylko cenę, ale też region, transfer, plażę, standard pokoju i realną ofertę All Inclusive.</p>
    </section>
    <section className="shell seo-copy-section">
      <h2>Riwiera Turecka czy wybrzeże egejskie?</h2>
      <p>Side, Antalya i Alanya są naturalnym punktem startu dla osób szukających klasycznego resortu i dużego wyboru All Inclusive. Bodrum i Marmaris warto sprawdzić, jeśli ważniejsze są krajobrazy, mniejsze zatoki i możliwość łączenia hotelu ze zwiedzaniem.</p>
      <p>Dla rodzin duże znaczenie mają aquapark, klub dla dzieci, zacienienie, rodzaj plaży oraz czas transferu. Przy wyjeździe we dwoje większą różnicę może zrobić lokalizacja hotelu i dostęp do miejscowości poza resortem.</p>
    </section>
    <section className="shell seo-related-block">
      <div className="kicker">TURCJA W 2027</div>
      <h2>Wybierz termin lub styl wyjazdu</h2>
      <div className="seo-related-links">
        <Link href="/wakacje-czerwiec-2027">Czerwiec 2027 →</Link>
        <Link href="/wakacje-lipiec-2027">Lipiec 2027 →</Link>
        <Link href="/wakacje-sierpien-2027">Sierpień 2027 →</Link>
        <Link href="/wakacje-z-dziecmi">Wakacje z dziećmi →</Link>
        <Link href="/riwiera-turecka-czy-egejska-co-wybrac">Riwiera Turecka czy Egejska? →</Link>
        <Link href="/turcja">Przewodnik po Turcji →</Link>
      </div>
    </section>
    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">AKTUALNE OFERTY</div><h2>Sprawdź Turcję 2027</h2></div></div>
      <div className="single-partner-search-wrap"><SearchHub embedded initialTab="Wakacje" initialDestinations={["Turcja"]} /></div>
    </section>
    <SiteFooter/>
  </main>;
}
