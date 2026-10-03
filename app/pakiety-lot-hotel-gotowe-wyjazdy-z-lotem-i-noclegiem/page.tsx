import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SalesCollectionSchema from "@/components/SalesCollectionSchema";
import SearchHub from "@/components/SearchHub";
import LiveSalesRail from "@/components/LiveSalesRail";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import { homepageFallbackOffers } from "@/lib/offers";
import styles from "../conversion-pages.module.css";

export const metadata: Metadata = {
  title: { absolute: "Lot i hotel 2026 — tani lot + hotel i loty z noclegiem | Tripownia.pl" },
  description: "Lot i hotel w jednym wyszukiwaniu: porównaj tani lot + hotel, loty z noclegiem, city break i krótkie wakacje z polskich lotnisk. Sprawdź aktualne oferty i pełny koszt.",
  alternates: { canonical: "/pakiety-lot-hotel-gotowe-wyjazdy-z-lotem-i-noclegiem" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "Lot i hotel — tani lot + hotel i loty z noclegiem | Tripownia.pl",
    description: "Najpierw zobacz aktualne propozycje, potem ustaw kierunek, daty i lotnisko. Porównaj lot + hotel bez skakania między wieloma stronami.",
    url: "https://tripownia.pl/pakiety-lot-hotel-gotowe-wyjazdy-z-lotem-i-noclegiem",
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
      path="/pakiety-lot-hotel-gotowe-wyjazdy-z-lotem-i-noclegiem"
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
      <div className={styles.sectionCard}>
        <div className={styles.kicker}>LOT + HOTEL WG BUDŻETU I STYLU</div>
        <h2>Przejdź od razu do konkretnego typu wyjazdu</h2>
        <p>Te skróty prowadzą do stron z aktualnymi ofertami i filtrem ceny — bez ściany tekstu przed wynikami.</p>
        <div className={styles.linkPills}>
          <Link href="/podroze/city-break-rzym-lot-hotel">Rzym · lot + hotel</Link>
          <Link href="/podroze/city-break-bari-lot-hotel">Bari · lot + hotel</Link>
          <Link href="/podroze/city-break-malta-lot-hotel">Malta · lot + hotel</Link>
          <Link href="/podroze/city-break-barcelona-lot-hotel">Barcelona · lot + hotel</Link>
          <Link href="/podroze/city-break-do-700-zl">City break do 700 zł</Link>
          <Link href="/podroze/city-break-do-1000-zl">City break do 1000 zł</Link>
          <Link href="/podroze/city-break-do-1500-zl">City break do 1500 zł</Link>
          <Link href="/podroze/last-minute-do-2000-zl">Last Minute do 2000 zł</Link>
          <Link href="/podroze/last-minute-do-3000-zl">Last Minute do 3000 zł</Link>
          <Link href="/tanie-all-inclusive">Tanie All Inclusive</Link>
          <Link href="/wakacje">Wakacje</Link>
          <Link href="/okazje">Aktualne okazje</Link>
        </div>
      </div>
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
