import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SalesCollectionSchema from "@/components/SalesCollectionSchema";
import SearchHub from "@/components/SearchHub";
import LiveSalesRail from "@/components/LiveSalesRail";
import { homepageFallbackOffers } from "@/lib/offers";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import ReadySearchGrid from "@/components/ReadySearchGrid";

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
    <section className="section shell"><FacebookFollowCTA placement="wakacje_after_offers" compact /></section>
    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">GOTOWE WAKACJE</div><h2>Wybierz już ustawiony wariant</h2><p>Kierunek, lotnisko, budżet lub miesiąc są przekazane do wyszukiwarki automatycznie.</p></div></div>
      <ReadySearchGrid items={[
        { href: "/szukaj?destination=Egipt&airport=WAWA&budget=3000&duration=7&board=all%20inclusive&tab=All%20Inclusive", eyebrow: "EGIPT · WARSZAWA · DO 3 000 ZŁ", title: "7 nocy All Inclusive", meta: "WAW + WMI · pełne wyżywienie · aktualne pakiety" },
        { href: "/szukaj?destination=Malta&budget=2500&duration=5-7&tab=Lot%20%2B%20hotel", eyebrow: "MALTA · 5–7 NOCY · DO 2 500 ZŁ", title: "Malta na tydzień", meta: "Lot + hotel · różne polskie lotniska" },
        { href: "/szukaj?airport=KTW&budget=2500&duration=7&board=all%20inclusive&tab=All%20Inclusive", eyebrow: "KATOWICE · DO 2 500 ZŁ", title: "All Inclusive z Katowic", meta: "7 nocy · ciepłe kierunki · najtańsze najpierw" },
        { href: "/szukaj?airport=POZ&budget=3000&duration=7&tab=Lot%20%2B%20hotel", eyebrow: "POZNAŃ · DO 3 000 ZŁ", title: "Wakacje z Poznania", meta: "7 nocy · różne kierunki · lot + hotel" },
        { href: "/szukaj?destination=Egipt&month=2026-11&budget=3000&duration=7&board=all%20inclusive&tab=All%20Inclusive", eyebrow: "LISTOPAD 2026 · EGIPT", title: "Ciepło w listopadzie", meta: "7 nocy · All Inclusive · do 3 000 zł/os." },
        { href: "/szukaj?month=2026-12&budget=3000&duration=7&tab=Lot%20%2B%20hotel", eyebrow: "GRUDZIEŃ 2026 · DO 3 000 ZŁ", title: "Ciepłe wakacje w grudniu", meta: "7 nocy · różne kierunki z polskich lotnisk" },
      ]} />
    </section>
    <section className="section shell">
      <div className="section-heading">
        <div>
          <div className="kicker">JESZCZE WIĘCEJ KONKRETÓW</div>
          <h2>Wybierz budżet albo lotnisko i od razu zobacz wyniki</h2>
          <p>Bez przechodzenia przez kolejne strony kategorii.</p>
        </div>
      </div>
      <ReadySearchGrid items={[
        { href: "/szukaj?budget=1500&duration=5-7&tab=Lot%20%2B%20hotel", eyebrow: "DO 1 500 ZŁ · 5–7 NOCY", title: "Najtańsze wakacje", meta: "Różne kierunki i lotniska · sortowanie po cenie" },
        { href: "/szukaj?budget=2500&duration=7&board=all%20inclusive&tab=All%20Inclusive", eyebrow: "DO 2 500 ZŁ · 7 NOCY", title: "All Inclusive w budżecie", meta: "Różne ciepłe kierunki · pełne wyżywienie" },
        { href: "/szukaj?airport=WAWA&budget=3000&duration=7&tab=Wakacje", eyebrow: "WARSZAWA · DO 3 000 ZŁ", title: "Wakacje z Warszawy", meta: "7 nocy · WAW + WMI · różne kierunki" },
        { href: "/szukaj?airport=KRK&budget=3000&duration=7&tab=Wakacje", eyebrow: "KRAKÓW · DO 3 000 ZŁ", title: "Wakacje z Krakowa", meta: "7 nocy · KRK · najtańsze najpierw" },
        { href: "/szukaj?airport=POZ&budget=3000&duration=7&tab=Wakacje", eyebrow: "POZNAŃ · DO 3 000 ZŁ", title: "Wakacje z Poznania", meta: "7 nocy · POZ · różne kierunki" },
        { href: "/szukaj?destination=Wyspy%20Kanaryjskie&budget=3500&duration=7&tab=Wakacje", eyebrow: "KANARY · 7 NOCY · DO 3 500 ZŁ", title: "Wyspy Kanaryjskie", meta: "Słońce · różne lotniska · aktualne pakiety" },
      ]} />
      <div className="seo-discovery-footer">
        <Link href="/wakacje-2027">Wakacje 2027</Link>
        <Link href="/wakacje-z-dziecmi">Wakacje z dziećmi</Link>
        <Link href="/ferie-2027">Ferie 2027</Link>
        <Link href="/majowka-2027">Majówka 2027</Link>
      </div>
    </section>
    <SiteFooter/>
  </main>;
}
