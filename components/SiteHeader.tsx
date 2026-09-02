"use client";

import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  const siteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://tripownia.pl/#organization",
        name: "Tripownia.pl",
        url: "https://tripownia.pl/",
        logo: "https://tripownia.pl/tripownia-logo.webp",
      },
      {
        "@type": "WebSite",
        "@id": "https://tripownia.pl/#website",
        url: "https://tripownia.pl/",
        name: "Tripownia.pl",
        publisher: { "@id": "https://tripownia.pl/#organization" },
        inLanguage: "pl-PL",
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema).replace(/</g, "\\u003c") }} />
    <header className="nav shell site-nav">
      <Link className="brand-logo" href="/" aria-label="Tripownia.pl">
        <Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={220} height={220} priority />
      </Link>
      <nav>
        <Link href="/okazje">Okazje</Link>
        <Link href="/city-break-2">City break</Link>
        <Link href="/last-minute">Last minute</Link>
        <Link href="/kierunki">Kierunki</Link>
        <Link href="/polska">Polska</Link>
        <Link href="/wydarzenia">⚽ Wydarzenia</Link>
        <Link href="/podroze-po-przezycia">✨ Przeżycia</Link>
        <Link href="/dalekie-podroze">🌏 Dalekie</Link>
        <Link href="/podroze">Pomysły</Link>
        <Link href="/ulubione">♡ Ulubione</Link>
        <Link href="/parkingi">Parkingi</Link>
      </nav>
      <Link className="nav-cta nav-search-link" href="/#wyszukiwarka">Wyniki Tripownia.pl</Link>
    </header>
    </>
  );
}
