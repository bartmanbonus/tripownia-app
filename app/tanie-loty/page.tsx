import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Tanie loty z Polski — okazje lotnicze i city breaki",
  description: "Tanie loty z Warszawy, Krakowa, Katowic, Gdańska i Wrocławia. Tripownia codziennie szuka okazji lotniczych i łączy je z pomysłami na city break i wakacje.",
  alternates: { canonical: "/tanie-loty" },
  openGraph: {
    title: "Tanie loty z Polski | Tripownia.pl",
    description: "Codziennie wyszukujemy świeże okazje lotnicze z polskich lotnisk i pokazujemy tylko konkretne terminy oraz ceny.",
    type: "website",
    url: "/tanie-loty",
  },
};

const links = [
  ["Malta z Warszawy", "/podroze/malta-z-warszawy"],
  ["Rzym z Warszawy", "/podroze/rzym-z-warszawy"],
  ["Barcelona z Warszawy", "/podroze/barcelona-z-warszawy"],
  ["Cypr z Warszawy", "/podroze/cypr-z-warszawy"],
  ["Madera z Warszawy", "/podroze/madera-z-warszawy"],
  ["Teneryfa z Warszawy", "/podroze/teneryfa-z-warszawy"],
  ["City break do 1000 zł", "/podroze/city-break-do-1000-zl"],
  ["City break do 1500 zł", "/podroze/city-break-do-1500-zl"],
];

export default function CheapFlightsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tanie loty z Polski — Tripownia",
    description: "Aktualne okazje lotnicze z polskich lotnisk oraz pomysły na krótkie i dłuższe wyjazdy.",
    url: "https://tripownia.pl/tanie-loty",
    isPartOf: { "@type": "WebSite", name: "Tripownia", url: "https://tripownia.pl" },
  };

  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="shell seo-landing-hero">
        <div className="kicker">TANIE LOTY</div>
        <h1>Tanie loty z Polski — codziennie szukamy nowych okazji</h1>
        <p>
          Tripownia sprawdza ceny lotów z największych polskich lotnisk i wybiera okazje,
          które mają konkretny termin, aktualną cenę i bezpośrednie przejście do rezerwacji.
          Nie pokazujemy codziennie tych samych kierunków — rotujemy destynacje, żeby łatwiej było znaleźć coś nowego.
        </p>
        <div className="seo-hero-actions">
          <Link className="primary-cta" href="/#szukaj-samodzielnie">Szukaj lotu →</Link>
          <Link className="secondary-cta" href="/okazje">Zobacz okazje dnia</Link>
        </div>
      </section>

      <section className="shell seo-copy-section">
        <div className="kicker">JAK SZUKAMY</div>
        <h2>Okazja lotnicza ma być świeża, nie tylko tania na pierwszy rzut oka</h2>
        <p>
          Cena biletu ma sens dopiero w kontekście terminu, lotniska wylotu i innych dostępnych wyników.
          Dlatego porównujemy podobne połączenia i publikujemy perłkę lotniczą tylko wtedy, gdy wyróżnia się ceną.
        </p>
        <p>
          Codziennie rano sprawdzamy nowe wyniki. Jeżeli danego dnia nie ma naprawdę dobrej ceny,
          nie oznaczamy zwykłego biletu jako okazji na siłę.
        </p>
      </section>

      <section className="shell seo-related-block">
        <div className="kicker">POPULARNE KIERUNKI I BUDŻETY</div>
        <h2>Sprawdź konkretne pomysły na tani wyjazd</h2>
        <div className="seo-related-links">
          {links.map(([label, href]) => <Link key={href} href={href}>{label} →</Link>)}
        </div>
        <div className="seo-related">
          <Link href="/podroze">Wszystkie pomysły na podróże →</Link>
          <Link href="/kierunki">Wszystkie kierunki →</Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
