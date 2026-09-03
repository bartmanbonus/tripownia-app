"use client";

import Link from "next/link";

export default function SiteHeader() {
  const siteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://tripownia.pl/#organization", name: "Tripownia.pl", url: "https://tripownia.pl/", logo: "https://tripownia.pl/tripownia-logo.webp" },
      { "@type": "WebSite", "@id": "https://tripownia.pl/#website", url: "https://tripownia.pl/", name: "Tripownia.pl", publisher: { "@id": "https://tripownia.pl/#organization" }, inLanguage: "pl-PL" },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema).replace(/</g, "\\u003c") }} />
    <header className="site-header-shell site-header-v98">
      <div className="site-nav shell">
        <Link className="brand-logo" href="/" aria-label="Tripownia.pl">
          <img src="/tripownia-logo.webp" alt="Tripownia.pl" width="76" height="76" />
        </Link>

        <div className="site-nav-stack">
          <nav className="site-nav-primary" aria-label="Najważniejsze sekcje sprzedażowe">
            <Link className="nav-sale nav-sale-main" href="/okazje">🔥 Okazje</Link>
            <Link className="nav-sale" href="/wydarzenia" title="Wyjazdy na mecze piłkarskie">⚽ Mecze piłkarskie</Link>
            <Link className="nav-sale" href="/podroze-po-przezycia">✨ Przeżycia</Link>
            <Link className="nav-sale seasonal-nav-link" href="/jarmarki-bozonarodzeniowe">🎄 Jarmarki</Link>
            <Link className="nav-sale seasonal-nav-link" href="/sylwester">🥂 Sylwester</Link>
          </nav>

          <nav className="site-nav-secondary" aria-label="Pozostałe sekcje Tripowni">
            <Link href="/city-break">City break</Link>
            <Link href="/last-minute">Last minute</Link>
            <Link href="/wakacje">Wakacje</Link>
            <Link href="/kierunki">Kierunki</Link>
            <Link href="/polska">Polska</Link>
            <Link href="/dalekie-podroze">Dalekie</Link>
            <Link href="/podroze">Pomysły</Link>
            <Link href="/parkingi">Parkingi</Link>
            <Link href="/magazyn-podrozniczy">Poradniki</Link>
            <Link href="/ulubione">♡ Ulubione</Link>
          </nav>
        </div>

        <Link className="nav-cta nav-search-link" href="/#wyszukiwarka">Szukaj wyjazdu</Link>
      </div>
    </header>
  </>;
}
