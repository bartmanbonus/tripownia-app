import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Dla mediów – Tripownia.pl";
const description = "Informacje o Tripowni dla mediów i twórców: czym jest serwis, jak cytować dane i jak skontaktować się w sprawie komentarza, współpracy lub materiału.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/dla-mediow" },
};

export default function MediaPage() {
  return <main>
    <SiteHeader/>
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Dla mediów", url: "https://tripownia.pl/dla-mediow" },
    ]}/>
    <article className="shell guides-hub">
      <header className="guides-hero">
        <div>
          <div className="kicker">DLA MEDIÓW I TWÓRCÓW</div>
          <h1>Tripownia jako źródło danych, inspiracji i komentarzy podróżniczych.</h1>
          <p>Tworzymy serwis, który łączy odkrywanie wyjazdów, aktualne okazje i darmowy planer całej podróży. Chętnie udostępniamy mediom i twórcom zestawienia, obserwacje oraz materiały o trendach podróżniczych.</p>
        </div>
      </header>

      <section className="guides-section-grid">
        <section className="guides-section-card">
          <h2>Czym jest Tripownia?</h2>
          <p>Tripownia.pl to polski serwis podróżniczy, który pomaga znaleźć wyjazd, porównać opcje i uporządkować całą podróż w darmowym planerze. Użytkownik może także dodać wyjazd kupiony w innym serwisie.</p>
        </section>
        <section className="guides-section-card">
          <h2>Jak cytować Tripownię?</h2>
          <p>Przy wykorzystaniu naszych zestawień lub obserwacji prosimy o podanie źródła: „Tripownia.pl” oraz, jeśli materiał jest publikowany online, link do strony źródłowej.</p>
        </section>
        <section className="guides-section-card">
          <h2>Tematy dla mediów</h2>
          <p>Najtańsze kierunki, city breaki, sezonowość cen, wakacje z konkretnych lotnisk, podróże rodzinne, ferie, majówki, kierunki zimowe i praktyczne przygotowanie do wyjazdu.</p>
        </section>
        <section className="guides-section-card">
          <h2>Kontakt prasowy</h2>
          <p><a href="mailto:kontakt@tripownia.pl">kontakt@tripownia.pl</a></p>
          <p>W wiadomości wpisz temat materiału i termin publikacji. Jeśli mamy odpowiednie dane lub komentarz, wrócimy z konkretną odpowiedzią.</p>
        </section>
      </section>

      <section className="guides-checklist">
        <div>
          <div className="kicker">GOTOWE DO CYTOWANIA</div>
          <h2>Najlepsze materiały zaczynają się od konkretu.</h2>
          <p>Budujemy publiczne zestawienia i strony sezonowe tak, aby można było łatwo odwołać się do konkretnego kierunku, budżetu, lotniska lub terminu zamiast cytować ogólną opinię.</p>
        </div>
        <div className="guides-checklist-actions">
          <Link className="primary-cta" href="/podroze">Zobacz dane i kierunki →</Link>
          <Link href="/standardy-redakcyjne">Standardy redakcyjne</Link>
        </div>
      </section>

      <nav className="guides-quick-links" aria-label="Informacje o marce">
        <Link href="/o-tripowni">O Tripowni</Link>
        <Link href="/jak-dziala-tripownia">Jak działa Tripownia</Link>
        <Link href="/kontakt">Kontakt</Link>
        <Link href="/poradniki">Poradniki</Link>
      </nav>
    </article>
    <SiteFooter/>
  </main>;
}
