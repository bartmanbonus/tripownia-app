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
          <p><strong>My szukamy. Ty lecisz.</strong><br/>Wybrane okazje podróżnicze i konkretne propozycje w jednym miejscu.</p>
          <a className="footer-mail" href="mailto:kontakt@tripownia.pl">kontakt@tripownia.pl</a>
        </div>

        <div className="footer-column">
          <h3>Znajdź wyjazd</h3>
          <Link href="/okazje">Okazje</Link>
          <Link href="/city-break">City break</Link>
          <Link href="/last-minute">Last minute</Link>
          <Link href="/polska">Polska</Link>
          <Link href="/wydarzenia">Mecze piłkarskie</Link>
          <Link href="/ulubione">Ulubione</Link>
        </div>

        <div className="footer-column">
          <h3>Przygotuj podróż</h3>
          <Link href="/parkingi">Parkingi</Link>
          <Link href="/esim">eSIM</Link>
          <Link href="/atrakcje">Atrakcje</Link>
          <Link href="/ubezpieczenia">Ubezpieczenia</Link>
          <Link href="/transfery">Transfery</Link>
          <Link href="/wynajem-auta">Wynajem auta</Link>
          <Link href="/magazyn-podrozniczy">Poradniki i magazyn</Link>
          <Link href="/kierunki">Przewodniki po kierunkach</Link>
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
