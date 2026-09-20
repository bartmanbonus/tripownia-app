import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Luggage, Map, Plane, ShieldCheck, Sparkles, SunMedium } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Poradniki podróżnicze 2026 – bagaż, lotniska, kierunki i przygotowanie",
  description: "Praktyczne poradniki podróżnicze Tripowni: bagaż podręczny, jedzenie w samolocie, lotniska, transfery, ciepłe kierunki, city breaki i przygotowanie do wyjazdu.",
  alternates: { canonical: "/poradniki" },
  openGraph: {
    title: "Poradniki podróżnicze 2026 | Tripownia.pl",
    description: "Bagaż, lotniska, dokumenty, kierunki i praktyczne przygotowanie do podróży.",
    url: "https://tripownia.pl/poradniki",
  },
  robots: { index: true, follow: true },
};

const sections = [
  {
    icon: BookOpen,
    title: "Planowanie podróży",
    description: "Od pomysłu na wyjazd do planu dnia i gotowej checklisty.",
    links: [
      ["Darmowy planer podróży – jak zacząć", "/planer-podrozy"],
      ["Checklista przed wyjazdem", "/przed-wyjazdem"],
      ["Kierunki i pomysły na podróż", "/kierunki"],
    ],
  },
  {
    icon: Luggage,
    title: "Bagaż i lotnisko",
    description: "Zasady, które najczęściej sprawdzasz tuż przed wylotem.",
    links: [
      ["Limit płynów 100 ml na polskich lotniskach", "/lotniska-w-polsce-bez-limitu-100-ml-plynow"],
      ["Czy można mieć dwa bagaże podręczne?", "/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych"],
      ["Czy można wnieść jedzenie do samolotu?", "/czy-mozna-wniesc-jedzenie-do-samolotu-co-wolno-zabrac-na-poklad"],
    ],
  },
  {
    icon: Plane,
    title: "Lot i dojazd",
    description: "Co zrobić, kiedy liczy się logistyka i czas na miejscu.",
    links: [
      ["Jak najtaniej dojechać z lotniska do centrum", "/jak-dojechac-z-lotniska-do-centrum-miasta-najtansze-opcje-transportu"],
      ["Co zrobić po odwołaniu lotu do Katanii", "/etna-sparalizowala-loty-na-sycylie-co-zrobic-po-odwolaniu-lotu-do-katanii"],
      ["Transfer czy transport publiczny?", "/transfery"],
    ],
  },
  {
    icon: SunMedium,
    title: "Gdzie i kiedy lecieć",
    description: "Kierunki dobrane do sezonu, pogody i długości wyjazdu.",
    links: [
      ["Gdzie jest ciepło w listopadzie?", "/gdzie-jest-cieplo-w-listopadzie"],
      ["Gdzie na wakacje we wrześniu?", "/gdzie-na-wakacje-we-wrzesniu"],
      ["Gdzie polecieć na weekend z Polski?", "/gdzie-poleciec-na-weekend-z-polski-12-pomyslow-na-city-break"],
      ["Gdzie na Sylwestra 2026/2027?", "/gdzie-na-sylwestra-2026-2027-15-kierunkow"],
    ],
  },
  {
    icon: Map,
    title: "Kierunki",
    description: "Porównania regionów i miejsc, które pomagają wybrać właściwą bazę.",
    links: [
      ["Wietnam – Hanoi, Da Nang czy Phu Quoc?", "/wietnam"],
      ["Grecja – którą wyspę wybrać?", "/grecja"],
      ["Hiszpania – gdzie nad morze?", "/hiszpania"],
      ["Cypr – Pafos, Larnaka czy Ayia Napa?", "/cypr"],
      ["Albania – Saranda, Ksamil czy Vlora?", "/albania"],
      ["Malta – gdzie spać i ile dni zaplanować?", "/malta"],
    ],
  },
];

const checklist = [
  "Sprawdź dokumenty i wymagania wjazdowe w aktualnym źródle.",
  "Potwierdź limity bagażu dla konkretnej taryfy i linii lotniczej.",
  "Zapisz bilety, rezerwacje i adres noclegu offline.",
  "Zaplanuj dojazd z lotniska i zapasową metodę płatności.",
  "Sprawdź pogodę ponownie 2–3 dni przed wyjazdem.",
  "Przygotuj internet, transfer i najważniejsze atrakcje przed lądowaniem.",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Poradniki podróżnicze Tripowni",
  url: "https://tripownia.pl/poradniki",
  description: "Praktyczne poradniki o bagażu, lotniskach, kierunkach i przygotowaniu do podróży.",
};

export default function GuidesPage() {
  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="shell guides-hub">
        <header className="guides-hero">
          <div className="guides-hero-icon"><BookOpen size={28}/></div>
          <div>
            <div className="kicker">PORADNIKI TRIPOWNI</div>
            <h1>Najpierw odpowiedź. Potem rezerwacja.</h1>
            <p>Praktyczne informacje dla podróżujących: bagaż, lotniska, kierunki, dojazdy i przygotowanie do wyjazdu. Bez przekopywania przypadkowych wyników.</p>
          </div>
        </header>

        <nav className="guides-quick-links" aria-label="Najważniejsze narzędzia przed podróżą">
          <Link href="/okazje"><Sparkles size={18}/><span>Znajdź wyjazd</span></Link>
          <Link href="/atrakcje"><Map size={18}/><span>Atrakcje</span></Link>
          <Link href="/transfery"><Plane size={18}/><span>Transfer</span></Link>
          <Link href="/organizer"><ShieldCheck size={18}/><span>Organizer</span></Link>
        </nav>

        <div className="guides-section-grid">
          {sections.map(({ icon: Icon, title, description, links }) => (
            <section className="guides-section-card" key={title}>
              <div className="guides-section-head"><Icon size={22}/><div><h2>{title}</h2><p>{description}</p></div></div>
              <div className="guides-link-list">
                {links.map(([label, href]) => <Link href={href} key={href}><span>{label}</span><ArrowRight size={16}/></Link>)}
              </div>
            </section>
          ))}
        </div>

        <section className="guides-checklist">
          <div>
            <div className="kicker">PRZED WYLOTEM</div>
            <h2>Krótka checklista, która zamyka większość problemów przed podróżą</h2>
            <p>To nie zastępuje aktualnych zasad przewoźnika ani wymagań kraju, ale dobrze porządkuje ostatnie przygotowania.</p>
          </div>
          <ol>{checklist.map((item, index) => <li key={item}><strong>{index + 1}</strong><span>{item}</span></li>)}</ol>
          <div className="guides-checklist-actions">
            <Link className="primary-cta" href="/organizer">Otwórz organizer <ArrowRight size={17}/></Link>
            <Link href="/moja-podroz">Moja podróż</Link>
          </div>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}

