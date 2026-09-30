import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";
import styles from "../conversion-pages.module.css";

export const metadata: Metadata = {
  title: "Lot + hotel 2026 — loty z hotelem i noclegiem | Tripownia.pl",
  description: "Znajdź lot + hotel w jednym wyszukiwaniu. Porównaj loty z hotelem, loty z noclegiem, city break i krótkie wakacje z polskich lotnisk.",
  alternates: { canonical: "/pakiety-lot-hotel-gotowe-wyjazdy-z-lotem-i-noclegiem" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "Lot + hotel — loty z hotelem i noclegiem | Tripownia.pl",
    description: "Ustaw kierunek, daty i lotnisko. Tripownia pomoże znaleźć lot + hotel bez zaczynania od pustej wyszukiwarki.",
    url: "https://tripownia.pl/pakiety-lot-hotel-gotowe-wyjazdy-z-lotem-i-noclegiem",
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema).replace(/</g,"\\u003c")}}/>
    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>LOT + HOTEL</div>
          <h1>Lot + hotel: loty z hotelem i noclegiem w jednym wyszukiwaniu</h1>
          <p>Wpisz kierunek, daty i lotnisko wylotu. Porównaj wariant lot + hotel na city break, krótki urlop albo dłuższe wakacje bez przeklikiwania kilku osobnych stron.</p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#szukaj-lot-hotel">Szukaj lot + hotel</a>
            <Link className={styles.secondary} href="/city-break">City break 2–5 dni</Link>
          </div>
        </div>
        <div className={styles.sectionCard}>
          <div className={styles.kicker}>NA CO PATRZEĆ</div>
          <h2>Nie tylko cena startowa</h2>
          <p>Sprawdź godziny lotów, bagaż, lokalizację hotelu, transfer z lotniska i zasady anulacji. To one decydują o pełnym koszcie wyjazdu.</p>
        </div>
      </div>
    </section>

    <section className={styles.shell} id="szukaj-lot-hotel">
      <div className={styles.searchPanel}>
        <div className={styles.searchPanelHead}>
          <div className={styles.kicker}>SZUKAJ PO SWOJEMU</div>
          <h2>Ustaw kierunek, daty i budżet</h2>
          <p>Możesz wpisać jedno lub kilka miejsc. Jeśli nie wiesz dokąd lecieć, zostaw kierunek szerzej i porównaj propozycje.</p>
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
        <div className={styles.kicker}>LOT + HOTEL WG POTRZEBY</div>
        <h2>Wybierz sposób szukania</h2>
        <div className={styles.linkPills}>
          <Link href="/city-break">City break lot + hotel</Link>
          <Link href="/wakacje">Wakacje</Link>
          <Link href="/tanie-all-inclusive">Tanie All Inclusive</Link>
          <Link href="/last-minute">Last Minute</Link>
          <Link href="/tanie-loty">Tanie loty</Link>
          <Link href="/okazje">Aktualne okazje</Link>
        </div>
      </div>
    </section>

    <section className={[styles.shell, styles.section].join(" ")}>
      <div className={styles.sectionCard}>
        <div className={styles.kicker}>NAJCZĘSTSZE PYTANIA</div>
        <h2>Lot i hotel — zanim klikniesz rezerwację</h2>
        {faq.map(([question, answer]) => <div key={question}><h3>{question}</h3><p>{answer}</p></div>)}
      </div>
    </section>
    <SiteFooter/>
  </main>;
}
