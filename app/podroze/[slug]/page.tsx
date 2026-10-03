import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SeoEximOffers from "@/components/SeoEximOffers";
import { partners } from "@/lib/partners";
import { allSeoLandings, getAllSeoLanding } from "@/lib/allSeoLandings";
import type { SeoLanding } from "@/lib/seoLandings";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import SalesCollectionSchema from "@/components/SalesCollectionSchema";

type PageProps = { params: Promise<{ slug: string }> };

type PracticalGuide = {
  heading: string;
  summary: string;
  bullets: string[];
  checklist: string[];
};

const practicalGuides: Record<string, PracticalGuide> = {
  "Wyspy Zielonego Przylądka": {
    heading: "Sal czy Boa Vista? Najpierw wybierz styl wyjazdu",
    summary: "Cabo Verde najlepiej porównywać nie tylko po cenie. Sal daje więcej infrastruktury wokół Santa Maria, a Boa Vista ma spokojniejszy, bardziej resortowy charakter.",
    bullets: [
      "Sal sprawdzi się lepiej, jeśli chcesz mieć restauracje, wycieczki i więcej rzeczy poza hotelem w zasięgu ręki.",
      "Boa Vista warto rozważyć przy nastawieniu na plażę i odpoczynek; wtedy szczególnie ważna jest lokalizacja resortu i transfer.",
      "Przy podobnej cenie porównaj pełny koszt: bagaż, transfer, wyżywienie i ewentualne dopłaty w hotelu.",
    ],
    checklist: [
      "Sprawdź dokładną wyspę i miejscowość, nie tylko nazwę kraju.",
      "Porównaj pakiet z przelotem z samodzielnym lotem i hotelem.",
      "Zobacz godziny lotów i długość transferu przed rezerwacją.",
      "Jeśli zależy Ci na kąpieli i sportach wodnych, sprawdź warunki w konkretnej części wyspy.",
    ],
  },
  "Wyspy Kanaryjskie": {
    heading: "Nie wybieraj Kanarów tylko po najniższej cenie",
    summary: "Teneryfa, Gran Canaria i Fuerteventura dają różny typ wyjazdu. W praktyce dużo zmieniają część wyspy, odległość od lotniska i dostęp do atrakcji poza hotelem.",
    bullets: [
      "Na Teneryfie warto od razu sprawdzić, czy nocleg jest na południu czy północy wyspy.",
      "Na Fuerteventurze lokalizacja ma duże znaczenie, jeśli planujesz zwiedzanie zamiast pobytu głównie przy hotelu.",
      "Przy tygodniowym pobycie wynajem auta może być ważniejszy niż niewielka różnica w cenie hotelu.",
    ],
    checklist: [
      "Porównaj wyspę, region i lotnisko przylotu.",
      "Sprawdź wyżywienie oraz realną odległość od plaży.",
      "Zobacz, czy warto dopłacić do lepszej lokalizacji zamiast wyższego standardu pokoju.",
      "Porównaj terminy przed świętami, w święta i po świętach osobno.",
    ],
  },
  Egipt: {
    heading: "W Egipcie region jest równie ważny jak hotel",
    summary: "Hurghada, Marsa Alam i Sharm el Sheikh różnią się charakterem wyjazdu, transferami i warunkami na miejscu. Sama liczba gwiazdek hotelu nie wystarczy do porównania ofert.",
    bullets: [
      "Jeśli zależy Ci na rafie i snorkelingu, sprawdź dostęp do morza i pomost przy konkretnym hotelu.",
      "Przy późnym przylocie długi transfer potrafi istotnie skrócić pierwszy dzień pobytu.",
      "W All Inclusive porównuj opinie o jedzeniu, plaży i pokojach, nie tylko opis touroperatora.",
    ],
    checklist: [
      "Sprawdź region i długość transferu z lotniska.",
      "Zobacz, czy plaża jest piaszczysta, rafowa czy dostępna z pomostu.",
      "Porównaj godziny lotów i faktyczną liczbę pełnych dni na miejscu.",
      "Przy podobnej cenie wybierz lepiej oceniany hotel zamiast kierować się samą liczbą gwiazdek.",
    ],
  },
  Malta: {
    heading: "Na Malcie lokalizacja noclegu robi największą różnicę",
    summary: "Przy krótkim wyjeździe warto ograniczyć czas na dojazdy. Valletta, Sliema i okolice St. Julian’s dają łatwiejszy dostęp do komunikacji i atrakcji niż tańszy nocleg daleko od głównych tras.",
    bullets: [
      "Na 3–4 dni wybieraj nocleg pod plan zwiedzania, a nie tylko najniższą cenę.",
      "Przy późnym przylocie sprawdź dojazd z lotniska jeszcze przed zakupem lotu.",
      "Jeśli chcesz objechać wyspę, porównaj transport publiczny z wynajmem auta.",
    ],
    checklist: [
      "Sprawdź godziny lotów i transfer z lotniska.",
      "Zobacz odległość od przystanków i promów.",
      "Porównaj cenę hotelu z lokalizacją — przy krótkim pobycie czas jest częścią kosztu.",
      "Przy pobycie poza sezonem sprawdź warunki pogodowe na konkretne dni przed wyjazdem.",
    ],
  },
  "City break": {
    heading: "Dobry city break zaczyna się od godzin lotów",
    summary: "Przy 2–4 nocach ważniejsze od samej ceny biletu bywają godzina przylotu, lotnisko docelowe i lokalizacja hotelu. To one decydują, ile czasu realnie zostaje na miejscu.",
    bullets: [
      "Porównuj pełny koszt lotu z bagażem i transferem do centrum.",
      "Hotel kilka minut bliżej centrum często daje większą korzyść niż niewielka oszczędność na noclegu.",
      "Wylot w czwartek lub powrót w poniedziałek potrafi dać lepszą cenę niż klasyczny piątek–niedziela.",
    ],
    checklist: [
      "Policz godziny na miejscu, nie tylko liczbę noclegów.",
      "Sprawdź dojazd z lotniska po godzinie przylotu.",
      "Porównaj bagaż podręczny i dopłaty przewoźnika.",
      "Zobacz lokalizację hotelu na mapie przed rezerwacją.",
    ],
  },
  "Ciepłe wakacje": {
    heading: "Najpierw wybierz, czego oczekujesz od zimowego słońca",
    summary: "Kierunki różnią się pewnością pogody, długością lotu i stylem wypoczynku. Najtańsza oferta nie zawsze daje najlepszy bilans czasu, temperatury i standardu pobytu.",
    bullets: [
      "Na krótki wyjazd liczy się czas lotu; przy 7–10 dniach łatwiej uzasadnić dalszy kierunek.",
      "Porównuj temperaturę i wiatr dla konkretnego regionu, nie tylko kraju.",
      "Przy formule All Inclusive sprawdź, ile wydatków na miejscu naprawdę odpada.",
    ],
    checklist: [
      "Porównaj kilka kierunków w tym samym terminie.",
      "Sprawdź długość lotu i transferu.",
      "Zobacz, co dokładnie obejmuje wyżywienie.",
      "Policz łączny budżet, a nie tylko cenę startową oferty.",
    ],
  },
};

