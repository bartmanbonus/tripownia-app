"use client";

import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div><Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={150} height={120}/><p>Wyniki Tripownia.pl: najpierw inspiracja, potem rezerwacja. ✈️</p></div>
        <div className="footer-links">
          <Link href="/kierunki">Kierunki</Link><Link href="/city-break-2">City break</Link><Link href="/last-minute">Last minute</Link><Link href="/poradniki">Poradniki</Link><Link href="/polityka-prywatnosci">Polityka prywatności</Link><Link href="/regulamin">Regulamin</Link>
        </div>
      </div>
    </footer>
  );
}
