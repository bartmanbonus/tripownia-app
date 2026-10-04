import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CarTaxiFront, ExternalLink, UsersRound } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { partners } from "@/lib/partners";
import TripPiecePartnerLink from "@/components/TripPiecePartnerLink";

export const metadata: Metadata = {
  title: "Transfer z lotniska i taxi",
  description: "Porównaj prywatny transfer i taxi po przylocie. Sprawdź wygodny dojazd z lotniska do hotelu.",
  alternates: { canonical: "/transfery" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] || "" : value || ""; }

export default async function TransfersPage({ searchParams }: Props) {
  const params = await searchParams;
  const destination = first(params.destination).trim();
  return (
    <main>
      <SiteHeader />
      <section className="shell service-page">
        <div className="kicker">PO PRZYLOCIE</div>
        <h1>Transfer dopasowany do konkretnego lotu.</h1>
        <p className="hub-lead">Najpierw sprawdź, czy transfer nie jest już w cenie pakietu. Jeśli nie — porównaj taxi lub transfer prywatny pod godzinę przylotu, liczbę osób i odległość hotelu.</p>

        <div className="service-panel">
          <div>
            <div className="my-trip-card-head"><CarTaxiFront size={21} /><h2>Transfer z lotniska</h2></div>
            <p>Dobre, gdy chcesz z góry znać trasę i sposób odbioru po przylocie.</p>
            <ul>
              <li>Wpisz konkretne lotnisko i miejsce docelowe.</li>
              <li>Porównaj cenę z lokalnym taxi i transportem publicznym.</li>
              <li>Sprawdź zasady oczekiwania przy opóźnieniu lotu.</li>
            </ul>
            <div className="service-cta">
              <strong>Sprawdź transfer</strong>
              <TripPiecePartnerLink href={partners.kiwitaxi.buildUrl()} piece="transfer" partner="kiwitaxi" destination={destination} label={destination ? `Transfer: ${destination}` : "Transfer z lotniska"} source="transfers_kiwitaxi">Zobacz transfery <ExternalLink size={16}/></TripPiecePartnerLink>
            </div>
          </div>

          <div>
            <div className="my-trip-card-head"><UsersRound size={21} /><h2>Transfer dla grupy</h2></div>
            <p>Warto porównać przy większej grupie, dłuższej trasie lub bardziej niestandardowym przejeździe.</p>
            <ul>
              <li>Podaj dokładny punkt odbioru i hotel.</li>
              <li>Sprawdź wielkość samochodu i miejsce na bagaż.</li>
              <li>Porównaj finalną cenę całej grupy, nie tylko cenę od osoby.</li>
            </ul>
            <div className="service-cta">
              <strong>Porównaj przejazdy</strong>
              <TripPiecePartnerLink href={partners.gettransfer.buildUrl()} piece="transfer" partner="gettransfer" destination={destination} label={destination ? `Transfer grupowy: ${destination}` : "Transfer dla grupy"} source="transfers_gettransfer">Porównaj przejazdy <ExternalLink size={16}/></TripPiecePartnerLink>
            </div>
          </div>
        </div>

        <div className="deals-end-cta">
          <div><strong>Masz już wybraną ofertę?</strong><span>Dodaj ją do Mojej podróży i ogarnij transfer razem z lotem, pogodą, atrakcjami i checklistą.</span></div>
          <Link href="/moja-podroz">Otwórz Moją podróż <ArrowRight size={16}/></Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
