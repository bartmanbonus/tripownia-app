import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Darmowy planer podróży – plan wyjazdu krok po kroku";
const description = "Zaplanuj wyjazd z Tripownią: lot, nocleg, atrakcje, plan dnia i checklista w jednym miejscu. Dodaj także podróż zarezerwowaną poza Tripownią.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/planer-podrozy" },
  openGraph: {
    type: "website", locale: "pl_PL", siteName: "Tripownia",
    title, description, url: "/planer-podrozy",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
};

const steps = [
  {
    title: "1. Ustal kierunek, termin i budżet",
    text: "Zacznij od liczby pełnych dni na miejscu. Dolicz dojazdy i zostaw zapas na powrót. W budżecie uwzględnij nie tylko lot i nocleg, ale też bagaż, transport, jedzenie i atrakcje. Jeżeli nie masz jeszcze kierunku, porównaj kilka pomysłów w podobnym terminie.",
    href: "/kierunki", label: "Porównaj kierunki podróży",
  },
  {
    title: "2. Zbierz lot i nocleg w jednym planie",
    text: "Dodaj podróż i uporządkuj informacje o rezerwacjach. Zapisz godziny lotów, adres noclegu i godziny zameldowania. Przy późnym przylocie sprawdź możliwość wejścia do hotelu oraz dojazd z lotniska. Możesz zacząć także od wyjazdu kupionego w innym serwisie.",
    href: "/dodaj-podroz", label: "Dodaj własną podróż",
  },
  {
    title: "3. Ułóż plan zwiedzania dzień po dniu",
    text: "Grupuj miejsca według okolicy, aby nie tracić dnia na przejazdy. Na każdy dzień wybierz jeden najważniejszy punkt, a resztę potraktuj elastycznie. Przed zakupem biletów sprawdź godziny otwarcia i czas potrzebny na dojazd. Zostaw miejsce na posiłek, odpoczynek i zmianę pogody.",
    href: "/atrakcje", label: "Znajdź atrakcje na wyjazd",
  },
  {
    title: "4. Przygotuj checklistę przed wyjazdem",
    text: "Przejdź przez dokumenty, odprawę, bagaż, ubezpieczenie, internet i płatności. Wymagania wjazdowe sprawdzaj dla swojego obywatelstwa, celu podróży i krajów tranzytowych w aktualnych źródłach urzędowych. Terminu sprawdzenia dokumentów nie zostawiaj na ostatni tydzień.",
    href: "/przed-wyjazdem", label: "Zobacz checklistę podróżną",
  },
  {
    title: "5. Zaplanuj pierwszy dzień na miejscu",
    text: "Przygotuj adres hotelu, sposób dojazdu i plan awaryjny, jeśli samolot przyleci później. Sprawdź internet w telefonie i zapisz najważniejsze potwierdzenia offline. Prognozę sprawdź krótko przed podróżą, a wymagające dobrej pogody atrakcje ustaw tak, aby można było je przełożyć.",
    href: "/transfery", label: "Zaplanuj transfer z lotniska",
  },
];

const questions = [
  ["Czy planer podróży jest darmowy?", "Korzystanie z planera Tripowni jest bezpłatne. Loty, noclegi, bilety i inne usługi rezerwujesz osobno u dostawców. Część odnośników to linki afiliacyjne, z których Tripownia może otrzymać prowizję."],
  ["Czy mogę dodać wyjazd kupiony gdzie indziej?", "Tak. Dodaj własną podróż i wykorzystaj organizer do zebrania informacji o wyjeździe. Nie musisz kupować lotu ani hotelu przez Tripownię."],
  ["Od czego zacząć, jeśli mam już lot?", "Dodaj kierunek i daty, następnie dobierz nocleg oraz dojazd z lotniska. Dopiero później rozpisz atrakcje na poszczególne dni, uwzględniając godziny przylotu i powrotu."],
  ["Czy planer zastępuje bilety i potwierdzenia rezerwacji?", "Nie. Organizer pomaga uporządkować podróż. Zachowaj oryginalne bilety, potwierdzenia i dokumenty od dostawców, również w formie dostępnej bez internetu."],
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function TravelPlannerGuide() {
  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "Darmowy planer podróży", url: "https://tripownia.pl/planer-podrozy" },
      ]} />
      <article className="shell guides-hub">
        <header className="guides-hero">
          <div>
            <div className="kicker">TWÓJ WYJAZD KROK PO KROKU</div>
            <h1>Darmowy planer podróży</h1>
            <p>Lot, nocleg, plan dnia i checklista — uporządkuj wyjazd w jednym miejscu. Zacznij od pomysłu albo dodaj podróż, którą już masz zarezerwowaną.</p>
            <div className="guides-checklist-actions">
              <Link className="primary-cta" href="/dodaj-podroz">Zacznij planować za darmo</Link>
              <Link href="/moja-podroz">Otwórz mój plan podróży</Link>
            </div>
          </div>
        </header>
        <section aria-labelledby="planning-steps">
          <h2 id="planning-steps">Jak zaplanować podróż samodzielnie?</h2>
          <div className="guides-section-grid">
            {steps.map(step => (
              <section className="guides-section-card" key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <Link className="before-trip-card-link" href={step.href}>{step.label} →</Link>
              </section>
            ))}
          </div>
        </section>
        <section className="guides-checklist" aria-labelledby="planner-questions">
          <h2 id="planner-questions">Pytania o planer Tripowni</h2>
          {questions.map(([question, answer]) => <div key={question}><h3>{question}</h3><p>{answer}</p></div>)}
          <Link href="/informacja-afiliacyjna">Jak działają linki afiliacyjne?</Link>
        </section>
        <nav className="guides-quick-links" aria-label="Pomysły i przygotowanie do podróży">
          <Link href="/okazje">Okazje Tripowni</Link>
          <Link href="/city-break">Pomysły na city break</Link>
          <Link href="/poradniki">Poradniki podróżnicze</Link>
          <Link href="/przed-wyjazdem">Checklista przed wyjazdem</Link>
        </nav>
      </article>
      <SiteFooter />
    </main>
  );
}
