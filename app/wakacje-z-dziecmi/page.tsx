import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Wakacje z dziećmi 2027 – rodzinne All Inclusive i kierunki";
const description = "Wakacje z dziećmi 2027: porównaj rodzinne All Inclusive, hotele z aquaparkiem, krótki lot i kierunki dobre dla rodzin. Sprawdź aktualne oferty z Polski.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/wakacje-z-dziecmi" },
  openGraph: {
    type: "website",
    title: `${title} | Tripownia.pl`,
    description,
    url: "/wakacje-z-dziecmi",
  },
};

const faq = [
  ["Jaki kierunek wybrać na wakacje z dziećmi?", "Najpierw dopasuj wyjazd do wieku dziecka, długości lotu i tego, ile czasu chcecie spędzać w hotelu. Dla rodzin często liczą się krótki transfer, plaża, basen, animacje i łatwy dostęp do jedzenia."],
  ["Czy All Inclusive opłaca się z dziećmi?", "Przy rodzinie All Inclusive może ułatwić kontrolę budżetu i ograniczyć codzienną logistykę. Porównaj jednak standard hotelu, godziny posiłków, przekąski, napoje i faktyczne udogodnienia dla dzieci."],
  ["Na co patrzeć przy hotelu rodzinnym?", "Sprawdź rodzaj pokoju, brodzik lub basen, zacienione miejsca, plac zabaw, odległość od plaży, transfer z lotniska oraz opinie rodzin podróżujących z dziećmi w podobnym wieku."],
  ["Czy warto lecieć z dziećmi z dalszego lotniska?", "Tylko po policzeniu pełnego kosztu i czasu. Tańszy pakiet może przestać być korzystny po doliczeniu dojazdu, parkingu, noclegu przy lotnisku i bardziej męczących godzin podróży."],
] as const;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function FamilyHolidaysPage() {
  return <main>
    <SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Wakacje", url: "https://tripownia.pl/wakacje" },
      { name: "Wakacje z dziećmi", url: "https://tripownia.pl/wakacje-z-dziecmi" },
    ]}/>

    <section className="shopping-hero shell">
      <div className="kicker">WAKACJE Z DZIEĆMI</div>
      <h1>Wakacje z dziećmi 2027: wybierz kierunek pod rodzinę, nie tylko pod cenę.</h1>
      <p>Porównaj rodzinne All Inclusive, hotele z aquaparkiem, krótsze loty i kierunki z prostym transferem. Tripownia pomaga sprawdzić pełny koszt i wygodę całej podróży.</p>
    </section>

    <section className="shell seo-copy-section">
      <div className="kicker">CO MA ZNACZENIE</div>
      <h2>Dobry rodzinny wyjazd zaczyna się od logistyki</h2>
      <p>Przy młodszych dzieciach ważniejsze od jednej gwiazdki więcej mogą być godziny lotu, krótki transfer, szybkie zameldowanie i pokój, w którym rodzina naprawdę się mieści.</p>
      <p>Jeżeli większość czasu chcecie spędzać w hotelu, porównaj Turcję, Grecję, Bułgarię, Egipt i Wyspy Kanaryjskie. Jeśli planujecie dużo zwiedzania, sprawdź również lokalizację hotelu, transport i możliwość zrobienia planu B na gorszą pogodę.</p>
    </section>

    <section className="shell seo-related-block">
      <div className="kicker">POPULARNE WARIANTY</div>
      <h2>Rodzinne wakacje według budżetu i stylu</h2>
      <div className="seo-related-links">
        <Link href="/podroze/wakacje-do-2000-zl">Wakacje do 2000 zł →</Link>
        <Link href="/podroze/wakacje-do-2500-zl">Wakacje do 2500 zł →</Link>
        <Link href="/podroze/all-inclusive-do-2000-zl">All Inclusive do 2000 zł →</Link>
        <Link href="/wakacje-2027">Wakacje 2027 →</Link>
        <Link href="/ferie-2027">Ferie 2027 →</Link>
        <Link href="/kierunki">Wszystkie kierunki →</Link>
      </div>
    </section>

    <section className="shell seo-copy-section">
      <h2>Jak wybrać hotel dla rodziny?</h2>
      <p>Sprawdź nie tylko zdjęcia aquaparku. Zobacz dokładny typ pokoju, zasady dostawek, temperaturę basenu poza sezonem, dostępność posiłków dla dzieci, odległość od plaży i czas transferu.</p>
      <p>Przy podobnej cenie hotel bliżej lotniska lub plaży może dać rodzinie więcej niż obiekt z większą liczbą atrakcji, ale wymagający długich dojazdów.</p>
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">SZUKAJ RODZINNIE</div><h2>Sprawdź aktualne wakacje</h2><p>Porównaj kierunek, termin i lotnisko, a przed rezerwacją sprawdź ostateczną cenę i warunki u partnera.</p></div></div>
      <div className="single-partner-search-wrap"><UnifiedPartnerSearch mode="holiday" /></div>
    </section>

    <section className="shell guides-checklist">
      <h2>Najczęstsze pytania o wakacje z dziećmi</h2>
      {faq.map(([question, answer]) => <div key={question}><h3>{question}</h3><p>{answer}</p></div>)}
    </section>

    <SiteFooter/>
  </main>;
}
