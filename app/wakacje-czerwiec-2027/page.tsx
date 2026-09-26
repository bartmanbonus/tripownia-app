import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Wakacje czerwiec 2027 – gdzie lecieć? Tanie kierunki i All Inclusive";
const description = "Wakacje w czerwcu 2027: porównaj Grecję, Turcję, Egipt, Cypr i inne kierunki. Sprawdź All Inclusive, rodzinne wakacje i aktualne oferty z Polski.";

export const metadata: Metadata = { title, description, alternates: { canonical: "/wakacje-czerwiec-2027" } };

export default function June2027Page(){
  return <main>
    <SiteHeader/>
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Wakacje 2027", url: "https://tripownia.pl/wakacje-2027" },
      { name: "Czerwiec 2027", url: "https://tripownia.pl/wakacje-czerwiec-2027" },
    ]}/>
    <section className="shopping-hero shell">
      <div className="kicker">CZERWIEC 2027</div>
      <h1>Wakacje w czerwcu 2027: gdzie polecieć przed szczytem sezonu?</h1>
      <p>Czerwiec daje szeroki wybór kierunków i często spokojniejszy początek lata. Porównaj Grecję, Turcję, Cypr, Egipt i inne miejsca pod kątem temperatury, ceny i długości lotu.</p>
    </section>
    <section className="shell seo-copy-section">
      <h2>Dlaczego warto rozważyć czerwiec?</h2>
      <p>Przed wakacyjnym szczytem łatwiej znaleźć większy wybór hoteli i spokojniejsze kurorty. Przy rodzinach warto sprawdzić, czy wyjazd nie koliduje ze szkołą, a przy parach i dorosłych podróżnych czerwiec może być dobrym kompromisem między pogodą i tłumami.</p>
      <p>Na południu Europy temperatury są już wysokie, ale nie zawsze tak intensywne jak w środku lata. Egipt i Turcja mogą być cieplejsze, więc wybór regionu ma znaczenie.</p>
    </section>
    <section className="shell seo-related-block">
      <div className="kicker">POPULARNE KIERUNKI</div>
      <div className="seo-related-links">
        <Link href="/grecja-2027">Grecja 2027 →</Link>
        <Link href="/turcja-2027">Turcja 2027 →</Link>
        <Link href="/egipt-2027">Egipt 2027 →</Link>
        <Link href="/cypr">Cypr →</Link>
        <Link href="/wakacje-z-dziecmi">Wakacje z dziećmi →</Link>
        <Link href="/wakacje-lipiec-2027">Lipiec 2027 →</Link>
      </div>
    </section>
    <section className="section shell"><div className="section-heading"><div><div className="kicker">SPRAWDŹ OFERTY</div><h2>Wakacje w czerwcu 2027</h2></div></div><div className="single-partner-search-wrap"><SearchHub embedded initialTab="Wakacje" initialDateMode="month" initialMonth="2027-06" /></div></section>
    <SiteFooter/>
  </main>;
}
