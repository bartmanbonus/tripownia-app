import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  MapPin,
  PlaneTakeoff,
  Search,
  Sparkles,
  WalletCards,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FlexibleFlightsExplorer from "@/components/FlexibleFlightsExplorer";

export const metadata: Metadata = {
  title: "Tanie loty z Polski — okazje lotnicze i city breaki",
  description: "Tanie loty z Warszawy, Krakowa, Katowic, Gdańska, Wrocławia i Poznania. Sprawdź okazje lotnicze z polskich lotnisk i pomysły na city break oraz wakacje.",
  alternates: { canonical: "/tanie-loty" },
  openGraph: {
    title: "Tanie loty z Polski | Tripownia.pl",
    description: "Szukaj tanich lotów z polskich lotnisk według kierunku, elastycznych dat i długości wyjazdu.",
    type: "website",
    url: "/tanie-loty",
  },
};

const airportLinks = [
  { label: "Warszawa", code: "WAW + WMI", href: "/podroze/tanie-loty-z-warszawy", note: "Chopin i Modlin" },
  { label: "Kraków", code: "KRK", href: "/podroze/tanie-loty-z-krakowa", note: "Balice" },
  { label: "Katowice", code: "KTW", href: "/podroze/tanie-loty-z-katowic", note: "Pyrzowice" },
  { label: "Gdańsk", code: "GDN", href: "/podroze/tanie-loty-z-gdanska", note: "Rębiechowo" },
  { label: "Wrocław", code: "WRO", href: "/podroze/tanie-loty-z-wroclawia", note: "Strachowice" },
  { label: "Poznań", code: "POZ", href: "/podroze/tanie-loty-z-poznania", note: "Ławica" },
  { label: "Lublin", code: "LUZ", href: "/podroze/tanie-loty-z-lublina", note: "Świdnik" },
  { label: "Modlin", code: "WMI", href: "/podroze/tanie-loty-z-modlina", note: "Warszawa-Modlin" },
];

const inspirations = [
  { eyebrow: "CITY BREAK", title: "Do 1000 zł", text: "Krótki wyjazd bez przepalania budżetu.", href: "/podroze/city-break-do-1000-zl" },
  { eyebrow: "WIĘCEJ OPCJI", title: "Do 1500 zł", text: "Większy wybór terminów i kierunków.", href: "/podroze/city-break-do-1500-zl" },
  { eyebrow: "POPULARNY KIERUNEK", title: "Rzym", text: "Sprawdź terminy z Warszawy i porównaj ceny.", href: "/podroze/rzym-z-warszawy" },
  { eyebrow: "SŁOŃCE", title: "Malta", text: "Dobry kierunek na krótki reset przez cały rok.", href: "/podroze/malta-z-warszawy" },
];

