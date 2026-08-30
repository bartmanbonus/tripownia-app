import Link from "next/link";
import OfferCard from "@/components/OfferCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import type { LegacyItem } from "@/lib/legacy";
import { offers } from "@/lib/offers";

const destinationWords = ["Malta","Grecja","Cypr","Włochy","Hiszpania","Egipt","Turcja","Tunezja","Madera","Teneryfa","Fuerteventura","Rodos","Kreta","Dubaj","Albania","Chorwacja"];
function relatedOffers(item: LegacyItem) {
  const hay = `${item.title} ${item.path}`.toLowerCase();
  const found = offers.filter(o => hay.includes(o.country.toLowerCase()) || hay.includes(o.city.toLowerCase()));
  return (found.length ? found : offers).slice(0, 3);
}

export default function LegacyPage({ item }: { item: LegacyItem }) {
  const related = relatedOffers(item);
  const archived = item.type === "product";
  return <main><SiteHeader/>
    <div className="legacy-shell shell">
      <div className="legacy-breadcrumb"><Link href="/">Tripownia</Link><span>›</span><span>{item.type === "post" ? "Poradnik" : archived ? "Oferta" : "Strona"}</span></div>
      {archived && <div className="archive-banner"><strong>Oferta archiwalna</strong><span>Cena i dostępność mogły się zmienić. Na dole znajdziesz aktualne propozycje.</span></div>}
      <article className="legacy-article">
        <header><div className="kicker">{archived ? "ARCHIWUM OFERT" : item.type === "post" ? "MAGAZYN TRIPOWNI" : "TRIPOWNIA"}</div><h1>{item.title}</h1></header>
        <div className="legacy-content" dangerouslySetInnerHTML={{__html:item.html}}/>
      </article>
      <section className="legacy-offers"><div className="section-heading"><div><div className="kicker">AKTUALNIE NA TRIPOWNI</div><h2>Sprawdź też aktualne propozycje</h2></div><Link href="/okazje">Wszystkie okazje →</Link></div><div className="cards-grid">{related.map(o=><OfferCard key={o.id} offer={o}/>)}</div></section>
      <section className="legacy-internal-links"><h2>Zostań na Tripowni</h2><div><Link href="/kierunki">🌍 Kierunki</Link><Link href="/city-break-2">🏙 City break</Link><Link href="/last-minute">🏖 Last minute</Link><Link href="/poradniki">🧭 Poradniki</Link><Link href="/parkingi">🚗 Parkingi</Link></div></section>
    </div><SiteFooter/></main>;
}
