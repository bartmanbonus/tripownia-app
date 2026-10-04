import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";
import ReadySearchGrid from "@/components/ReadySearchGrid";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";

const title = "Wakacje 2027 – First Minute, All Inclusive i lot + hotel";
const description = "Wakacje 2027 z Polski: First Minute, All Inclusive, lot + hotel i tanie wakacje. Porównaj kierunki, lotniska, terminy i pełny koszt podróży.";

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
      <h1>Wakacje 2027: First Minute, All Inclusive i lot + hotel.</h1>
      <p>Sezon 2027 już pojawia się w sprzedaży. Tripownia pomaga porównać kierunek, lotnisko, długość pobytu i pełny koszt, zamiast patrzeć wyłącznie na cenę startową.</p>
    </section>

    <section className="shell seo-copy-section">
      <div className="kicker">JAK SZUKAĆ</div>
      <h2>Najpierw wybierz styl wyjazdu, potem konkretną ofertę</h2>
      <p>Jeśli chcesz odpoczywać głównie w hotelu, porównaj All Inclusive w Turcji, Grecji, Egipcie, Tunezji i na Wyspach Kanaryjskich. Jeżeli ważniejsze jest zwiedzanie, sprawdź city break albo samodzielny lot z noclegiem.</p>
      <p>Przy rodzinnych wakacjach szczególnie ważne są godziny lotów, transfer, rodzaj pokoju, wyżywienie i rzeczywista odległość od plaży. Dla par i krótszych wyjazdów większe znaczenie może mieć lokalizacja hotelu i możliwość zwiedzania bez auta.</p>
    </section>

    <section className="section shell">
      <div className="section-heading">
        <div>
          <div className="kicker">GOTOWE PUNKTY STARTU 2027</div>
          <h2>Wybierz miesiąc, lotnisko albo kierunek — parametry są już ustawione</h2>
          <p>Kliknięcie uruchamia wyszukiwanie zamiast przenosić do kolejnej strony opisowej.</p>
        </div>
      </div>
      <ReadySearchGrid items={[
        { href: "/szukaj?destination=Egipt&month=2027-06&duration=7&budget=3500&board=all%20inclusive&tab=All%20Inclusive", eyebrow: "EGIPT · CZERWIEC 2027 · 7 NOCY", title: "Egipt All Inclusive", meta: "Do 3 500 zł/os. · różne lotniska" },
        { href: "/szukaj?destination=Turcja&month=2027-06&duration=7&budget=3500&board=all%20inclusive&tab=All%20Inclusive", eyebrow: "TURCJA · CZERWIEC 2027 · 7 NOCY", title: "Turcja All Inclusive", meta: "Do 3 500 zł/os. · aktualne pakiety" },
        { href: "/szukaj?destination=Grecja&month=2027-06&duration=7&budget=3500&tab=Wakacje", eyebrow: "GRECJA · CZERWIEC 2027 · 7 NOCY", title: "Grecja 2027", meta: "Wyspy i kontynent · różne polskie lotniska" },
        { href: "/szukaj?month=2027-07&duration=7&budget=3500&tab=Wakacje", eyebrow: "LIPIEC 2027 · 7 NOCY · DO 3 500 ZŁ", title: "Wakacje w lipcu", meta: "Różne kierunki · najtańsze najpierw" },
        { href: "/szukaj?airport=WAWA&month=2027-07&duration=7&budget=3500&tab=Wakacje", eyebrow: "WARSZAWA · LIPIEC 2027", title: "Wakacje z Warszawy", meta: "7 nocy · WAW + WMI · do 3 500 zł/os." },
        { href: "/szukaj?airport=KTW&month=2027-07&duration=7&budget=3500&board=all%20inclusive&tab=All%20Inclusive", eyebrow: "KATOWICE · LIPIEC 2027", title: "All Inclusive z Katowic", meta: "7 nocy · do 3 500 zł/os. · różne kierunki" },
      ]} />
      <div className="seo-discovery-footer">
        <Link href="/wakacje-czerwiec-2027">Poradnik: czerwiec 2027</Link>
        <Link href="/wakacje-lipiec-2027">Poradnik: lipiec 2027</Link>
        <Link href="/wakacje-sierpien-2027">Poradnik: sierpień 2027</Link>
      </div>
    </section>

    <section className="section shell">
      <div className="section-heading"><div><div className="kicker">PORÓWNAJ TERAZ</div><h2>Sprawdź aktualne wakacje</h2><p>Wyszukaj kierunek i termin, a przed zakupem porównaj końcową cenę oraz warunki u partnera.</p></div></div>
      <div className="single-partner-search-wrap"><SearchHub embedded initialTab="Wakacje" /></div>
    </section>
    <section className="section shell"><FacebookFollowCTA placement="wakacje_2027_after_search" compact /></section>

    <section className="shell guides-checklist">
      <h2>Najczęstsze pytania o wakacje 2027</h2>
      {faq.map(([q,a]) => <div key={q}><h3>{q}</h3><p>{a}</p></div>)}
    </section>
    <SiteFooter/>
  </main>;
}
