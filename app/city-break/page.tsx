import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import { offers, isOfferExpired } from "@/lib/offers";

const TITLE = "City break 2026 — lot + hotel, weekend i krótkie wyjazdy";
const DESCRIPTION = "City break 2026: aktualne oferty lot + hotel na 2–5 dni z polskich lotnisk. Porównaj ceny, terminy i kierunki, a potem przejdź do rezerwacji u partnera.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/city-break" },
  openGraph: {
    type: "website",
    title: `${TITLE} | Tripownia.pl`,
    description: DESCRIPTION,
    url: "/city-break",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "City break — Tripownia.pl" }],
  },
};

const cityBreakIdeas = [
  {city:"Marrakesz", country:"Maroko", image:"/images/destinations/marrakesz.jpg", text:"Słońce, riady i zupełnie inny klimat w kilka godzin lotu."},
  {city:"Dubaj", country:"ZEA", image:"/images/destinations/dubaj.jpg", text:"Ciepło, nowoczesność i dużo atrakcji na 4–5 dni."},
  {city:"Sewilla", country:"Hiszpania", image:"/images/destinations/sewilla.jpg", text:"Tapasy, słońce i jeden z najlepszych kierunków na jesień."},
  {city:"Ateny", country:"Grecja", image:"/images/destinations/ateny.jpg", text:"Historia, jedzenie i szybki miejski reset."},
  {city:"Wenecja", country:"Włochy", image:"/images/destinations/wenecja.jpg", text:"Klasyk, ale najlepiej poza wakacyjnym tłumem."},
  {city:"Walencja", country:"Hiszpania", image:"/images/destinations/walencja.jpg", text:"Miasto i plaża w jednym krótkim wyjeździe."},
  {city:"Porto", country:"Portugalia", image:"/images/destinations/porto.jpg", text:"Jedzenie, wino i spacerowanie bez gonitwy."},
  {city:"Stambuł", country:"Turcja", image:"/images/destinations/stambul.jpg", text:"Europa i Azja w jednym bardzo intensywnym city breaku."},
];

const seasonalCityBreaks = [
  { href: "/podroze/city-break-pazdziernik-2026", label: "City break — październik 2026" },
  { href: "/podroze/city-break-listopad-2026", label: "City break — listopad 2026" },
  { href: "/podroze/city-break-grudzien-2026", label: "City break — grudzień 2026" },
];

const cityBreakAirports = [
  { href: "/podroze/city-break-z-poznania", label: "City break z Poznania" },
  { href: "/podroze/city-break-z-katowic", label: "City break z Katowic" },
  { href: "/podroze/city-break-z-gdanska", label: "City break z Gdańska" },
  { href: "/podroze/city-break-z-wroclawia", label: "City break z Wrocławia" },
  { href: "/podroze/city-break-z-warszawy", label: "City break z Warszawy" },
  { href: "/podroze/city-break-z-lublina", label: "City break z Lublina" },
];

export default function CityBreakPage() {
  const cityOffers = offers.filter(o => !isOfferExpired(o) && o.partner !== "esky" && (o.category.includes("city") || o.category.includes("weekend"))).slice(0, 12);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: "https://tripownia.pl/city-break",
    isPartOf: { "@type": "WebSite", name: "Tripownia", url: "https://tripownia.pl" },
  };

  return <main><SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <section className="shopping-hero shell">
      <div className="kicker">CITY BREAK 2026 — WYBIERASZ SAM</div>
      <h1>City break: lot + hotel, weekend i krótki wyjazd.</h1>
      <p>Sprawdź aktualne propozycje na 2–5 dni albo wybierz konkretne lotnisko i miesiąc. Porównuj ceny, terminy i pełny koszt wyjazdu, a do rezerwacji przechodź dopiero po wybraniu najlepszej opcji.</p>
      <div className="seo-related-links" style={{marginTop: "18px"}}>
        {seasonalCityBreaks.map(item => <Link key={item.href} href={item.href}>{item.label} →</Link>)}
      </div>
      <Link className="editorial-link" href="/magazyn-podrozniczy/city-break-2026">Poradnik: jak szukać city breaków →</Link>
    </section>

    <section className="section shell" aria-labelledby="city-break-airports-title">
      <div className="section-heading"><div><div className="kicker">CITY BREAK Z TWOJEGO LOTNISKA</div><h2 id="city-break-airports-title">Sprawdź wyjazdy z najpopularniejszych polskich lotnisk</h2><p>Wybierz lotnisko startowe i przejdź od razu do ofert dopasowanych do miejsca wylotu.</p></div></div>
      <div className="seo-related-links">
        {cityBreakAirports.map(item => <Link key={item.href} href={item.href}>{item.label} →</Link>)}
      </div>
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">OKAZJE TRIPOWNI</div><h2>Na początek kilka naszych typów</h2></div></div>
      <div className="city-shopping-row">{cityOffers.map(o => <OfferCard key={o.id} offer={o}/>)}</div>
      <div className="city-break-idea-head"><div><div className="kicker">WIĘCEJ KIERUNKÓW</div><h2>Nie ograniczamy city breaku do dwóch aktualnych pakietów</h2><p>To kierunki do dalszego wyszukania — bez udawania, że mamy dla każdego aktualną cenę pakietu.</p></div></div>
      <div className="city-break-idea-grid">{cityBreakIdeas.map(item => <a key={item.city} className="city-break-idea-card" href="#szukaj-city-break"><img src={item.image} alt={`${item.city}, ${item.country}`}/><span><small>{item.country}</small><strong>{item.city}</strong><p>{item.text}</p><b>Szukaj city breaku →</b></span></a>)}</div>
      <div className="single-partner-search-wrap" id="szukaj-city-break"><UnifiedPartnerSearch mode="city" /></div>
    </section>
    <SiteFooter/>
  </main>;
}
