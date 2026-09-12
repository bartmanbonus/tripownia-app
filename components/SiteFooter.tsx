"use client";

import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="shell footer-main">
        <div className="footer-brand-block">
          <Link href="/" className="footer-logo" aria-label="Tripownia.pl — strona główna">
            <Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={180} height={180} />
          </Link>
          <p><strong>My szukamy. Ty lecisz.</strong><br/>Wybrane okazje, inspiracje i narzędzia do planowania podróży w jednym miejscu.</p>
          <a className="footer-mail" href="mailto:kontakt@tripownia.pl">kontakt@tripownia.pl</a>
        </div>

        <div className="footer-column">
          <h3>Odkrywaj</h3>
          <Link href="/okazje">Dzisiejsze okazje</Link>
          <Link href="/inspiracje">Inspiracje</Link>
          <Link href="/city-break">City break</Link>
          <Link href="/last-minute">Last minute</Link>
          <Link href="/podroze-po-przezycia">Podróże po przeżycia</Link>
          <Link href="/dalekie-podroze">Dalekie podróże</Link>
          <Link href="/wydarzenia">Mecze i eventy</Link>
        </div>

        <div className="footer-column">
          <h3>Na czasie</h3>
          <Link href="/lotniska-w-polsce-bez-limitu-100-ml-plynow">Lotniska bez limitu 100 ml</Link>
          <Link href="/podroze/city-break-listopad-2026">City break — listopad 2026</Link>
          <Link href="/podroze/cieple-wakacje-listopad-2026">Gdzie ciepło w listopadzie</Link>
          <Link href="/podroze/wyspy-kanaryjskie-grudzien-2026">Kanary — grudzień 2026</Link>
          <Link href="/podroze/wyspy-zielonego-przyladka-grudzien-2026">Cabo Verde — grudzień</Link>
          <Link href="/gdzie-na-sylwestra-2026-2027-15-kierunkow">Sylwester 2026/2027</Link>
          <Link href="/podroze/city-break-z-poznania">City break z Poznania</Link>
          <Link href="/podroze/city-break-z-gdanska">City break z Gdańska</Link>
        </div>

        <div className="footer-column">
          <h3>Planuj</h3>
          <Link href="/kierunki">Kierunki</Link>
          <Link href="/polska">Polska</Link>
          <Link href="/parkingi">Parkingi</Link>
          <Link href="/esim">eSIM</Link>
          <Link href="/atrakcje">Atrakcje</Link>
          <Link href="/ubezpieczenia">Ubezpieczenia</Link>
          <Link href="/transfery">Transfery</Link>
          <Link href="/wynajem-auta">Wynajem auta</Link>
          <Link href="/poradniki">Poradniki</Link>
        </div>

        <div className="footer-column footer-company">
          <h3>Tripownia.pl</h3>
          <p>Be in IT<br/>ul. Batalionów Chłopskich 77E/11<br/>01-305 Warszawa</p>
          <Link href="/regulamin">Regulamin</Link>
          <Link href="/polityka-prywatnosci">Polityka prywatności</Link>
          <Link href="/informacja-afiliacyjna">Informacja afiliacyjna</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p>Tripownia.pl nie jest biurem podróży. Rezerwacji dokonujesz bezpośrednio u zewnętrznego dostawcy. Ceny i dostępność mogą się zmieniać.</p>
        <p>© {new Date().getFullYear()} Tripownia.pl</p>
      </div>
    </footer>
  );
}
