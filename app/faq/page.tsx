import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "FAQ — tanie wakacje, city break i planowanie podróży";
const description = "Najczęstsze pytania o Tripownię: wyszukiwanie wakacji i city breaków, darmowy planer podróży, ceny, rezerwacje oraz linki afiliacyjne.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/faq" },
};

const questions = [
  ["Czym jest Tripownia?", "Tripownia pomaga znaleźć pomysł na wyjazd, porównać aktualne oferty i uporządkować całą podróż w darmowym planerze — od lotu i noclegu po atrakcje, transport i checklistę."],
  ["Czy Tripownia jest biurem podróży?", "Nie. Rezerwację finalizujesz bezpośrednio u wybranego partnera lub dostawcy usługi."],
  ["Czy planer podróży jest darmowy?", "Tak. Możesz dodać własny wyjazd i korzystać z planera bez opłaty."],
  ["Czy mogę dodać podróż kupioną poza Tripownią?", "Tak. Planner działa również dla wyjazdów kupionych w innym serwisie."],
  ["Dlaczego cena oferty może się zmienić?", "Ceny lotów, hoteli i pakietów są dynamiczne i mogą zmieniać się wraz z dostępnością. Przed zakupem zawsze sprawdź finalną cenę u partnera."],
  ["Czy linki do partnerów są afiliacyjne?", "Część linków jest afiliacyjna. Tripownia może otrzymać prowizję po zakupie u partnera, bez podnoszenia ceny dla użytkownika."],
] as const;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function FaqPage() {
  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "FAQ", url: "https://tripownia.pl/faq" },
      ]} />
      <article className="shell guides-hub">
        <header className="guides-hero">
          <div>
            <div className="kicker">FAQ TRIPOWNI</div>
            <h1>Najczęstsze pytania o Tripownię i planowanie podróży</h1>
            <p>Jak działa wyszukiwanie wyjazdów, darmowy planer, ceny i przejścia do partnerów.</p>
          </div>
        </header>
        <section className="guides-section-grid">
          {questions.map(([question, answer]) => (
            <section className="guides-section-card" key={question}>
              <h2>{question}</h2>
              <p>{answer}</p>
            </section>
          ))}
        </section>
        <nav className="guides-quick-links" aria-label="Przydatne strony Tripowni">
          <Link href="/okazje">Aktualne okazje podróżnicze</Link>
          <Link href="/wakacje">Tanie wakacje</Link>
          <Link href="/city-break">City break</Link>
          <Link href="/planer-podrozy">Darmowy planer podróży</Link>
          <Link href="/kierunki">Kierunki podróży</Link>
        </nav>
      </article>
      <SiteFooter />
    </main>
  );
}
