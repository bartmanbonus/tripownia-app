import type { Metadata } from "next";
import { ArrowRight, CarTaxiFront, ExternalLink, UsersRound } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { partners } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Transfer z lotniska i taxi",
  description: "Porównaj prywatny transfer i taxi po przylocie. Tripownia prowadzi do Kiwitaxi i GetTransfer przez centralny tracking afiliacyjny.",
  alternates: { canonical: "/transfery" },
};

export default function TransfersPage() {
  return (
    <main>
      <SiteHeader />
      <section className="shell service-page">
        <div className="kicker">PO PRZYLOCIE</div>
        <h1>Transfer dopasowany do konkretnego lotu.</h1>
        <p className="hub-lead">Najpierw sprawdź, czy transfer nie jest już w cenie pakietu. Jeśli nie — porównaj taxi lub transfer prywatny pod godzinę przylotu, liczbę osób i odległość hotelu.</p>

        <div className="service-panel">
          <div>
            <div className="my-trip-card-head"><CarTaxiFront size={21} /><h2>Kiwitaxi</h2></div>
            <p>Dobre, gdy chcesz z góry znać trasę i sposób odbioru po przylocie.</p>
            <ul>
              <li>Wpisz konkretne lotnisko i miejsce docelowe.</li>
              <li>Porównaj cenę z lokalnym taxi i transportem publicznym.</li>
              <li>Sprawdź zasady oczekiwania przy opóźnieniu lotu.</li>
            </ul>
            <div className="service-cta">
              <strong>Sprawdź Kiwitaxi</strong>
              <a href={partners.kiwitaxi.buildUrl()} target="_blank" rel="sponsored noopener noreferrer">Zobacz transfery <ExternalLink size={16}/></a>
            </div>
          </div>

          <div>
            <div className="my-trip-card-head"><UsersRound size={21} /><h2>GetTransfer</h2></div>
            <p>Warto porównać przy większej grupie, dłuższej trasie lub bardziej niestandardowym przejeździe.</p>
            <ul>
              <li>Podaj dokładny punkt odbioru i hotel.</li>
              <li>Sprawdź wielkość samochodu i miejsce na bagaż.</li>
              <li>Porównaj finalną cenę całej grupy, nie tylko cenę od osoby.</li>
            </ul>
            <div className="service-cta">
              <strong>Sprawdź GetTransfer</strong>
              <a href={partners.gettransfer.buildUrl()} target="_blank" rel="sponsored noopener noreferrer">Porównaj przejazdy <ExternalLink size={16}/></a>
            </div>
          </div>
        </div>

        <div className="deals-end-cta">
          <div><strong>Masz już wybraną ofertę?</strong><span>Dodaj ją do Mojej podróży i ogarnij transfer razem z lotem, pogodą, atrakcjami i checklistą.</span></div>
          <a href="/moja-podroz">Otwórz Moją podróż <ArrowRight size={16}/></a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
