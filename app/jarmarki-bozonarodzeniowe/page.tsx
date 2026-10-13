import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChristmasMarketsClient from "@/components/ChristmasMarketsClient";
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
    <main className={styles.marketPage}>
      <SiteHeader/>
      <section className="seasonal-hero shell market-hero-compact">
        <div className="kicker">ŚWIĄTECZNE PODRÓŻE · SEZON 2026/2027</div>
        <h1>Jarmarki Europy. Twój wyjazd w kilku kliknięciach.</h1>
        <p>Wybierz termin, porównaj dostępne loty lub pociągi i znajdź hotel. Wszystko przy konkretnym jarmarku, bez zaczynania wyszukiwania od zera.</p>
      </section>
      <div className="section shell market-section-compact">
        <ChristmasMarketsClient/>
      </div>
      <SiteFooter/>
    </main>
  );
}
