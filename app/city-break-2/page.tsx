import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import EskyLiveWidget from "@/components/EskyLiveWidget";
import { offers, isOfferExpired } from "@/lib/offers";

export const metadata: Metadata = { title:"City break — oferty lot + hotel | Tripownia.pl", description:"Kup city break: konkretne oferty Tripowni i pełna wyszukiwarka eSky lot + hotel.", alternates:{canonical:"/city-break-2"} };

export default function CityBreakPage(){
  const cityOffers=offers.filter(o=>!isOfferExpired(o)&&(o.category.includes("city")||o.category.includes("weekend"))).slice(0,12);
  return <main className="city-buy-page"><SiteHeader/>
    <section className="shell city-shopping-hero"><div><div className="kicker">CITY BREAK — KUPUJEMY</div><h1>Krótki wyjazd. Konkretna cena. Lot + hotel.</h1><p>Najpierw pokazujemy wybrane okazje Tripowni, a potem pełną wyszukiwarkę eSky. Bez przechodzenia przez artykuł.</p></div></section>
    <section className="section shell"><div className="section-heading"><div><div className="kicker">AKTUALNE PROPOZYCJE</div><h2>City breaki, które warto sprawdzić teraz</h2></div></div><div className="city-shopping-row">{cityOffers.map(o=><OfferCard key={o.id} offer={o}/>)}</div>
      <div className="city-esky-shell"><div className="kicker">PEŁNA BAZA ESKY</div><h2>Wyszukaj dowolny city break</h2><p>Ustaw miasto, termin i długość pobytu. Wyniki oraz aktualne ceny pochodzą bezpośrednio z eSky.</p><EskyLiveWidget/></div>
    </section><SiteFooter/></main>
}
