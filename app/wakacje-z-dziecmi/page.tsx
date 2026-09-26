import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import styles from "../conversion-pages.module.css";

const title = "Wakacje z dziećmi 2027 – rodzinne All Inclusive i kierunki";
const description = "Wakacje z dziećmi 2027: porównaj rodzinne All Inclusive, krótsze loty, proste transfery i kierunki dobre dla rodzin. Ustaw termin i sprawdź aktualne propozycje.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/wakacje-z-dziecmi" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title,
    description,
    url: "/wakacje-z-dziecmi",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
};

const familyDestinations = [
  { name: "Egipt", label: "All Inclusive + słońce", href: "/egipt", image: "/images/destinations/marsa-alam.jpg", text: "Dużo hoteli resortowych. Przed rezerwacją sprawdź czas transferu, podgrzewanie basenów i dokładny typ pokoju." },
  { name: "Wyspy Kanaryjskie", label: "Łagodny klimat", href: "/wyspy-kanaryjskie-wakacje-all-inclusive-i-last-minute", image: "/images/destinations/teneryfa.jpg", text: "Dobry kierunek, gdy chcesz połączyć hotel, plażę i zwiedzanie bez bardzo egzotycznej logistyki." },
  { name: "Grecja", label: "Plaże + krótszy wyjazd", href: "/grecja-2027", image: "/images/destinations/rodos.jpg", text: "Duży wybór wysp i hoteli. Przy dzieciach porównaj lotnisko, transfer oraz odległość od plaży." },
  { name: "Bułgaria", label: "Budżet + plaża", href: "/bulgaria", image: "/images/destinations/sloneczny-brzeg.jpg", text: "Warto porównywać pełny koszt rodzinnego pokoju i faktyczną lokalizację hotelu, nie tylko cenę od osoby." },
] as const;

