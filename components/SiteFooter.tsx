"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import OfferRailDeduper from "@/components/OfferRailDeduper";

export default function SiteFooter() {
  return (
    <>
      <OfferRailDeduper />
      <footer className="footer footer-v2">
        <div className="shell footer-v2-shell">
          <div className="footer-v2-content">
            <div className="footer-v2-top-grid">
              <div className="footer-v2-brand-card">
                <Link href="/" className="footer-v2-logo" aria-label="Tripownia.pl — strona główna">
                  <Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={220} height={220} />
                </Link>
              </div>

              <div className="footer-v2-column footer-v2-discover">
                <h3>Twoja podróż</h3>
                <Link href="/moja-podroz">Darmowy planner</Link>
                <Link href="/dodaj-podroz">Dodaj własny wyjazd</Link>
                <Link href="/dla-ciebie">Dla Ciebie</Link>
                <Link href="/profil">Profil podróżnika</Link>
                <Link href="/przed-wyjazdem">Checklista przed wyjazdem</Link>
              </div>
            </div>

            <div className="footer-v2-trending">
              <div className="footer-v2-column">
                <h3>Na czasie</h3>
                <div className="footer-v2-trending-links">
                  <Link href="/lotniska-w-polsce-bez-limitu-100-ml-plynow">Lotniska bez limitu 100 ml</Link>
                  <Link href="/podroze/city-break-listopad-2026">City break — listopad 2026</Link>
                  <Link href="/podroze/cieple-wakacje-listopad-2026">Gdzie ciepło w listopadzie</Link>
                  <Link href="/podroze/wyspy-kanaryjskie-grudzien-2026">Kanary — grudzień 2026</Link>
                  <Link href="/podroze/wyspy-zielonego-przyladka-grudzien-2026">Cabo Verde — grudzień</Link>
                  <Link href="/gdzie-na-sylwestra-2026-2027-15-kierunkow">Sylwester 2026/2027</Link>
                  <Link href="/poradniki">Poradniki</Link>
                </div>
              </div>
            </div>

            <div className="footer-v2-lower-grid">
              <div className="footer-v2-column footer-v2-plan">
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
    </>
  );
}
