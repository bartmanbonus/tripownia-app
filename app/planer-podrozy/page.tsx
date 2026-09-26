import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import styles from "../conversion-pages.module.css";

const title = "Darmowy planer podróży – plan wyjazdu krok po kroku";
const description = "Zaplanuj wyjazd z Tripownią: lot, nocleg, atrakcje, plan dnia i checklista w jednym miejscu. Dodaj także podróż zarezerwowaną poza Tripownią.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/planer-podrozy" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title,
    description,
    url: "/planer-podrozy",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
};

const steps = [
  { n: "1", title: "Dodaj kierunek i termin", text: "Możesz zacząć od pomysłu albo od wyjazdu, który już masz kupiony." },
  { n: "2", title: "Zapisz lot i nocleg", text: "Zbierz godziny, adres, zameldowanie i najważniejsze dane w jednym planie." },
  { n: "3", title: "Ułóż dni na miejscu", text: "Dodawaj atrakcje i grupuj je tak, żeby nie tracić czasu na zbędne przejazdy." },
  { n: "4", title: "Przejdź checklistę", text: "Dokumenty, bagaż, internet, ubezpieczenie, transfer i przygotowanie przed wylotem." },
  { n: "5", title: "Wracaj do planu później", text: "Na koncie możesz przechowywać zapisane podróże i wracać do nich z kolejnych urządzeń po synchronizacji." },
] as const;

const questions = [
  ["Czy planer podróży jest darmowy?", "Korzystanie z planera Tripowni jest bezpłatne. Loty, noclegi, bilety i inne usługi rezerwujesz osobno u dostawców. Część odnośników to linki afiliacyjne, z których Tripownia może otrzymać prowizję."],
  ["Czy mogę dodać wyjazd kupiony gdzie indziej?", "Tak. Dodaj własną podróż i wykorzystaj organizer do zebrania informacji o wyjeździe. Nie musisz kupować lotu ani hotelu przez Tripownię."],
  ["Czy muszę mieć konto?", "Nie musisz mieć konta, żeby zacząć planować. Konto przydaje się, gdy chcesz synchronizować zapisane dane i wracać do nich na innych urządzeniach."],
  ["Czy planer zastępuje bilety i potwierdzenia rezerwacji?", "Nie. Organizer pomaga uporządkować podróż. Zachowaj oryginalne bilety, potwierdzenia i dokumenty od dostawców, również w formie dostępnej bez internetu."],
] as const;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function TravelPlannerGuide() {
  return (
    <main className={styles.page}>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "Darmowy planer podróży", url: "https://tripownia.pl/planer-podrozy" },
      ]} />

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.kicker}>TWÓJ WYJAZD W JEDNYM MIEJSCU</div>
            <h1>Nie tylko poradnik. Zacznij układać własną podróż.</h1>
            <p>Lot, nocleg, plan dnia i checklista — zacznij od zera albo dodaj wyjazd, który masz już zarezerwowany. Plan możesz później rozwijać i zapisywać.</p>
            <div className={styles.heroActions}>
              <Link className={styles.primary} href="/dodaj-podroz">Zacznij planować za darmo</Link>
              <Link className={styles.secondary} href="/moja-podroz">Otwórz mój aktualny plan</Link>
            </div>
          </div>
          <div className={styles.heroMedia}>
            <Image src="/images/destinations/lizbona.jpg" alt="Planowanie własnej podróży" fill sizes="(max-width:980px) 100vw, 45vw" priority/>
          </div>
        </div>
      </section>

      <section className={styles.shell}>
        <div className={styles.plannerChoiceGrid}>
          <Link href="/dodaj-podroz" className={styles.plannerChoice}>
            <small>NIE MAM JESZCZE PLANU</small>
            <strong>Stwórz nową podróż</strong>
            <p>Podaj kierunek i termin, a potem stopniowo dodawaj lot, hotel, atrakcje i checklistę.</p>
            <b>Zacznij nowy plan →</b>
          </Link>
          <Link href="/moja-podroz" className={styles.plannerChoice}>
            <small>MAM JUŻ AKTYWNY WYJAZD</small>
            <strong>Wróć do bieżącej podróży</strong>
            <p>Otwórz aktualny plan i kontynuuj tam, gdzie skończyłeś: harmonogram, checklisty i dane wyjazdu.</p>
            <b>Otwórz mój plan →</b>
          </Link>
          <Link href="/moje-podroze" className={styles.plannerChoice}>
            <small>MAM WIĘCEJ PODRÓŻY</small>
            <strong>Moje zapisane wyjazdy</strong>
            <p>Zobacz aktywne i zapisane podróże. Jeśli używasz konta, możesz synchronizować dane w chmurze.</p>
            <b>Zobacz moje podróże →</b>
          </Link>
        </div>
      </section>

      <section className={[styles.shell, styles.section].join(" ")}>
        <div className={styles.sectionHead}>
          <div><div className={styles.kicker}>JAK TO DZIAŁA</div><h2>Pięć prostych kroków zamiast ściany tekstu</h2><p>Planer ma prowadzić do konkretu: co już masz, czego brakuje i co zrobić przed wyjazdem.</p></div>
        </div>
        <div className={styles.stepGrid}>
          {steps.map(step => <div className={styles.step} key={step.n}><span>{step.n}</span><strong>{step.title}</strong><p>{step.text}</p></div>)}
        </div>
      </section>

      <section className={styles.shell}>
        <div className={styles.sectionCard}>
          <div className={styles.kicker}>CO MOŻESZ TRZYMAĆ W PLANIE</div>
          <h2>Najważniejsze elementy wyjazdu w jednym miejscu</h2>
          <div className={styles.featureStrip}>
            <div><strong>✈️ Lot i godziny</strong><span>Wylot, powrót i najważniejsze szczegóły podróży.</span></div>
            <div><strong>🏨 Nocleg</strong><span>Adres, zameldowanie i dane hotelu.</span></div>
            <div><strong>🗓️ Plan dnia</strong><span>Atrakcje i pomysły rozpisane na konkretne dni.</span></div>
            <div><strong>✅ Checklista</strong><span>Dokumenty, bagaż i przygotowanie przed wyjazdem.</span></div>
          </div>
          <div className={styles.linkPills}>
            <Link href="/atrakcje">Atrakcje</Link>
            <Link href="/transfery">Transfer z lotniska</Link>
            <Link href="/esim">eSIM</Link>
            <Link href="/parkingi">Parking przy lotnisku</Link>
            <Link href="/przed-wyjazdem">Checklista przed wyjazdem</Link>
          </div>
        </div>
      </section>

      <section className={styles.shell}>
        <div className={styles.sectionCard}>
          <div className={styles.kicker}>KONTO I ZAPIS DANYCH</div>
          <h2>Możesz zacząć bez konta, a później zsynchronizować dane</h2>
          <p>Tripownia pozwala zacząć lokalnie. Po zalogowaniu możesz przypisać zapisane podróże, ulubione i dane planera do konta i korzystać z synchronizacji w chmurze.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primary} href="/konto">Zaloguj się lub utwórz konto</Link>
            <Link className={styles.secondary} href="/profil">Ustaw preferencje podróżnicze</Link>
          </div>
        </div>
      </section>

      <section className={[styles.shell, styles.section].join(" ")}>
        <div className={styles.sectionHead}><div><div className={styles.kicker}>FAQ</div><h2>Pytania o planer Tripowni</h2></div></div>
        <div className={styles.faq}>{questions.map(([q,a]) => <article key={q}><h3>{q}</h3><p>{a}</p></article>)}</div>
      </section>

      <SiteFooter />
    </main>
  );
}
