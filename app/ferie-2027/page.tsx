import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FerieOffers2027 from "@/components/FerieOffers2027";

const title = "Ferie zimowe 2027 – terminy i gotowe wyjazdy dla województw";
const description = "Ferie zimowe 2027: wybierz swoją turę i zobacz konkretne wyjazdy dopasowane do dat ferii. Austria, Włochy, Egipt, Turcja i aktualne oferty z polskich lotnisk.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/ferie-2027" },
};

const terms = [
  ["18–31 stycznia 2027", "podkarpackie, podlaskie, dolnośląskie, łódzkie, śląskie, opolskie"],
  ["1–14 lutego 2027", "mazowieckie, pomorskie, świętokrzyskie, lubelskie"],
  ["15–28 lutego 2027", "lubuskie, kujawsko-pomorskie, warmińsko-mazurskie, wielkopolskie, zachodniopomorskie, małopolskie"],
] as const;



export default function Ferie2027Page() {
  return <main className="ferie-2027-page">
    <SiteHeader/>
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Ferie zimowe 2027", url: "https://tripownia.pl/ferie-2027" },
    ]}/>

    <section className="shell ferie-hero">
      <div className="ferie-hero-copy">
        <div className="kicker">FERIE ZIMOWE 2027</div>
        <h1>Ferie 2027: wybierz swoją turę i zobacz gotowe wyjazdy.</h1>
        <p>Daty ferii są już podpięte. Wybierz grupę województw, a pokażemy konkretne oferty i najbliższe sensowne lotniska.</p>
        <a className="ferie-hero-cta" href="#oferty-ferie"><Search size={18}/> Zobacz konkretne oferty na ferie</a>
      </div>
    </section>

    <FerieOffers2027/>

    <section className="shell ferie-section ferie-terms-section">
      <div className="ferie-section-head">
        <div>
          <div className="kicker">TERMINY FERII 2027</div>
          <h2>Sprawdź swoją turę</h2>
        </div>
      </div>
      <div className="ferie-terms-grid">
        {terms.map(([date, regions], index) => (
          <article className="ferie-term-card" key={date}>
            <span className="ferie-term-number">{index + 1}</span>
            <div>
              <h3>{date}</h3>
              <p>{regions}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="ferie-source-row">
        <p>Terminy wynikają z kalendarza roku szkolnego 2026/2027 ogłoszonego przez Ministerstwo Edukacji Narodowej.</p>
        <a href="https://www.gov.pl/web/edukacja/ministerstwo-edukacji-narodowej-oglosilo-kalendarz-roku-szkolnego-20262027" target="_blank" rel="noopener noreferrer">Sprawdź oficjalny kalendarz MEN →</a>
      </div>
    </section>


    <section className="shell ferie-editorial">
      <div className="ferie-editorial-media" aria-hidden="true"/>
      <div className="ferie-editorial-copy">
        <div className="kicker">WARTO WIEDZIEĆ</div>
        <h2>Ciepło, zwiedzanie czy śnieg?</h2>
        <p>Na słońce bez bardzo dalekiego lotu porównaj Egipt i Wyspy Kanaryjskie. Na kilkudniowe zwiedzanie dobrze sprawdzają się miasta południowej Europy, a przy wyjeździe narciarskim kluczowe są dojazd, warunki śniegowe i koszt karnetów.</p>
        <p>Przy rodzinnej podróży porównaj też długość transferu z lotniska i godziny lotów. Tani lot późnym wieczorem może oznaczać dodatkowy nocleg albo utratę pierwszego dnia wyjazdu.</p>
        <div className="ferie-editorial-links">
          <Link href="/gdzie-jest-cieplo-zima-bez-dalekiego-lotu">Ciepło zimą →</Link>
          <Link href="/city-break">City break →</Link>
          <Link href="/podroze">Więcej inspiracji →</Link>
          <Link href="/podroze/ferie-2027-all-inclusive">Ferie 2027 All Inclusive →</Link>
          <Link href="/podroze/ferie-2027-egipt">Egipt na ferie 2027 →</Link>
          <Link href="/podroze/ferie-2027-z-warszawy-all-inclusive">Ferie z Warszawy All Inclusive →</Link>
          <Link href="/podroze/ferie-2027-z-katowic-all-inclusive">Ferie z Katowic All Inclusive →</Link>
        </div>
      </div>
    </section>

    <SiteFooter/>
  </main>;
}
