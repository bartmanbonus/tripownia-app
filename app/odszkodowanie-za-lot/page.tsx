import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, ExternalLink, Plane, Scale, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { partners } from "@/lib/partners";
import { trackedAffiliateHref } from "@/lib/tracking";

export const metadata: Metadata = {
  title: "Odszkodowanie za opóźniony lub odwołany lot",
  description: "Sprawdź, czy po opóźnionym, odwołanym locie albo odmowie wejścia na pokład może przysługiwać Ci odszkodowanie.",
  alternates: { canonical: "/odszkodowanie-za-lot" },
  openGraph: {
    title: "Odszkodowanie za lot | Tripownia.pl",
    description: "Sprawdź możliwość uzyskania odszkodowania po problemach z lotem.",
    url: "https://tripownia.pl/odszkodowanie-za-lot",
  },
};

const claimHref = trackedAffiliateHref({
  partner: "zwrotzalot",
  url: partners.zwrotzalot.buildUrl(),
  source: "flight_compensation_page",
});

const situations = [
  { icon: Clock3, title: "Duże opóźnienie", text: "Lot dotarł na miejsce ze znacznym opóźnieniem? Warto sprawdzić, czy spełnia warunki do roszczenia." },
  { icon: Plane, title: "Odwołany lot", text: "Przewoźnik odwołał rejs lub zmienił go w ostatniej chwili? Sprawdź dostępne możliwości." },
  { icon: ShieldCheck, title: "Odmowa wejścia na pokład", text: "Nie wpuszczono Cię na pokład mimo ważnej rezerwacji? Taka sytuacja także może dawać podstawę do roszczenia." },
] as const;

export default function FlightCompensationPage() {
  return (
    <main>
      <SiteHeader />
      <section className="shell service-page">
        <div className="kicker">PO PROBLEMIE Z LOTEM</div>
        <h1>Sprawdź, czy możesz dostać odszkodowanie za lot.</h1>
        <p className="hub-lead">
          Opóźnienie, odwołanie lub odmowa wejścia na pokład nie zawsze oznaczają wypłatę,
          ale warto szybko sprawdzić konkretny przypadek zamiast zgadywać.
        </p>

        <div className="service-panel">
          <div>
            <div className="my-trip-card-head"><Scale size={21} /><h2>Sprawdź swój lot</h2></div>
            <p>Przygotuj numer lotu, datę podróży i podstawowe informacje o tym, co się wydarzyło.</p>
            <ul>
              <li>sprawdzenie dotyczy konkretnego lotu i okoliczności,</li>
              <li>ostateczna kwalifikacja zależy od warunków danego zdarzenia,</li>
              <li>przed wysłaniem zgłoszenia zobacz zasady i ewentualne koszty obsługi.</li>
            </ul>
            <div className="service-cta">
              <strong>Zweryfikuj możliwość odszkodowania</strong>
              <a href={claimHref} rel="sponsored">Sprawdź mój lot <ExternalLink size={16}/></a>
            </div>
          </div>

          <div>
            <div className="my-trip-card-head"><ShieldCheck size={21} /><h2>Kiedy warto sprawdzić?</h2></div>
            <div className="plannerChecklist">
              {situations.map(({ icon: Icon, title, text }) => (
                <div key={title}><Icon size={18}/><span><b>{title}</b> — {text}</span></div>
              ))}
            </div>
          </div>
        </div>

        <p className="affiliate-note" style={{ marginTop: 14 }}>
          Tripownia nie rozstrzyga, czy odszkodowanie przysługuje. Po kliknięciu przejdziesz do zewnętrznego serwisu, który sprawdza roszczenie. Link ma charakter afiliacyjny.
        </p>

        <div className="deals-end-cta">
          <div>
            <strong>Chcesz ogarnąć resztę podróży?</strong>
            <span>W planerze zbierzesz lot, nocleg, transfer, checklistę i kolejne rzeczy do zrobienia.</span>
          </div>
          <Link href="/moja-podroz">Otwórz Moją podróż <ArrowRight size={16}/></Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
