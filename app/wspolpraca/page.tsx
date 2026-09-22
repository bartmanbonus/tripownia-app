import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Współpraca z Tripownią – twórcy i partnerzy podróżniczy";
const description = "Współpraca z Tripownią dla twórców, mediów i partnerów travel. Testy produktu, materiały podróżnicze, afiliacja, dane i wspólne formaty contentowe.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/wspolpraca" },
};

export default function CollaborationPage() {
  return <main>
    <SiteHeader/>
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Współpraca", url: "https://tripownia.pl/wspolpraca" },
    ]}/>
    <article className="shell guides-hub">
      <header className="guides-hero">
        <div>
          <div className="kicker">WSPÓŁPRACA</div>
          <h1>Twórzmy podróże, które da się naprawdę wykorzystać.</h1>
          <p>Szukamy współprac z twórcami i usługami, które realnie pomagają użytkownikowi znaleźć, kupić albo lepiej zaplanować wyjazd.</p>
        </div>
      </header>

      <section className="guides-section-grid">
        <section className="guides-section-card">
          <h2>Dla twórców travel</h2>
          <p>Możemy wspólnie testować Tripownię na konkretnym wyjeździe: od wyszukania opcji, przez budżet, po gotowy plan dnia. Zależy nam na treści, która pokazuje produkt w użyciu, a nie na klasycznej reklamie logo.</p>
        </section>
        <section className="guides-section-card">
          <h2>Dla partnerów</h2>
          <p>Interesują nas usługi, które pasują do realnej ścieżki podróżnika: loty, noclegi, atrakcje, transfery, auta, parkingi, internet i inne elementy wyjazdu.</p>
        </section>
        <section className="guides-section-card">
          <h2>Dla mediów</h2>
          <p>Możemy przygotować zestawienie kierunków, obserwacje cenowe lub komentarz do sezonowego tematu podróżniczego.</p>
          <Link href="/dla-mediow">Informacje dla mediów →</Link>
        </section>
        <section className="guides-section-card">
          <h2>Jak zacząć?</h2>
          <p>Napisz na <a href="mailto:kontakt@tripownia.pl">kontakt@tripownia.pl</a>. Opisz swój kanał, usługę albo pomysł i podaj, co wspólnie mogłoby dać użytkownikowi praktyczną wartość.</p>
        </section>
      </section>

      <section className="guides-checklist">
        <div>
          <div className="kicker">NASZE PODEJŚCIE</div>
          <h2>Nie szukamy współprac tylko dla zasięgu.</h2>
          <p>Najlepszy format to taki, w którym odbiorca dostaje konkretną podróż, odpowiedź, oszczędność czasu albo użyteczne narzędzie. Dzięki temu marka Tripownia pojawia się w naturalnym kontekście, a nie jako doklejona reklama.</p>
        </div>
      </section>

      <nav className="guides-quick-links" aria-label="Więcej o Tripowni">
        <Link href="/o-tripowni">O Tripowni</Link>
        <Link href="/jak-dziala-tripownia">Jak działa Tripownia</Link>
        <Link href="/informacja-afiliacyjna">Afiliacja</Link>
        <Link href="/kontakt">Kontakt</Link>
      </nav>
    </article>
    <SiteFooter/>
  </main>;
}
