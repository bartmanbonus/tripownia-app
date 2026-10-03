import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewYearOffers from "@/components/NewYearOffers";
import SearchHub from "@/components/SearchHub";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";

const title = "City break Sylwester 2026/2027 — lot + hotel za granicą";
const description = "City break na Sylwestra 2026/2027: lot + hotel, krótkie wyjazdy do Europy i ciepłe kierunki na przełom roku. Sprawdź aktualne terminy, ceny i gotowe wyjazdy.";

const faqItems = [
  {
    question: "Gdzie polecieć na Sylwestra 2026/2027 za granicę?",
    answer: "Na krótki city break warto porównywać miasta z dobrymi godzinami lotów, a na ciepły wyjazd kierunki takie jak Egipt, Wyspy Kanaryjskie, Malta, Cypr czy Maroko. Najlepszy wybór zależy od długości pobytu i budżetu.",
  },
  {
    question: "Kiedy rezerwować city break na Sylwestra 2026/2027?",
    answer: "Im bliżej przełomu roku, tym mniej elastyczne bywają loty i noclegi. Warto porównywać kilka kierunków i sąsiednie daty, zamiast czekać wyłącznie na last minute.",
  },
  {
    question: "City break czy All Inclusive na Sylwestra?",
    answer: "City break lepiej sprawdza się przy 3–5 dniach i zwiedzaniu miasta. All Inclusive ma większy sens przy tygodniowym wyjeździe nastawionym na pogodę, hotel i wypoczynek.",
  },
  {
    question: "Jakie daty sprawdzić na Sylwestra 2026/2027?",
    answer: "Dobrym punktem startowym jest zakres 27 grudnia 2026 – 3 stycznia 2027, ale przesunięcie wylotu lub powrotu o 1–2 dni może znacząco zmienić cenę.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sylwester" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title,
    description,
    url: "/sylwester",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
};

type PageProps = {
  searchParams: Promise<{
    destination?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedDestination = typeof params.destination === "string" ? params.destination : "";
  const selectedFrom = typeof params.from === "string" ? params.from : "2026-12-27";
  const selectedTo = typeof params.to === "string" ? params.to : "2027-01-03";

  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <section className="seasonal-hero shell newyear-hero-premium">
        <div className="kicker">CITY BREAK NA SYLWESTRA 2026/2027</div>
        <h1>City break Sylwester 2026/2027 – lot + hotel i gotowe wyjazdy</h1>
        <p>Porównaj krótkie city breaki, tydzień w cieple i dalsze wyjazdy na przełom roku. Najpierw realne terminy i ceny, potem wybór kierunku.</p>
        <div className="newyear-type-nav">
          <a href="#szukaj-sylwester">Znajdź wyjazd do swojego budżetu</a>
          <a href="#city-break">City break 3–6 nocy</a>
          <a href="#dluzsze">Dłuższe 7–12 nocy</a>
        </div>
        <div className="seo-related-links" style={{ marginTop: 16 }}>
          <Link href="/sylwester-all-inclusive-2026-2027-egipt-czy-wyspy-kanaryjskie">Sylwester All Inclusive: Egipt czy Kanary? →</Link>
          <Link href="/podroze/cieple-wakacje-grudzien-2026">Ciepłe wakacje w grudniu 2026 →</Link>
          <Link href="/city-break">City break lot + hotel →</Link>
          <Link href="/podroze/city-break-grudzien-2026">City break grudzień 2026 →</Link>
          <Link href="/podroze/city-break-z-warszawy">City break z Warszawy →</Link>
          <Link href="/podroze/city-break-z-poznania">City break z Poznania →</Link>
          <Link href="/podroze/sylwester-z-warszawy-do-2000-zl">Sylwester z Warszawy do 2000 zł →</Link>
          <Link href="/podroze/grudzien-2026-all-inclusive-do-3000-zl">All Inclusive w grudniu do 3000 zł →</Link>
          <Link href="/planer-podrozy">Ułóż wyjazd w darmowym planerze →</Link>
        </div>
      </section>

      <section className="section shell" id="szukaj-sylwester">
        <div className="section-heading">
          <div>
            <div className="kicker">SZUKAJ PO SWOJEMU</div>
            <h2>Wybierz kierunek, lotnisko i termin na przełom roku</h2>
            <p>Możesz wybrać konkretny kierunek albo Gdziekolwiek, jedno lub kilka lotnisk oraz własny zakres dat.</p>
          </div>
        </div>
        <div className="single-partner-search-wrap">
          <SearchHub
            key={`${selectedDestination}|${selectedFrom}|${selectedTo}`}
            embedded
            initialTab="Lot + hotel"
            initialDestinations={selectedDestination ? [selectedDestination] : []}
            initialDateMode="range"
            initialDateFrom={selectedFrom}
            initialDateTo={selectedTo}
            searchRequest={selectedDestination ? 1 : 0}
          />
        </div>
      </section>

      <NewYearOffers />
      <section className="section shell"><FacebookFollowCTA placement="sylwester_after_offers" compact /></section>

      <section className="section shell">
        <div className="section-heading">
          <div>
            <div className="kicker">SYLWESTER — PYTANIA</div>
            <h2>Najczęstsze pytania przed rezerwacją</h2>
          </div>
        </div>
        <div style={{ display: "grid", gap: 12, maxWidth: 980 }}>
          {faqItems.map((item) => (
            <details key={item.question} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 15, padding: "15px 18px" }}>
              <summary style={{ cursor: "pointer", fontWeight: 900 }}>{item.question}</summary>
              <p style={{ color: "var(--muted)", lineHeight: 1.65, margin: "10px 0 0" }}>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
