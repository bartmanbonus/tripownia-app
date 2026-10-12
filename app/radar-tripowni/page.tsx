import LivePriceRadar from "@/components/LivePriceRadar";
import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";


const title = "Radar Tripowni – codzienny wybór okazji podróżniczych";
const description = "Radar Tripowni: krótka codzienna selekcja ciekawych wyjazdów z Polski. City break, ciepło, All Inclusive i tanie podróże bez ściany przypadkowych ofert.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/radar-tripowni" },
  openGraph: {
    type: "website",
    title: `${title} | Tripownia.pl`,
    description,
    url: "/radar-tripowni",
  },
};

export const revalidate = 300;

export default function RadarTripowniPage() {
  const picks: Array<never> = [];
  const checked = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());



  return <main>
    <SiteHeader/>

    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Radar Tripowni", url: "https://tripownia.pl/radar-tripowni" },
    ]}/>

    <article className="shell guides-hub">
      <header className="guides-hero">
        <div>
          <div className="kicker">RADAR TRIPOWNI · {checked}</div>
          <h1>Prawdziwe okazje cenowe – sprawdzane na bieżąco.</h1>
          <p>Pokazujemy wyłącznie aktualne ceny z konkretnymi terminami i dokładnymi linkami. Gdy nie ma wiarygodnych okazji, nie wyświetlamy fikcyjnych promocji.</p>
        </div>
      </header>

      <LivePriceRadar />)}
      </section>

      <section className="guides-checklist">
        <div>
          <div className="kicker">JAK CZYTAĆ RADAR</div>
          <h2>To inspiracja, nie obietnica ceny.</h2>
          <p>Ceny i dostępność w turystyce zmieniają się dynamicznie. Przed rezerwacją zawsze sprawdź finalną cenę, termin, bagaż i warunki na stronie rezerwacji. Jeśli oferta zniknęła, przejdź do pełnej listy okazji i sprawdź aktualne alternatywy.</p>
        </div>
        <div className="guides-checklist-actions">
          <Link className="primary-cta" href="/okazje">Wszystkie okazje Tripowni →</Link>
          <Link href="/dla-ciebie">Dopasuj wyjazdy do siebie</Link>
        </div>
      </section>

      <section className="seo-related-block">
        <div className="kicker">SZUKAJ DALEJ</div>
        <h2>Od Radaru do konkretnego wyjazdu</h2>
        <div className="seo-related-links">
          <Link href="/city-break">City break →</Link>
          <Link href="/last-minute">Last Minute →</Link>
          <Link href="/wakacje-2027">Wakacje 2027 →</Link>
          <Link href="/gdzie-jest-cieplo-zima-bez-dalekiego-lotu">Gdzie jest ciepło zimą →</Link>
          <Link href="/wakacje-z-dziecmi">Wakacje z dziećmi →</Link>
          <Link href="/moja-podroz">Zaplanuj swoją podróż →</Link>
        </div>
      </section>
    </article>
    <SiteFooter/>
  </main>;
}
