import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BusFront,
  CircleHelp,
  Clock3,
  FileCheck2,
  Languages,
  Luggage,
  MapPin,
  PlaneTakeoff,
  Route,
  ShieldCheck,
  Smartphone,
  TicketCheck,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
  title: "Pierwszy lot samolotem krok po kroku – lotnisko, odprawa i boarding",
  description: "Pierwszy lot samolotem? Tripownia prowadzi krok po kroku: odprawa, bagaż, kontrola bezpieczeństwa, gate, boarding, lot, przesiadka i odbiór bagażu.",
  alternates: { canonical: "/pierwszy-lot" },
  openGraph: {
    title: "Pierwszy lot samolotem – krok po kroku | Tripownia.pl",
    description: "Bez lotniskowego żargonu: co zrobić przed lotem, na lotnisku, przy kontroli, gate, boardingu i po lądowaniu.",
    url: "https://tripownia.pl/pierwszy-lot",
  },
  robots: { index: true, follow: true },
};

const airportSteps = [
  {
    icon: FileCheck2,
    title: "1. Zanim wyjdziesz z domu",
    text: "Miej dokument, boarding pass lub numer rezerwacji, sprawdź lotnisko i godzinę. Jeśli masz bagaż rejestrowany, zostaw więcej czasu.",
  },
  {
    icon: TicketCheck,
    title: "2. Po wejściu na lotnisko",
    text: "Patrz na tablicę ODLOTY / DEPARTURES. Przy swoim locie znajdziesz numer stanowiska odprawy lub informację, że możesz iść prosto do kontroli bezpieczeństwa.",
  },
  {
    icon: ShieldCheck,
    title: "3. Kontrola bezpieczeństwa",
    text: "Pokazujesz kartę pokładową, przechodzisz kontrolę i stosujesz się do oznaczeń. Jeśli czegoś nie wiesz, obsługa pokaże Ci, co wyjąć z bagażu.",
  },
  {
    icon: MapPin,
    title: "4. Znajdź gate",
    text: "Po kontroli sprawdź na ekranie numer bramki. Gate może pojawić się później, więc patrz na ekrany i nie odchodź za daleko przed boardingiem.",
  },
  {
    icon: PlaneTakeoff,
    title: "5. Boarding i samolot",
    text: "Przy bramce pokazujesz dokument i boarding pass. W samolocie znajdź numer miejsca, schowaj bagaż i włącz tryb samolotowy zgodnie z komunikatami załogi.",
  },
  {
    icon: Luggage,
    title: "6. Po lądowaniu",
    text: "Kieruj się znakami ARRIVALS / BAGGAGE CLAIM. Jeśli nadałeś bagaż, na ekranie sprawdź numer taśmy dla swojego lotu. Potem idź do wyjścia lub transferu.",
  },
];

