import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SalesCollectionSchema from "@/components/SalesCollectionSchema";
import SearchHub from "@/components/SearchHub";
import LiveSalesRail from "@/components/LiveSalesRail";
import { homepageFallbackOffers } from "@/lib/offers";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import ReadySearchGrid from "@/components/ReadySearchGrid";
import styles from "../conversion-pages.module.css";

export const metadata: Metadata = {
  title: "City break z Polski — tanie loty + hotel na 2–5 dni",
  description: "City break z Warszawy, Poznania, Krakowa i innych lotnisk. Porównaj lot + hotel na 2–5 dni, aktualne oferty oraz gotowe terminy weekendowych wyjazdów.",
  alternates: { canonical: "/city-break" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "City break z Polski — tanie loty + hotel na 2–5 dni",
    description: "City break lot + hotel, loty z noclegiem i krótkie wyjazdy na 2–5 dni. Porównaj aktualne propozycje.",
    url: "/city-break",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "City break z Polski — tanie loty + hotel na 2–5 dni",
    description: "City break lot + hotel, loty z noclegiem i krótkie wyjazdy na 2–5 dni. Porównaj aktualne propozycje.",
    images: ["/opengraph-image"],
  },
};

const cityBreakIdeas = [
  {city:"Marrakesz", country:"Maroko", image:"/images/destinations/marrakesz.jpg", text:"Słońce, riady i zupełnie inny klimat w kilka godzin lotu."},
  {city:"Dubaj", country:"ZEA", image:"/images/destinations/dubaj.jpg", text:"Ciepło, nowoczesność i dużo atrakcji na 4–5 dni."},
  {city:"Sewilla", country:"Hiszpania", image:"/images/destinations/sewilla.jpg", text:"Tapasy, słońce i jeden z najlepszych kierunków na jesień."},
  {city:"Ateny", country:"Grecja", image:"/images/destinations/ateny.jpg", text:"Historia, jedzenie i szybki miejski reset."},
  {city:"Wenecja", country:"Włochy", image:"/images/destinations/wenecja.jpg", text:"Klasyk, ale najlepiej poza wakacyjnym tłumem."},
  {city:"Walencja", country:"Hiszpania", image:"/images/destinations/walencja.jpg", text:"Miasto i plaża w jednym krótkim wyjeździe."},
  {city:"Porto", country:"Portugalia", image:"/images/destinations/porto.jpg", text:"Jedzenie, wino i spacerowanie bez gonitwy."},
  {city:"Stambuł", country:"Turcja", image:"/images/destinations/stambul.jpg", text:"Europa i Azja w jednym bardzo intensywnym city breaku."},
];

