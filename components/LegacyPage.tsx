import Link from "next/link";
import OfferCard from "@/components/OfferCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import type { LegacyItem } from "@/lib/legacy";
import { legacyCanonicalPath } from "@/lib/legacy";
import { offers } from "@/lib/offers";

type GrowthLink = { href: string; label: string };

function relatedOffers(item: LegacyItem) {
  const hay = `${item.title} ${item.path}`.toLowerCase();
  const found = offers.filter(o => hay.includes(o.country.toLowerCase()) || hay.includes(o.city.toLowerCase()));
  return (found.length ? found : offers).slice(0, 3);
}

function contextualGrowthLinks(item: LegacyItem): GrowthLink[] {
  const hay = `${item.title} ${item.path}`.toLowerCase();
  if (hay.includes("limit") && hay.includes("płyn")) return [
    { href: "/podroze/city-break-z-warszawy", label: "City break z Warszawy" },
    { href: "/podroze/city-break-z-poznania", label: "City break z Poznania" },
    { href: "/podroze/city-break-z-gdanska", label: "City break z Gdańska" },
  ];
  if (hay.includes("październik") || hay.includes("listopad") || hay.includes("ciepło")) return [
    { href: "/podroze/egzotyka-zima", label: "Egzotyka na chłodniejsze miesiące" },
    { href: "/podroze/teneryfa-z-warszawy", label: "Teneryfa z Warszawy" },
    { href: "/podroze/wakacje-do-2500-zl", label: "Wakacje do 2500 zł" },
  ];
  if (hay.includes("sylwestr")) return [
    { href: "/sylwester", label: "Aktualne pomysły na Sylwestra" },
    { href: "/podroze/egzotyka-zima", label: "Ciepłe kierunki zimą" },
    { href: "/dalekie-podroze", label: "Dalekie podróże" },
  ];
  if (hay.includes("bagaż") || hay.includes("karta pokładowa") || hay.includes("jedzenie do samolotu") || hay.includes("lotnisk")) return [
    { href: "/tanie-loty", label: "Sprawdź tanie loty" },
    { href: "/city-break", label: "Znajdź city break" },
    { href: "/podroze/city-break-z-krakowa", label: "City break z Krakowa" },
  ];
  return [
    { href: "/okazje", label: "Dzisiejsze okazje" },
    { href: "/podroze", label: "Podróże według potrzeb" },
    { href: "/alerty", label: "Ustaw alert podróżniczy" },
  ];
}

export default function LegacyPage({ item }: { item: LegacyItem }) {
  const related = relatedOffers(item);
  const growthLinks = contextualGrowthLinks(item);
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
      {item.type === "post" && <section className="legacy-internal-links"><h2>Sprawdź teraz na Tripowni</h2><div>{growthLinks.map(link=><Link key={link.href} href={link.href}>{link.label} →</Link>)}</div></section>}
      <section className="legacy-offers"><div className="section-heading"><div><div className="kicker">WYNIKI TRIPOWNIA.PL</div><h2>Sprawdź też aktualne wyniki Tripownia.pl</h2></div><Link href="/okazje">Wszystkie okazje →</Link></div><div className="cards-grid">{related.map(o=><OfferCard key={o.id} offer={o}/>)}</div></section>
      <section className="legacy-internal-links"><h2>Zostań na Tripowni</h2><div><Link href="/kierunki">🌍 Kierunki</Link><Link href="/city-break">🏙 City break</Link><Link href="/last-minute">🏖 Last minute</Link><Link href="/poradniki">🧭 Poradniki</Link><Link href="/alerty">🔔 Alerty</Link></div></section>
    </div><SiteFooter/></main>;
}
