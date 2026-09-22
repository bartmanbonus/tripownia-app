import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Ferie zimowe 2027 – terminy województw i gdzie lecieć";
const description = "Ferie zimowe 2027: sprawdź terminy dla województw i pomysły na wyjazd. Ciepłe kierunki, city break, narty i wakacje z polskich lotnisk.";

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
  return <main>
    <SiteHeader/>
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Ferie zimowe 2027", url: "https://tripownia.pl/ferie-2027" },
    ]}/>
    <section className="shopping-hero shell">
      <div className="kicker">FERIE ZIMOWE 2027</div>
      <h1>Ferie 2027: terminy województw i pomysły na wyjazd.</h1>
      <p>W 2027 ferie odbywają się w trzech turach. Jeśli planujesz wyjazd samolotem, wcześniejsze porównanie kilku lotnisk i kierunków daje większą elastyczność niż szukanie jednego hotelu w ostatniej chwili.</p>
    </section>

    <section className="shell seo-copy-section">
      <div className="kicker">TERMINY FERII 2027</div>
      <h2>Sprawdź swoją turę</h2>
      {terms.map(([date, regions]) => <div key={date} style={{marginBottom:16}}><h3>{date}</h3><p>{regions}</p></div>)}
      <p>Terminy wynikają z kalendarza roku szkolnego 2026/2027 ogłoszonego przez Ministerstwo Edukacji Narodowej.</p>
      <p><a href="https://www.gov.pl/web/edukacja/ministerstwo-edukacji-narodowej-oglosilo-kalendarz-roku-szkolnego-20262027" target="_blank" rel="noopener noreferrer">Sprawdź oficjalny kalendarz MEN →</a></p>
    </section>

    <section className="shell seo-related-block">
      <div className="kicker">GDZIE NA FERIE</div>
      <h2>Dobierz kierunek do tego, czego chcesz od zimowego wyjazdu</h2>
      <div className="seo-related-links">
        <Link href="/gdzie-jest-cieplo-zima-bez-dalekiego-lotu">Gdzie jest ciepło zimą →</Link>
        <Link href="/wakacje-z-dziecmi">Wakacje z dziećmi →</Link>
        <Link href="/wyspy-kanaryjskie-wakacje-all-inclusive-i-last-minute">Wyspy Kanaryjskie →</Link>
        <Link href="/egipt">Egipt →</Link>
        <Link href="/city-break">City break →</Link>
        <Link href="/podroze">Pomysły na podróże →</Link>
        <Link href="/planer-podrozy">Zaplanuj wyjazd →</Link>
      </div>
    </section>

    <section className="shell seo-copy-section">
      <h2>Ciepło, zwiedzanie czy śnieg?</h2>
      <p>Na słońce bez bardzo dalekiego lotu warto porównywać Egipt i Wyspy Kanaryjskie. Na kilkudniowe zwiedzanie dobrze sprawdzają się miasta południowej Europy, a przy wyjeździe narciarskim kluczowe są dojazd, warunki śniegowe i koszt karnetów.</p>
      <p>Przy rodzinnej podróży porównaj również długość transferu z lotniska oraz godziny lotów. Tani lot późnym wieczorem może oznaczać dodatkowy nocleg albo utratę pierwszego dnia wyjazdu.</p>
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">SZUKAJ WYJAZDU</div><h2>Sprawdź aktualne wakacje na ferie</h2></div></div>
      <div className="single-partner-search-wrap"><UnifiedPartnerSearch mode="holiday" /></div>
    </section>
    <SiteFooter/>
  </main>;
}
