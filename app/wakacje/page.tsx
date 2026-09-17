import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import { offers, isOfferExpired } from "@/lib/offers";

const TITLE = "Wakacje 2026 — All Inclusive, lot + hotel i aktualne oferty";
const DESCRIPTION = "Wakacje 2026: aktualne All Inclusive, lot + hotel, plaża i egzotyka z polskich lotnisk. Porównaj oferty i przejdź do rezerwacji u partnera.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/wakacje" },
  openGraph: {
    type: "website",
    title: `${TITLE} | Tripownia.pl`,
    description: DESCRIPTION,
    url: "/wakacje",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Wakacje — Tripownia.pl" }],
  },
};

const airportLinks = [
  { href: "/podroze/wakacje-z-poznania", label: "Wakacje z Poznania" },
  { href: "/podroze/wakacje-z-katowic", label: "Wakacje z Katowic" },
  { href: "/podroze/wakacje-z-gdanska", label: "Wakacje z Gdańska" },
  { href: "/podroze/wakacje-z-wroclawia", label: "Wakacje z Wrocławia" },
  { href: "/podroze/wakacje-z-krakowa", label: "Wakacje z Krakowa" },
  { href: "/podroze/wakacje-z-warszawy", label: "Wakacje z Warszawy" },
  { href: "/podroze/wakacje-z-rzeszowa", label: "Wakacje z Rzeszowa" },
];

export default function WakacjePage() {
  const holidayOffers = offers.filter(o => !isOfferExpired(o) && !o.category.includes("city")).slice(0, 12);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: "https://tripownia.pl/wakacje",
    isPartOf: { "@type": "WebSite", name: "Tripownia", url: "https://tripownia.pl" },
  };

  return <main><SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <section className="shopping-hero shell">
      <div className="kicker">WAKACJE 2026 — PEŁNA OFERTA</div>
      <h1>Wakacje 2026: All Inclusive, lot + hotel i aktualne pakiety.</h1>
      <p>Porównaj All Inclusive, rodzinne wakacje, plażę, egzotykę i klasyczne pakiety. Tripownia pokazuje wybrane oferty i pozwala sprawdzić szerszą bazę u partnerów — bez ograniczania się do jednego źródła.</p>
    </section>

    <section className="section shell" aria-labelledby="holiday-airports-title">
      <div className="section-heading"><div><div className="kicker">WAKACJE Z TWOJEGO LOTNISKA</div><h2 id="holiday-airports-title">Przejdź prosto do ofert z konkretnego miasta</h2><p>Wzmacniamy strony z intencją zakupową: konkretne lotnisko, aktualne pakiety i szybkie przejście do rezerwacji.</p></div></div>
      <div className="seo-related-links">
        {airportLinks.map(item => <Link key={item.href} href={item.href}>{item.label} →</Link>)}
      </div>
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">WYBRANE PRZEZ NAS</div><h2>Aktualne wakacje warte sprawdzenia</h2><p>Porównuj nie tylko cenę startową, ale też termin, liczbę nocy, wyżywienie i koszt całej podróży.</p></div></div>
      <div className="city-shopping-row">{holidayOffers.map(o => <OfferCard key={o.id} offer={o}/>)}</div>
      <div className="single-partner-search-wrap"><UnifiedPartnerSearch mode="holiday" /></div>
    </section>
    <SiteFooter/>
  </main>;
}
