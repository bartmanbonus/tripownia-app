import type { Metadata } from 'next';
import Link from 'next/link';
import ReadySearchGrid from '@/components/ReadySearchGrid';
import SalesCollectionSchema from '@/components/SalesCollectionSchema';
import SiteHeader from '@/components/SiteHeader';
import { partners } from '@/lib/partners';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: { absolute: 'Wyszukiwarka wycieczek — wybierz wyjazd | Tripownia.pl' },
  description: 'Szukasz wycieczki z biurem podróży? Wybierz kierunek, termin, lotnisko i uczestników. Sprawdź wakacje All Inclusive i last minute, a rezerwację dokończ w serwisie rezerwacyjnym.',
  openGraph: { title: 'Wyszukiwarka wycieczek — wybierz wakacje', description: 'Kierunek, termin i lotnisko w jednym miejscu. Wyszukaj wyjazd i sprawdź warunki rezerwacji w serwisie rezerwacyjnym.', url: 'https://tripownia.pl/szukaj-wakacji', type: 'website' },
  alternates: { canonical: '/szukaj-wakacji' },
};

export default function PackageSearchPage() {
  return <main><SiteHeader />
    <SalesCollectionSchema name="Wyszukiwarka wycieczek" description="Wyszukaj wycieczki z biurem podróży, All Inclusive i last minute." path="/szukaj-wakacji" about={['wycieczki z biurem podróży', 'wakacje', 'All Inclusive', 'last minute']} />
    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">WYSZUKAJ WYCIECZKĘ</div>
        <h1>Wyszukiwarka wycieczek: znajdź wakacje z biurem podróży</h1>
        <p>Wybierz kierunek, termin, lotnisko i uczestników. Wyniki i rezerwację otworzysz w serwisie rezerwacyjnym.</p>
      </div></div>
      <iframe id="wyszukiwarka-wycieczek" src="/widgets/wakacje-search.html" title="Wyszukiwarka wycieczek" style={{ width: '100%', height: '850px', border: 0, borderRadius: '16px' }} />
      <p>Jeśli wyszukiwarka się nie wyświetla, <a href={`/sprawdz-oferte?${new URLSearchParams({ partner: 'wakacje', target: partners.wakacje.buildUrl(), source: 'wakacje_widget' })}`}>przejdź do wyszukiwania wycieczek</a>.</p>
    </section>
    <section className="section shell">
      <h2>Wiesz już, jakiego wyjazdu szukasz?</h2>
      <p>Przejdź do odpowiedniej kategorii Tripowni, aby zawęzić wybór, albo porównaj inne terminy w wyszukiwarce powyżej.</p>
      <ReadySearchGrid items={[
        { href: '/tanie-all-inclusive', eyebrow: 'WYŻYWIENIE W PAKIECIE', title: 'Wakacje All Inclusive', meta: 'Porównaj hotele, terminy i zakres wyżywienia.', cta: 'Sprawdź All Inclusive →' },
        { href: '/last-minute', eyebrow: 'BLISKIE TERMINY', title: 'Wycieczki last minute', meta: 'Sprawdź dostępne wyjazdy i godziny lotów.', cta: 'Sprawdź last minute →' },
        { href: '/wakacje-2027', eyebrow: 'ZAPLANUJ WCZEŚNIEJ', title: 'Wakacje 2027', meta: 'Wybierz termin i kierunek na kolejny sezon.', cta: 'Zobacz wakacje 2027 →' },
        { href: '/z-warszawy', eyebrow: 'CHOPIN I MODLIN', title: 'Wakacje z Warszawy', meta: 'Wyszukaj wyjazd z dogodnym lotniskiem.', cta: 'Sprawdź wyloty z Warszawy →' },
        { href: '/z-katowic', eyebrow: 'PYRZOWICE', title: 'Wakacje z Katowic', meta: 'Porównaj kierunki dostępne z Katowic.', cta: 'Sprawdź wyloty z Katowic →' },
        { href: '/wakacje-z-dziecmi', eyebrow: 'WYJAZD RODZINNY', title: 'Wakacje z dziećmi', meta: 'Uwzględnij wiek dzieci, pokój i długość transferu.', cta: 'Sprawdź wyjazdy rodzinne →' },
      ]} />
    </section>
    <section className="section shell">
      <h2>Jak wybrać wycieczkę i przejść do rezerwacji?</h2>
      <ol><li>Wpisz kierunek lub pozostaw pole puste, wybierz lotnisko oraz przedział dat.</li>
      <li>Ustaw liczbę dorosłych i wiek dzieci. Dzięki temu porównujesz oferty dla właściwego składu podróżnych.</li>
      <li>Kliknij „Szukaj”. Wyniki otworzą się w serwisie rezerwacyjnym, gdzie sprawdzisz konkretny hotel, termin i cenę.</li>
      <li>Przed zakupem sprawdź łączną cenę dla wszystkich uczestników, bagaż, transfer, wyżywienie i warunki rezygnacji.</li></ol>
      <h2>Co porównać poza ceną za osobę?</h2>
      <p>Dwa wyjazdy do tego samego hotelu mogą różnić się pokojem, lotniskiem, godzinami przelotu i wyżywieniem. Porównuj je dla tej samej liczby osób i nocy. Sprawdź, czy transfer oraz bagaż są wliczone, a także ile czasu faktycznie spędzisz na miejscu.</p>
      <h2>Gdzie kupuję wycieczkę?</h2>
      <p>Tripownia pomaga znaleźć wyjazd. W tej wyszukiwarce wybierasz parametry, a szczegóły oferty i rezerwację obsługuje serwis rezerwacyjny partnera. Przed zapłatą sprawdź wskazanego organizatora oraz warunki konkretnej wycieczki.</p>
      <h2>Czy cena może się zmienić?</h2>
      <p>Tak. Ceny i dostępność zależą od terminu, składu podróżnych i wybranego wariantu. Obowiązującą cenę sprawdź u partnera przed potwierdzeniem rezerwacji. Link afiliacyjny pozwala Tripowni otrzymać prowizję zgodnie z warunkami programu.</p>
      <p><Link href="#wyszukiwarka-wycieczek">Wróć do wyszukiwarki wycieczek ↑</Link> · <Link href="/kierunki">Porównaj kierunki podróży</Link></p>
    </section><SiteFooter /></main>;
}