function landingHeroVisual(query: string) {
  const normalized = query.toLocaleLowerCase("pl");

  const exact: Record<string, { src: string; alt: string }> = {
    "malta": { src: "/images/destinations/valletta.jpg", alt: "Valletta na Malcie" },
    "egipt": { src: "/images/destinations/marsa-alam.jpg", alt: "Wybrzeże Marsa Alam w Egipcie" },
    "bułgaria": { src: "/images/destinations/sloneczny-brzeg.jpg", alt: "Słoneczny Brzeg w Bułgarii" },
    "hiszpania": { src: "/images/destinations/majorka.jpg", alt: "Majorka w Hiszpanii" },
    "wyspy kanaryjskie": { src: "/images/destinations/fuerteventura.jpg", alt: "Fuerteventura na Wyspach Kanaryjskich" },
    "madera": { src: "/images/destinations/madera.jpg", alt: "Madera" },
    "rzym": { src: "/images/destinations/rzym.jpg", alt: "Rzym" },
    "bari": { src: "/images/destinations/neapol.jpg", alt: "Południowe Włochy — inspiracja na city break w Bari" },
    "barcelona": { src: "/images/destinations/barcelona.jpg", alt: "Barcelona" },
    "cypr": { src: "/images/destinations/pafos.jpg", alt: "Pafos na Cyprze" },
    "teneryfa": { src: "/images/destinations/teneryfa.jpg", alt: "Teneryfa" },
  };

  if (exact[normalized]) return exact[normalized];
  if (normalized.includes("city break")) return { src: "/images/destinations/rzym.jpg", alt: "Inspiracja na krótki city break" };
  if (normalized.includes("last minute")) return { src: "/images/destinations/fuerteventura.jpg", alt: "Inspiracja na słoneczny wyjazd Last Minute" };
  if (normalized.includes("all inclusive")) return { src: "/images/destinations/marsa-alam.jpg", alt: "Inspiracja na wakacje All Inclusive" };
  if (normalized.includes("wakacje")) return { src: "/images/destinations/rodos.jpg", alt: "Inspiracja na wakacyjny wyjazd" };
  return { src: "/images/destinations/porto.jpg", alt: "Inspiracja podróżnicza Tripowni" };
}

