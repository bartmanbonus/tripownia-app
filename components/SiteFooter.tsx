"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="footer footer-v2">
      <div className="shell footer-v2-shell">
        <div className="footer-v2-lead">
          <div className="footer-v2-brand-card">
            <Link href="/" className="footer-v2-logo" aria-label="Tripownia.pl — strona główna">
              <Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={220} height={220} />
            </Link>
            <div className="footer-v2-kicker">MY SZUKAMY. TY LECISZ.</div>
            <h2>Podróże bez przekopywania całego internetu.</h2>
            <p>Okazje, kierunki i narzędzia do planowania w jednym miejscu. Ty wybierasz, co Cię rusza — Tripownia pomaga dojść do konkretu.</p>
            <div className="footer-v2-actions">
              <Link href="/#wyszukiwarka" className="footer-v2-primary">Znajdź wyjazd <ArrowRight size={18} /></Link>
              <Link href="/okazje" className="footer-v2-secondary">Dzisiejsze okazje</Link>
            </div>
          </div>

          <div className="footer-v2-nav">
            <div className="footer-v2-column">
              <h3>Odkrywaj</h3>
              <Link href="/okazje">Dzisiejsze okazje</Link>
              <Link href="/city-break">City break</Link>
              <Link href="/last-minute">Last minute</Link>
              <Link href="/podroze-po-przezycia">Podróże po przeżycia</Link>
              <Link href="/dalekie-podroze">Dalekie podróże</Link>
            </div>

            <div className="footer-v2-column">
              <h3>Planuj</h3>
              <Link href="/kierunki">Kierunki</Link>
              <Link href="/parkingi">Parkingi</Link>
              <Link href="/esim">eSIM</Link>
              <Link href="/atrakcje">Atrakcje</Link>
              <Link href="/ubezpieczenia">Ubezpieczenia</Link>
              <Link href="/wynajem-auta">Wynajem auta</Link>
            </div>

            <div className="footer-v2-column">
              <h3>Na czasie</h3>
              <Link href="/lotniska-w-polsce-bez-limitu-100-ml-plynow">Lotniska bez limitu 100 ml</Link>
              <Link href="/gdzie-jest-cieplo-w-pazdzierniku-12-kierunkow-na-wakacje">Gdzie ciepło w październiku</Link>
              <Link href="/gdzie-jest-cieplo-w-listopadzie">Gdzie ciepło w listopadzie</Link>
              <Link href="/gdzie-na-sylwestra-2026-2027-15-kierunkow">Sylwester 2026/2027</Link>
              <Link href="/poradniki">Poradniki</Link>
            </div>

            <div className="footer-v2-column footer-v2-company">
              <h3>Tripownia.pl</h3>
              <a href="mailto:kontakt@tripownia.pl" className="footer-v2-contact"><Mail size={15} /> kontakt@tripownia.pl</a>
              <p className="footer-v2-address"><MapPin size={15} /> <span>Be in IT<br/>ul. Batalionów Chłopskich 77E/11<br/>01-305 Warszawa</span></p>
              <Link href="/regulamin">Regulamin</Link>
              <Link href="/polityka-prywatnosci">Polityka prywatności</Link>
              <Link href="/informacja-afiliacyjna">Informacja afiliacyjna</Link>
            </div>
          </div>
        </div>

        <div className="footer-v2-bottom">
          <p>Tripownia.pl nie jest biurem podróży. Rezerwacji dokonujesz bezpośrednio u zewnętrznego dostawcy. Ceny i dostępność mogą się zmieniać.</p>
          <span>© {new Date().getFullYear()} Tripownia.pl</span>
        </div>
      </div>
    </footer>
  );
}
