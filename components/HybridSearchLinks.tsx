import Link from 'next/link';
import type { ReactNode } from 'react';
import { partners } from '@/lib/partners';
import { eskySearchUrl } from '@/lib/eskySearch';

/** Search choices are not priced inventory. Keep one primary action. */
export default function HybridSearchLinks({ destination, departure = '', month = '', start = '', end = '', children }: {
  destination: string; departure?: string; month?: string; start?: string; end?: string; children?: ReactNode;
}) {
  const flight = new URLSearchParams({ destination, ...(departure ? { origin: departure } : {}),
    ...(month ? { month } : {}), ...(start ? { outbound: start } : {}), ...(end && end !== start ? { inbound: end } : {}) });
  const hotel = new URLSearchParams({ q: destination, ...(start ? { from: start } : {}), ...(end && end !== start ? { to: end } : {}) });
  const packageTarget = eskySearchUrl({ query: destination, departure, start, end });
  return <section className="travel-search-options" aria-label="Sprawdź możliwości wyjazdu">
    <h4>{destination ? `${destination} — sprawdź wyjazd` : 'Sprawdź wyjazd'}</h4>
    <p>Wybierz wycieczkę lub zaplanuj lot i nocleg osobno.</p>
    <div className="travel-search-options__actions">
      <Link className="travel-search-options__primary" href="/szukaj-wakacji">Sprawdź wycieczkę →</Link>
      <Link href={`/loty?${flight}`}>Sprawdź loty</Link>
      <Link href={`/hotele?${hotel}`}>Sprawdź noclegi</Link>
    </div>
    <small>Otworzysz wyszukiwarkę. Cenę i dostępność sprawdzisz po wyborze terminu.</small>
    <details className="travel-search-options__more">
      <summary>Inne opcje wyszukiwania</summary>
      <div className="travel-search-options__secondary">
        {children}
        <Link href={`/sprawdz-oferte?${new URLSearchParams({ partner: 'esky', target: packageTarget, destination, source: 'hybrid_packages' })}`}>Sprawdź lot + hotel</Link>
        {(['tui', 'exim'] as const).map((partner, index) => <Link key={partner}
          href={`/sprawdz-oferte?${new URLSearchParams({ partner, target: partners[partner].buildUrl(), destination, source: 'hybrid_catalogue' })}`}>
          {index === 0 ? 'Przeglądaj wycieczki zorganizowane' : 'Sprawdź dodatkowy katalog wycieczek'}
        </Link>)}
      </div>
      <small>W dodatkowych katalogach wybierz kierunek i termin ponownie.</small>
    </details>
  </section>;
}
