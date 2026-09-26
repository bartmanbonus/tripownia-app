import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import styles from "../conversion-pages.module.css";

const title = "Gdzie jest ciepło zimą 2026/2027? Kierunki bez bardzo dalekiego lotu";
const description = "Gdzie jest ciepło zimą 2026/2027? Porównaj Egipt, Wyspy Kanaryjskie, Maroko i Emiraty. Sprawdź czas lotu, charakter pogody i aktualne wakacje.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/gdzie-jest-cieplo-zima-bez-dalekiego-lotu" },
  openGraph: {
    type: "article",
    locale: "pl_PL",
    siteName: "Tripownia",
    title,
    description,
    url: "/gdzie-jest-cieplo-zima-bez-dalekiego-lotu",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
};

const options = [
  { name: "Egipt", href: "/egipt", image: "/images/destinations/marsa-alam.jpg", meta: "ok. 4–5 h lotu", badge: "Najcieplej blisko", text: "Dobry punkt startu, jeśli chcesz słońca, All Inclusive i relatywnie krótkiego lotu z Polski." },
  { name: "Wyspy Kanaryjskie", href: "/wyspy-kanaryjskie-wakacje-all-inclusive-i-last-minute", image: "/images/destinations/teneryfa.jpg", meta: "ok. 5–6 h lotu", badge: "Łagodna Europa", text: "Dla osób, które wolą łagodniejsze temperatury, europejską logistykę i połączenie plaży ze zwiedzaniem." },
  { name: "Maroko", href: "/maroko", image: "/images/destinations/marrakesz.jpg", meta: "ok. 4–5 h lotu", badge: "Miasto + ocean", text: "Dobry wybór, jeśli chcesz połączyć łagodniejszy klimat, miasta i wybrzeże bez bardzo dalekiej podróży." },
  { name: "Emiraty Arabskie", href: "/zea", image: "/images/destinations/dubaj.jpg", meta: "ok. 5–6 h lotu", badge: "Miasto + plaża", text: "Dalszy, ale nadal prosty kierunek na zimowe słońce, szczególnie jeśli zależy Ci na miejskich atrakcjach i plaży." },
] as const;