function getPracticalGuide(query: string): PracticalGuide {
  if (practicalGuides[query]) return practicalGuides[query];
  if (query.toLowerCase().includes("city")) return practicalGuides["City break"];
  if (query.toLowerCase().includes("wakacje") || query.toLowerCase().includes("all inclusive")) return practicalGuides["Ciepłe wakacje"];

  return {
    heading: `Jak podejść do wyjazdu: ${query}`,
    summary: "Najlepsza oferta to nie zawsze najniższa cena. Warto porównać termin, godziny podróży, lokalizację noclegu i koszty, które pojawiają się dopiero po kliknięciu w szczegóły.",
    bullets: [
      "Porównaj co najmniej dwa terminy i dwa warianty noclegu.",
      "Sprawdź łączny koszt z bagażem, transferem i wyżywieniem.",
      "Przy krótkim pobycie zwróć szczególną uwagę na godziny lotów i położenie hotelu.",
    ],
    checklist: [
      "Czy termin i liczba nocy naprawdę Ci odpowiadają?",
      "Czy cena obejmuje bagaż i transfer?",
      "Czy lokalizacja hotelu pasuje do planu wyjazdu?",
      "Czy ta sama podróż nie jest korzystniejsza w sąsiednim terminie?",
    ],
  };
}

function landingFaq(query: string, departure?: string) {
  const from = departure ? ` z ${departure}` : "";
  const normalized = query.toLowerCase();

  if (normalized.includes("city break")) return [
    {
      question: `Jak znaleźć tani city break${from}?`,
      answer: "Porównaj kilka kierunków dla tych samych dat, godziny lotów, bagaż, transfer z lotniska i lokalizację hotelu. Przy 2–4 dniach dobry rozkład lotów często jest ważniejszy niż najniższa cena biletu.",
    },
    {
      question: `Na ile dni najlepiej lecieć na city break${from}?`,
      answer: "Najczęściej sprawdzają się 2–5 dni. Przy krótkim pobycie warto wybierać loty, które nie zabierają całego pierwszego ani ostatniego dnia.",
    },
    {
      question: "Czy lepiej kupić lot i hotel razem czy osobno?",
      answer: "Warto porównać oba warianty dla tego samego terminu. Liczy się pełny koszt z bagażem, transferem, podatkami i warunkami anulowania.",
    },
  ];

  if (normalized.includes("last minute")) return [
    {
      question: `Kiedy sprawdzać Last Minute${from}?`,
      answer: "Największą wartość daje elastyczność kierunku i terminu. Porównuj kilka krajów na ten sam tydzień i sprawdzaj pełny zakres pakietu, nie tylko cenę wejściową.",
    },
    {
      question: "Czy Last Minute zawsze jest najtańsze?",
      answer: "Nie. Cena zależy od dostępności miejsc, terminu, lotniska, hotelu i wyżywienia. Dlatego Last Minute warto porównywać z normalnymi ofertami i sąsiednimi datami.",
    },
    {
      question: "Co sprawdzić przed rezerwacją Last Minute?",
      answer: "Godziny lotów, bagaż, transfer, standard pokoju, wyżywienie, zasady anulowania i faktyczną liczbę pełnych dni na miejscu.",
    },
  ];

  if (normalized.includes("all inclusive")) return [
    {
      question: `Co obejmuje All Inclusive${from}?`,
      answer: "Zakres różni się między hotelami. Przed rezerwacją sprawdź posiłki, napoje, godziny działania restauracji i barów, przekąski oraz usługi dodatkowo płatne.",
    },
    {
      question: "Czy najtańsze All Inclusive oznacza najlepszą ofertę?",
      answer: "Nie zawsze. Porównaj opinie o hotelu, plażę, transfer, standard pokoju, godziny lotów i zakres wyżywienia. Niewielka dopłata może dać znacznie lepszy pobyt.",
    },
    {
      question: "Jak porównywać oferty All Inclusive?",
      answer: "Porównuj ten sam termin, podobny standard hotelu, bagaż, transfer i realną liczbę dni na miejscu. Dopiero wtedy cena jest porównywalna.",
    },
  ];

  if (normalized.includes("wakacje")) return [
    {
      question: `Jak znaleźć tanie wakacje${from}?`,
      answer: "Porównaj kilka kierunków i terminów, sprawdź lotniska wylotu oraz pełny koszt pakietu z bagażem, transferem i wyżywieniem.",
    },
    {
      question: "Czy warto porównywać sąsiednie terminy?",
      answer: "Tak. Przesunięcie wyjazdu o kilka dni może znacząco zmienić cenę lotu lub pakietu, zwłaszcza poza ścisłym szczytem sezonu.",
    },
    {
      question: "Na co patrzeć poza ceną wakacji?",
      answer: "Na standard hotelu, lokalizację, wyżywienie, bagaż, transfer, godziny lotów i warunki anulowania.",
    },
  ];

  return [
    {
      question: `Jak porównywać oferty: ${query}?`,
      answer: "Sprawdź pełny koszt, termin, liczbę nocy, godziny podróży, bagaż, transfer oraz warunki rezerwacji.",
    },
    {
      question: "Czy ceny ofert mogą się zmieniać?",
      answer: "Tak. Ceny i dostępność zależą od bieżącego feedu partnera i mogą zmienić się do momentu finalnej rezerwacji.",
    },
    {
      question: "Gdzie odbywa się finalna rezerwacja?",
      answer: "Tripownia pomaga znaleźć i porównać ofertę, a finalna rezerwacja i płatność odbywają się bezpośrednio u partnera.",
    },
  ];
}

function compactDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

const GENERIC_SEARCH_QUERIES = new Set([
  "city break", "tanie loty", "wakacje", "last minute", "all inclusive", "ciepłe wakacje",
]);

function searchTabForLanding(item: SeoLanding) {
  const query = item.query.toLocaleLowerCase("pl");
  if (query.includes("tanie loty")) return "Loty";
  if (query.includes("city break")) return "City break";
  if (query.includes("all inclusive")) return "All Inclusive";
  return "Lot + hotel";
}

function readySearchHref(item: SeoLanding) {
  const params = new URLSearchParams();
  const query = item.query.trim();
  if (query && !GENERIC_SEARCH_QUERIES.has(query.toLocaleLowerCase("pl"))) params.set("destination", query);

  const airport = item.departure === "Warszawa" ? "WAWA" : item.departureCode;
  if (airport) params.set("airport", airport);
  if (item.maxPrice) params.set("budget", String(item.maxPrice));

  if (item.minNights && item.maxNights) {
    params.set("duration", item.minNights === item.maxNights ? String(item.minNights) : `${item.minNights}-${item.maxNights}`);
  } else if (item.maxNights) {
    params.set("duration", `1-${item.maxNights}`);
  } else if (item.minNights) {
    params.set("duration", item.minNights >= 15 ? "15+" : `${item.minNights}-14`);
  }

  if (item.startDate) params.set("from", item.startDate);
  if (item.endDate) params.set("to", item.endDate);
  params.set("tab", searchTabForLanding(item));
  return `/szukaj?${params.toString()}`;
}

