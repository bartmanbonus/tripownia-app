import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <main>
      <SiteHeader/>
      <section className="shell launch-not-found">
        <span>404</span>
        <div className="kicker">TEJ STRONY JUŻ TU NIE MA</div>
        <h1>Podróż się nie kończy — znajdźmy lepszą ofertę.</h1>
        <p>
          Link mógł wygasnąć albo adres się zmienił. Przejdź do aktualnych okazji,
          wyszukiwarki lub wybierz kierunek.
        </p>
        <div className="launch-not-found-actions">
          <Link className="primary-cta" href="/okazje">Zobacz aktualne okazje →</Link>
          <Link className="secondary-cta" href="/#wyszukiwarka">Przejdź do wyszukiwarki</Link>
          <Link className="secondary-cta" href="/kierunki">Wybierz kierunek</Link>
        </div>
      </section>
      <SiteFooter/>
    </main>
  );
}
