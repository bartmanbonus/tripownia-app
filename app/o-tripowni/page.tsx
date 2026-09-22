import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "O Tripowni – jak pomagamy planować i kupować podróże";
const description = "Poznaj Tripownię: serwis do wyszukiwania wyjazdów, porównywania opcji i darmowego planowania całej podróży. Zobacz, jak działamy i na czym zarabia serwis.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/o-tripowni" },
  openGraph: { type: "website", title: `${title} | Tripownia.pl`, description, url: "/o-tripowni" },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "O Tripowni",
  url: "https://tripownia.pl/o-tripowni",
  mainEntity: {
    "@id": "https://tripownia.pl/#organization",
    "@type": "Organization",
    name: "Tripownia",
    alternateName: "Tripownia.pl",
    url: "https://tripownia.pl",
    logo: "https://tripownia.pl/tripownia-logo.webp",
    email: "kontakt@tripownia.pl",
  },
};

export default function AboutTripowniaPage() {
  return <main>
    <SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema).replace(/</g, "\\u003c") }} />
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "O Tripowni", url: "https://tripownia.pl/o-tripowni" },
    ]}/>

    <article className="shell guides-hub">
      <header className="guides-hero">
        <div>
          <div className="kicker">O TRIPOWNI</div>
          <h1>Jedno miejsce od pomysłu na wyjazd do gotowego planu podróży.</h1>
          <p>Tripownia łączy inspiracje, wyszukiwanie ofert i darmowy planer. Możesz znaleźć wyjazd u nas albo dodać podróż kupioną gdzie indziej i uporządkować wszystko krok po kroku.</p>
        </div>
      </header>

      <section className="guides-section-grid">
        <section className="guides-section-card">
          <h2>Po co powstała Tripownia?</h2>
          <p>Podróż zwykle zaczyna się w jednej wyszukiwarce, nocleg w drugiej, atrakcje w trzeciej, a plan dnia w notatkach. Tripownia ma ograniczyć ten chaos i zebrać najważniejsze etapy w jednej ścieżce.</p>
        </section>
        <section className="guides-section-card">
          <h2>Co znajdziesz w serwisie?</h2>
          <p>Aktualne inspiracje, wakacje, city breaki, loty, noclegi, kierunki, poradniki, atrakcje, transfery i darmowy planer podróży. Nie musisz kupować wyjazdu przez Tripownię, żeby korzystać z planera.</p>
        </section>
        <section className="guides-section-card">
          <h2>Czego Tripownia nie robi?</h2>
          <p>Tripownia nie jest biurem podróży i nie finalizuje rezerwacji za użytkownika. Zakup odbywa się bezpośrednio u zewnętrznego dostawcy, który odpowiada za cenę, dostępność i warunki usługi.</p>
        </section>
        <section className="guides-section-card">
          <h2>Jak finansuje się serwis?</h2>
          <p>Część linków prowadzących do partnerów jest afiliacyjna. Jeśli użytkownik dokona zakupu po takim przejściu, Tripownia może otrzymać prowizję. Nie zmienia to ceny po stronie użytkownika.</p>
        </section>
      </section>

      <section className="guides-checklist">
        <div>
          <div className="kicker">NASZE ZASADY</div>
          <h2>Najpierw użyteczność, potem kliknięcie.</h2>
          <p>Nie chcemy budować serwisu jako ściany przypadkowych ofert. Staramy się pokazywać kontekst: termin, budżet, kierunek, logistykę i elementy, które wpływają na realny koszt podróży.</p>
        </div>
        <div className="guides-checklist-actions">
          <Link className="primary-cta" href="/jak-dziala-tripownia">Zobacz, jak działamy →</Link>
          <Link href="/standardy-redakcyjne">Standardy redakcyjne</Link>
        </div>
      </section>

      <nav className="guides-quick-links" aria-label="Najważniejsze strony Tripowni">
        <Link href="/okazje">Okazje Tripowni</Link>
        <Link href="/planer-podrozy">Darmowy planer podróży</Link>
        <Link href="/poradniki">Poradniki podróżnicze</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/informacja-afiliacyjna">Informacja afiliacyjna</Link>
      </nav>
    </article>
    <SiteFooter/>
  </main>;
}
