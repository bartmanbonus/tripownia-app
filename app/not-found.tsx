import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="shell system-state-page">
        <div className="kicker">404</div>
        <h1>Tej strony już tu nie ma.</h1>
        <p>Zamiast kończyć podróż tutaj, przejdź do aktualnych ofert albo ułóż własny plan.</p>
        <div className="system-state-actions">
          <Link className="primary-cta" href="/#wyszukiwarka">Znajdź wyjazd</Link>
          <Link className="secondary-cta" href="/dodaj-podroz">Ułóż plan za 0 zł</Link>
          <Link className="secondary-cta" href="/app">Moja Tripownia</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
