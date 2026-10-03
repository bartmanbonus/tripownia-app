import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SalesCollectionSchema from "@/components/SalesCollectionSchema";
import SearchHub from "@/components/SearchHub";
import LiveSalesRail from "@/components/LiveSalesRail";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import ReadySearchGrid from "@/components/ReadySearchGrid";
import { homepageFallbackOffers } from "@/lib/offers";
import styles from "../conversion-pages.module.css";

export const metadata: Metadata = {
  title: { absolute: "Lot i hotel 2026 — tani lot + hotel i loty z noclegiem | Tripownia.pl" },
  description: "Lot i hotel w jednym wyszukiwaniu: porównaj tani lot + hotel, loty z noclegiem, city break i krótkie wakacje z polskich lotnisk. Sprawdź aktualne oferty i pełny koszt.",
  alternates: { canonical: "/lot-hotel" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "Lot i hotel — tani lot + hotel i loty z noclegiem | Tripownia.pl",
    description: "Najpierw zobacz aktualne propozycje, potem ustaw kierunek, daty i lotnisko. Porównaj lot + hotel bez skakania między wieloma stronami.",
    url: "https://tripownia.pl/lot-hotel",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lot i hotel — tani lot + hotel i loty z noclegiem | Tripownia.pl",
    description: "Aktualne propozycje lot + hotel, city break i krótkie wakacje z polskich lotnisk.",
    images: ["/opengraph-image"],
  },
};