const faq = [
  ["Jaki kierunek wybrać na wakacje z dziećmi?", "Najpierw dopasuj wyjazd do wieku dziecka, długości lotu i tego, ile czasu chcecie spędzać w hotelu. Dla rodzin często liczą się krótki transfer, plaża, basen, animacje i łatwy dostęp do jedzenia."],
  ["Czy All Inclusive opłaca się z dziećmi?", "Przy rodzinie All Inclusive może ułatwić kontrolę budżetu i ograniczyć codzienną logistykę. Porównaj jednak standard hotelu, godziny posiłków, przekąski, napoje i faktyczne udogodnienia dla dzieci."],
  ["Na co patrzeć przy hotelu rodzinnym?", "Sprawdź rodzaj pokoju, brodzik lub basen, zacienione miejsca, plac zabaw, odległość od plaży, transfer z lotniska oraz opinie rodzin podróżujących z dziećmi w podobnym wieku."],
  ["Czy warto lecieć z dziećmi z dalszego lotniska?", "Tylko po policzeniu pełnego kosztu i czasu. Tańszy pakiet może przestać być korzystny po doliczeniu dojazdu, parkingu, noclegu przy lotnisku i bardziej męczących godzin podróży."],
] as const;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function FamilyHolidaysPage() {
  return <main className={styles.page}>
    <SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Wakacje", url: "https://tripownia.pl/wakacje" },
      { name: "Wakacje z dziećmi", url: "https://tripownia.pl/wakacje-z-dziecmi" },
    ]}/>

    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>WAKACJE Z DZIEĆMI 2027</div>
          <h1>Najpierw wygoda rodziny. Dopiero potem najniższa cena.</h1>
          <p>Porównaj kierunek, długość lotu, transfer, typ pokoju i wyżywienie. Wyszukiwarka poniżej pozwala od razu ustawić rodzinny wyjazd bez przeklikiwania się przez poradnik.</p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#szukaj-rodzinnie">Szukaj rodzinnych wakacji</a>
            <Link className={styles.secondary} href="/wakacje-2027">Zobacz wakacje 2027</Link>
          </div>
        </div>
        <div className={styles.heroMedia}>
          <Image src="/images/destinations/rodos.jpg" alt="Plaża i wakacyjny kierunek dla rodzin" fill sizes="(max-width: 980px) 100vw, 45vw" priority/>
        </div>
      </div>
    </section>

    <section className={styles.shell}>
      <div className={styles.factGrid}>
        <div className={styles.fact}><small>LOT</small><strong>Sprawdź godziny, nie tylko długość</strong><p>Nocny powrót z małym dzieckiem może kosztować więcej energii niż droższy pakiet.</p></div>
        <div className={styles.fact}><small>TRANSFER</small><strong>Im prostszy, tym lepiej</strong><p>Przy podobnej cenie krótki dojazd do hotelu potrafi zrobić dużą różnicę.</p></div>
        <div className={styles.fact}><small>POKÓJ</small><strong>Zweryfikuj faktyczny układ</strong><p>Sprawdź dostawki, łóżeczko, drzwi między pokojami i powierzchnię dla całej rodziny.</p></div>
        <div className={styles.fact}><small>WYŻYWIENIE</small><strong>Patrz na codzienną logistykę</strong><p>Godziny posiłków, przekąski i napoje bywają ważniejsze niż sama etykieta All Inclusive.</p></div>
      </div>
    </section>

    <section className={styles.shell} id="szukaj-rodzinnie">
      <div className={styles.searchPanel}>
        <div className={styles.searchPanelHead}>
          <div className={styles.kicker}>SZUKAJ RODZINNIE</div>
          <h2>Ustaw kierunek, termin i budżet</h2>
          <p>Startujemy od wakacji 5–7 nocy. Możesz zmienić wszystko, wybrać kilka lotnisk i porównać różne kierunki.</p>
        </div>
        <SearchHub
          embedded
          initialTab="Wakacje"
          initialDuration="5-7"
          destinationQuickPicks={["Egipt", "Wyspy Kanaryjskie", "Grecja", "Bułgaria", "Turcja"]}
        />
      </div>
    </section>

    <section className={[styles.shell, styles.section].join(" ")}>
      <div className={styles.sectionHead}>
        <div>
          <div className={styles.kicker}>POPULARNE KIERUNKI</div>
          <h2>Najpierw wybierz styl rodzinnego wyjazdu</h2>
          <p>Nie oznaczamy przypadkowych hoteli jako „rodzinne”. Najpierw pokazujemy kierunek, a parametry konkretnego obiektu sprawdzasz przed rezerwacją.</p>
        </div>
      </div>
      <div className={styles.imageCardGrid}>
        {familyDestinations.map((item) => (
          <Link href={item.href} className={styles.imageCard} key={item.name}>
            <div className={styles.imageWrap}><Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 25vw"/></div>
            <div className={styles.imageBody}><small>{item.label}</small><strong>{item.name}</strong><p>{item.text}</p><b>Sprawdź kierunek →</b></div>
          </Link>
        ))}
      </div>
    </section>

    <section className={styles.shell}>
      <div className={styles.sectionCard}>
        <div className={styles.kicker}>PRZED REZERWACJĄ</div>
        <h2>Hotel dla rodziny: sprawdź 6 rzeczy</h2>
        <div className={styles.guideGrid}>
          <div className={styles.guideCard}><h3>Pokój i dostawki</h3><p>Sprawdź dokładny typ pokoju, liczbę pełnych łóżek, możliwość łóżeczka i zasady zakwaterowania dzieci.</p></div>
          <div className={styles.guideCard}><h3>Basen poza sezonem</h3><p>Jeśli jedziecie jesienią lub zimą, potwierdź czy wybrany basen dla dzieci jest rzeczywiście podgrzewany.</p></div>
          <div className={styles.guideCard}><h3>Plaża i dojście</h3><p>„Blisko plaży” może oznaczać spacer pod górę, przejście przez ulicę albo hotelowy bus.</p></div>
          <div className={styles.guideCard}><h3>Pełny koszt wyjazdu</h3><p>Dolicz bagaż, parking, dojazd na lotnisko, transfer i ewentualny nocleg przed wylotem.</p></div>
        </div>
        <div className={styles.linkPills}>
          <Link href="/podroze/wakacje-do-2000-zl">Wakacje do 2000 zł</Link>
          <Link href="/podroze/wakacje-do-2500-zl">Wakacje do 2500 zł</Link>
          <Link href="/podroze/all-inclusive-do-2000-zl">All Inclusive do 2000 zł</Link>
          <Link href="/ferie-2027">Ferie 2027</Link>
          <Link href="/kierunki">Wszystkie kierunki</Link>
        </div>
      </div>
    </section>

    <section className={[styles.shell, styles.section].join(" ")}>
      <div className={styles.sectionHead}><div><div className={styles.kicker}>FAQ</div><h2>Najczęstsze pytania o wakacje z dziećmi</h2></div></div>
      <div className={styles.faq}>{faq.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}</div>
    </section>

    <SiteFooter/>
  </main>;
}
