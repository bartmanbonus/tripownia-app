import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChristmasMarketsClient from "@/components/ChristmasMarketsClient";
import { ArrowDown, BedDouble, Plane, TrainFront } from "lucide-react";
import styles from "./markets.module.css";

export const metadata: Metadata = {
  title: "Jarmarki bożonarodzeniowe 2026 — terminy i wyjazdy",
  description: "Wiedeń, Praga, Drezno, Norymberga, Berlin, Budapeszt i Salzburg — sprawdź daty jarmarków, wybierz lotnisko, miesiąc i długość wyjazdu, a następnie porównaj loty i noclegi.",
  alternates: { canonical: "/jarmarki-bozonarodzeniowe" },
};

export const dynamic = "force-dynamic";
const PUBLISH_UNTIL = new Date("2027-01-07T22:59:59Z").getTime();

export default function Page() {
  if (Date.now() > PUBLISH_UNTIL) notFound();

  return (
    <main>
      <SiteHeader/>
      <section className="seasonal-hero shell market-hero-compact">
        <div className="kicker">ŚWIĄTECZNE PODRÓŻE · SEZON 2026/2027</div>
        <h1>Najpiękniejsze jarmarki Europy. Wybierz swój termin.</h1>
        <p>Wiedeń, Praga, Budapeszt i inne świąteczne miasta. Porównaj krótkie wyjazdy bez narzuconych dat — z lotem, noclegiem i atrakcjami w jednym planie.</p>
      </section>
      <div className="section shell market-section-compact">
        <aside className={styles.newOptionsBanner} aria-label="Nowe sposoby planowania jarmarków">
          <div className={styles.newOptionsCopy}>
            <span className={styles.newOptionsEyebrow}>NOWE MOŻLIWOŚCI · JARMARKI 2026/2027</span>
            <h2>Teraz wybierzesz lot, pociąg i nocleg do jarmarków.</h2>
            <p>Sprawdź przejazd i hotel dla każdego z 7 miast. Loty pokazujemy, gdy mamy potwierdzenie połączenia lub wynik wyszukiwania; ceny i dostępność sprawdzasz u dostawcy.</p>
          </div>
          <div className={styles.newOptionsActions}>
            <span className={styles.newOptionsPills}>
              <span><Plane size={15} aria-hidden="true" /> Loty</span>
              <span><TrainFront size={15} aria-hidden="true" /> Pociągi</span>
              <span><BedDouble size={15} aria-hidden="true" /> Hotele</span>
            </span>
            <a href="#jarmarki-wyniki">Zobacz 7 kierunków <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
        </aside>
        <ChristmasMarketsClient/>
      </div>
      <SiteFooter/>
    </main>
  );
}
