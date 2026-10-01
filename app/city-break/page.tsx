import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SalesCollectionSchema from "@/components/SalesCollectionSchema";
import SearchHub from "@/components/SearchHub";
import LiveSalesRail from "@/components/LiveSalesRail";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import ProgressiveLinkCloud from "@/components/ProgressiveLinkCloud";
import styles from "../conversion-pages.module.css";

export const metadata: Metadata = {
  title: "City break lot + hotel 2026 — loty z noclegiem i tani weekend",
  description: "City break lot + hotel, loty z noclegiem i krótkie wyjazdy na 2–5 dni. Ustaw kierunek, termin oraz lotnisko i porównaj aktualne propozycje.",
  alternates: { canonical: "/city-break" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "City break lot + hotel 2026 — loty z noclegiem i tani weekend",
    description: "City break lot + hotel, loty z noclegiem i krótkie wyjazdy na 2–5 dni. Porównaj aktualne propozycje.",
    url: "/city-break",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "City break lot + hotel 2026 — loty z noclegiem i tani weekend",
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

const seasonalCityBreaks = [
  { href: "/podroze/city-break-pazdziernik-2026", label: "City break październik 2026" },
  { href: "/podroze/city-break-listopad-2026", label: "City break listopad 2026" },
  { href: "/podroze/city-break-grudzien-2026", label: "City break grudzień 2026" },
  { href: "/sylwester", label: "City break na Sylwestra 2026/2027" },
];

const airportCityBreaks = [
  { href: "/podroze/city-break-z-warszawy", label: "City break z Warszawy" },
  { href: "/podroze/city-break-z-poznania", label: "City break z Poznania" },
  { href: "/podroze/city-break-z-lublina", label: "City break z Lublina" },
  { href: "/podroze/city-break-z-katowic", label: "City break z Katowic" },
  { href: "/podroze/city-break-z-gdanska", label: "City break z Gdańska" },
  { href: "/podroze/city-break-z-krakowa", label: "City break z Krakowa" },
  { href: "/podroze/city-break-z-wroclawia", label: "City break z Wrocławia" },
  { href: "/podroze/city-break-z-rzeszowa", label: "City break z Rzeszowa" },
  { href: "/podroze/city-break-ze-szczecina", label: "City break ze Szczecina" },
  { href: "/podroze/city-break-z-lodzi", label: "City break z Łodzi" },
  { href: "/podroze/city-break-z-bydgoszczy", label: "City break z Bydgoszczy" },
  { href: "/podroze/city-break-z-olsztyna-mazur", label: "City break z Olsztyna-Mazur" },
  { href: "/podroze/city-break-z-modlina", label: "City break z Modlina" },
];

export default function CityBreakPage() {
  return <main className={styles.page}>
    <SiteHeader/>
    <SalesCollectionSchema name="City break 2026" description="City break lot + hotel, loty z noclegiem i krótkie wyjazdy na 2–5 dni." path="/city-break" about={["city break","lot + hotel","tani weekend","loty z noclegiem"]} />

    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>CITY BREAK 2026</div>
          <h1>City break: lot + hotel, loty z noclegiem i krótki weekend</h1>
          <p>Ustaw miasto, lotnisko wylotu, termin i liczbę nocy. Porównaj wariant lot + hotel, gotowe kierunki oraz krótkie wyjazdy na 2–5 dni.</p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#szukaj-city-break">Szukaj city breaku</a>
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
        <div><div className={styles.kicker}>AKTUALNE PROPOZYCJE</div><h2>Najtańsze city breaki teraz</h2><p>Aktualne ceny z bieżących źródeł. Sortujemy od najniższej ceny i pokazujemy krótkie wyjazdy.</p></div>
        <Link href="/okazje">Wszystkie okazje →</Link>
      </div>
      <LiveSalesRail mode="citybreak" limit={8}/>
    </section>

    <section className={[styles.shell, styles.section].join(" ")}>
      <div className={styles.sectionHead}><div><div className={styles.kicker}>WIĘCEJ POMYSŁÓW</div><h2>Nie ograniczamy city breaku do aktualnych kart</h2><p>Te kierunki służą jako szybki start do własnego wyszukiwania.</p></div></div>
      <div className={styles.imageCardGrid}>
        {cityBreakIdeas.map(item => (
          <a key={item.city} className={styles.imageCard} href="#szukaj-city-break">
            <div className={styles.imageWrap}><Image src={item.image} alt={item.city + ", " + item.country} fill sizes="(max-width:640px) 100vw, (max-width:980px) 50vw, 25vw"/></div>
            <div className={styles.imageBody}><small>{item.country}</small><strong>{item.city}</strong><p>{item.text}</p><b>Szukaj city breaku →</b></div>
          </a>
        ))}
      </div>
    </section>

    <section className={styles.shell}>
      <div className={styles.sectionCard}>
        <div className={styles.kicker}>SZUKAJ WG TERMINU LUB LOTNISKA</div>
        <h2>City break z Warszawy, Poznania, Krakowa i innych lotnisk</h2>
        <p>Wybierz lotnisko startowe i przejdź od razu do krótkich wyjazdów z tego miasta. Osobne strony pomagają znaleźć realne kierunki i porównać pełny koszt lotu + hotelu.</p>
        <ProgressiveLinkCloud
          visible={8}
          items={[
            ...seasonalCityBreaks,
            ...airportCityBreaks,
            { href: "/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych", label: "Bagaż podręczny" },
            { href: "/sylwester", label: "City break na Sylwestra 2026/2027" },
            { href: "/podroze/city-break-do-1000-zl", label: "City break do 1000 zł" },
            { href: "/podroze/city-break-do-1500-zl", label: "City break do 1500 zł" },
            { href: "/podroze/city-break-z-warszawy-do-1500-zl", label: "City break z Warszawy do 1500 zł" },
            { href: "/pakiety-lot-hotel-gotowe-wyjazdy-z-lotem-i-noclegiem", label: "Lot + hotel" },
            { href: "/planer-podrozy", label: "Darmowy planer podróży" },
          ]}
        />
      </div>
    </section>

    <section className={[styles.shell, styles.section].join(" ")}><FacebookFollowCTA placement="city_break" compact /></section>
    <SiteFooter/>
  </main>;
}