function readySearchMeta(item: SeoLanding) {
  const parts: string[] = [];
  if (item.departure) parts.push(`wylot: ${item.departure}`);
  if (item.startDate || item.endDate) {
    const date = [compactDate(item.startDate), compactDate(item.endDate)].filter(Boolean).join("–");
    if (date) parts.push(date);
  }
  if (item.minNights && item.maxNights) parts.push(`${item.minNights}–${item.maxNights} nocy`);
  else if (item.maxNights) parts.push(`do ${item.maxNights} nocy`);
  else if (item.minNights) parts.push(`od ${item.minNights} nocy`);
  if (item.maxPrice) parts.push(`do ${item.maxPrice.toLocaleString("pl-PL")} zł/os.`);
  return parts.length ? parts.join(" · ") : "gotowe parametry wyszukiwania";
}

function formatDate(value?: string) {
  if (!value) return null;
  return new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00Z`));
}

export const dynamicParams = false;

export function generateStaticParams() {
  return allSeoLandings.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getAllSeoLanding(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.lead,
    alternates: { canonical: `/podroze/${page.slug}` },
    openGraph: {
      title: `${page.title} | Tripownia.pl`,
      description: page.lead,
      type: "website",
      locale: "pl_PL",
      siteName: "Tripownia",
      url: `/podroze/${page.slug}`,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${page.title} — Tripownia.pl` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | Tripownia.pl`,
      description: page.lead,
      images: ["/opengraph-image"],
    },
  };
}

export default async function SeoLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getAllSeoLanding(slug);
  if (!page) notFound();

  const rawStartDate = "startDate" in page ? page.startDate : undefined;
  const rawEndDate = "endDate" in page ? page.endDate : undefined;
  const startDate = typeof rawStartDate === "string" ? rawStartDate : undefined;
  const endDate = typeof rawEndDate === "string" ? rawEndDate : undefined;
  const guide = getPracticalGuide(page.query);
  const heroVisual = landingHeroVisual(page.query);
  const faqItems = landingFaq(page.query, page.departure);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const dateRange = startDate || endDate
    ? [formatDate(startDate), formatDate(endDate)].filter(Boolean).join(" – ")
    : "Elastyczny termin";
  const stayRange = page.minNights && page.maxNights
    ? `${page.minNights}–${page.maxNights} nocy`
    : page.minNights
      ? `od ${page.minNights} nocy`
      : page.maxNights
        ? `do ${page.maxNights} nocy`
        : "Dobierz w wyszukiwarce";
  const budgetLabel = page.maxPrice ? `do ${page.maxPrice.toLocaleString("pl-PL")} zł/os.` : "Porównaj pełny koszt";

  const bookingUrl = partners.booking.buildUrl(
    `https://www.booking.com/searchresults.pl.html?ss=${encodeURIComponent(page.query)}`
  );

  const kiwiDeep = new URL("https://www.kiwi.com/deep");
  kiwiDeep.searchParams.set("from", page.departureCode || "WAW");
  kiwiDeep.searchParams.set("to", page.kiwiCode || "anywhere");
  kiwiDeep.searchParams.set("sort", "price");
  kiwiDeep.searchParams.set("asc", "1");
  kiwiDeep.searchParams.set("currency", "PLN");
  kiwiDeep.searchParams.set("locale", "pl");

  const kiwiUrl = partners.kiwi.buildUrl(kiwiDeep.toString());

  const alertParams = new URLSearchParams({ destination: page.query });
  if (page.departure) alertParams.set("departure", page.departure);
  if (page.maxPrice) alertParams.set("maxPrice", String(page.maxPrice));

  const departureHubHref =
    page.departure === "Warszawa" ? "/z-warszawy" :
    page.departure === "Kraków" ? "/z-krakowa" :
    page.departure === "Poznań" ? "/z-poznania" :
    page.departure === "Gdańsk" ? "/z-gdanska" :
    page.departure === "Katowice" ? "/z-katowic" :
    page.departure === "Wrocław" ? "/z-wroclawia" :
    undefined;

  const airportCluster = page.departure
    ? allSeoLandings
        .filter((item) => item.slug !== page.slug && item.departure === page.departure)
        .sort((a, b) => {
          const order = ["City break", "Tanie loty", "Wakacje", "Last Minute", "All Inclusive"];
          const ai = order.findIndex((label) => a.query === label);
          const bi = order.findIndex((label) => b.query === label);
          return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
        })
        .slice(0, 8)
    : [];

  const commercialSiblingLinks = allSeoLandings
    .filter((item) => item.slug !== page.slug)
    .filter((item) => {
      const sameDeparture = Boolean(page.departure && item.departure === page.departure);
      const sameQuery = item.query === page.query;
      const sameCountryFamily = ["Egipt","Turcja","Grecja","Cypr"].includes(page.query) && item.query === page.query;
      const bothBudget = Boolean(page.maxPrice && item.maxPrice);
      return sameDeparture && (sameQuery || sameCountryFamily || bothBudget);
    })
    .slice(0, 5);

  const related = allSeoLandings
    .filter((item) => item.slug !== page.slug && !airportCluster.some((cluster) => cluster.slug === item.slug))
    .sort((a, b) => {
      const queryMatchA = Number(a.query === page.query);
      const queryMatchB = Number(b.query === page.query);
      const departureMatchA = Number(Boolean(page.departure && a.departure === page.departure));
      const departureMatchB = Number(Boolean(page.departure && b.departure === page.departure));
      return (queryMatchB * 2 + departureMatchB) - (queryMatchA * 2 + departureMatchA);
    })
    .slice(0, 6);

  const quickFacts = [
    { label: "TERMIN", value: dateRange },
    { label: "POBYT", value: stayRange },
    { label: "WYLOT", value: page.departure || "Wybierz lotnisko" },
    { label: "BUDŻET", value: budgetLabel },
  ];

  const discoveryLinks = [...airportCluster, ...commercialSiblingLinks, ...related]
    .filter((item, index, items) => items.findIndex((candidate) => candidate.slug === item.slug) === index)
    .slice(0, 8);
  const currentReadySearchHref = readySearchHref(page);

  return (
    <main className="seo-travel-landing-v3">
      <SiteHeader />
      <SalesCollectionSchema name={page.title} description={page.lead} path={`/podroze/${page.slug}`} about={[page.query, page.departure ? `${page.query} z ${page.departure}` : "tanie podróże"]} />
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "Pomysły na podróże", url: "https://tripownia.pl/podroze" },
        { name: page.title, url: `https://tripownia.pl/podroze/${page.slug}` },
      ]}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />

      <section className="seo-intent-hero">
        <div className="shell seo-intent-hero-inner">
          <div className="seo-intent-copy">
            <div className="kicker">{page.eyebrow}</div>
            <h1>{page.title}</h1>
            <p>{page.lead}</p>
            <div className="seo-hero-actions">
              <a className="primary-cta" href="#aktualne-oferty">Zobacz aktualne oferty ↓</a>
              <Link className="secondary-cta" href={currentReadySearchHref}>Zmień parametry</Link>
              <Link className="secondary-cta" href={`/alerty?${alertParams.toString()}`}>Ustaw alert</Link>
              {departureHubHref && <Link className="secondary-cta" href={departureHubHref}>Wszystkie wyjazdy z {page.departure}</Link>}
            </div>
          </div>

          <div className="seo-intent-aside">
            <div className="seo-intent-photo">
              <Image
                src={heroVisual.src}
                alt={heroVisual.alt}
                fill
                sizes="(max-width: 980px) 100vw, 420px"
                priority
              />
              <span>Aktualne oferty poniżej</span>
            </div>
            <div className="seo-intent-facts" aria-label="Parametry wyjazdu">
              {quickFacts.map((fact) => (
                <div key={fact.label}>
                  <small>{fact.label}</small>
                  <strong>{fact.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell seo-primary-offers" id="aktualne-oferty">
        <div className="seo-landing-section-head seo-primary-offers-head">
          <div>
            <div className="kicker">AKTUALNE OFERTY</div>
            <h2>Najpierw konkrety</h2>
            <p>{startDate || endDate
              ? "Pokazujemy propozycje zgodne z okresem tej strony. Jeśli nie ma dobrego dopasowania, nie podmieniamy terminu na przypadkowy."
              : "Pokazujemy bieżące propozycje dla tych parametrów i aktualnej dostępności."}</p>
          </div>
          <Link href={currentReadySearchHref}>Wyszukaj po swojemu →</Link>
        </div>

        <SeoEximOffers
          query={page.query}
          departure={page.departure}
          minNights={page.minNights}
          maxNights={page.maxNights}
          maxPrice={page.maxPrice}
          startDate={startDate}
          endDate={endDate}
        />
      </section>
      <section className="section shell seo-social-after-offers"><FacebookFollowCTA placement="seo_landing_after_offers" compact /></section>

      <section className="shell seo-decision-section">
        <div className="seo-decision-head">
          <div className="kicker">ZANIM ZAREZERWUJESZ</div>
          <h2>{guide.heading}</h2>
          <p>{guide.summary}</p>
        </div>

        <div className="seo-decision-grid">
          <article>
            <span>01</span>
            <h3>Co ma największe znaczenie</h3>
            <ul>{guide.bullets.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article>
            <span>02</span>
            <h3>Sprawdź przed rezerwacją</h3>
            <ul>{guide.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </div>

        {page.paragraphs.length > 0 && (
          <div className="seo-editorial-note">
            <strong>Warto wiedzieć</strong>
            {page.paragraphs.map((text) => <p key={text}>{text}</p>)}
          </div>
        )}
      </section>

      <section className="shell seo-search-wider">
        <div className="seo-landing-section-head">
          <div>
            <div className="kicker">NIE PASUJE?</div>
            <h2>Poszerz wyszukiwanie, ale zachowaj kontrolę nad budżetem</h2>
            <p>Sprawdź osobno loty i noclegi albo zmień parametry w wyszukiwarce Tripowni.</p>
          </div>
        </div>

        <div className="seo-search-wider-grid">
          <a href={kiwiUrl} target="_blank" rel="sponsored noopener noreferrer">
            <span>✈️</span>
            <strong>Porównaj loty</strong>
            <small>{page.departure ? `Wylot: ${page.departure}` : "Wybierz lotnisko i kierunek"}</small>
            <b>Sprawdź →</b>
          </a>
          <a href={bookingUrl} target="_blank" rel="sponsored noopener noreferrer">
            <span>🏨</span>
            <strong>Sprawdź noclegi</strong>
            <small>Porównaj koszt hotelu osobno</small>
            <b>Sprawdź →</b>
          </a>
          <Link href={currentReadySearchHref}>
            <span>🔎</span>
            <strong>Zmień parametry</strong>
            <small>Termin, kierunek, lotnisko lub budżet</small>
            <b>Wyszukaj →</b>
          </Link>
          <Link href={`/alerty?${alertParams.toString()}`}>
            <span>🔔</span>
            <strong>Ustaw alert</strong>
            <small>Wróć do tematu, gdy pojawi się lepsza opcja</small>
            <b>Ustaw →</b>
          </Link>
        </div>
      </section>

      <section className="shell seo-faq-section">
        <div className="kicker">PYTANIA I ODPOWIEDZI</div>
        <h2>{page.query}{page.departure ? ` z ${page.departure}` : ""} — najczęstsze pytania</h2>
        <div className="seo-faq-list">
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {discoveryLinks.length > 0 && (
        <section className="shell seo-discovery-section">
          <div className="seo-landing-section-head">
            <div>
              <div className="kicker">PODOBNE WYSZUKIWANIA</div>
              <h2>Jeśli chcesz porównać inne warianty</h2>
              <p>Najbardziej zbliżone strony z tym samym lotniskiem, budżetem, terminem lub typem wyjazdu.</p>
            </div>
          </div>
          <div className="seo-discovery-grid">
            {discoveryLinks.map((item) => (
              <Link key={item.slug} href={readySearchHref(item)}>
                <small>{readySearchMeta(item)}</small>
                <strong>{item.title}</strong>
                <span>Pokaż gotowe wyniki →</span>
              </Link>
            ))}
          </div>
          <div className="seo-discovery-footer">
            <Link href="/podroze">Wszystkie pomysły na podróże</Link>
            <Link href="/okazje">Aktualne okazje</Link>
            <Link href="/planer-podrozy">Darmowy planer podróży</Link>
            {departureHubHref && <Link href={departureHubHref}>Wszystkie wyjazdy z {page.departure}</Link>}
          </div>
        </section>
      )}


      <SiteFooter />
    </main>
  );
}
