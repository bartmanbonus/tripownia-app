"use client";

import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="nav shell site-nav">
      <Link className="brand-logo" href="/" aria-label="Tripownia.pl">
        <Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={220} height={220} priority />
      </Link>
      <nav>
        <Link href="/okazje">Okazje</Link>
        <Link href="/city-break-2">City break</Link>
        <Link href="/last-minute">Last minute</Link>
        <Link href="/kierunki">Kierunki</Link>
        <Link href="/podroze">Pomysły</Link>
        <Link href="/ulubione">♡ Ulubione</Link>
        <Link href="/parkingi">Parkingi</Link>
      </nav>
      <Link className="nav-cta nav-search-link" href="/#wyszukiwarka">Wyniki Tripownia.pl</Link>
    </header>
  );
}
