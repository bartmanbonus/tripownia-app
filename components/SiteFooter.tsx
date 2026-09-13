"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="footer footer-v2">
      <div className="shell footer-v2-shell">
        <div className="footer-v2-lead">
          <div className="footer-v2-brand-card">
            <Link href="/" className="footer-v2-logo" aria-label="Tripownia.pl — strona główna">
              <Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={180} height={180} />
            </Link>
            <div className="footer-v2-brand-copy">
              <div className="footer-v2-kicker">MY SZUKAMY. TY LECISZ.</div>
              <p>Okazje, kierunki i pomocne narzędzia do planowania podróży — konkretnie, w jednym miejscu.</p>
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
              <Link href="/podroze/city-break-listopad-2026">City break — listopad 2026</Link>
              <Link href="/podroze/cieple-wakacje-listopad-2026">Gdzie ciepło w listopadzie</Link>
              <Link href="/podroze/wyspy-kanaryjskie-grudzien-2026">Kanary — grudzień 2026</Link>
              <Link href="/podroze/wyspy-zielonego-przyladka-grudzien-2026">Cabo Verde — grudzień</Link>
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
