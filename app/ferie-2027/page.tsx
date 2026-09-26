import type { Metadata } from "next";
import Link from "next/link";
import { Building2, CalendarDays, MapPin, Plane, Search, Sun, Users } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";
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

const ideas = [
  {
    href: "/gdzie-jest-cieplo-zima-bez-dalekiego-lotu",
    label: "Gdzie jest ciepło zimą",
    icon: <Sun size={22}/>,
  },
  {
    href: "/wakacje-z-dziecmi",
    label: "Wakacje z dziećmi",
    icon: <Users size={22}/>,
  },
  {
    href: "/wyspy-kanaryjskie-wakacje-all-inclusive-i-last-minute",
    label: "Wyspy Kanaryjskie",
    icon: <Plane size={22}/>,
  },
  {
    href: "/egipt",
    label: "Egipt",
    icon: <MapPin size={22}/>,
  },
  {
    href: "/city-break",
    label: "City break",
    icon: <Building2 size={22}/>,
  },
  {
    href: "/planer-podrozy",
    label: "Zaplanuj wyjazd",
    icon: <CalendarDays size={22}/>,
  },
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
        <h1>Ferie 2027: terminy województw i pomysły na wyjazd.</h1>
        <p>Sprawdź swoją turę, wybierz styl wyjazdu i od razu przejdź do aktualnych propozycji. Bez przekopywania się przez przypadkowe terminy i kierunki.</p>
        <a className="ferie-hero-cta" href="#szukaj-ferie"><Search size={18}/> Szukaj wyjazdu na ferie</a>
      </div>
    </section>

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

    <section className="shell ferie-section ferie-ideas-section">
      <div className="kicker">GDZIE NA FERIE</div>
      <h2>Dobierz kierunek do tego, czego chcesz od zimowego wyjazdu</h2>
      <div className="ferie-ideas-grid">
        {ideas.map((item) => (
          <Link href={item.href} className="ferie-idea-card" key={item.href}>
            <span className="ferie-idea-icon">{item.icon}</span>
            <strong>{item.label}</strong>
            <span className="ferie-idea-arrow">→</span>
          </Link>
        ))}
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
        </div>
      </div>
    </section>

    <section className="shell ferie-search-section" id="szukaj-ferie">
      <div className="ferie-search-heading">
        <div className="kicker">SZUKAJ WYJAZDU</div>
        <h2>Sprawdź aktualne wakacje na ferie</h2>
        <p>Wybierz kierunek, lotnisko i zakres dat. Pokażemy tylko oferty, które rzeczywiście pasują do ustawionych parametrów.</p>
      </div>
      <div className="ferie-search-wrap"><SearchHub embedded initialTab="Wakacje" /></div>
    </section>

    <SiteFooter/>
  </main>;
}
