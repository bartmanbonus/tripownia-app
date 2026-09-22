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
  ["Egipt", "Dobry punkt startu, jeśli chcesz słońca, All Inclusive i relatywnie krótkiego lotu z Polski."],
  ["Wyspy Kanaryjskie", "Opcja dla osób, które wolą łagodniejsze temperatury, europejską logistykę i możliwość połączenia plaży ze zwiedzaniem."],
  ["Maroko", "Warto porównać, jeśli chcesz połączyć łagodniejszy klimat, miasta i wybrzeże bez bardzo dalekiej podróży."],
  ["Emiraty Arabskie", "Dalszy, ale nadal prosty kierunek na zimowe słońce, szczególnie jeśli zależy Ci na miejskich atrakcjach i plaży."],
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
  return <main>
    <SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Gdzie jest ciepło zimą", url: "https://tripownia.pl/gdzie-jest-cieplo-zima-bez-dalekiego-lotu" },
    ]}/>

    <section className="shopping-hero shell">
      <div className="kicker">ZIMOWE SŁOŃCE 2026/2027</div>
      <h1>Gdzie jest ciepło zimą bez bardzo dalekiego lotu?</h1>
      <p>Porównaj kierunki, które pozwalają uciec od polskiej zimy bez kilkunastogodzinnej podróży. Najpierw zdecyduj, czy ważniejsza jest plaża, zwiedzanie czy All Inclusive.</p>
    </section>

    <section className="shell seo-copy-section">
      <div className="kicker">NA POCZĄTEK</div>
      <h2>Egipt, Kanary, Maroko czy Emiraty?</h2>
      {options.map(([name, text]) => <div key={name} style={{marginBottom:16}}><h3>{name}</h3><p>{text}</p></div>)}
    </section>

    <section className="shell seo-related-block">
      <div className="kicker">ZIMOWE KIERUNKI</div>
      <h2>Przejdź do konkretnego miejsca lub terminu</h2>
      <div className="seo-related-links">
        <Link href="/egipt">Egipt →</Link>
        <Link href="/wyspy-kanaryjskie-wakacje-all-inclusive-i-last-minute">Wyspy Kanaryjskie →</Link>
        <Link href="/maroko">Maroko →</Link>
        <Link href="/zea">Emiraty Arabskie →</Link>
        <Link href="/ferie-2027">Ferie zimowe 2027 →</Link>
        <Link href="/podroze/egipt-grudzien-2026">Egipt w grudniu →</Link>
      </div>
    </section>

    <section className="shell seo-copy-section">
      <h2>Nie patrz tylko na temperaturę kraju</h2>
      <p>W zimie warunki mogą mocno różnić się między regionami tego samego kraju. Przy Egipcie sprawdź konkretny kurort, przy Kanarach część wyspy, a przy Maroku różnicę między wybrzeżem i miastami w głębi lądu.</p>
      <p>Jeśli najważniejsza jest kąpiel w morzu, sprawdź aktualną temperaturę wody i wiatr przed rezerwacją. Jeśli zależy Ci głównie na słońcu i zwiedzaniu, łagodniejsze kierunki mogą być wystarczające.</p>
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">SPRAWDŹ OFERTY</div><h2>Porównaj zimowe wakacje</h2></div></div>
      <div className="single-partner-search-wrap"><UnifiedPartnerSearch mode="holiday" /></div>
    </section>

    <section className="shell guides-checklist">
      <h2>Najczęstsze pytania o ciepłe kierunki zimą</h2>
      {faq.map(([question, answer]) => <div key={question}><h3>{question}</h3><p>{answer}</p></div>)}
    </section>

    <SiteFooter/>
  </main>;
}
