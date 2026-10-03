import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SalesCollectionSchema from "@/components/SalesCollectionSchema";
import SearchHub from "@/components/SearchHub";
import LiveSalesRail from "@/components/LiveSalesRail";
import { homepageFallbackOffers } from "@/lib/offers";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import ProgressiveLinkCloud from "@/components/ProgressiveLinkCloud";

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
  twitter: {
    card: "summary_large_image",
    title: "Wakacje 2026 — aktualne oferty | Tripownia.pl",
    description: "All Inclusive, lot + hotel, rodzinne wakacje i egzotyka — porównaj aktualne propozycje w jednym miejscu.",
  },
};

export default function WakacjePage() {
  return <main><SiteHeader/>
    <SalesCollectionSchema name="Tanie wakacje 2026" description="Tanie wakacje 2026, All Inclusive, last minute i lot + hotel z polskich lotnisk." path="/wakacje" about={["tanie wakacje","All Inclusive","last minute","lot + hotel"]} />
    <section className="shopping-hero shell">
      <div className="kicker">WAKACJE 2026 — PEŁNA OFERTA</div>
      <h1>Tanie wakacje 2026: All Inclusive, last minute i lot + hotel.</h1>
      <p>Porównaj All Inclusive, rodzinne wakacje, plażę, egzotykę i klasyczne pakiety. Tripownia pokazuje wybrane oferty i pozwala przejść do aktualnej dostępności — bez przekopywania wielu osobnych serwisów.</p>
    </section>
    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">WYBRANE PRZEZ NAS</div><h2>Aktualne wakacje warte sprawdzenia</h2><p>Porównuj nie tylko cenę startową, ale też termin, liczbę nocy, wyżywienie i koszt całej podróży.</p></div></div>
      <LiveSalesRail mode="vacation" limit={10} initialOffers={homepageFallbackOffers}/>
      <div className="single-partner-search-wrap"><SearchHub embedded initialTab="Wakacje" /></div>
    </section>
    <section className="shell seo-related-block">
      <div className="kicker">SZUKAJ DOKŁADNIEJ</div>
      <h2>Wakacje według budżetu, lotniska i terminu</h2>
      <p className="seo-related-intro">Najpierw najczęstsze ścieżki. Pozostałe filtry możesz rozwinąć, jeśli ich potrzebujesz.</p>
      <ProgressiveLinkCloud
        visible={8}
        items={[
          { href: "/pakiety-lot-hotel-gotowe-wyjazdy-z-lotem-i-noclegiem", label: "Lot + hotel" },
          { href: "/podroze/wakacje-do-2000-zl", label: "Wakacje do 2000 zł" },
          { href: "/podroze/wakacje-do-2500-zl", label: "Wakacje do 2500 zł" },
          { href: "/wakacje-2027", label: "Wakacje 2027" },
          { href: "/wakacje-z-dziecmi", label: "Wakacje z dziećmi" },
          { href: "/gdzie-jest-cieplo-zima-bez-dalekiego-lotu", label: "Gdzie jest ciepło zimą" },
          { href: "/podroze/wakacje-z-warszawy", label: "Wakacje z Warszawy" },
          { href: "/podroze/wakacje-z-krakowa", label: "Wakacje z Krakowa" },
          { href: "/ferie-2027", label: "Ferie zimowe 2027" },
          { href: "/majowka-2027", label: "Majówka 2027" },
          { href: "/podroze/wakacje-z-poznania", label: "Wakacje z Poznania" },
          { href: "/podroze/wakacje-z-katowic", label: "Wakacje z Katowic" },
          { href: "/podroze/wakacje-z-gdanska", label: "Wakacje z Gdańska" },
          { href: "/podroze/wakacje-z-wroclawia", label: "Wakacje z Wrocławia" },
          { href: "/podroze/wakacje-z-rzeszowa", label: "Wakacje z Rzeszowa" },
          { href: "/podroze/wakacje-z-lublina", label: "Wakacje z Lublina" },
          { href: "/podroze/all-inclusive-z-warszawy", label: "All Inclusive z Warszawy" },
          { href: "/podroze/last-minute-z-warszawy", label: "Last Minute z Warszawy" },
          { href: "/podroze/cieple-wakacje-listopad-2026", label: "Ciepłe wakacje w listopadzie" },
          { href: "/podroze/egipt-listopad-z-warszawy", label: "Egipt w listopadzie z Warszawy" },
          { href: "/podroze/all-inclusive-listopad-do-2500-zl", label: "All Inclusive w listopadzie do 2500 zł" },
          { href: "/podroze/cieple-wakacje-grudzien-2026", label: "Ciepłe wakacje w grudniu" },
          { href: "/podroze/egipt-grudzien-2026-z-warszawy", label: "Egipt w grudniu z Warszawy" },
          { href: "/podroze/wyspy-kanaryjskie-listopad-2026", label: "Wyspy Kanaryjskie w listopadzie" },
          { href: "/podroze/wyspy-kanaryjskie-grudzien-2026", label: "Wyspy Kanaryjskie w grudniu" },
          { href: "/podroze/cieple-wakacje-z-warszawy-do-3000-zl", label: "Ciepłe wakacje z Warszawy do 3000 zł" },
          { href: "/podroze/egipt-z-warszawy", label: "Egipt z Warszawy" },
          { href: "/podroze/egipt-z-katowic", label: "Egipt z Katowic" },
          { href: "/podroze/egipt-z-poznania", label: "Egipt z Poznania" },
          { href: "/podroze/turcja-z-warszawy", label: "Turcja z Warszawy" },
          { href: "/podroze/turcja-z-katowic", label: "Turcja z Katowic" },
          { href: "/podroze/grecja-z-warszawy", label: "Grecja z Warszawy" },
          { href: "/podroze/grecja-z-katowic", label: "Grecja z Katowic" },
          { href: "/podroze/egipt-all-inclusive-z-warszawy", label: "Egipt All Inclusive z Warszawy" },
          { href: "/podroze/egipt-all-inclusive-z-katowic", label: "Egipt All Inclusive z Katowic" },
          { href: "/podroze/turcja-all-inclusive-z-warszawy", label: "Turcja All Inclusive z Warszawy" },
          { href: "/podroze/turcja-all-inclusive-z-katowic", label: "Turcja All Inclusive z Katowic" },
          { href: "/podroze/wakacje-7-dni-do-2500-zl", label: "Wakacje 7 dni do 2500 zł" },
        ]}
      />
    </section>
    <section className="section shell"><FacebookFollowCTA placement="wakacje" compact /></section>
    <SiteFooter/>
  </main>;
}