const faq = [
  ["Gdzie jest najcieplej zimą bez bardzo dalekiego lotu?", "Najczęściej warto zacząć porównanie od Egiptu i dalej zestawić go z Wyspami Kanaryjskimi oraz Marokiem. Ostateczny wybór zależy od tego, czy chcesz kąpieli, zwiedzania czy przede wszystkim odpoczynku w hotelu."],
  ["Czy zimą warto jechać na Wyspy Kanaryjskie?", "Tak, jeśli oczekujesz łagodnej pogody i aktywnego wypoczynku. Warunki różnią się między wyspami i między północą a południem, dlatego sprawdzaj konkretny region."],
  ["Czy Egipt zimą nadaje się na All Inclusive?", "Egipt jest popularnym kierunkiem zimowym, ale przed rezerwacją warto sprawdzić region, wiatr, dostęp do morza i podgrzewanie basenów w konkretnym hotelu."],
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

export default function WinterSunPage() {
  return <main className={styles.page}>
    <SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Gdzie jest ciepło zimą", url: "https://tripownia.pl/gdzie-jest-cieplo-zima-bez-dalekiego-lotu" },
    ]}/>

    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>ZIMOWE SŁOŃCE 2026/2027</div>
          <h1>Gdzie jest ciepło zimą bez kilkunastogodzinnego lotu?</h1>
          <p>Porównaj kierunki, które mają sens na zimowy wyjazd z Polski. Najpierw wybierz styl podróży, potem ustaw termin i sprawdź konkretne oferty.</p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#porownaj-kierunki">Porównaj kierunki</a>
            <a className={styles.secondary} href="#oferty-zima">Sprawdź oferty</a>
          </div>
        </div>
        <div className={styles.heroMedia}>
          <Image src="/images/destinations/teneryfa.jpg" alt="Ciepły kierunek zimą" fill sizes="(max-width: 980px) 100vw, 45vw" priority/>
        </div>
      </div>
    </section>

    <section className={styles.shell} id="porownaj-kierunki">
      <div className={styles.factGrid}>
        <div className={styles.fact}><small>NAJWIĘCEJ SŁOŃCA</small><strong>Egipt</strong><p>Najmocniejszy punkt startu, jeśli priorytetem jest ciepło i hotel.</p></div>
        <div className={styles.fact}><small>ŁAGODNA EUROPA</small><strong>Kanary</strong><p>Dobre dla osób, które chcą spacerów, zwiedzania i prostszej logistyki.</p></div>
        <div className={styles.fact}><small>MIASTO + KLIMAT</small><strong>Maroko</strong><p>Więcej zwiedzania i lokalnego klimatu, mniej typowego resortu.</p></div>
        <div className={styles.fact}><small>MIASTO + PLAŻA</small><strong>Emiraty</strong><p>Wyższy budżet, za to bardzo prosta infrastruktura turystyczna.</p></div>
      </div>
    </section>

    <section className={[styles.shell, styles.section].join(" ")}>
      <div className={styles.sectionHead}>
        <div><div className={styles.kicker}>KIERUNKI DO PORÓWNANIA</div><h2>Wybierz styl zimowego wyjazdu</h2><p>Nie wrzucamy wszystkich ciepłych krajów do jednego worka. Zobacz, czym realnie różni się typ wyjazdu.</p></div>
      </div>
      <div className={styles.imageCardGrid}>
        {options.map((option) => (
          <Link href={option.href} key={option.name} className={styles.imageCard}>
            <div className={styles.imageWrap}><Image src={option.image} alt={option.name} fill sizes="(max-width:640px) 100vw, (max-width:980px) 50vw, 25vw"/></div>
            <div className={styles.imageBody}><small>{option.badge}</small><strong>{option.name}</strong><p><b>{option.meta}</b><br/>{option.text}</p><b>Zobacz kierunek →</b></div>
          </Link>
        ))}
      </div>
    </section>

    <section className={styles.shell} id="oferty-zima">
      <div className={styles.searchPanel}>
        <div className={styles.searchPanelHead}>
          <div className={styles.kicker}>SPRAWDŹ OFERTY</div>
          <h2>Porównaj zimowe wakacje</h2>
          <p>Ustaw kierunek, lotnisko, termin i budżet. Na start podpowiadamy cztery najczęściej porównywane kierunki zimowe.</p>
        </div>
        <SearchHub
          embedded
          initialTab="Wakacje"
          initialDuration="5-7"
          destinationQuickPicks={["Egipt", "Wyspy Kanaryjskie", "Maroko", "Dubaj"]}
        />
      </div>
    </section>

    <section className={styles.shell}>
      <div className={styles.sectionCard}>
        <div className={styles.kicker}>WARTO WIEDZIEĆ</div>
        <h2>Nie patrz tylko na temperaturę kraju</h2>
        <div className={styles.guideGrid}>
          <div className={styles.guideCard}><h3>Region robi różnicę</h3><p>W Egipcie sprawdź konkretny kurort, na Kanarach część wyspy, a w Maroku wybrzeże versus miasta w głębi lądu.</p></div>
          <div className={styles.guideCard}><h3>Morze to nie to samo co powietrze</h3><p>Jeśli chcesz pływać, sprawdź temperaturę wody i wiatr przed rezerwacją, nie tylko średnią temperaturę dnia.</p></div>
          <div className={styles.guideCard}><h3>Basen zimą</h3><p>Przy hotelach resortowych potwierdź, które baseny są rzeczywiście podgrzewane i w jakich miesiącach.</p></div>
          <div className={styles.guideCard}><h3>Plan B</h3><p>Jeśli pogoda będzie słabsza, kierunki z dobrym zwiedzaniem dają więcej opcji niż wyjazd oparty wyłącznie na plaży.</p></div>
        </div>
        <div className={styles.linkPills}>
          <Link href="/ferie-2027">Ferie zimowe 2027</Link>
          <Link href="/podroze/egipt-grudzien-2026">Egipt w grudniu</Link>
          <Link href="/podroze/wyspy-kanaryjskie-grudzien-2026">Kanary w grudniu</Link>
          <Link href="/kierunki">Wszystkie kierunki</Link>
        </div>
      </div>
    </section>

    <section className={[styles.shell, styles.section].join(" ")}>
      <div className={styles.sectionHead}><div><div className={styles.kicker}>FAQ</div><h2>Najczęstsze pytania o ciepłe kierunki zimą</h2></div></div>
      <div className={styles.faq}>{faq.map(([q,a]) => <article key={q}><h3>{q}</h3><p>{a}</p></article>)}</div>
    </section>

    <SiteFooter/>
  </main>;
}
