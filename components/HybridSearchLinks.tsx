import Link from 'next/link';
import { partners } from '@/lib/partners';
import { eskySearchUrl } from '@/lib/eskySearch';

/** Search routes are separate from priced offers; never count them as available inventory. */
export default function HybridSearchLinks({ destination, departure = '', month = '', start = '', end = '' }: {
  destination: string; departure?: string; month?: string; start?: string; end?: string;
}) {
  if (!destination.trim()) return null;
  const flight = new URLSearchParams({ destination, ...(departure ? { origin: departure } : {}),
    ...(month ? { month } : {}), ...(start ? { outbound: start } : {}), ...(end && end !== start ? { inbound: end } : {}) });
  const hotel = new URLSearchParams({ q: destination });
  const packageTarget = eskySearchUrl({ query: destination, departure, start, end });
  return <section className="search-v3-empty" aria-label="Dalsze wyszukiwanie podróży">
    <strong>Więcej możliwości: {destination}</strong>
    <p>Porównaj pakiet lub dobierz lot i nocleg osobno. Poniższe odnośniki otwierają wyszukiwarki, a nie potwierdzone oferty cenowe.</p>
    <div className="search-v3-empty-actions">
      <Link href={`/loty?${flight}`}>Loty do: {destination}</Link>
      <Link href={`/hotele?${hotel}`}>Hotele w: {destination}</Link>
      <Link href={`/sprawdz-oferte?${new URLSearchParams({ partner: 'esky', target: packageTarget, destination, source: 'hybrid_packages' })}`}>eSky — lot + hotel</Link>
      {(['tui', 'exim', 'wakacje'] as const).map(partner => <Link key={partner}
        href={`/sprawdz-oferte?${new URLSearchParams({ partner, target: partners[partner].buildUrl(), destination, source: 'hybrid_catalogue' })}`}>
        {partners[partner].name} — pełny katalog
      </Link>)}
    </div>
    <small>W pełnych katalogach wybierz kierunek i filtry ponownie; ceny i dostępność potwierdza partner.</small>
  </section>;
}
