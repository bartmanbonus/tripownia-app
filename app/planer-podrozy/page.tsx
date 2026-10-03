import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import styles from "../conversion-pages.module.css";

const title = "Planer podróży online za darmo – indywidualne planowanie wyjazdu";
const description = "Darmowy planer podróży online do indywidualnego planowania wyjazdu: lot, nocleg, atrakcje, transfer, plan dnia i checklista w jednym miejscu.";

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

const plannerSteps = [
  { n: "1", title: "Kierunek", text: "Wybierz konkretny cel albo zostaw pole otwarte i zobacz propozycje." },
  { n: "2", title: "Termin", text: "Podaj daty, miesiąc albo zaznacz, że termin jest elastyczny." },
  { n: "3", title: "Co już masz", text: "Lot, hotel, transfer? Zaznaczasz tylko to, co jest już ogarnięte." },
  { n: "4", title: "Tripownia uzupełnia braki", text: "Dostajesz kolejne elementy planu, checklistę i miejsce do dalszej organizacji." },
] as const;

const features = [
  { icon: "✈️", title: "Lot", text: "Godziny, wylot, powrót i dane podróży." },
  { icon: "🏨", title: "Nocleg", text: "Hotel, adres, check-in i ważne informacje." },
  { icon: "🗓️", title: "Plan dnia", text: "Atrakcje i pomysły rozpisane dzień po dniu." },
  { icon: "✅", title: "Checklista", text: "Dokumenty, bagaż i rzeczy do zrobienia." },
  { icon: "🚕", title: "Transfer", text: "Dojazd z lotniska i transport na miejscu." },
  { icon: "📶", title: "eSIM i dodatki", text: "Internet, parking i inne elementy przed wyjazdem." },
] as const;

