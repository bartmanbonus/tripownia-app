"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Lightweight discovery only: the partner widget loads after opening its page. */
export default function WakacjeDiscovery() {
  const path = usePathname() || '/';
  const eligible = path === '/' || /^\/(okazje|kierunki|wakacje|last-minute|tanie-all-inclusive|lot-hotel|city-break|dalekie-podroze|podroze|inspiracje|ferie|majowka|z-)/.test(path);
  if (!eligible) return null;
  const title = path.includes('last-minute') ? 'Sprawdź także last minute w Wakacje.pl'
    : path.includes('all-inclusive') ? 'Więcej możliwości na All Inclusive'
    : /kierunki|dalekie|podroze/.test(path) ? 'Szukasz wycieczki w tym kierunku?'
    : 'Jeszcze więcej wyjazdów do wyboru';
  return <section className="section shell" aria-label="Wycieczki Wakacje.pl">
    <div className="search-v3-empty" style={{ textAlign: 'left' }}>
      <div className="kicker">WYCIECZKI · WAKACJE.PL</div>
      <h2>{title}</h2>
      <p>Sprawdź wyjazdy wielu biur podróży. Wybierz kierunek, termin, lotnisko i uczestników w wyszukiwarce Wakacje.pl.</p>
      <div className="search-v3-empty-actions">
        <Link href={`/szukaj-wakacji?${new URLSearchParams({ source: path })}`}>Wyszukaj wycieczkę →</Link>
      </div>
      <small>Wyniki i aktualne ceny zobaczysz w Wakacje.pl. Rezerwujesz bezpośrednio u partnera.</small>
    </div>
  </section>;
}
