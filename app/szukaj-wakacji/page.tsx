import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Search } from 'lucide-react';
import ReadySearchGrid from '@/components/ReadySearchGrid';
import SalesCollectionSchema from '@/components/SalesCollectionSchema';
import SiteHeader from '@/components/SiteHeader';
import SearchHub from '@/components/SearchHub';
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
    <section className="holiday-landing">
      <div className="holiday-landing-hero">
        <div className="holiday-landing-hero-inner shell">
          <div className="holiday-landing-hero-copy">
            <span className="kicker">TRIPOWNIA · WAKACJE I WYCIECZKI</span>
            <h1>Znajdź wakacje <em>szybciej i wygodniej</em></h1>
            <p>Wybierz kierunek, termin i lotnisko. Sprawdź wycieczki oraz All Inclusive, a rezerwację dokończ bezpiecznie u partnera.</p>
            <div className="holiday-landing-trust">
              <span><Search size={17}/> Szeroki wybór kierunków</span>
              <span><ShieldCheck size={17}/> Rezerwacja u partnera</span>
              <span><Sparkles size={17}/> Jedna wygodna wyszukiwarka</span>
            </div>
          </div>
          <div className="holiday-landing-hero-photo" role="img" aria-label="Majorka: nadmorski pejzaż i architektura"/>
        </div>
      </div>
      <div className="shell holiday-landing-search">
        <div id="wyszukiwarka-wycieczek" className="holiday-landing-native-search"><SearchHub embedded initialTab="Wakacje" /></div>
        <p className="holiday-landing-fallback">Jeśli wyszukiwarka nie działa, <a href={`/sprawdz-oferte?${new URLSearchParams({ partner: 'wakacje', target: partners.wakacje.buildUrl(), source: 'wakacje_widget' })}`}>otwórz pełne wyszukiwanie wycieczek</a>.</p>
      </div>
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
    </section>
    <style>{`
      .holiday-landing{padding-bottom:14px;background:linear-gradient(180deg,#fff8f3,#fff 88%)}
      .holiday-landing-hero{background:linear-gradient(110deg,#fff6ec 0%,#fff8f3 47%,#e9f4fb 100%);position:relative;overflow:hidden}
      .holiday-landing-hero-inner{display:grid;grid-template-columns:1fr minmax(300px,.9fr);gap:30px;align-items:center;padding:42px 0 94px}
      .holiday-landing-hero-copy{position:relative;z-index:1}
      .holiday-landing-hero h1{max-width:700px;margin:16px 0;font-size:clamp(36px,4.5vw,64px);letter-spacing:-.055em;line-height:1.02;color:#182342}
      .holiday-landing-hero h1 em{font-style:normal;color:#f0522b}
      .holiday-landing-hero-copy>p{max-width:680px;color:#606575;font-size:17px;line-height:1.55}
      .holiday-landing-trust{display:flex;flex-wrap:wrap;gap:14px;margin-top:26px}
      .holiday-landing-trust span{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;color:#3e495e}
      .holiday-landing-trust svg{color:#f0522b}
      .holiday-landing-hero-photo{min-height:285px;align-self:stretch;background:url('/images/destinations/majorka.jpg') center/cover;border-radius:90px 20px 90px 20px;box-shadow:0 14px 34px rgba(28,73,91,.16)}
      .holiday-landing-search{position:relative;z-index:2;margin-top:-67px}
      .holiday-landing-native-search{padding:clamp(16px,2.5vw,28px);border:1px solid #ead8cc;border-radius:24px;background:#fff;box-shadow:0 16px 48px rgba(25,28,47,.10)}
      .holiday-landing-native-search .search-v3-embedded .search-v3-head{padding:0 0 16px!important}
      .holiday-landing-native-search .search-v3-embedded .search-v3-form{padding:0 0 18px!important}
      .holiday-landing-native-search .search-v3-embedded .search-v3-tabs{padding:0 0 16px!important}
      .holiday-landing-native-search .search-v3-embedded .search-v3-submit{background:#f4512c!important;color:#fff!important}
      .holiday-landing-fallback{padding:0 12px;font-size:12px;color:#727780}
      .holiday-landing-fallback a{color:#e64c2d;font-weight:800}
      @media(max-width:760px){.holiday-landing-hero-inner{grid-template-columns:1fr;padding:26px 0 72px;gap:16px}.holiday-landing-hero h1{font-size:clamp(34px,9vw,48px)}.holiday-landing-hero-photo{min-height:150px;max-height:190px;border-radius:20px}.holiday-landing-search{margin-top:-48px}.holiday-landing-trust{gap:10px}}
    `}</style><SiteFooter /></main>;
}