const questions = [
  ["Czy planer podróży jest darmowy?", "Tak. Korzystanie z planera Tripowni jest bezpłatne. Loty, noclegi, bilety i inne usługi rezerwujesz osobno dopiero wtedy, gdy zdecydujesz się na konkretną opcję."],
  ["Czy mogę dodać wyjazd kupiony gdzie indziej?", "Tak. Możesz dodać własną podróż, nawet jeśli lot lub hotel został kupiony poza Tripownią. Planer pomoże zebrać wszystko w jednym miejscu i uzupełnić brakujące elementy."],
  ["Czy muszę mieć konto?", "Nie. Możesz zacząć bez konta. Konto przydaje się później, gdy chcesz synchronizować zapisane podróże i wracać do nich na innych urządzeniach."],
  ["Czy planer zastępuje bilety i potwierdzenia rezerwacji?", "Nie. Organizer pomaga uporządkować podróż. Oryginalne bilety, potwierdzenia i dokumenty od dostawców zachowaj także poza Tripownią."],
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

      <section className={styles.plannerHero}>
        <div className={styles.plannerHeroGrid}>
          <div className={styles.plannerIntro}>
            <div className={styles.kicker}>DARMOWY PLANER PODRÓŻY</div>
            <h1>Indywidualne planowanie podróży w jednym darmowym planerze</h1>
            <p>
              Nie musisz mieć gotowego pomysłu ani wszystkich rezerwacji. Planer podróży prowadzi Cię od pomysłu do gotowego wyjazdu. Wybierz, na jakim etapie jesteś,
              a Tripownia poprowadzi Cię dalej bez pustych formularzy i bez zaczynania od zera.
            </p>

            <div className={styles.plannerTrust}>
              <span>0 zł za planer</span>
              <span>bez konta na start</span>
              <span>możesz wrócić później</span>
            </div>

            <div className={styles.plannerSavedShortcut}>
              <span>Masz już zapisany wyjazd?</span>
              <Link href="/moja-podroz">Otwórz aktualny plan →</Link>
            </div>
          </div>

          <div className={styles.plannerLaunchCard}>
            <div className={styles.kicker}>ZACZNIJ TUTAJ</div>
            <h2>Jak chcesz zacząć?</h2>
            <p className={styles.plannerLaunchLead}>Wybierz sytuację, która najlepiej pasuje. Nie musisz uzupełniać wszystkiego od razu.</p>

            <div className={styles.plannerStartGrid}>
              <Link href="/dodaj-podroz?mode=open" className={styles.plannerStartOption}>
                <span className={styles.plannerStartIcon}>🌍</span>
                <span className={styles.plannerStartCopy}>
                  <small>NIE WIEM JESZCZE DOKĄD</small>
                  <strong>Pokaż mi pomysły na wyjazd</strong>
                  <span>Możesz zostawić kierunek otwarty i zacząć od inspiracji.</span>
                </span>
                <span className={styles.plannerStartArrow}>→</span>
              </Link>

              <Link href="/dodaj-podroz?mode=known" className={styles.plannerStartOption}>
                <span className={styles.plannerStartIcon}>📍</span>
                <span className={styles.plannerStartCopy}>
                  <small>WIEM DOKĄD CHCĘ JECHAĆ</small>
                  <strong>Zacznij od kierunku i terminu</strong>
                  <span>Wpisz miejsce, ustaw daty albo elastyczny termin i przejdź dalej.</span>
                </span>
                <span className={styles.plannerStartArrow}>→</span>
              </Link>

              <Link href="/dodaj-podroz?mode=owned" className={styles.plannerStartOption}>
                <span className={styles.plannerStartIcon}>🧳</span>
                <span className={styles.plannerStartCopy}>
                  <small>MAM JUŻ LOT, HOTEL LUB WYJAZD</small>
                  <strong>Dodaj to, co już masz</strong>
                  <span>Tripownia nie szuka nowego wyjazdu — uzupełnia tylko brakujące elementy.</span>
                </span>
                <span className={styles.plannerStartArrow}>→</span>
              </Link>
            </div>

            <div className={styles.plannerOpenRow}>
              <span>Wracasz do planowania?</span>
              <Link href="/moja-podroz">Aktualny plan</Link>
              <Link href="/moje-podroze">Wszystkie podróże</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.shell}>
        <div className={styles.plannerProgress}>
          <div className={styles.plannerProgressHead}>
            <h2>Planer prowadzi Cię krok po kroku</h2>
            <p>Najpierw minimum informacji. Dopiero później kolejne elementy, więc nie dostajesz na wejściu długiego formularza.</p>
          </div>
          <div className={styles.plannerProgressGrid}>
            {plannerSteps.map((step) => (
              <div className={styles.plannerProgressStep} key={step.n}>
                <span>{step.n}</span>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={[styles.shell, styles.plannerFeatureSection].join(" ")}>
        <div className={styles.kicker}>WSZYSTKO W JEDNYM PLANIE</div>
        <h2>Nie osobny poradnik, tylko miejsce do ogarnięcia całego wyjazdu</h2>
        <p>W planie zbierasz to, co już masz, i dodajesz kolejne elementy dopiero wtedy, gdy są Ci potrzebne.</p>

        <div className={styles.plannerFeatureGrid}>
          {features.map((feature) => (
            <div className={styles.plannerFeature} key={feature.title}>
              <span className={styles.plannerFeatureIcon}>{feature.icon}</span>
              <strong>{feature.title}</strong>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>

        <div className={styles.linkPills}>
          <Link href="/atrakcje">Atrakcje</Link>
          <Link href="/transfery">Transfer z lotniska</Link>
          <Link href="/esim">eSIM</Link>
          <Link href="/parkingi">Parking przy lotnisku</Link>
          <Link href="/przed-wyjazdem">Checklista przed wyjazdem</Link>
        </div>
      </section>

      <section className={[styles.shell, styles.plannerTwoColumn].join(" ")}>
        <div className={styles.plannerCompactCard}>
          <div className={styles.kicker}>PO ZAPISANIU PLANU</div>
          <h2>Wracasz dokładnie tam, gdzie skończyłaś</h2>
          <p>Plan nie kończy się po kliknięciu „utwórz”. Możesz go później edytować, rozbudowywać i trzymać kilka podróży równolegle.</p>
          <div className={styles.plannerChecklist}>
            <div><span>✓</span><span><b>Aktualna podróż</b> — szybki dostęp do wyjazdu, który właśnie planujesz.</span></div>
            <div><span>✓</span><span><b>Moje podróże</b> — aktywne i zapisane plany w jednym miejscu.</span></div>
            <div><span>✓</span><span><b>Edycja później</b> — możesz wrócić do lotu, hotelu, checklisty i planu dnia.</span></div>
          </div>
          <div className={styles.plannerCardActions}>
            <Link href="/moja-podroz">Otwórz aktualny plan</Link>
            <Link href="/moje-podroze">Zobacz wszystkie podróże</Link>
          </div>
        </div>

        <div className={styles.plannerCompactCard}>
          <div className={styles.kicker}>KONTO JEST OPCJONALNE</div>
          <h2>Zacznij od razu, konto dodaj później</h2>
          <p>Na początku możesz działać lokalnie. Po zalogowaniu przypiszesz zapisane podróże do konta i skorzystasz z synchronizacji między urządzeniami.</p>
          <div className={styles.plannerChecklist}>
            <div><span>✓</span><span>bez obowiązkowej rejestracji przed rozpoczęciem planowania</span></div>
            <div><span>✓</span><span>synchronizacja zapisanych podróży po zalogowaniu</span></div>
            <div><span>✓</span><span>preferencje podróżnicze, do których możesz wracać</span></div>
          </div>
          <div className={styles.plannerCardActions}>
            <Link href="/konto">Zaloguj się lub utwórz konto</Link>
            <Link href="/profil">Ustaw preferencje</Link>
          </div>
        </div>
      </section>

      <section className={styles.shell}>
        <div className={styles.sectionCard}>
          <div className={styles.kicker}>POMYSŁY NA WYJAZD</div>
          <h2>Najpierw znajdź kierunek, potem ułóż go w planerze</h2>
          <div className={styles.linkPills}>
            <Link href="/city-break">City break lot + hotel</Link>
            <Link href="/sylwester">Sylwester 2026/2027</Link>
            <Link href="/wakacje">Wakacje</Link>
            <Link href="/okazje">Okazje Tripowni</Link>
          </div>
        </div>
      </section>

      <section className={[styles.shell, styles.plannerFaq].join(" ")}>
        <div className={styles.kicker}>FAQ</div>
        <h2>Najczęstsze pytania</h2>
        {questions.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>

      <SiteFooter />
    </main>
  );
}