const faq = [
  ["Co oznacza lot + hotel?", "To wyszukiwanie wyjazdu, w którym porównujesz przelot i nocleg dla tego samego kierunku i terminu. Finalne warunki oraz płatność potwierdzasz u partnera."],
  ["Czy lot + hotel nadaje się tylko na city break?", "Nie. Sprawdza się zarówno na 2–4 dni, jak i na dłuższy urlop. Przy krótkim wyjeździe szczególnie ważne są godziny lotów i lokalizacja hotelu."],
  ["Jak znaleźć tani lot z hotelem?", "Porównaj kilka kierunków dla tych samych dat, sprawdź różne lotniska wylotu i policz pełny koszt z bagażem, transferem i dojazdem na lotnisko."],
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function LotHotelPage() {
  return <main className={styles.page}>
    <SiteHeader/>
    <SalesCollectionSchema
      name="Lot + hotel 2026"
      description="Aktualne propozycje lot + hotel, loty z noclegiem, city break i krótkie wakacje z polskich lotnisk."
      path="/lot-hotel"
      about={["lot + hotel", "lot i hotel", "loty z noclegiem", "city break"]}
    />
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema).replace(/</g,"\\u003c")}}/>

    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>LOT + HOTEL</div>
          <h1>Lot i hotel — znajdź tani lot + nocleg bez składania wyjazdu od zera</h1>
          <p>Najpierw zobacz aktualne propozycje. Potem ustaw kierunek, daty, lotnisko i długość pobytu. Tripownia łączy krótkie city breaki i pakiety lot + hotel w jedną prostą ścieżkę.</p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#aktualne-lot-hotel">Zobacz aktualne oferty</a>
            <a className={styles.secondary} href="#szukaj-lot-hotel">Ustaw własne parametry</a>
          </div>
        </div>
        <div className={styles.heroMedia}>
          <Image
            src="/images/destinations/rzym.jpg"
            alt="Krótki wyjazd lot i hotel do europejskiego miasta"
            fill
            sizes="(max-width:980px) 100vw, 45vw"
            priority
          />
        </div>
      </div>
    </section>

    <section className={styles.shell}>
      <div className={styles.factGrid}>
        <div className={styles.fact}><small>PAKIET</small><strong>Lot + nocleg</strong><p>Porównuj elementy dla tego samego terminu zamiast składać podróż w kilku kartach.</p></div>
        <div className={styles.fact}><small>POBYT</small><strong>2 dni lub dłużej</strong><p>City break, krótki urlop albo dłuższe wakacje — długość ustawiasz pod siebie.</p></div>
        <div className={styles.fact}><small>KOSZT</small><strong>Patrz na całość</strong><p>Bagaż, transfer i dojazd na lotnisko potrafią zmienić pozornie najtańszą ofertę.</p></div>
        <div className={styles.fact}><small>REZERWACJA</small><strong>Jedna prosta ścieżka</strong><p>Wybierasz konkretną opcję w Tripowni i dopiero wtedy przechodzisz do finalnych warunków.</p></div>
      </div>
    </section>

    <section className={[styles.shell, styles.section].join(" ")} id="aktualne-lot-hotel">
      <div className={styles.sectionHead}>
        <div>
          <div className={styles.kicker}>AKTUALNE PROPOZYCJE</div>
          <h2>Tanie lot + hotel na krótki wyjazd</h2>
          <p>Najpierw pokazujemy konkretne propozycje i sortujemy je od najniższej ceny. Jeśli nic nie pasuje, wyszukiwarka niżej pozwala rozszerzyć kierunek i termin.</p>
        </div>
        <Link href="/city-break">Więcej city breaków →</Link>
      </div>
      <LiveSalesRail mode="citybreak" limit={6} initialOffers={homepageFallbackOffers}/>
    </section>

    <section className={[styles.shell, styles.section].join(" ")}><FacebookFollowCTA placement="lot_hotel_after_offers" compact /></section>

    <section className={styles.shell} id="szukaj-lot-hotel">
      <div className={styles.searchPanel}>
        <div className={styles.searchPanelHead}>
          <div className={styles.kicker}>SZUKAJ PO SWOJEMU</div>
          <h2>Ustaw kierunek, daty i długość pobytu</h2>
          <p>Wpisz jedno lub kilka miejsc. Możesz też zacząć szerzej i porównać propozycje bez wybierania konkretnego kierunku na starcie.</p>
        </div>
        <SearchHub
          embedded
          initialTab="Lot + hotel"
          destinationQuickPicks={["Malta","Rzym","Barcelona","Cypr","Madera","Porto"]}
        />
      </div>
    </section>

    <section className={[styles.shell, styles.section].join(" ")}>
      <div className={styles.sectionHead}>
        <div>
          <div className={styles.kicker}>GOTOWE LOT + HOTEL</div>
          <h2>Nie wybieraj kategorii — wybierz konkretny wyjazd</h2>
          <p>Każdy wariant otwiera już ustawione wyszukiwanie z kierunkiem, długością i budżetem.</p>
        </div>
      </div>
      <ReadySearchGrid items={[
        { href: "/szukaj?destination=Rzym&duration=3-4&budget=1500&tab=Lot%20%2B%20hotel", eyebrow: "RZYM · 3–4 NOCE · DO 1 500 ZŁ", title: "Rzym lot + hotel", meta: "Aktualne pakiety i warianty z polskich lotnisk" },
        { href: "/szukaj?destination=Bari&duration=2-4&budget=1500&tab=Lot%20%2B%20hotel", eyebrow: "BARI · 2–4 NOCE · DO 1 500 ZŁ", title: "Bari lot + hotel", meta: "Krótki wyjazd do Apulii bez składania rezerwacji od zera" },
        { href: "/szukaj?destination=Malta&duration=3-5&budget=1500&tab=Lot%20%2B%20hotel", eyebrow: "MALTA · 3–5 NOCY · DO 1 500 ZŁ", title: "Malta lot + hotel", meta: "Valletta i okolice · aktualne opcje" },
        { href: "/szukaj?destination=Barcelona&duration=3-4&budget=1500&tab=Lot%20%2B%20hotel", eyebrow: "BARCELONA · 3–4 NOCE · DO 1 500 ZŁ", title: "Barcelona lot + hotel", meta: "Krótki city break · pełny pakiet" },
        { href: "/szukaj?budget=1000&duration=2-4&tab=City%20break", eyebrow: "GDZIEKOLWIEK · DO 1 000 ZŁ", title: "Najtańszy city break", meta: "2–4 noce · różne kierunki · sortowanie po cenie" },
        { href: "/szukaj?airport=WAWA&budget=2000&duration=5-9&tab=Last%20minute", eyebrow: "WARSZAWA · DO 2 000 ZŁ", title: "Last Minute lot + hotel", meta: "5–9 nocy · WAW + WMI · aktualne pakiety" },
      ]} />
    </section>

    <section className={[styles.shell, styles.section].join(" ")}>
      <div className={styles.sectionCard}>
        <div className={styles.kicker}>NAJCZĘSTSZE PYTANIA</div>
        <h2>Lot i hotel — najważniejsze przed rezerwacją</h2>
        <div className={styles.faq}>
          {faq.map(([question, answer]) => (
            <article key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <SiteFooter/>
  </main>;
}
