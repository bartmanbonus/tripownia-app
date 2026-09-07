"use client";

import Link from "next/link";
import {
  Tag,
  Trophy,
  Heart,
  Star,
  TreePine,
  PartyPopper,
  Plane,
  Search,
  BedDouble,
  Car,
  ShieldCheck,
  BookOpen,
  Lightbulb,
  CircleHelp,
  UserRound,
} from "lucide-react";

export default function SiteHeader() {
  const showMarkets = Date.now() <= new Date("2027-01-07T22:59:59Z").getTime();
  const siteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://tripownia.pl/#organization", name: "Tripownia.pl", url: "https://tripownia.pl/", logo: "https://tripownia.pl/tripownia-logo.webp" },
      { "@type": "WebSite", "@id": "https://tripownia.pl/#website", url: "https://tripownia.pl/", name: "Tripownia.pl", publisher: { "@id": "https://tripownia.pl/#organization" }, inLanguage: "pl-PL" },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema).replace(/</g, "\\u003c") }} />
    <header className="site-header-shell site-header-v98 site-header-premium site-header-premium-v4">
      <div className="site-nav shell premium-mega-shell">
        <Link className="brand-logo premium-brand" href="/" aria-label="Tripownia.pl">
          <img src="/tripownia-logo.webp" alt="Tripownia.pl" width="82" height="82" />
        </Link>

        <div className="site-nav-stack premium-mega-stack">
          <nav className="site-nav-primary premium-nav-primary premium-nav-primary-v4" aria-label="Najważniejsze sekcje">
            <Link className="nav-sale nav-v4 nav-v4-deals" href="/okazje">
              <span className="nav-v4-icon"><Tag size={20}/></span>
              <span className="nav-v4-copy"><strong>Okazje</strong><small>Nasze najlepsze ceny</small></span>
            </Link>

            <Link className="nav-sale nav-v4 nav-v4-events" href="/wydarzenia" title="Mecze, eventy i wyjazdy sportowe">
              <span className="nav-v4-icon"><Trophy size={21}/></span>
              <span className="nav-v4-copy"><strong>Mecze i eventy</strong><small>Terminarze i wyjazdy</small></span>
            </Link>

            <Link className="nav-sale nav-v4 nav-v4-experience" href="/podroze-po-przezycia">
              <span className="nav-v4-icon"><Heart size={20}/></span>
              <span className="nav-v4-copy"><strong>Przeżycia</strong><small>Nasze inspiracje</small></span>
            </Link>

            <Link className="nav-sale nav-v4 nav-v4-picks" href="/podroze">
              <span className="nav-v4-icon"><Star size={21}/></span>
              <span className="nav-v4-copy"><strong>Atrakcje Tripowni</strong><small>Nasze TOP propozycje</small></span>
              <span className="nav-v4-badge">TOP</span>
            </Link>

            {showMarkets && <Link className="nav-sale nav-v4 nav-v4-market seasonal-nav-link" href="/jarmarki-bozonarodzeniowe">
              <span className="nav-v4-icon"><TreePine size={21}/></span>
              <span className="nav-v4-copy"><strong>Jarmarki</strong><small>Terminy sezonu</small></span>
            </Link>}

            <Link className="nav-sale nav-v4 nav-v4-newyear seasonal-nav-link" href="/sylwester">
              <span className="nav-v4-icon"><PartyPopper size={21}/></span>
              <span className="nav-v4-copy"><strong>Sylwester</strong><small>Wyjazdy 2026/27</small></span>
            </Link>

            <Link className="nav-sale nav-v4 nav-v4-longhaul" href="/dalekie-podroze">
              <span className="nav-v4-icon"><Plane size={21}/></span>
              <span className="nav-v4-copy"><strong>Dalekie podróże</strong><small>Nasze odkrycia</small></span>
            </Link>

            <Link className="nav-v4-search" href="/#wyszukiwarka" aria-label="Szukaj wyjazdu">
              <Search size={22} strokeWidth={2.3}/>
              <span>Szukaj</span>
            </Link>
          </nav>

          <nav className="site-nav-secondary premium-nav-secondary premium-nav-secondary-v4" aria-label="Usługi i pozostałe sekcje">
            <div className="premium-nav-services">
              <Link href="/#wyszukiwarka"><BedDouble size={17}/><span>Hotele</span></Link>
              <Link href="/#wyszukiwarka"><Plane size={17}/><span>Loty</span></Link>
              <Link href="/podroze"><Car size={17}/><span>Wynajem aut</span></Link>
              <Link href="/podroze"><ShieldCheck size={17}/><span>Ubezpieczenia</span></Link>
              <Link href="/magazyn-podrozniczy"><BookOpen size={17}/><span>Poradniki</span></Link>
              <Link href="/podroze"><Lightbulb size={17}/><span>Inspiracje</span></Link>
            </div>
            <div className="premium-nav-account">
              <Link href="/podroze"><CircleHelp size={17}/><span>Pomoc</span></Link>
              <Link href="/ulubione"><Heart size={17}/><span>Ulubione</span></Link>
              <Link href="/ulubione"><UserRound size={17}/><span>Moje konto</span></Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  </>;
}
