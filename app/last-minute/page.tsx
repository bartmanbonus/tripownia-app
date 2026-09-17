import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import { offers, isOfferExpired } from "@/lib/offers";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";

const TITLE = "Last Minute 2026 — aktualne wakacje i All Inclusive";
const DESCRIPTION = "Last Minute 2026: aktualne wakacje, All Inclusive i pakiety z polskich lotnisk. Porównaj ceny, terminy i kierunki, a potem przejdź do rezerwacji u partnera.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/last-minute" },
  openGraph: {
    type: "website",
    title: `${TITLE} | Tripownia.pl`,
    description: DESCRIPTION,
    url: "/last-minute",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Last Minute — Tripownia.pl" }],
  },
};

const airportLinks = [
  { href: "/podroze/last-minute-z-katowic", label: "Last Minute z Katowic" },
  { href: "/podroze/last-minute-z-poznania", label: "Last Minute z Poznania" },
  { href: "/podroze/last-minute-z-gdanska", label: "Last Minute z Gdańska" },
  { href: "/podroze/last-minute-z-wroclawia", label: "Last Minute z Wrocławia" },
  { href: "/podroze/last-minute-z-warszawy", label: "Last Minute z Warszawy" },
  { href: "/podroze/last-minute-z-rzeszowa", label: "Last Minute z Rzeszowa" },
  { href: "/podroze/last-minute-ze-szczecina", label: "Last Minute ze Szczecina" },
];

export default function LastMinuteOffersPage() {
  const active = offers
    .filter(o => !isOfferExpired(o))
    .filter(o => isTravelDestinationAllowed(o.city,o.country));

  const vacationPool = active
    .filter(o => o.partner !== "esky")
    .filter(o => (o.category||[]).some(c=>/wakacje|allinclusive|plaza|cieplo/i.test(c)) || Number(o.nights||0)>=5)
    .sort((a,b)=>Number(a.price||0)-Number(b.price||0));

  const featured = vacationPool.slice(0,12);
  const featuredIds = new Set(featured.map(o=>o.id));
  const more = vacationPool.filter(o=>!featuredIds.has(o.id)).slice(0,12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: "https://tripownia.pl/last-minute",
    isPartOf: { "@type": "WebSite", name: "Tripownia", url: "https://tripownia.pl" },
  };

  return <main>
    <SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <section className="shopping-hero shell last-minute-shopping-hero">
      <div>
        <div className="kicker">⚡ LAST MINUTE 2026</div>
        <h1>Last Minute 2026: aktualne wakacje i All Inclusive do sprawdzenia teraz.</h1>
        <p>Porównaj konkretne pakiety z ceną, terminem i kierunkiem. Tripownia pokazuje najtańsze sensowne opcje na początku i pozwala przeszukać szerszą bazę bez zamykania się na jednego partnera.</p>
      </div>
      <Link className="editorial-link" href="/magazyn-podrozniczy/last-minute-2026">📚 Jak kupować last minute — poradnik →</Link>
    </section>

    <section className="section shell" aria-labelledby="last-minute-airports-title">
      <div className="section-heading"><div><div className="kicker">LAST MINUTE Z TWOJEGO LOTNISKA</div><h2 id="last-minute-airports-title">Wybierz lotnisko i zobacz aktualne wakacje</h2><p>Najmocniej rozwijamy strony, które już zbierają wyświetlenia w Google i prowadzą użytkownika bezpośrednio do ofert.</p></div></div>
      <div className="seo-related-links">
        {airportLinks.map(item => <Link key={item.href} href={item.href}>{item.label} →</Link>)}
      </div>
    </section>

    <section className="section shell last-minute-live-section">
      <div className="section-heading"><div><div className="kicker">WYBRANE PRZEZ TRIPOWNIĘ</div><h2>Aktualne oferty Last Minute</h2><p>Sortujemy od najniższej ceny. Sprawdź termin, liczbę nocy, wyżywienie i lotnisko wylotu przed przejściem do rezerwacji.</p></div></div>
      <div className="last-minute-offer-rail">{featured.map(o=><OfferCard key={o.id} offer={o}/>)}</div>
    </section>

    <section className="section shell partner-search-shopping">
      <UnifiedPartnerSearch mode="lastminute" initialDestination=""/>
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">WIĘCEJ OKAZJI</div><h2>Kolejne Last Minute do sprawdzenia</h2></div></div>
      <div className="last-minute-offer-rail">{more.map(o=><OfferCard key={o.id} offer={o}/>)}</div>
    </section>
    <SiteFooter/>
  </main>;
}
