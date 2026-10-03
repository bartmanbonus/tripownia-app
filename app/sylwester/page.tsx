import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewYearOffers from "@/components/NewYearOffers";
import SearchHub from "@/components/SearchHub";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import SalesCollectionSchema from "@/components/SalesCollectionSchema";

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
    airport?: string;
    budget?: string;
    duration?: string;
    board?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedDestination = typeof params.destination === "string" ? params.destination : "";
  const selectedAirports = typeof params.airport === "string" ? params.airport.split(",").map((item) => item.trim()).filter(Boolean) : [];
  const selectedBudget = typeof params.budget === "string" ? params.budget : "all";
  const selectedDuration = typeof params.duration === "string" ? params.duration : "all";
  const selectedBoard = typeof params.board === "string" ? params.board : "all";
  const selectedFrom = typeof params.from === "string" ? params.from : "2026-12-27";
  const selectedTo = typeof params.to === "string" ? params.to : "2027-01-03";
  const hasReadySearch = Boolean(selectedDestination || selectedAirports.length || selectedBudget !== "all" || selectedDuration !== "all" || selectedBoard !== "all");

  return (
    <main>
      <SiteHeader />
      <SalesCollectionSchema name="City break Sylwester 2026/2027" description={description} path="/sylwester" about={["city break sylwester 2026","sylwester za granicą","lot + hotel","Sylwester 2026/2027"]} />
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
            key={`${selectedDestination}|${selectedAirports.join(",")}|${selectedBudget}|${selectedDuration}|${selectedBoard}|${selectedFrom}|${selectedTo}`}
            embedded
            initialTab="Lot + hotel"
            initialDestinations={selectedDestination ? [selectedDestination] : []}
            initialAirports={selectedAirports}
            initialBudget={selectedBudget}
            initialDuration={selectedDuration}
            initialBoard={selectedBoard}
            initialDateMode="range"
            initialDateFrom={selectedFrom}
            initialDateTo={selectedTo}
            searchRequest={hasReadySearch ? 1 : 0}
          />
        </div>
      </section>

      <NewYearOffers />
      <section className="section shell"><FacebookFollowCTA placement="sylwester_after_offers" compact /></section>

      <section className="section shell newyear-ready-searches">
        <div className="section-heading">
          <div>
            <div className="kicker">GOTOWE WYSZUKIWANIA</div>
            <h2>Nie klikaj w ciemno — wybierz już ustawiony wyjazd</h2>
            <p>Każdy kafel ma konkretny kierunek albo lotnisko, daty, długość pobytu i budżet. Kliknięcie od razu uruchamia wyszukiwanie z tymi parametrami.</p>
          </div>
        </div>
        <div className="newyear-ready-grid">
          <Link className="newyear-ready-card" href="/szukaj?airport=WAWA&budget=2000&duration=3-6&tab=Lot%20%2B%20hotel&from=2026-12-27&to=2027-01-03">
            <small>WARSZAWA · DO 2 000 ZŁ/OS.</small>
            <strong>Najtańszy city break na Sylwestra</strong>
            <span>27.12–03.01 · 3–6 nocy · WAW + WMI</span>
            <b>Pokaż wyniki od najtańszych →</b>
          </Link>
          <Link className="newyear-ready-card" href="/szukaj?destination=Budapeszt&duration=4&tab=Lot%20%2B%20hotel&from=2026-12-30&to=2027-01-03">
            <small>BUDAPESZT · 4 NOCE</small>
            <strong>Budapeszt na przełom roku</strong>
            <span>30.12–03.01 · termy · Dunaj · centrum</span>
            <b>Znajdź lot + hotel →</b>
          </Link>
          <Link className="newyear-ready-card" href="/szukaj?destination=Rzym&duration=4&tab=Lot%20%2B%20hotel&from=2026-12-29&to=2027-01-02">
            <small>RZYM · 4 NOCE</small>
            <strong>Rzym na Sylwestra</strong>
            <span>29.12–02.01 · lot + hotel · city break</span>
            <b>Pokaż dostępne warianty →</b>
          </Link>
          <Link className="newyear-ready-card" href="/szukaj?destination=Malta&duration=5&tab=Lot%20%2B%20hotel&from=2026-12-29&to=2027-01-03">
            <small>MALTA · 5 NOCY</small>
            <strong>Malta — trochę cieplej, nadal krótko</strong>
            <span>29.12–03.01 · Valletta · Sliema · lot + hotel</span>
            <b>Znajdź aktualne oferty →</b>
          </Link>
          <Link className="newyear-ready-card" href="/szukaj?airport=WAWA&budget=3000&duration=7-12&board=all%20inclusive&tab=All%20Inclusive&from=2026-12-27&to=2027-01-05">
            <small>CIEPŁO · ALL INCLUSIVE · DO 3 000 ZŁ/OS.</small>
            <strong>Tydzień w cieple z Warszawy</strong>
            <span>27.12–05.01 · 7–12 nocy · All Inclusive</span>
            <b>Pokaż najtańsze ciepłe opcje →</b>
          </Link>
          <Link className="newyear-ready-card" href="/szukaj?airport=POZ&budget=2000&duration=3-6&tab=Lot%20%2B%20hotel&from=2026-12-27&to=2027-01-03">
            <small>POZNAŃ · DO 2 000 ZŁ/OS.</small>
            <strong>Sylwester z Poznania</strong>
            <span>27.12–03.01 · 3–6 nocy · różne kierunki</span>
            <b>Pokaż realne wyniki z POZ →</b>
          </Link>
        </div>
      </section>

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
