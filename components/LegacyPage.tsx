import Link from "next/link";
import OfferCard from "@/components/OfferCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import type { LegacyItem } from "@/lib/legacy";
import { legacyCanonicalPath } from "@/lib/legacy";
import { offers } from "@/lib/offers";

function relatedOffers(item: LegacyItem) {
  const hay = `${item.title} ${item.path}`.toLowerCase();
  const found = offers.filter(o => hay.includes(o.country.toLowerCase()) || hay.includes(o.city.toLowerCase()));
  return (found.length ? found : offers).slice(0, 3);
}

export default function LegacyPage({ item }: { item: LegacyItem }) {
  const related = relatedOffers(item);
  const archived = item.type === "product";
  const canonicalPath = legacyCanonicalPath(item.path);
  const canonicalUrl = `https://tripownia.pl${canonicalPath}`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tripownia", item: "https://tripownia.pl/" },
      { "@type": "ListItem", position: 2, name: item.type === "post" ? "Poradniki" : archived ? "Archiwum ofert" : "Tripownia", item: item.type === "post" ? "https://tripownia.pl/poradniki" : "https://tripownia.pl/okazje" },
      { "@type": "ListItem", position: 3, name: item.title, item: canonicalUrl },
    ],
  };
  const articleJsonLd = item.type === "post" ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.description || undefined,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    inLanguage: "pl-PL",
    publisher: {
      "@type": "Organization",
      name: "Tripownia",
      url: "https://tripownia.pl",
      logo: { "@type": "ImageObject", url: "https://tripownia.pl/tripownia-logo.webp" },
    },
  } : null;

  return <main><SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbJsonLd).replace(/</g,"\\u003c")}}/>
    {articleJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(articleJsonLd).replace(/</g,"\\u003c")}}/>}
    <div className="legacy-shell shell">
      <div className="legacy-breadcrumb"><Link href="/">Tripownia</Link><span>›</span><span>{item.type === "post" ? "Poradnik" : archived ? "Oferta" : "Strona"}</span></div>
      {archived && <div className="archive-banner"><strong>Oferta archiwalna</strong><span>Cena i dostępność mogły się zmienić. Na dole znajdziesz aktualne propozycje.</span></div>}
      <article className="legacy-article">
        <header><div className="kicker">{archived ? "ARCHIWUM OFERT" : item.type === "post" ? "MAGAZYN TRIPOWNI" : "TRIPOWNIA"}</div><h1>{item.title}</h1></header>
        <div className="legacy-content" dangerouslySetInnerHTML={{__html:item.html}}/>
      </article>
      <section className="legacy-offers"><div className="section-heading"><div><div className="kicker">WYNIKI TRIPOWNIA.PL</div><h2>Sprawdź też aktualne wyniki Tripownia.pl</h2></div><Link href="/okazje">Wszystkie okazje →</Link></div><div className="cards-grid">{related.map(o=><OfferCard key={o.id} offer={o}/>)}</div></section>
      <section className="legacy-internal-links"><h2>Zostań na Tripowni</h2><div><Link href="/kierunki">🌍 Kierunki</Link><Link href="/city-break">🏙 City break</Link><Link href="/last-minute">🏖 Last minute</Link><Link href="/poradniki">🧭 Poradniki</Link><Link href="/parkingi">🚗 Parkingi</Link></div></section>
    </div><SiteFooter/></main>;
}
