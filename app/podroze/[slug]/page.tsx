import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SeoEximOffers from "@/components/SeoEximOffers";
import { partners } from "@/lib/partners";
import { allSeoLandings, getAllSeoLanding } from "@/lib/allSeoLandings";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

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
      url: `/podroze/${page.slug}`,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: page.title }],
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

  return (
    <main>
      <SiteHeader />
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "Pomysły na podróże", url: "https://tripownia.pl/podroze" },
        { name: page.title, url: `https://tripownia.pl/podroze/${page.slug}` },
      ]}/>

      <section className="seo-landing-hero" style={{ padding: "44px 0 40px" }}>
        <div className="shell">
          <div className="kicker">{page.eyebrow}</div>
          <h1 style={{ fontSize: "clamp(38px,4.8vw,58px)", lineHeight: 1.02, letterSpacing: "-2.4px", maxWidth: 900, margin: "12px 0 14px" }}>{page.title}</h1>
          <p style={{ maxWidth: 760, fontSize: 17, lineHeight: 1.55, margin: 0 }}>{page.lead}</p>
          <div className="seo-hero-actions" style={{ marginTop: 18 }}>
            <Link className="primary-cta" href="/#wyszukiwarka">Ustaw własne parametry →</Link>
            <a className="secondary-cta" href="#aktualne-oferty">Zobacz oferty</a>
            <Link className="secondary-cta" href={`/alerty?${alertParams.toString()}`}>Ustaw alert →</Link>
          </div>
        </div>
      </section>

      <section className="shell" style={{ padding: "30px 0 8px" }}>
        <div className="kicker">NA SZYBKO</div>
        <h2 style={{ margin: "7px 0 16px", fontSize: "clamp(25px,3vw,34px)", letterSpacing: "-1.2px" }}>Najważniejsze informacje przed szukaniem oferty</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
          {quickFacts.map((fact) => (
            <div key={fact.label} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, padding: "16px 18px", minHeight: 92 }}>
              <div style={{ fontSize: 10, letterSpacing: "1.2px", fontWeight: 900, color: "var(--accent)", marginBottom: 7 }}>{fact.label}</div>
              <strong style={{ display: "block", fontSize: 16, lineHeight: 1.35 }}>{fact.value}</strong>
            </div>
          ))}
        </div>
      </section>

      {airportCluster.length > 0 && (
        <section className="shell seo-related-block" aria-label={`Więcej wyjazdów z ${page.departure}`}>
          <div className="kicker">WIĘCEJ Z TEGO LOTNISKA</div>
          <h2>Sprawdź inne typy wyjazdów z {page.departure}</h2>
          <div className="seo-related-links">
            {airportCluster.map((item) => (
              <Link key={item.slug} href={`/podroze/${item.slug}`}>{item.title} →</Link>
            ))}
          </div>
        </section>
      )}

      <section className="shell seo-offer-section" id="aktualne-oferty">
        <div className="section-heading">
          <div>
            <div className="kicker">AKTUALNE OFERTY</div>
            <h2>Najlepsze dostępne propozycje dla tego wyszukiwania</h2>
            <p>{startDate || endDate ? "Filtrujemy również realną datę wylotu — nie podstawiamy ofert z innego miesiąca." : "Pobieramy bieżące produkty, ceny i terminy automatycznie. Każda karta prowadzi do konkretnej oferty."}</p>
          </div>
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

      <section className="shell" style={{ padding: "10px 0 48px", maxWidth: 980 }}>
        <div className="kicker">PRAKTYCZNIE</div>
        <h2 style={{ margin: "7px 0 12px", fontSize: "clamp(28px,3.4vw,40px)", letterSpacing: "-1.5px" }}>{guide.heading}</h2>
        <p style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.65, maxWidth: 850 }}>{guide.summary}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18, marginTop: 22 }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 18, padding: 22 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 20 }}>Co ma największe znaczenie</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: "var(--muted)", lineHeight: 1.65 }}>
              {guide.bullets.map((item) => <li key={item} style={{ marginBottom: 8 }}>{item}</li>)}
            </ul>
          </div>
          <div style={{ background: "#fff8f3", border: "1px solid #f2ded2", borderRadius: 18, padding: 22 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 20 }}>Sprawdź przed rezerwacją</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#5f5955", lineHeight: 1.65 }}>
              {guide.checklist.map((item) => <li key={item} style={{ marginBottom: 8 }}>{item}</li>)}
            </ul>
          </div>
        </div>

        <div style={{ marginTop: 26 }}>
          {page.paragraphs.map((text) => <p key={text} style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: 16 }}>{text}</p>)}
        </div>
      </section>

      <section className="shell seo-partners-section">
        <div className="section-heading">
          <div>
            <div className="kicker">SZUKAJ SZERZEJ</div>
            <h2>Porównaj aktualne ceny</h2>
          </div>
        </div>
        <div className="big-partner-grid">
          <a href={kiwiUrl} target="_blank" rel="sponsored noopener noreferrer"><span>🛫</span><strong>Loty</strong><small>Porównaj ceny</small><b>Porównaj →</b></a>
          <a href={bookingUrl} target="_blank" rel="sponsored noopener noreferrer"><span>🏨</span><strong>Noclegi</strong><small>Noclegi w wybranym miejscu</small><b>Sprawdź hotele →</b></a>
        </div>
      </section>

      <section className="shell seo-related-block">
        <div className="kicker">MOŻE CIĘ TEŻ ZAINTERESOWAĆ</div>
        <div className="seo-related-links">
          {related.map((item) => <Link key={item.slug} href={`/podroze/${item.slug}`}>{item.title} →</Link>)}
        </div>
        <div className="seo-related">
          <Link href="/podroze">← Wszystkie pomysły na podróże</Link>
          <Link href="/kierunki">Zobacz wszystkie kierunki →</Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
