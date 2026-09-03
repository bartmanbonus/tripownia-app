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
            <Link className="nav-sale nav-sale-main" href="/okazje"><span className="nav-ico nav-ico-hot" aria-hidden="true">●</span><span>Okazje</span></Link>
            <Link className="nav-sale" href="/wydarzenia" title="Wyjazdy na mecze piłkarskie"><span className="nav-ico nav-ico-ball" aria-hidden="true">⚽</span><span>Mecze piłkarskie</span></Link>
            <Link className="nav-sale" href="/podroze-po-przezycia"><span className="nav-ico nav-ico-exp" aria-hidden="true">✦</span><span>Przeżycia</span></Link>
            <Link className="nav-sale seasonal-nav-link" href="/jarmarki-bozonarodzeniowe"><span className="nav-ico nav-ico-market" aria-hidden="true">▲</span><span>Jarmarki</span></Link>
            <Link className="nav-sale seasonal-nav-link" href="/sylwester"><span className="nav-ico nav-ico-newyear" aria-hidden="true">✧</span><span>Sylwester</span></Link>
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
            <Link href="/ulubione">♡ Ulubione</Link>
            <Link className="nav-search-inline" href="/#wyszukiwarka"><span className="nav-ico nav-ico-search" aria-hidden="true">⌕</span><span>Szukaj wyjazdu</span></Link>
          </nav>
        </div>
      </div>
    </header>
  </>;
}
