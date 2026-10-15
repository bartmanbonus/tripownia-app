"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Lightweight discovery only: the partner widget loads after opening its page. */
export default function WakacjeDiscovery() {
  const path = usePathname() || '/';
  const eligible = path === '/' || /^\/(okazje|kierunki|wakacje|last-minute|tanie-all-inclusive|lot-hotel|city-break|dalekie-podroze|podroze|inspiracje|ferie|majowka|z-)/.test(path);
  if (!eligible) return null;
  const title = path.includes('last-minute') ? 'Sprawdź wycieczki last minute'
    : path.includes('all-inclusive') ? 'Więcej możliwości na All Inclusive'
    : /kierunki|dalekie|podroze/.test(path) ? 'Szukasz wycieczki w tym kierunku?'
    : 'Jeszcze więcej wyjazdów do wyboru';
  return <section className="section shell" aria-label="Sprawdź wycieczkę">
    <div className="travel-discovery">
      <div className="kicker">ZAPLANUJ WYJAZD</div>
      <h2>{title}</h2>
      <p>Sprawdź wyjazdy wielu biur podróży. Wybierz kierunek, termin, lotnisko i uczestników.</p>
      <div className="travel-search-options__actions">
        <Link className="travel-search-options__primary" href={`/szukaj-wakacji?${new URLSearchParams({ source: path })}`}>Sprawdź wycieczkę →</Link>
      </div>
      <p><Link href="/last-minute">Wycieczki last minute</Link> · <Link href="/tanie-all-inclusive">Wakacje All Inclusive</Link> · <Link href="/wakacje-2027">Wakacje 2027</Link></p>
      <small>Cenę i dostępność potwierdzisz przed rezerwacją.</small>
    </div>
  </section>;
}
