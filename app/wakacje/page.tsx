import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SalesCollectionSchema from "@/components/SalesCollectionSchema";
import SearchHub from "@/components/SearchHub";
import LiveSalesRail from "@/components/LiveSalesRail";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";

export const metadata: Metadata = {
  title: "Tanie wakacje 2026 — All Inclusive, last minute i lot + hotel",
  description: "Tanie wakacje 2026 z polskich lotnisk: All Inclusive, last minute i lot + hotel. Porównaj aktualne oferty, terminy i pełny koszt wyjazdu.",
  alternates: { canonical: "/wakacje" },
  openGraph: {
    type: "website",
    title: "Wakacje 2026 — aktualne oferty | Tripownia.pl",
    description: "All Inclusive, lot + hotel, rodzinne wakacje i egzotyka — porównaj aktualne propozycje w jednym miejscu.",
    url: "https://tripownia.pl/wakacje",
  },
};

export default function WakacjePage() {
  return <main><SiteHeader/>
    <SalesCollectionSchema name="Tanie wakacje 2026" description="Tanie wakacje 2026, All Inclusive, last minute i lot + hotel z polskich lotnisk." path="/wakacje" about={["tanie wakacje","All Inclusive","last minute","lot + hotel"]} />
    <section className="shopping-hero shell">
      <div className="kicker">WAKACJE 2026 — PEŁNA OFERTA</div>
      <h1>Tanie wakacje 2026: All Inclusive, last minute i lot + hotel.</h1>
      <p>Porównaj All Inclusive, rodzinne wakacje, plażę, egzotykę i klasyczne pakiety. Tripownia pokazuje wybrane oferty i pozwala sprawdzić szerszą bazę u partnerów — bez ograniczania się do jednego źródła.</p>
    </section>
    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">WYBRANE PRZEZ NAS</div><h2>Aktualne wakacje warte sprawdzenia</h2><p>Porównuj nie tylko cenę startową, ale też termin, liczbę nocy, wyżywienie i koszt całej podróży.</p></div></div>
      <LiveSalesRail mode="vacation" limit={10}/>
      <div className="single-partner-search-wrap"><SearchHub embedded initialTab="Wakacje" /></div>
    </section>
    <section className="shell seo-related-block">
      <div className="kicker">SZUKAJ DOKŁADNIEJ</div>
      <h2>Wakacje według lotniska i terminu</h2>
      <div className="seo-related-links">
        <Link href="/pakiety-lot-hotel-gotowe-wyjazdy-z-lotem-i-noclegiem">Lot + hotel →</Link>
        <Link href="/podroze/wakacje-do-2000-zl">Wakacje do 2000 zł →</Link>
        <Link href="/podroze/wakacje-do-2500-zl">Wakacje do 2500 zł →</Link>
        <Link href="/wakacje-2027">Wakacje 2027 →</Link>
        <Link href="/wakacje-z-dziecmi">Wakacje z dziećmi →</Link>
        <Link href="/gdzie-jest-cieplo-zima-bez-dalekiego-lotu">Gdzie jest ciepło zimą →</Link>
        <Link href="/ferie-2027">Ferie zimowe 2027 →</Link>
        <Link href="/majowka-2027">Majówka 2027 →</Link>
        <Link href="/podroze/wakacje-z-warszawy">Wakacje z Warszawy →</Link>
        <Link href="/podroze/wakacje-z-poznania">Wakacje z Poznania →</Link>
        <Link href="/podroze/wakacje-z-krakowa">Wakacje z Krakowa →</Link>
        <Link href="/podroze/wakacje-z-katowic">Wakacje z Katowic →</Link>
        <Link href="/podroze/wakacje-z-gdanska">Wakacje z Gdańska →</Link>
        <Link href="/podroze/wakacje-z-wroclawia">Wakacje z Wrocławia →</Link>
        <Link href="/podroze/wakacje-z-rzeszowa">Wakacje z Rzeszowa →</Link>
        <Link href="/podroze/wakacje-z-lublina">Wakacje z Lublina →</Link>
        <Link href="/podroze/all-inclusive-z-warszawy">All Inclusive z Warszawy →</Link>
        <Link href="/podroze/last-minute-z-warszawy">Last Minute z Warszawy →</Link>
        <Link href="/podroze/cieple-wakacje-listopad-2026">Ciepłe wakacje w listopadzie →</Link>
        <Link href="/podroze/cieple-wakacje-grudzien-2026">Ciepłe wakacje w grudniu →</Link>
        <Link href="/podroze/egipt-z-warszawy">Egipt z Warszawy →</Link>
        <Link href="/podroze/egipt-z-katowic">Egipt z Katowic →</Link>
        <Link href="/podroze/egipt-z-poznania">Egipt z Poznania →</Link>
        <Link href="/podroze/turcja-z-warszawy">Turcja z Warszawy →</Link>
        <Link href="/podroze/turcja-z-katowic">Turcja z Katowic →</Link>
        <Link href="/podroze/grecja-z-warszawy">Grecja z Warszawy →</Link>
        <Link href="/podroze/grecja-z-katowic">Grecja z Katowic →</Link>
        <Link href="/podroze/egipt-all-inclusive-z-warszawy">Egipt All Inclusive z Warszawy →</Link>
        <Link href="/podroze/egipt-all-inclusive-z-katowic">Egipt All Inclusive z Katowic →</Link>
        <Link href="/podroze/turcja-all-inclusive-z-warszawy">Turcja All Inclusive z Warszawy →</Link>
        <Link href="/podroze/turcja-all-inclusive-z-katowic">Turcja All Inclusive z Katowic →</Link>
        <Link href="/podroze/wakacje-7-dni-do-2500-zl">Wakacje 7 dni do 2500 zł →</Link>
      </div>
    </section>
    <section className="section shell"><FacebookFollowCTA placement="wakacje" compact /></section>
    <SiteFooter/>
  </main>;
}
