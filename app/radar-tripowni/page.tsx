import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { getDailyOffers, linkPromiseLabel } from "@/lib/offers";

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

export const revalidate = 3600;

export default function RadarTripowniPage() {
  const picks = getDailyOffers(undefined, 5);
  const checked = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Radar Tripowni",
    numberOfItems: picks.length,
    itemListElement: picks.map((offer, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${offer.city}, ${offer.country} – od ${offer.price} zł`,
      url: "https://tripownia.pl/okazje",
    })),
  };

  return <main>
    <SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, "\\u003c") }} />
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Radar Tripowni", url: "https://tripownia.pl/radar-tripowni" },
    ]}/>

    <article className="shell guides-hub">
      <header className="guides-hero">
        <div>
          <div className="kicker">RADAR TRIPOWNI · {checked}</div>
          <h1>5 wyjazdów, które dziś warto mieć na radarze.</h1>
          <p>Nie wrzucamy tu wszystkiego. Radar Tripowni to krótka selekcja różnych typów podróży: szybki city break, ciepło, plaża albo wyjazd z dobrą relacją ceny do długości pobytu.</p>
        </div>
      </header>

      <section className="guides-section-grid">
        {picks.map((offer, index) => <section className="guides-section-card" key={offer.id}>
          <div className="kicker">#{index + 1} · {offer.tag}</div>
          <h2>{offer.flag} {offer.city}, {offer.country}</h2>
          <p><strong>od {offer.price.toLocaleString("pl-PL")} zł/os.</strong> · {offer.nights} nocy · wylot: {offer.departure}</p>
          <p>{offer.reason}</p>
          <p><small>{offer.dates} · {offer.board} · link: {linkPromiseLabel(offer)}</small></p>
          <a href={offer.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer">Sprawdź u partnera →</a>
        </section>)}
      </section>

      <section className="guides-checklist">
        <div>
          <div className="kicker">JAK CZYTAĆ RADAR</div>
          <h2>To inspiracja, nie obietnica ceny.</h2>
          <p>Ceny i dostępność w turystyce zmieniają się dynamicznie. Przed rezerwacją zawsze sprawdź finalną cenę, termin, bagaż i warunki bezpośrednio u partnera. Jeśli oferta zniknęła, przejdź do pełnej listy okazji i sprawdź aktualne alternatywy.</p>
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
