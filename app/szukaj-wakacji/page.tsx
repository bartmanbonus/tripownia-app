import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Search } from 'lucide-react';
import ReadySearchGrid from '@/components/ReadySearchGrid';
import SalesCollectionSchema from '@/components/SalesCollectionSchema';
import SiteHeader from '@/components/SiteHeader';
import WakacjePrimarySearch from '@/components/WakacjePrimarySearch';
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
            <h1>Znajdź wakacje</h1>
          </div>
        </div>
      </div>
      <div className="shell holiday-landing-search">
        <WakacjePrimarySearch featured id="wyszukiwarka-wycieczek" title="Kierunek, termin i gotowe wyjazdy" description="" />
        <p className="holiday-landing-fallback">Jeśli wyszukiwarka nie działa, <a href={`/sprawdz-oferte?${new URLSearchParams({ partner: 'wakacje', target: partners.wakacje.buildUrl(), source: 'wakacje_widget' })}`}>otwórz pełne wyszukiwanie wycieczek</a>.</p>
      </div>
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
      .holiday-landing-fallback{padding:0 12px;font-size:12px;color:#727780}
      .holiday-landing-fallback a{color:#e64c2d;font-weight:800}
      @media(max-width:760px){.holiday-landing-hero-inner{grid-template-columns:1fr;padding:26px 0 72px;gap:16px}.holiday-landing-hero h1{font-size:clamp(34px,9vw,48px)}.holiday-landing-hero-photo{min-height:150px;max-height:190px;border-radius:20px}.holiday-landing-search{margin-top:-48px}.holiday-landing-trust{gap:10px}}
      .holiday-landing-hero-inner{display:block;padding:24px 0 20px}
      .holiday-landing-hero h1{font-size:clamp(28px,4vw,40px);margin:8px 0}
      .holiday-landing-hero-photo{display:none}
      .holiday-landing-search{margin-top:0}
    `}</style><SiteFooter /></main>;
}
