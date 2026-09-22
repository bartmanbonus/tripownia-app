import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Kontakt – Tripownia.pl";
const description = "Skontaktuj się z Tripownią w sprawie serwisu, współpracy, treści, korekt i partnerstw. E-mail: kontakt@tripownia.pl.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/kontakt" },
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Kontakt – Tripownia.pl",
  url: "https://tripownia.pl/kontakt",
  about: { "@id": "https://tripownia.pl/#organization" },
};

export default function ContactPage() {
  return <main>
    <SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema).replace(/</g, "\\u003c") }} />
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Kontakt", url: "https://tripownia.pl/kontakt" },
    ]}/>

    <article className="shell guides-hub">
      <header className="guides-hero">
        <div>
          <div className="kicker">KONTAKT</div>
          <h1>Napisz do Tripowni.</h1>
          <p>Masz pytanie o serwis, znalazłeś nieaktualną informację albo chcesz porozmawiać o współpracy? Najprościej napisać do nas mailowo.</p>
        </div>
      </header>

      <section className="guides-section-grid">
        <section className="guides-section-card">
          <h2>Kontakt ogólny</h2>
          <p><a href="mailto:kontakt@tripownia.pl">kontakt@tripownia.pl</a></p>
          <p>Sprawy dotyczące działania serwisu, partnerstw, współpracy i pytań o Tripownię.</p>
        </section>
        <section className="guides-section-card">
          <h2>Korekta treści</h2>
          <p>Jeśli zauważysz nieaktualną datę, zasadę, opis kierunku albo błąd w poradniku, wyślij adres strony i krótką informację, co wymaga sprawdzenia.</p>
          <Link href="/standardy-redakcyjne">Zobacz standardy redakcyjne →</Link>
        </section>
        <section className="guides-section-card">
          <h2>Rezerwacje i płatności</h2>
          <p>Tripownia nie finalizuje rezerwacji. W sprawach dotyczących konkretnego zakupu, płatności, anulowania lub zmiany rezerwacji kontaktuj się bezpośrednio z dostawcą, u którego dokonano zakupu.</p>
        </section>
        <section className="guides-section-card">
          <h2>Współpraca i afiliacja</h2>
          <p>Jesteśmy otwarci na współpracę z usługami, które realnie pomagają planować podróż. Zasady linków partnerskich opisujemy publicznie.</p>
          <Link href="/informacja-afiliacyjna">Jak działa afiliacja →</Link>
        </section>
      </section>

      <nav className="guides-quick-links" aria-label="Informacje o Tripowni">
        <Link href="/o-tripowni">O Tripowni</Link>
        <Link href="/jak-dziala-tripownia">Jak działa Tripownia</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/polityka-prywatnosci">Polityka prywatności</Link>
      </nav>
    </article>
    <SiteFooter/>
  </main>;
}
