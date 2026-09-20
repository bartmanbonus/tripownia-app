import Link from "next/link";
import OfferCard from "@/components/OfferCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ArticlePartnerSearch from "@/components/ArticlePartnerSearch";
import ArticleDeepDiveBlock from "@/components/ArticleDeepDiveBlock";
import type { LegacyItem } from "@/lib/legacy";
import { legacyCanonicalPath } from "@/lib/legacy";
import { offers } from "@/lib/offers";
import { getArticleContext, type ArticleContext } from "@/lib/articleContext";
import { getArticleDeepDive } from "@/lib/articleDeepDive";
import { getArticleDeepDiveWave7 } from "@/lib/articleDeepDiveWave7";
import { getArticleDeepDiveWave8 } from "@/lib/articleDeepDiveWave8";
import { getArticleDeepDiveWave9 } from "@/lib/articleDeepDiveWave9";

type GrowthLink = { href: string; label: string };

function norm(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function checkedAtIso(value?: string) {
  if (!value) return undefined;
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return undefined;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

const relatedDestinationAliases: Record<string, string[]> = {
  sycylia: ["sycylia", "catania", "palermo"],
  albania: ["albania", "saranda", "vlora", "ksamil", "durres"],
  wietnam: ["wietnam", "hanoi", "da nang", "phu quoc", "ho chi minh"],
  cypr: ["cypr", "pafos", "larnaka", "larnaca"],
  hiszpania: ["hiszpania", "majorka", "teneryfa", "alicante", "malaga", "barcelona"],
  grecja: ["grecja", "kreta", "rodos", "kos", "korfu", "zakynthos"],
  turcja: ["turcja", "antalya", "alanya", "side", "bodrum", "marmaris"],
  egipt: ["egipt", "hurghada", "marsa alam", "sharm"],
  malta: ["malta", "valletta", "sliema", "mellieha"],
  "wyspy kanaryjskie": ["teneryfa", "gran canaria", "fuerteventura", "lanzarote", "kanary"],
};

function relatedOffers(context: ArticleContext, destinationOverride?: string) {
  const selectedDestination = destinationOverride || context.destination;
  if (selectedDestination) {
    const destination = norm(selectedDestination);
    const terms = relatedDestinationAliases[destination] || [destination];
    const matched = offers.filter((offer) => {
      const city = norm(offer.city);
      const country = norm(offer.country);
      return terms.some((term) => term.includes(city) || term.includes(country) || city.includes(term) || country.includes(term));
    }).slice(0, 3);
    if (matched.length) return matched;
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

  if (hay.includes("grecj")) return [
    { href: "/podroze/grecja-z-warszawy", label: "Grecja z Warszawy" },
    { href: "/podroze/grecja-z-katowic", label: "Grecja z Katowic" },
    { href: "/podroze/grecja-z-poznania", label: "Grecja z Poznania" },
    { href: "/podroze/grecja-z-krakowa", label: "Grecja z Krakowa" },
    { href: "/wakacje", label: "Wszystkie aktualne wakacje" },
  ];
  if (hay.includes("turcj") || hay.includes("riwiera turecka") || hay.includes("egejska")) return [
    { href: "/podroze/turcja-z-warszawy", label: "Turcja z Warszawy" },
    { href: "/podroze/turcja-z-katowic", label: "Turcja z Katowic" },
    { href: "/podroze/turcja-z-poznania", label: "Turcja z Poznania" },
    { href: "/podroze/turcja-z-gdanska", label: "Turcja z Gdańska" },
    { href: "/last-minute", label: "Aktualne Last Minute" },
  ];
  if (hay.includes("egipt")) return [
    { href: "/podroze/egipt-z-warszawy", label: "Egipt z Warszawy" },
    { href: "/podroze/egipt-z-katowic", label: "Egipt z Katowic" },
    { href: "/podroze/egipt-z-poznania", label: "Egipt z Poznania" },
    { href: "/podroze/egipt-z-wroclawia", label: "Egipt z Wrocławia" },
    { href: "/last-minute", label: "Aktualne Last Minute" },
  ];
  if (hay.includes("kanar") || hay.includes("teneryf")) return [
    { href: "/podroze/wyspy-kanaryjskie-z-warszawy", label: "Kanary z Warszawy" },
    { href: "/podroze/wyspy-kanaryjskie-z-katowic", label: "Kanary z Katowic" },
    { href: "/podroze/wyspy-kanaryjskie-listopad-2026", label: "Kanary — listopad 2026" },
    { href: "/podroze/wyspy-kanaryjskie-grudzien-2026", label: "Kanary — grudzień 2026" },
    { href: "/wakacje", label: "Aktualne wakacje" },
  ];
  if (hay.includes("malta")) return [
    { href: "/podroze/malta-z-warszawy", label: "Malta z Warszawy" },
    { href: "/podroze/malta-z-krakowa", label: "Malta z Krakowa" },
    { href: "/podroze/malta-listopad-2026", label: "Malta — listopad 2026" },
    { href: "/city-break", label: "Aktualne city breaki" },
  ];
  if (hay.includes("hiszpan")) return [
    { href: "/podroze/wyspy-kanaryjskie-z-warszawy", label: "Kanary z Warszawy" },
    { href: "/podroze/wyspy-kanaryjskie-z-katowic", label: "Kanary z Katowic" },
    { href: "/city-break", label: "City break w Hiszpanii" },
    { href: "/wakacje", label: "Aktualne wakacje" },
  ];
  if (hay.includes("limit") && hay.includes("płyn")) return [
    { href: "/podroze/city-break-z-warszawy", label: "City break z Warszawy" },
    { href: "/podroze/city-break-z-krakowa", label: "City break z Krakowa" },
    { href: "/podroze/city-break-z-katowic", label: "City break z Katowic" },
    { href: "/podroze/city-break-z-gdanska", label: "City break z Gdańska" },
    { href: "/podroze/city-break-z-wroclawia", label: "City break z Wrocławia" },
    { href: "/podroze/city-break-z-poznania", label: "City break z Poznania" },
  ];
  if (hay.includes("listopad") && (hay.includes("ciepło") || hay.includes("cieplo") || hay.includes("gdzie"))) return [
    { href: "/podroze/cieple-wakacje-listopad-2026", label: "Ciepłe wakacje — listopad 2026" },
    { href: "/podroze/wyspy-kanaryjskie-z-warszawy", label: "Kanary z Warszawy" },
    { href: "/podroze/egipt-z-warszawy", label: "Egipt z Warszawy" },
    { href: "/podroze/malta-z-warszawy", label: "Malta z Warszawy" },
  ];
  if (hay.includes("październik") || hay.includes("pazdziernik")) return [
    { href: "/podroze/city-break-pazdziernik-2026", label: "City break — październik 2026" },
    { href: "/podroze/wyspy-kanaryjskie-z-warszawy", label: "Kanary z Warszawy" },
    { href: "/podroze/grecja-z-warszawy", label: "Grecja z Warszawy" },
    { href: "/podroze/wakacje-do-2500-zl", label: "Wakacje do 2500 zł" },
  ];
  if (hay.includes("wietnam") || hay.includes("hanoi")) return [
    { href: "/dalekie-podroze", label: "Dalekie podróże" },
    { href: "/okazje", label: "Aktualne okazje" },
    { href: "/alerty", label: "Ustaw alert na Wietnam" },
  ];
  if (hay.includes("cypr")) return [
    { href: "/podroze/cieple-wakacje-listopad-2026", label: "Ciepłe kierunki — listopad" },
    { href: "/wakacje", label: "Aktualne wakacje" },
    { href: "/last-minute", label: "Last Minute" },
  ];
  if (hay.includes("alban")) return [
    { href: "/wakacje", label: "Aktualne wakacje" },
    { href: "/last-minute", label: "Last Minute" },
    { href: "/wynajem-auta", label: "Wynajem auta" },
  ];
  if (hay.includes("weekend") || hay.includes("city break")) return [
    { href: "/city-break", label: "Aktualne city breaki" },
    { href: "/podroze/city-break-z-warszawy", label: "City break z Warszawy" },
    { href: "/podroze/city-break-z-poznania", label: "City break z Poznania" },
    { href: "/podroze/city-break-z-wroclawia", label: "City break z Wrocławia" },
  ];
  if (hay.includes("ciepło") || hay.includes("cieplo")) return [
    { href: "/podroze/egipt-z-warszawy", label: "Egipt z Warszawy" },
    { href: "/podroze/wyspy-kanaryjskie-z-warszawy", label: "Kanary z Warszawy" },
    { href: "/podroze/malta-z-warszawy", label: "Malta z Warszawy" },
    { href: "/podroze/cieple-wakacje-grudzien-2026", label: "Ciepłe wakacje — grudzień" },
  ];
  if (hay.includes("sylwestr")) return [
    { href: "/sylwester", label: "Aktualne pomysły na Sylwestra" },
    { href: "/podroze/city-break-grudzien-2026", label: "City break — grudzień 2026" },
    { href: "/podroze/cieple-wakacje-grudzien-2026", label: "Ciepłe kierunki w grudniu" },
    { href: "/dalekie-podroze", label: "Dalekie podróże" },
  ];
  if (hay.includes("psem") || hay.includes("z psem")) return [
    { href: "/wakacje", label: "Aktualne wakacje" },
    { href: "/wynajem-auta", label: "Wynajem auta na wyjazd" },
    { href: "/ubezpieczenia", label: "Ubezpieczenie podróżne" },
  ];
  if (hay.includes("etna") || hay.includes("sycyli") || hay.includes("katanii")) return [
    { href: "/tanie-loty", label: "Sprawdź aktualne loty" },
    { href: "/city-break", label: "City break we Włoszech" },
    { href: "/ubezpieczenia", label: "Ubezpieczenie podróżne" },
  ];
  if (hay.includes("dojechac") || hay.includes("dojechać") || hay.includes("dostać się z lotniska")) return [
    { href: "/transfery", label: "Transfery lotniskowe" },
    { href: "/wynajem-auta", label: "Wynajem auta" },
    { href: "/city-break", label: "City break" },
  ];
  if (hay.includes("bagaż") || hay.includes("karta pokładowa") || hay.includes("jedzenie do samolotu") || hay.includes("lotnisk")) return [
    { href: "/tanie-loty", label: "Sprawdź tanie loty" },
    { href: "/city-break", label: "Znajdź city break" },
    { href: "/podroze/city-break-z-krakowa", label: "City break z Krakowa" },
  ];
  return [
    { href: "/wakacje", label: "Aktualne wakacje" },
    { href: "/last-minute", label: "Last Minute" },
    { href: "/city-break", label: "City break" },
    { href: "/okazje", label: "Dzisiejsze okazje" },
  ];
}

export default function LegacyPage({ item }: { item: LegacyItem }) {
  const context = getArticleContext(item);
  const growthLinks = contextualGrowthLinks(item);
  const archived = item.type === "product";
  const canonicalPath = legacyCanonicalPath(item.path);
  const canonicalUrl = `https://tripownia.pl${canonicalPath}`;
  const deepDiveLookupPath = canonicalPath.startsWith("/gdzie-jest-cieplo-w-pazdzierniku")
    ? "/gdzie-jest-cieplo-w-pazdzierniku"
    : canonicalPath;
  const deepDive = item.type === "post"
    ? getArticleDeepDiveWave9(deepDiveLookupPath) || getArticleDeepDiveWave8(deepDiveLookupPath) || getArticleDeepDiveWave7(deepDiveLookupPath) || getArticleDeepDive(deepDiveLookupPath)
    : undefined;
  const effectiveDestination = context.destination || deepDive?.searchPresets?.[0];
  const related = relatedOffers(context, effectiveDestination);
  const shouldRenderSearch = item.type === "post"
    && !deepDive?.hideSearch
    && (context.hasUsefulSearchContext || Boolean(deepDive?.searchPresets?.length));
  const showCommercialLinks = !archived && growthLinks.length > 0;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tripownia", item: "https://tripownia.pl/" },
      { "@type": "ListItem", position: 2, name: item.type === "post" ? "Poradniki" : archived ? "Archiwum ofert" : "Tripownia", item: item.type === "post" ? "https://tripownia.pl/poradniki" : "https://tripownia.pl/okazje" },
      { "@type": "ListItem", position: 3, name: item.title, item: canonicalUrl },
    ],
  };
  const dateModified = checkedAtIso(deepDive?.checkedAt);
  const articleJsonLd = item.type === "post" ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.description || undefined,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    dateModified,
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

      {showCommercialLinks && <section className="legacy-internal-links" aria-label="Aktualne oferty związane z tematem">
        <div className="kicker">AKTUALNE OFERTY</div>
        <h2>Sprawdź wyjazdy związane z tym tematem</h2>
        <p>Poradnik pomaga wybrać kierunek. Tutaj przejdziesz do aktualnych stron z ofertami, cenami i wylotami z konkretnych lotnisk.</p>
        <div>{growthLinks.map((link, index)=><Link key={link.href} className={index === 0 ? "primary-cta" : undefined} href={link.href}>{link.label} →</Link>)}</div>
      </section>}

      {deepDive && <ArticleDeepDiveBlock deepDive={deepDive} />}

      {shouldRenderSearch && <>
        <section className="legacy-internal-links">
          <div className="kicker">KONKRET DLA TEGO ARTYKUŁU</div>
          <h2>{effectiveDestination && !context.destination ? `${effectiveDestination}: sprawdź aktualne możliwości` : context.focusTitle}</h2>
          <ul>{context.focusPoints.map((point) => <li key={point}>{point}</li>)}</ul>
        </section>
        <section className="legacy-article-search">
          <div className="section-heading"><div><div className="kicker">WYSZUKIWANIE USTAWIONE POD ARTYKUŁ</div><h2>{effectiveDestination ? `Sprawdź aktualne wyjazdy: ${effectiveDestination}` : context.searchTitle}</h2><p>{effectiveDestination && !context.destination ? `Ustawiliśmy wyszukiwarkę pod ${effectiveDestination}. Wszystkie pola możesz zmienić.` : context.searchLead}</p></div></div>
          <ArticlePartnerSearch
            mode={deepDive?.searchMode || context.mode}
            initialDestination={effectiveDestination || ""}
            initialDeparture={context.departure || "Warszawa Chopina"}
            initialDepartureCode={context.departureCode}
            initialStartDate={context.startDate}
            initialEndDate={context.endDate}
            initialWeekendOnly={context.weekendOnly}
            presets={deepDive?.searchPresets}
          />
        </section>
      </>}

      {related.length > 0 && <section className="legacy-offers"><div className="section-heading"><div><div className="kicker">DOPASOWANE WYNIKI TRIPOWNI</div><h2>{effectiveDestination ? `Aktualne propozycje: ${effectiveDestination}` : "Aktualne propozycje pasujące do artykułu"}</h2></div><Link href="/okazje">Wszystkie okazje →</Link></div><div className="cards-grid">{related.map(o=><OfferCard key={o.id} offer={o}/>)}</div></section>}

      <section className="legacy-internal-links"><h2>Zostań na Tripowni</h2><div><Link href="/kierunki">Kierunki</Link><Link href="/wakacje">Wakacje</Link><Link href="/city-break">City break</Link><Link href="/last-minute">Last Minute</Link><Link href="/poradniki">Poradniki</Link></div></section>
    </div><SiteFooter/></main>;
}
