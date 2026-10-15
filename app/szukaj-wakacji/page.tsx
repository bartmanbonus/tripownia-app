import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import { partners } from '@/lib/partners';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Wyszukaj wycieczkę — oferta Wakacje.pl | Tripownia',
  description: 'Wybierz kierunek, termin i lotnisko w wyszukiwarce Wakacje.pl. Sprawdź wycieczki z afiliacją Tripowni.',
  alternates: { canonical: '/szukaj-wakacji' },
};

export default function PackageSearchPage() {
  return <main><SiteHeader />
    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">WYSZUKAJ WYCIECZKĘ</div>
        <h1>Sprawdź oferty Wakacje.pl</h1>
        <p>Wybierz kierunek, termin, lotnisko i uczestników. Wyniki i rezerwację otworzysz w Wakacje.pl.</p>
      </div></div>
      <iframe src="/widgets/wakacje-search.html" title="Wyszukiwarka wycieczek Wakacje.pl" style={{ width: '100%', height: '850px', border: 0, borderRadius: '16px' }} />
      <p>Jeśli wyszukiwarka się nie wyświetla, <a href={`/sprawdz-oferte?${new URLSearchParams({ partner: 'wakacje', target: partners.wakacje.buildUrl(), source: 'wakacje_widget' })}`}>przejdź do ofert Wakacje.pl</a>.</p>
    </section><SiteFooter /></main>;
}
