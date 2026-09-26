"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import OfferRailDeduper from "@/components/OfferRailDeduper";
import { trackEvent } from "@/lib/analytics";

export default function SiteFooter() {
  return (
    <>
      <OfferRailDeduper />
      <footer className="footer footer-v2">
        <div className="shell footer-v2-shell">
          <div className="footer-v2-grid">
            <div className="footer-v2-brand-card">
              <Link href="/" className="footer-v2-logo" aria-label="Tripownia.pl — strona główna">
                <Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={220} height={96} sizes="(max-width: 700px) 180px, 220px" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
              </Link>
              <p>Znajdź wyjazd albo dodaj ten, który już masz. Tripownia pomoże Ci za darmo ogarnąć całą podróż krok po kroku.</p>
              <Link className="footer-v2-plan-cta" href="/dodaj-podroz">Ułóż plan za 0 zł →</Link>
            </div>

            <div className="footer-v2-column">
              <h3>Twoja podróż</h3>
              <Link href="/planer-podrozy">Darmowy planer podróży</Link>
              <Link href="/dodaj-podroz">Dodaj własny wyjazd</Link>
              <Link href="/dla-ciebie">Dla Ciebie</Link>
              <Link href="/profil">Profil podróżnika</Link>
              <Link href="/przed-wyjazdem">Checklista przed wyjazdem</Link>
            </div>

            <div className="footer-v2-column">
              <h3>Inspiracje i dane</h3>
              <Link href="/kierunki">Wszystkie kierunki</Link>
              <Link href="/podroze-po-przezycia">Podróże po przeżycia</Link>
              <Link href="/dane-tripowni">Dane Tripowni</Link>
              <Link href="/radar-tripowni">Radar Tripowni</Link>
              <Link href="/poradniki">Poradniki</Link>
            </div>

            <div className="footer-v2-column">
              <h3>Marketplace</h3>
              <Link href="/wakacje">Wakacje</Link>
              <Link href="/atrakcje">Atrakcje</Link>
              <Link href="/transfery">Transfery</Link>
              <Link href="/parkingi">Parkingi</Link>
              <Link href="/esim">eSIM</Link>
              <Link href="/ubezpieczenia">Ubezpieczenia</Link>
              <Link href="/wynajem-auta">Wynajem auta</Link>
            </div>

            <div className="footer-v2-column footer-v2-company">
              <h3>Tripownia.pl</h3>
              <a href="mailto:kontakt@tripownia.pl" className="footer-v2-contact"><Mail size={15} /> kontakt@tripownia.pl</a>
              <p className="footer-v2-address"><MapPin size={15} /> <span>Be in IT<br/>ul. Batalionów Chłopskich 77E/11<br/>01-305 Warszawa</span></p>
              <a className="footer-v2-facebook" href="https://www.facebook.com/987707741084438" target="_blank" rel="noopener noreferrer" aria-label="Obserwuj Tripownię na Facebooku" onClick={() => trackEvent("facebook_follow_click", { placement: "footer" })}>Obserwuj nas na Facebooku →</a>
              <Link href="/o-tripowni">O Tripowni</Link>
              <Link href="/kontakt">Kontakt</Link>
              <Link href="/jak-dziala-tripownia">Jak działa Tripownia</Link>
              <Link href="/faq">FAQ</Link>
            </div>
          </div>

          <div className="footer-v2-bottom">
            <p>Tripownia.pl nie jest biurem podróży. Rezerwacji dokonujesz bezpośrednio u zewnętrznego dostawcy. Ceny i dostępność mogą się zmieniać.</p>
            <div className="footer-v2-legal">
              <Link href="/regulamin">Regulamin</Link>
              <Link href="/polityka-prywatnosci">Polityka prywatności</Link>
              <Link href="/informacja-afiliacyjna">Informacja afiliacyjna</Link>
            </div>
            <span>© {new Date().getFullYear()} Tripownia.pl</span>
          </div>
        </div>
      </footer>
    </>
  );
}
