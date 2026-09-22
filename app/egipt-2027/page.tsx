import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Egipt 2027 – wakacje All Inclusive, Hurghada i Marsa Alam";
const description = "Egipt 2027: porównaj All Inclusive, Hurghadę, Marsa Alam i Sharm el Sheikh. Sprawdź wakacje z Polski, lotniska wylotu i aktualne oferty.";

export const metadata: Metadata = { title, description, alternates: { canonical: "/egipt-2027" } };

export default function Egipt2027Page() {
  return <main>
    <SiteHeader/>
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Wakacje 2027", url: "https://tripownia.pl/wakacje-2027" },
      { name: "Egipt 2027", url: "https://tripownia.pl/egipt-2027" },
    ]}/>
    <section className="shopping-hero shell">
      <div className="kicker">EGIPT 2027</div>
      <h1>Egipt 2027: All Inclusive w Hurghadzie, Marsa Alam i Sharm el Sheikh.</h1>
      <p>Porównaj region, hotel, lotnisko wylotu i pełny koszt wyjazdu. W Egipcie lokalizacja hotelu, wiatr, dostęp do morza i transfer mogą mieć większe znaczenie niż sama liczba gwiazdek.</p>
    </section>
    <section className="shell seo-copy-section">
      <h2>Hurghada, Marsa Alam czy Sharm el Sheikh?</h2>
      <p>Hurghada daje szeroki wybór hoteli i prostą bazę do wycieczek. Marsa Alam częściej wybierają osoby nastawione na spokojniejszy pobyt, rafę i resort. Sharm el Sheikh warto porównać, jeśli zależy Ci na Morzu Czerwonym, nurkowaniu i hotelach resortowych.</p>
      <p>Przy podobnej cenie porównaj długość transferu, rodzaj plaży, dostęp do rafy, opinie o jedzeniu oraz podgrzewanie basenów poza najcieplejszymi miesiącami.</p>
    </section>
    <section className="shell seo-related-block">
      <div className="kicker">EGIPT W 2027</div>
      <h2>Sprawdź też termin i budżet</h2>
      <div className="seo-related-links">
        <Link href="/wakacje-czerwiec-2027">Wakacje w czerwcu 2027 →</Link>
        <Link href="/wakacje-lipiec-2027">Wakacje w lipcu 2027 →</Link>
        <Link href="/wakacje-sierpien-2027">Wakacje w sierpniu 2027 →</Link>
        <Link href="/wakacje-z-dziecmi">Wakacje z dziećmi →</Link>
        <Link href="/podroze/all-inclusive-do-2000-zl">All Inclusive do 2000 zł →</Link>
        <Link href="/egipt">Przewodnik po Egipcie →</Link>
      </div>
    </section>
    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">AKTUALNE OFERTY</div><h2>Sprawdź Egipt 2027</h2></div></div>
      <div className="single-partner-search-wrap"><UnifiedPartnerSearch mode="holiday" initialDestination="Egipt" /></div>
    </section>
    <SiteFooter/>
  </main>;
}
