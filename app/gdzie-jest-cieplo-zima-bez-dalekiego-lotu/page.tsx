import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Gdzie jest ciepło zimą 2026/2027? Kierunki bez bardzo dalekiego lotu";
const description = "Gdzie jest ciepło zimą 2026/2027? Porównaj Egipt, Wyspy Kanaryjskie, Maroko i dalsze kierunki. Sprawdź czas lotu, typ pogody i aktualne wakacje.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/gdzie-jest-cieplo-zima-bez-dalekiego-lotu" },
  openGraph: {
    type: "article",
    title: `${title} | Tripownia.pl`,
    description,
    url: "/gdzie-jest-cieplo-zima-bez-dalekiego-lotu",
  },
};

const options = [
  { name: "Egipt", href: "/egipt", meta: "ok. 4–5 h lotu", badge: "Najcieplej blisko", text: "Dobry punkt startu, jeśli chcesz słońca, All Inclusive i relatywnie krótkiego lotu z Polski." },
  { name: "Wyspy Kanaryjskie", href: "/wyspy-kanaryjskie-wakacje-all-inclusive-i-last-minute", meta: "ok. 5–6 h lotu", badge: "Europa zimą", text: "Dla osób, które wolą łagodniejsze temperatury, europejską logistykę i połączenie plaży ze zwiedzaniem." },
  { name: "Maroko", href: "/maroko", meta: "ok. 4–5 h lotu", badge: "Miasto + ocean", text: "Dobry wybór, jeśli chcesz połączyć łagodniejszy klimat, miasta i wybrzeże bez bardzo dalekiej podróży." },
  { name: "Emiraty Arabskie", href: "/zea", meta: "ok. 5–6 h lotu", badge: "Miasto + plaża", text: "Dalszy, ale nadal prosty kierunek na zimowe słońce, szczególnie jeśli zależy Ci na miejskich atrakcjach i plaży." },
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
  return <main className="winter-sun-page">
    <SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Gdzie jest ciepło zimą", url: "https://tripownia.pl/gdzie-jest-cieplo-zima-bez-dalekiego-lotu" },
    ]}/>

    <section className="shell winter-sun-hero">
      <div className="winter-sun-hero-copy">
        <div className="kicker">ZIMOWE SŁOŃCE 2026/2027</div>
        <h1>Gdzie jest ciepło zimą bez bardzo dalekiego lotu?</h1>
        <p>Porównaj kierunki, które pozwalają uciec od polskiej zimy bez kilkunastogodzinnej podróży. Zobacz, gdzie lecieć po plażę, zwiedzanie albo All Inclusive.</p>
        <div className="winter-sun-hero-actions">
          <a href="#porownaj-kierunki" className="winter-sun-primary">Porównaj kierunki</a>
          <a href="#oferty-zima" className="winter-sun-secondary">Sprawdź oferty</a>
        </div>
      </div>
    </section>

    <section className="shell winter-sun-section" id="porownaj-kierunki">
      <div className="winter-sun-section-head">
        <div className="kicker">NA POCZĄTEK</div>
        <h2>Egipt, Kanary, Maroko czy Emiraty?</h2>
        <p>Najpierw wybierz styl wyjazdu. Potem przejdź do konkretnego kierunku i aktualnych propozycji.</p>
      </div>
      <div className="winter-sun-grid">
        {options.map((option) => (
          <Link href={option.href} key={option.name} className="winter-sun-card">
            <span className="winter-sun-card-badge">{option.badge}</span>
            <h3>{option.name}</h3>
            <strong>{option.meta}</strong>
            <p>{option.text}</p>
            <span className="winter-sun-card-link">Zobacz kierunek →</span>
          </Link>
        ))}
      </div>
    </section>

    <section className="shell winter-sun-quick">
      <div>
        <div className="kicker">SZYBKI WYBÓR</div>
        <h2>Dobierz kierunek do tego, czego chcesz zimą</h2>
      </div>
      <div className="winter-sun-quick-grid">
        <Link href="/egipt"><strong>Najwięcej słońca</strong><span>Egipt →</span></Link>
        <Link href="/wyspy-kanaryjskie-wakacje-all-inclusive-i-last-minute"><strong>Łagodna Europa</strong><span>Kanary →</span></Link>
        <Link href="/maroko"><strong>Zwiedzanie + klimat</strong><span>Maroko →</span></Link>
        <Link href="/zea"><strong>Miasto + plaża</strong><span>Emiraty →</span></Link>
      </div>
    </section>

    <section className="shell winter-sun-editorial">
      <div className="winter-sun-editorial-media" aria-hidden="true"/>
      <div className="winter-sun-editorial-copy">
        <div className="kicker">WARTO WIEDZIEĆ</div>
        <h2>Nie patrz tylko na temperaturę kraju</h2>
        <p>W zimie warunki mogą mocno różnić się między regionami tego samego kraju. Przy Egipcie sprawdź konkretny kurort, przy Kanarach część wyspy, a przy Maroku różnicę między wybrzeżem i miastami w głębi lądu.</p>
        <p>Jeśli najważniejsza jest kąpiel w morzu, sprawdź aktualną temperaturę wody i wiatr przed rezerwacją. Jeśli zależy Ci głównie na słońcu i zwiedzaniu, łagodniejsze kierunki mogą być wystarczające.</p>
        <div className="winter-sun-pills">
          <Link href="/ferie-2027">Ferie zimowe 2027 →</Link>
          <Link href="/podroze/egipt-grudzien-2026">Egipt w grudniu →</Link>
        </div>
      </div>
    </section>

    <section className="shell winter-sun-search-section" id="oferty-zima">
      <div className="winter-sun-search-heading">
        <div className="kicker">SPRAWDŹ OFERTY</div>
        <h2>Porównaj zimowe wakacje</h2>
        <p>Wybierz kierunek, lotnisko i termin. Pokażemy konkretne dopasowania zamiast odsyłać Cię do pustej strony.</p>
      </div>
      <div className="single-partner-search-wrap"><UnifiedPartnerSearch mode="holiday" /></div>
    </section>

    <section className="shell winter-sun-faq">
      <div className="kicker">FAQ</div>
      <h2>Najczęstsze pytania o ciepłe kierunki zimą</h2>
      <div className="winter-sun-faq-grid">
        {faq.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}
      </div>
    </section>

    <SiteFooter/>
  </main>;
}