export default function CheapFlightsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tanie loty z Polski — Tripownia",
    description: "Aktualne okazje lotnicze z polskich lotnisk oraz pomysły na krótkie i dłuższe wyjazdy.",
    url: "https://tripownia.pl/tanie-loty",
    isPartOf: { "@type": "WebSite", name: "Tripownia", url: "https://tripownia.pl" },
  };

  return (
    <main className="cheap-flights-v2">
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="cheap-flights-hero">
        <div className="shell cheap-flights-hero-shell">
          <div className="cheap-flights-hero-copy">
            <div className="cheap-flights-eyebrow"><PlaneTakeoff size={15}/> TANIE LOTY</div>
            <h1>Nie szukaj lotu godzinami.<br/><span>Poluj na dobry termin.</span></h1>
            <p>
              Wybierz skąd chcesz lecieć, dokąd albo zostaw kierunek otwarty.
              Tripownia pomoże Ci znaleźć tanie terminy i konkretne pomysły na wyjazd.
            </p>

            <div className="cheap-flights-hero-actions">
              <a className="cheap-flights-primary" href="#poluj-na-loty">
                <Sparkles size={17}/> Poluj na najtańszy termin
              </a>
              <Link className="cheap-flights-secondary" href="/loty">
                <CalendarDays size={17}/> Mam konkretne daty
              </Link>
            </div>

            <div className="cheap-flights-benefits" aria-label="Co możesz zrobić">
              <span><BadgeCheck size={15}/> elastyczne daty</span>
              <span><BadgeCheck size={15}/> wiele lotnisk</span>
              <span><BadgeCheck size={15}/> kierunek „gdziekolwiek”</span>
            </div>
          </div>

          <div className="cheap-flights-hero-panel" aria-label="Szybka ścieżka wyszukiwania">
            <div className="cheap-flights-hero-panel-top">
              <span>NAJSZYBSZY START</span>
              <strong>Jak chcesz szukać?</strong>
            </div>
            <Link href="#poluj-na-loty">
              <span className="cheap-flights-path-icon"><Sparkles size={19}/></span>
              <span>
                <strong>Najtańszy termin</strong>
                <small>Nie znam dat albo kierunku</small>
              </span>
              <ArrowRight size={17}/>
            </Link>
            <Link href="/loty">
              <span className="cheap-flights-path-icon"><Search size={19}/></span>
              <span>
                <strong>Konkretny lot</strong>
                <small>Mam daty i trasę</small>
              </span>
              <ArrowRight size={17}/>
            </Link>
            <Link href="/gdzie-leciec">
              <span className="cheap-flights-path-icon"><WalletCards size={19}/></span>
              <span>
                <strong>Mam tylko budżet</strong>
                <small>Tripownia dobierze kierunek</small>
              </span>
              <ArrowRight size={17}/>
            </Link>
          </div>
        </div>
      </section>

      <section className="shell cheap-flights-search-section" id="poluj-na-loty">
        <div className="cheap-flights-section-head">
          <div>
            <div className="kicker">ELASTYCZNE LOTY</div>
            <h2>Najpierw ustaw tylko to, co naprawdę wiesz.</h2>
            <p>Nie musisz podawać konkretnej daty. Możesz wybrać kilka lotnisk, kilka kierunków albo zostawić „Gdziekolwiek”.</p>
          </div>
          <div className="cheap-flights-section-tip">
            <Sparkles size={18}/>
            <span><strong>Największa szansa na dobrą cenę:</strong> elastyczny kierunek + kilka lotnisk wylotu.</span>
          </div>
        </div>
        <div className="cheap-flights-search-shell">
          <FlexibleFlightsExplorer />
        </div>
      </section>

      <section className="shell cheap-flights-airports">
        <div className="cheap-flights-section-head compact">
          <div>
            <div className="kicker">LOTNISKO WYLOTU</div>
            <h2>Sprawdź tanie loty ze swojego miasta.</h2>
            <p>Jeśli wolisz przeglądać konkretne lotnisko, przejdź od razu do gotowej listy.</p>
          </div>
        </div>

        <div className="cheap-flights-airport-grid">
          {airportLinks.map((item) => (
            <Link href={item.href} key={item.href}>
              <span className="cheap-flights-airport-icon"><MapPin size={18}/></span>
              <span className="cheap-flights-airport-copy">
                <small>{item.code}</small>
                <strong>{item.label}</strong>
                <em>{item.note}</em>
              </span>
              <ArrowRight size={16}/>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell cheap-flights-inspiration">
        <div className="cheap-flights-section-head compact">
          <div>
            <div className="kicker">NIE WIESZ JESZCZE GDZIE?</div>
            <h2>Zacznij od budżetu albo sprawdzonego kierunku.</h2>
          </div>
          <Link href="/podroze">Wszystkie pomysły <ArrowRight size={16}/></Link>
        </div>

        <div className="cheap-flights-inspiration-grid">
          {inspirations.map((item) => (
            <Link href={item.href} key={item.href}>
              <small>{item.eyebrow}</small>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
              <b>Zobacz opcje <ArrowRight size={14}/></b>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell cheap-flights-method">
        <div className="cheap-flights-method-copy">
          <div className="kicker">JAK SZUKAMY</div>
          <h2>Tani lot to nie tylko najniższa liczba na ekranie.</h2>
          <p>
            Liczy się również sensowny termin, długość wyjazdu i lotnisko wylotu.
            Dlatego Tripownia ma pomagać szybko znaleźć opcję, którą naprawdę da się kupić i wykorzystać.
          </p>
        </div>
        <div className="cheap-flights-method-grid">
          <div><strong>1</strong><span><b>Ustaw minimum</b><small>Skąd, dokąd lub „Gdziekolwiek”.</small></span></div>
          <div><strong>2</strong><span><b>Porównaj terminy</b><small>Sprawdź kilka długości pobytu.</small></span></div>
          <div><strong>3</strong><span><b>Sprawdź cenę</b><small>Finalną kwotę potwierdź przed rezerwacją.</small></span></div>
        </div>
      </section>

      <section className="shell cheap-flights-bottom-cta">
        <div>
          <small>MASZ KONKRETNE DATY?</small>
          <strong>Przejdź do pełnej porównywarki lotów.</strong>
          <span>Ustaw trasę, termin i liczbę pasażerów.</span>
        </div>
        <Link href="/loty">Szukaj konkretnego lotu <ArrowRight size={17}/></Link>
      </section>

      <SiteFooter />
    </main>
  );
}