export default function CityBreakPage() {
  return <main className={styles.page}>
    <SiteHeader/>
    <SalesCollectionSchema name="City break 2026" description="City break lot + hotel, loty z noclegiem i krótkie wyjazdy na 2–5 dni." path="/city-break" about={["city break","lot + hotel","tani weekend","loty z noclegiem"]} />

    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>CITY BREAK 2026</div>
          <h1>City break lot + hotel – tanie pakiety na 2–5 dni</h1>
          <p>Ustaw miasto, lotnisko wylotu, termin i liczbę nocy. Porównaj wariant lot + hotel, gotowe kierunki oraz krótkie wyjazdy na 2–5 dni.</p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#szukaj-city-break">Znajdź najtańszy lot + hotel</a>
            <Link className={styles.secondary} href="/magazyn-podrozniczy/city-break-2026">Jak dobrze szukać city breaków</Link>
          </div>
        </div>
        <div className={styles.heroMedia}>
          <Image src="/images/destinations/rzym.jpg" alt="City break w europejskim mieście" fill sizes="(max-width:980px) 100vw, 45vw" priority/>
        </div>
      </div>
    </section>

    <section className={styles.shell}>
      <div className={styles.factGrid}>
        <div className={styles.fact}><small>ILE DNI</small><strong>2–5 dni</strong><p>Na city break najczęściej liczy się wygodny układ lotów, nie sama cena.</p></div>
        <div className={styles.fact}><small>LOTNISKO</small><strong>Porównaj dojazd</strong><p>Tani bilet z dalszego lotniska może przestać być tani po doliczeniu transportu.</p></div>
        <div className={styles.fact}><small>NOCLEG</small><strong>Lokalizacja ma znaczenie</strong><p>Przy krótkim wyjeździe godzina dziennie stracona na dojazdy boli bardziej.</p></div>
        <div className={styles.fact}><small>BAGAŻ</small><strong>Sprawdź zasady linii</strong><p>Na 2–4 dni często wystarczy podręczny, ale limity linii różnią się mocno.</p></div>
      </div>
    </section>

    <section className={[styles.shell, styles.section].join(" ")}>
      <div className={styles.sectionHead}>
        <div><div className={styles.kicker}>AKTUALNE PROPOZYCJE</div><h2>Najtańsze city breaki teraz</h2><p>Aktualne ceny z bieżących źródeł. Sortujemy od najniższej ceny i pokazujemy krótkie wyjazdy.</p></div>
        <Link href="/okazje">Wszystkie okazje →</Link>
      </div>
      <LiveSalesRail mode="citybreak" limit={8} initialOffers={homepageFallbackOffers}/>
      <nav className={styles.linkPills} aria-label="City break z konkretnych lotnisk w Polsce">
        <Link href="/podroze/city-break-z-warszawy">City break z Warszawy (WAW i Modlin)</Link>
        <Link href="/podroze/city-break-z-poznania">City break z Poznania (POZ)</Link>
        <Link href="/podroze/city-break-z-krakowa">City break z Krakowa (KRK)</Link>
        <Link href="/podroze/city-break-z-gdanska">City break z Gdańska (GDN)</Link>
      </nav>
    </section>
    <section className={[styles.shell, styles.section].join(" ")}><FacebookFollowCTA placement="city_break_after_offers" compact /></section>

    <section className={styles.shell} id="szukaj-city-break">
      <div className={styles.searchPanel}>
        <div className={styles.searchPanelHead}>
          <div className={styles.kicker}>SZUKAJ PO SWOJEMU</div>
          <h2>Miasto, termin, lotnisko — i gotowe</h2>
          <p>Domyślnie ustawiamy krótki wyjazd. Możesz wpisać kilka kierunków albo zostawić pole puste i szukać szerzej.</p>
        </div>
        <SearchHub
          embedded
          initialTab="City break"
          initialDuration="3-4"
          destinationQuickPicks={["Rzym", "Mediolan", "Barcelona", "Praga", "Wiedeń", "Porto"]}
        />
      </div>
    </section>

    <section className={[styles.shell, styles.section].join(" ")}>
      <div className={styles.sectionHead}>
        <div>
          <div className={styles.kicker}>GOTOWE CITY BREAKI</div>
          <h2>Wybierz konkretny kierunek — parametry już ustawione</h2>
          <p>Klikasz i od razu dostajesz wyniki dla kierunku, długości pobytu i budżetu. Nie wracasz do pustej wyszukiwarki.</p>
        </div>
      </div>
      <ReadySearchGrid items={[
        { href: "/szukaj?destination=Rzym&duration=3-4&budget=1500&tab=City%20break", eyebrow: "RZYM · 3–4 NOCE · DO 1 500 ZŁ", title: "Rzym lot + hotel", meta: "Krótki city break, aktualne warianty z polskich lotnisk." },
        { href: "/szukaj?destination=Bari&duration=2-4&budget=1500&tab=City%20break", eyebrow: "BARI · 2–4 NOCE · DO 1 500 ZŁ", title: "Bari i Apulia", meta: "Bari jako baza na krótki wyjazd po południu Włoch." },
        { href: "/szukaj?destination=Malta&duration=3-5&budget=1500&tab=City%20break", eyebrow: "MALTA · 3–5 NOCY · DO 1 500 ZŁ", title: "Malta lot + hotel", meta: "Valletta, Sliema i krótki wyjazd bez składania planu od zera." },
        { href: "/szukaj?destination=Barcelona&duration=3-4&budget=1500&tab=City%20break", eyebrow: "BARCELONA · 3–4 NOCE · DO 1 500 ZŁ", title: "Barcelona lot + hotel", meta: "Miasto, dobre połączenia i konkretne krótkie terminy." },
      ]} />
    </section>

    <section className={[styles.shell, styles.section].join(" ")}>
      <div className={styles.sectionHead}><div><div className={styles.kicker}>WIĘCEJ POMYSŁÓW</div><h2>Nie ograniczamy city breaku do aktualnych kart</h2><p>Te kierunki służą jako szybki start do własnego wyszukiwania.</p></div></div>
      <div className={styles.imageCardGrid}>
        {cityBreakIdeas.map(item => (
          <Link key={item.city} className={styles.imageCard} href={`/szukaj?destination=${encodeURIComponent(item.city)}&duration=3-4&tab=City%20break`}>
            <div className={styles.imageWrap}><Image src={item.image} alt={item.city + ", " + item.country} fill sizes="(max-width:640px) 100vw, (max-width:980px) 50vw, 25vw"/></div>
            <div className={styles.imageBody}><small>{item.country}</small><strong>{item.city}</strong><p>{item.text}</p><b>Szukaj city breaku →</b></div>
          </Link>
        ))}
      </div>
    </section>

    <section className={[styles.shell, styles.section].join(" ")}>
      <div className={styles.sectionHead}>
        <div>
          <div className={styles.kicker}>TERMIN, LOTNISKO LUB BUDŻET</div>
          <h2>Wybierz konkretny wariant — wyniki otworzą się od razu</h2>
          <p>Tu nie przechodzisz do kolejnej strony opisowej. Kafel ustawia lotnisko, miesiąc, długość pobytu albo budżet i uruchamia wyszukiwanie.</p>
        </div>
      </div>
      <ReadySearchGrid items={[
        { href: "/szukaj?airport=WAWA&duration=3-4&budget=1500&tab=City%20break", eyebrow: "WARSZAWA · 3–4 NOCE · DO 1 500 ZŁ", title: "City break z Warszawy", meta: "WAW + WMI · różne kierunki · najtańsze najpierw" },
        { href: "/szukaj?airport=POZ&duration=3-4&budget=1500&tab=City%20break", eyebrow: "POZNAŃ · 3–4 NOCE · DO 1 500 ZŁ", title: "City break z Poznania", meta: "POZ · różne kierunki · lot + hotel" },
        { href: "/szukaj?airport=KRK&duration=3-4&budget=1500&tab=City%20break", eyebrow: "KRAKÓW · 3–4 NOCE · DO 1 500 ZŁ", title: "City break z Krakowa", meta: "KRK · aktualne krótkie wyjazdy" },
        { href: "/szukaj?month=2026-11&duration=3-4&budget=1500&tab=City%20break", eyebrow: "LISTOPAD 2026 · 3–4 NOCE", title: "City break w listopadzie", meta: "Różne lotniska i kierunki · do 1 500 zł/os." },
        { href: "/szukaj?month=2026-12&duration=3-4&budget=1500&tab=City%20break", eyebrow: "GRUDZIEŃ 2026 · 3–4 NOCE", title: "City break w grudniu", meta: "Jarmarki, miasta i cieplejsze kierunki" },
        { href: "/szukaj?duration=3-4&budget=1000&tab=City%20break", eyebrow: "DO 1 000 ZŁ/OS. · 3–4 NOCE", title: "Najtańszy city break", meta: "Bez wskazywania kierunku · sortowanie od najniższej ceny" },
      ]} />
      <div className={styles.linkPills}>
        <Link href="/podroze/city-break-z-lublina">City break z Lublina</Link>
        <Link href="/sylwester">Sylwester 2026/2027</Link>
        <Link href="/lot-hotel">Lot + hotel</Link>
        <Link href="/planer-podrozy">Darmowy planer</Link>
        <Link href="/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych">Bagaż podręczny</Link>
      </div>
    </section>

    <SiteFooter/>
  </main>;
}
