import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Jak działa Tripownia? Wyszukiwanie, planer i linki partnerskie";
const description = "Sprawdź, jak działa Tripownia: skąd biorą się oferty, jak działa darmowy planer, gdzie finalizujesz rezerwację i kiedy serwis może otrzymać prowizję afiliacyjną.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/jak-dziala-tripownia" },
};

const questions = [
  ["Czy rezerwuję podróż w Tripowni?", "Nie. Tripownia pomaga znaleźć i uporządkować opcje, ale finalna rezerwacja odbywa się bezpośrednio u zewnętrznego dostawcy."],
  ["Czy ceny są gwarantowane?", "Nie. Ceny i dostępność w turystyce są dynamiczne. Przed zakupem zawsze sprawdź końcową kwotę i warunki u partnera."],
  ["Czy planer jest powiązany z zakupem?", "Nie. Możesz używać planera także dla podróży kupionej poza Tripownią."],
  ["Czy Tripownia zarabia na linkach?", "Część linków jest afiliacyjna. Tripownia może otrzymać prowizję po zakupie u partnera bez dodatkowej opłaty dla użytkownika."],
] as const;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.map(([q,a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export default function HowTripowniaWorksPage() {
  return <main>
    <SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Jak działa Tripownia", url: "https://tripownia.pl/jak-dziala-tripownia" },
    ]}/>

    <article className="shell guides-hub">
      <header className="guides-hero">
        <div>
          <div className="kicker">JAK DZIAŁAMY</div>
          <h1>Od inspiracji do gotowego planu — bez udawania, że sprzedajemy Ci podróż.</h1>
          <p>Tripownia pomaga odkrywać kierunki, porównywać opcje i planować wyjazd. Rezerwacja zawsze kończy się u zewnętrznego dostawcy.</p>
        </div>
      </header>

      <section className="guides-section-grid">
        <section className="guides-section-card"><h2>1. Szukasz pomysłu lub konkretnego kierunku</h2><p>Możesz zacząć od budżetu, lotniska, terminu, typu wyjazdu albo po prostu od inspiracji. W serwisie łączymy strony kierunkowe, oferty i poradniki.</p></section>
        <section className="guides-section-card"><h2>2. Porównujesz pełny koszt</h2><p>Patrz na cenę razem z bagażem, transferem, wyżywieniem, lokalizacją i godzinami lotów. Najtańsza karta nie zawsze oznacza najtańszy cały wyjazd.</p></section>
        <section className="guides-section-card"><h2>3. Przechodzisz do partnera</h2><p>Po wyborze konkretnej opcji przechodzisz do dostawcy. Tam widzisz ostateczną cenę, dostępność oraz warunki rezerwacji.</p></section>
        <section className="guides-section-card"><h2>4. Układasz podróż w planerze</h2><p>Możesz dodać lot, nocleg, plan dnia, atrakcje i checklistę. Planer działa również wtedy, gdy cały wyjazd został kupiony poza Tripownią.</p></section>
      </section>

      <section className="guides-checklist">
        <h2>Co sprawdzamy przed publikacją treści i ofert?</h2>
        <ol>
          <li><strong>1</strong><span>Czy temat odpowiada na realne pytanie podróżującego.</span></li>
          <li><strong>2</strong><span>Czy cena lub termin nie są przedstawione jako gwarantowane, jeśli zależą od partnera.</span></li>
          <li><strong>3</strong><span>Czy użytkownik wie, gdzie kończy się Tripownia, a zaczyna zewnętrzny dostawca.</span></li>
          <li><strong>4</strong><span>Czy link afiliacyjny jest opisany zgodnie z zasadami serwisu.</span></li>
        </ol>
        <div className="guides-checklist-actions">
          <Link className="primary-cta" href="/okazje">Sprawdź aktualne okazje →</Link>
          <Link href="/planer-podrozy">Otwórz planer</Link>
        </div>
      </section>

      <section className="shell guides-checklist">
        <h2>Najczęstsze pytania</h2>
        {questions.map(([q,a]) => <div key={q}><h3>{q}</h3><p>{a}</p></div>)}
      </section>

      <nav className="guides-quick-links" aria-label="Więcej o Tripowni">
        <Link href="/o-tripowni">O Tripowni</Link>
        <Link href="/standardy-redakcyjne">Standardy redakcyjne</Link>
        <Link href="/informacja-afiliacyjna">Afiliacja</Link>
        <Link href="/faq">FAQ</Link>
      </nav>
    </article>
    <SiteFooter/>
  </main>;
}
