"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import styles from "./SalesVisualShortcuts.module.css";

const airportCards = [
  {
    href: "/z-warszawy",
    label: "WAW + WMI",
    title: "Wyjazdy z Warszawy",
    text: "City break, wakacje, Last Minute i All Inclusive",
    image: "/images/destinations/rzym.jpg",
  },
  {
    href: "/z-krakowa",
    label: "KRK",
    title: "Wyjazdy z Krakowa",
    text: "City break, wakacje, Last Minute i All Inclusive",
    image: "/images/destinations/madera.jpg",
  },
];

const budgetCards = [
  {
    href: "/podroze/city-break-do-700-zl",
    label: "DO 700 ZŁ",
    title: "Tani city break",
    image: "/images/destinations/rzym.jpg",
  },
  {
    href: "/podroze/wakacje-do-1500-zl",
    label: "DO 1500 ZŁ",
    title: "Tanie wakacje",
    image: "/images/destinations/valletta.jpg",
  },
  {
    href: "/podroze/all-inclusive-do-2000-zl",
    label: "DO 2000 ZŁ",
    title: "All Inclusive",
    image: "/images/destinations/teneryfa.jpg",
  },
];

const seasonalCards = [
  {
    href: "/podroze/sylwester-z-warszawy-do-2000-zl",
    label: "SYLWESTER",
    title: "Przełom roku z Warszawy",
    image: "/images/destinations/praga.jpg",
  },
  {
    href: "/podroze/all-inclusive-listopad-do-2500-zl",
    label: "LISTOPAD",
    title: "All Inclusive do 2500 zł",
    image: "/images/destinations/teneryfa.jpg",
  },
  {
    href: "/podroze/ferie-2027-all-inclusive",
    label: "FERIE 2027",
    title: "Ciepło zimą",
    image: "/images/destinations/marsa-alam.jpg",
  },
];

export default function SalesVisualShortcuts() {
  function track(kind: "airport" | "seasonal" | "budget", href: string) {
    trackEvent("homepage_sales_shortcut_click", { kind, href });
  }

  return (
    <section className={styles.section} aria-label="Szybkie skróty do ofert">
      <div className={styles.shell}>
        <div className={styles.rowHeadSecondary}>
          <div>
            <small>SZUKAJ PO BUDŻECIE</small>
            <h3>Najpierw cena, potem kierunek.</h3>
          </div>
        </div>

        <div className={styles.seasonalGrid}>
          {budgetCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={styles.seasonalCard}
              onClick={() => track("budget", card.href)}
            >
              <Image src={card.image} alt="" fill sizes="(max-width: 620px) 82vw, (max-width: 980px) 46vw, 33vw" className={styles.image}/>
              <span className={styles.scrim} aria-hidden="true"/>
              <div className={styles.cardCopy}>
                <small>{card.label}</small>
                <strong>{card.title}</strong>
                <b>Zobacz oferty <ArrowRight size={14}/></b>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.rowHeadSecondary}>
          <div>
            <small>TERAZ WARTO SZUKAĆ</small>
            <h3>Najbliższe okazje sezonowe.</h3>
          </div>
        </div>

        <div className={styles.seasonalGrid}>
          {seasonalCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={styles.seasonalCard}
              onClick={() => track("seasonal", card.href)}
            >
              <Image src={card.image} alt="" fill sizes="(max-width: 620px) 82vw, (max-width: 980px) 46vw, 33vw" className={styles.image}/>
              <span className={styles.scrim} aria-hidden="true"/>
              <div className={styles.cardCopy}>
                <small>{card.label}</small>
                <strong>{card.title}</strong>
                <b>Zobacz <ArrowRight size={14}/></b>
              </div>
            </Link>
          ))}
        </div>
        <div className={styles.rowHead}>
          <div>
            <small>NAJWIĘCEJ MOŻLIWOŚCI WYLOTU</small>
            <h2>Zacznij od lotniska.</h2>
          </div>
          <Link href="/podroze">Wszystkie opcje <ArrowRight size={15}/></Link>
        </div>

        <div className={styles.airportGrid}>
          {airportCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={styles.airportCard}
              onClick={() => track("airport", card.href)}
            >
              <Image src={card.image} alt="" fill sizes="(max-width: 620px) 84vw, 50vw" className={styles.image}/>
              <span className={styles.scrim} aria-hidden="true"/>
              <div className={styles.cardCopy}>
                <small>{card.label}</small>
                <strong>{card.title}</strong>
                <span className={styles.airportText}>{card.text}</span>
                <b>Zobacz oferty <ArrowRight size={14}/></b>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
