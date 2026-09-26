import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Wakacje 2027 – tanie oferty, All Inclusive i lot + hotel";
const description = "Wakacje 2027 z Polski: All Inclusive, last minute, lot + hotel i samodzielne wyjazdy. Porównaj kierunki, lotniska, terminy i pełny koszt podróży.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/wakacje-2027" },
  openGraph: { type: "website", title: `${title} | Tripownia.pl`, description, url: "/wakacje-2027" },
};

const faq = [
  ["Kiedy zacząć szukać wakacji na lato 2027?", "Jeśli zależy Ci na konkretnym hotelu, lotnisku lub pokoju rodzinnym, warto porównywać oferty z wyprzedzeniem. Przy elastycznym kierunku i terminie można równolegle obserwować oferty dynamiczne i późniejsze promocje."],
  ["All Inclusive czy lot i hotel osobno?", "Porównaj pełny koszt obu wariantów. W pakiecie zwróć uwagę na bagaż, transfer i wyżywienie; przy samodzielnym wyjeździe dolicz dojazd z lotniska, opłaty hotelowe i dodatkowe posiłki."],
  ["Z którego lotniska szukać wakacji?", "Najpierw sprawdź lotnisko najbliżej domu, a dopiero później porównaj alternatywy. Niższa cena pakietu może przestać być korzystna po doliczeniu paliwa, parkingu lub noclegu przy dalszym lotnisku."],
] as const;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(([q,a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export default function Wakacje2027Page() {
  return <main>
    <SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Wakacje", url: "https://tripownia.pl/wakacje" },
      { name: "Wakacje 2027", url: "https://tripownia.pl/wakacje-2027" },
    ]}/>
    <section className="shopping-hero shell">
      <div className="kicker">WAKACJE 2027</div>
      <h1>Wakacje 2027: porównaj All Inclusive, lot + hotel i samodzielny wyjazd.</h1>
      <p>Sezon 2027 już pojawia się w sprzedaży. Tripownia pomaga porównać kierunek, lotnisko, długość pobytu i pełny koszt, zamiast patrzeć wyłącznie na cenę startową.</p>
    </section>

    <section className="shell seo-copy-section">
      <div className="kicker">JAK SZUKAĆ</div>
      <h2>Najpierw wybierz styl wyjazdu, potem konkretną ofertę</h2>
      <p>Jeśli chcesz odpoczywać głównie w hotelu, porównaj All Inclusive w Turcji, Grecji, Egipcie, Tunezji i na Wyspach Kanaryjskich. Jeżeli ważniejsze jest zwiedzanie, sprawdź city break albo samodzielny lot z noclegiem.</p>
      <p>Przy rodzinnych wakacjach szczególnie ważne są godziny lotów, transfer, rodzaj pokoju, wyżywienie i rzeczywista odległość od plaży. Dla par i krótszych wyjazdów większe znaczenie może mieć lokalizacja hotelu i możliwość zwiedzania bez auta.</p>
    </section>

    <section className="shell seo-related-block">
      <div className="kicker">POPULARNE PUNKTY STARTU</div>
      <h2>Wakacje 2027 według lotniska i typu wyjazdu</h2>
      <div className="seo-related-links">
        <Link href="/egipt-2027">Egipt 2027 →</Link>
        <Link href="/turcja-2027">Turcja 2027 →</Link>
        <Link href="/grecja-2027">Grecja 2027 →</Link>
        <Link href="/wakacje-czerwiec-2027">Czerwiec 2027 →</Link>
        <Link href="/wakacje-lipiec-2027">Lipiec 2027 →</Link>
        <Link href="/wakacje-sierpien-2027">Sierpień 2027 →</Link>
        <Link href="/podroze/wakacje-z-warszawy">Wakacje z Warszawy →</Link>
        <Link href="/podroze/wakacje-z-krakowa">Wakacje z Krakowa →</Link>
        <Link href="/podroze/wakacje-z-katowic">Wakacje z Katowic →</Link>
        <Link href="/podroze/wakacje-z-gdanska">Wakacje z Gdańska →</Link>
        <Link href="/podroze/all-inclusive-z-warszawy">All Inclusive z Warszawy →</Link>
        <Link href="/last-minute">Last Minute →</Link>
      </div>
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">PORÓWNAJ TERAZ</div><h2>Sprawdź aktualne wakacje</h2><p>Wyszukaj kierunek i termin, a przed zakupem porównaj końcową cenę oraz warunki u partnera.</p></div></div>
      <div className="single-partner-search-wrap"><SearchHub embedded initialTab="Wakacje" /></div>
    </section>

    <section className="shell guides-checklist">
      <h2>Najczęstsze pytania o wakacje 2027</h2>
      {faq.map(([q,a]) => <div key={q}><h3>{q}</h3><p>{a}</p></div>)}
    </section>
    <SiteFooter/>
  </main>;
}