const worries = [
  ["Nie znam angielskiego. Co zrobię?", "Na większości lotnisk wystarczą znaki, numer lotu i boarding pass. Miej pod ręką nazwę kierunku, numer lotu i dokument. W razie potrzeby pokaż ekran telefonu pracownikowi lotniska."],
  ["A jeśli nie znajdę gate?", "Sprawdź numer lotu na ekranie odlotów. Gate może się zmienić, dlatego zawsze kieruj się numerem lotu, nie tylko wcześniejszą informacją w aplikacji."],
  ["A jeśli nie mam wydrukowanej karty pokładowej?", "W wielu liniach wystarcza karta w telefonie, ale zasady zależą od przewoźnika i lotniska. Sprawdź wymagania swojej linii przed wyjazdem."],
  ["Czy mogę pójść do toalety w samolocie?", "Tak. Po zgaszeniu sygnalizacji zapięcia pasów możesz korzystać z toalety, chyba że załoga poprosi pasażerów o pozostanie na miejscach."],
  ["Co jeśli samolot się trzęsie?", "Turbulencje są normalnym zjawiskiem podczas lotu. Zostań na miejscu, zapnij pas i stosuj się do komunikatów załogi."],
  ["Co jeśli mam przesiadkę?", "Po wyjściu z samolotu szukaj znaków TRANSFER / CONNECTING FLIGHTS. Nie wychodź automatycznie do odbioru bagażu, jeśli bagaż został nadany do miejsca docelowego."],
  ["Co jeśli mój bagaż nie pojawi się na taśmie?", "Zanim opuścisz strefę odbioru bagażu, zgłoś się do punktu obsługi bagażowej linii lub lotniska i zachowaj potwierdzenie nadania bagażu."],
] as const;

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Pierwszy lot samolotem krok po kroku",
  description: "Co zrobić na lotnisku od wejścia do terminala aż po odbiór bagażu po lądowaniu.",
  step: airportSteps.map((step) => ({
    "@type": "HowToStep",
    name: step.title,
    text: step.text,
  })),
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: worries.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function FirstFlightPage() {
  return (
    <main>
      <SiteHeader />
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "Przed wyjazdem", url: "https://tripownia.pl/przed-wyjazdem" },
        { name: "Pierwszy lot", url: "https://tripownia.pl/pierwszy-lot" },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />

      <article className="shell guides-hub before-trip-hub">
        <header className="guides-hero">
          <div className="guides-hero-icon"><PlaneTakeoff size={28}/></div>
          <div>
            <div className="kicker">LECĘ PIERWSZY RAZ</div>
            <h1>Pierwszy lot? Tripownia przeprowadzi Cię przez lotnisko krok po kroku.</h1>
            <p>Nie musisz znać słów „check-in”, „gate” czy „boarding”. Wystarczy wiedzieć, co zrobić jako następne — od zakupu wyjazdu aż do wyjścia z lotniska po lądowaniu.</p>
          </div>
        </header>

        <nav className="guides-quick-links" aria-label="Od czego zaczynasz pierwszy lot">
          <Link href="#jeszcze-nie-mam-wyjazdu"><Route size={18}/><span>Nie mam jeszcze wyjazdu</span></Link>
          <Link href="#mam-bilet"><TicketCheck size={18}/><span>Mam już bilet</span></Link>
          <Link href="#lotnisko"><MapPin size={18}/><span>Boję się lotniska</span></Link>
          <Link href="#przesiadka"><Route size={18}/><span>Mam przesiadkę</span></Link>
        </nav>

        <section className="guides-checklist" id="jeszcze-nie-mam-wyjazdu">
          <div>
            <div className="kicker">NAJPROSTSZY START</div>
            <h2>Jeśli lecisz pierwszy raz, ogranicz liczbę rzeczy do ogarnięcia.</h2>
            <p>Na pierwszy wyjazd wygodniejszy bywa lot bez przesiadki, sensowne godziny, jedno miejsce noclegowe i gotowy pakiet lot + hotel lub All Inclusive. Nie chodzi o najtańszy wyjazd za wszelką cenę, tylko o prostszą podróż.</p>
          </div>
          <div className="guides-checklist-actions">
            <Link className="primary-cta" href="/lot-hotel">Zobacz lot + hotel <ArrowRight size={17}/></Link>
            <Link href="/tanie-all-inclusive">All Inclusive</Link>
            <Link href="/city-break">Krótki city break</Link>
          </div>
        </section>

        <section className="before-trip-timeline" id="lotnisko">
          <div className="kicker">NA LOTNISKU KROK PO KROKU</div>
          <h2>Patrz tylko na następny krok</h2>
          <div className="before-trip-timeline-grid">
            {airportSteps.map(({ icon: Icon, title, text }, index) => (
              <article key={title}>
                <strong>{index + 1}</strong>
                <div>
                  <span><Icon size={16}/> {title.replace(/^\d+\.\s*/, "")}</span>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="guides-section-grid" id="mam-bilet">
          <article className="guides-section-card">
            <div className="guides-section-head"><Smartphone size={22}/><div><h2>Boarding pass</h2><p>Karta pokładowa to „bilet do wejścia do samolotu”. Może być w aplikacji, telefonie lub — zależnie od linii — w wersji papierowej.</p></div></div>
            <Link className="before-trip-card-link" href="/czy-trzeba-drukowac-karte-pokladowa-odprawa-online-krok-po-kroku">Jak wygląda odprawa online <ArrowRight size={16}/></Link>
          </article>
          <article className="guides-section-card">
            <div className="guides-section-head"><Luggage size={22}/><div><h2>Bagaż</h2><p>Najpierw sprawdź, jaki bagaż masz w swojej taryfie. „Podręczny” nie zawsze oznacza to samo w każdej linii.</p></div></div>
            <Link className="before-trip-card-link" href="/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych">Sprawdź zasady bagażu <ArrowRight size={16}/></Link>
          </article>
          <article className="guides-section-card">
            <div className="guides-section-head"><ShieldCheck size={22}/><div><h2>Płyny i kontrola</h2><p>Nie ucz się zasad „na pamięć” z TikToka. Sprawdź aktualne zasady dla konkretnego lotniska, z którego wylatujesz.</p></div></div>
            <Link className="before-trip-card-link" href="/lotniska-w-polsce-bez-limitu-100-ml-plynow">Płyny na polskich lotniskach <ArrowRight size={16}/></Link>
          </article>
          <article className="guides-section-card">
            <div className="guides-section-head"><BusFront size={22}/><div><h2>Po lądowaniu</h2><p>Jeszcze przed lotem zapisz sobie sposób dojazdu z lotniska do noclegu. To szczególnie ważne przy późnym przylocie.</p></div></div>
            <Link className="before-trip-card-link" href="/jak-dojechac-z-lotniska-do-centrum-miasta-najtansze-opcje-transportu">Jak dojechać z lotniska <ArrowRight size={16}/></Link>
          </article>
        </section>

        <section className="seo-related-block" id="przesiadka" style={{ marginTop: 28 }}>
          <div className="kicker">PRZESIADKA BEZ PANIKI</div>
          <h2>Najważniejsze: nie idź za tłumem, tylko za znakami TRANSFER / CONNECTING FLIGHTS.</h2>
          <p>Sprawdź numer kolejnego lotu i nowy gate. Jeśli oba loty są na jednej rezerwacji, bagaż rejestrowany często leci dalej automatycznie — ale zawsze potwierdź to przy nadaniu bagażu.</p>
          <div className="seo-related-links" style={{ marginTop: 12 }}>
            <Link href="/przed-wyjazdem">Checklista przed wyjazdem →</Link>
            <Link href="/transfery">Transfer po przylocie →</Link>
            <Link href="/esim">Internet za granicą →</Link>
          </div>
        </section>

        <section className="seo-faq-section">
          <div className="kicker">NAJCZĘSTSZE OBAWY</div>
          <h2>Pytania, które wiele osób ma przed pierwszym lotem</h2>
          <div className="seo-faq-list">
            {worries.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="guides-checklist before-trip-cta">
          <div>
            <div className="kicker">NIE CHCESZ PAMIĘTAĆ WSZYSTKIEGO?</div>
            <h2>Dodaj wyjazd do planera i wracaj tylko do następnego kroku.</h2>
            <p>Tripownia może trzymać lot, nocleg, checklistę, plan dnia i rzeczy do zrobienia. To wygodniejsze niż trzymanie wszystkiego w kilku mailach i screenshotach.</p>
          </div>
          <div className="guides-checklist-actions">
            <Link className="primary-cta" href="/dodaj-podroz">Dodaj mój wyjazd <ArrowRight size={17}/></Link>
            <Link href="/przed-wyjazdem">Pełna checklista</Link>
          </div>
        </section>

        <section className="seo-related-block" style={{ marginTop: 28 }}>
          <div className="kicker">SŁOWNICZEK LOTNISKOWY</div>
          <div className="seo-related-links" style={{ marginTop: 12 }}>
            <span><strong>Departures</strong> — odloty</span>
            <span><strong>Check-in</strong> — odprawa</span>
            <span><strong>Security</strong> — kontrola bezpieczeństwa</span>
            <span><strong>Gate</strong> — bramka do wejścia na pokład</span>
            <span><strong>Boarding</strong> — wejście do samolotu</span>
            <span><strong>Baggage claim</strong> — odbiór bagażu</span>
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
