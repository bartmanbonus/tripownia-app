import Link from "next/link";
import OfferCard from "@/components/OfferCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import ArticleDeepDiveBlock from "@/components/ArticleDeepDiveBlock";
import type { LegacyItem } from "@/lib/legacy";
import { legacyCanonicalPath } from "@/lib/legacy";
import { offers } from "@/lib/offers";
import { getArticleContext, type ArticleContext } from "@/lib/articleContext";
import { getArticleDeepDive } from "@/lib/articleDeepDive";

type GrowthLink = { href: string; label: string };

function norm(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function relatedOffers(context: ArticleContext) {
  if (context.destination) {
    const destination = norm(context.destination);
    return offers.filter((offer) => {
      const city = norm(offer.city);
      const country = norm(offer.country);
      return destination.includes(city) || destination.includes(country) || city.includes(destination) || country.includes(destination);
    }).slice(0, 3);
  }

  if (context.mode === "city") {
    return offers.filter((offer) => offer.category.includes("city") || offer.category.includes("weekend")).slice(0, 3);
  }

  if (context.mode === "holiday" || context.mode === "lastminute") {
    return offers.filter((offer) => offer.category.includes("allinclusive") || offer.category.includes("plaza") || offer.category.includes("cieplo")).slice(0, 3);
  }

  return [];
}

function contextualGrowthLinks(item: LegacyItem): GrowthLink[] {
  const hay = `${item.title} ${item.path}`.toLowerCase();
  if (hay.includes("limit") && hay.includes("płyn")) return [
    { href: "/podroze/city-break-z-warszawy", label: "City break z Warszawy" },
    { href: "/podroze/city-break-z-krakowa", label: "City break z Krakowa" },
    { href: "/podroze/city-break-z-katowic", label: "City break z Katowic" },
    { href: "/podroze/city-break-z-gdanska", label: "City break z Gdańska" },
    { href: "/podroze/city-break-z-wroclawia", label: "City break z Wrocławia" },
    { href: "/podroze/city-break-z-poznania", label: "City break z Poznania" },
  ];
  if (hay.includes("listopad") && (hay.includes("ciepło") || hay.includes("gdzie"))) return [
    { href: "/podroze/cieple-wakacje-listopad-2026", label: "Ciepłe wakacje — listopad 2026" },
    { href: "/podroze/wyspy-kanaryjskie-listopad-2026", label: "Wyspy Kanaryjskie — listopad" },
    { href: "/podroze/egipt-listopad-2026", label: "Egipt — listopad 2026" },
    { href: "/podroze/malta-listopad-2026", label: "Malta — listopad 2026" },
  ];
  if (hay.includes("październik") || hay.includes("pazdziernik")) return [
    { href: "/podroze/city-break-pazdziernik-2026", label: "City break — październik 2026" },
    { href: "/podroze/teneryfa-z-warszawy", label: "Teneryfa z Warszawy" },
    { href: "/podroze/wakacje-do-2500-zl", label: "Wakacje do 2500 zł" },
  ];
  if (hay.includes("ciepło") || hay.includes("cieplo")) return [
    { href: "/podroze/cieple-wakacje-listopad-2026", label: "Gdzie ciepło w listopadzie" },
    { href: "/podroze/cieple-wakacje-grudzien-2026", label: "Gdzie ciepło w grudniu" },
    { href: "/podroze/wyspy-kanaryjskie-grudzien-2026", label: "Kanary — grudzień 2026" },
  ];
  if (hay.includes("sylwestr")) return [
    { href: "/sylwester", label: "Aktualne pomysły na Sylwestra" },
    { href: "/podroze/city-break-grudzien-2026", label: "City break — grudzień 2026" },
    { href: "/podroze/cieple-wakacje-grudzien-2026", label: "Ciepłe kierunki w grudniu" },
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
  const context = getArticleContext(item);
  const related = relatedOffers(context);
  const growthLinks = contextualGrowthLinks(item);
  const archived = item.type === "product";
  const canonicalPath = legacyCanonicalPath(item.path);
  const canonicalUrl = `https://tripownia.pl${canonicalPath}`;
  const deepDiveLookupPath = canonicalPath.startsWith("/gdzie-jest-cieplo-w-pazdzierniku")
    ? "/gdzie-jest-cieplo-w-pazdzierniku"
    : canonicalPath;
  const deepDive = item.type === "post" ? getArticleDeepDive(deepDiveLookupPath) : undefined;
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

      {deepDive && <ArticleDeepDiveBlock deepDive={deepDive} />}

      {item.type === "post" && context.hasUsefulSearchContext && <>
        <section className="legacy-internal-links">
          <div className="kicker">KONKRET DLA TEGO ARTYKUŁU</div>
          <h2>{context.focusTitle}</h2>
          <ul>{context.focusPoints.map((point) => <li key={point}>{point}</li>)}</ul>
        </section>
        <section className="legacy-article-search">
          <div className="section-heading"><div><div className="kicker">WYSZUKIWANIE USTAWIONE POD ARTYKUŁ</div><h2>{context.searchTitle}</h2><p>{context.searchLead}</p></div></div>
          <UnifiedPartnerSearch
            mode={deepDive?.searchMode || context.mode}
            initialDestination={context.destination || deepDive?.searchPresets?.[0] || ""}
            initialDeparture={context.departure || "Warszawa Chopina"}
            initialDepartureCode={context.departureCode}
            initialStartDate={context.startDate}
            initialEndDate={context.endDate}
            initialWeekendOnly={context.weekendOnly}
          />
        </section>
      </>}

      {item.type === "post" && <section className="legacy-internal-links"><h2>Sprawdź dalej w tym temacie</h2><div>{growthLinks.map(link=><Link key={link.href} href={link.href}>{link.label} →</Link>)}</div></section>}

      {related.length > 0 && <section className="legacy-offers"><div className="section-heading"><div><div className="kicker">DOPASOWANE WYNIKI TRIPOWNI</div><h2>{context.destination ? `Aktualne propozycje: ${context.destination}` : "Aktualne propozycje pasujące do artykułu"}</h2></div><Link href="/okazje">Wszystkie okazje →</Link></div><div className="cards-grid">{related.map(o=><OfferCard key={o.id} offer={o}/>)}</div></section>}

      <section className="legacy-internal-links"><h2>Zostań na Tripowni</h2><div><Link href="/kierunki">Kierunki</Link><Link href="/city-break">City break</Link><Link href="/last-minute">Last minute</Link><Link href="/poradniki">Poradniki</Link><Link href="/alerty">Alerty</Link></div></section>
    </div><SiteFooter/></main>;
}
