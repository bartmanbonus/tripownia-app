import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import { offers, isOfferExpired } from "@/lib/offers";

export const metadata: Metadata = {
  title: "City break 2026 — lot + hotel, weekend i krótkie wyjazdy | Tripownia.pl",
  description: "City break 2026: krótkie wyjazdy, lot + hotel i weekendowe propozycje. Sprawdź aktualne oferty oraz city breaki na październik, listopad i grudzień.",
  alternates: { canonical: "/city-break" },
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

export default function CityBreakPage() {
  const cityOffers = offers.filter(o => !isOfferExpired(o) && o.partner !== "esky" && (o.category.includes("city") || o.category.includes("weekend"))).slice(0, 12);
  return <main><SiteHeader/>
    <section className="shopping-hero shell">
      <div className="kicker">CITY BREAK 2026 — WYBIERASZ SAM</div>
      <h1>City break: lot + hotel, weekend i krótki wyjazd.</h1>
      <p>Sprawdź aktualne propozycje na 2–5 dni albo wybierz konkretny miesiąc. Nie ograniczamy wyników do naszych rekomendacji — możesz też wyszukać własny kierunek i termin.</p>
      <div className="seo-related-links" style={{marginTop: "18px"}}>
        {seasonalCityBreaks.map(item => <Link key={item.href} href={item.href}>{item.label} →</Link>)}
      </div>
      <Link className="editorial-link" href="/magazyn-podrozniczy/city-break-2026">Poradnik: jak szukać city breaków →</Link>
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
