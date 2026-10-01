"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import styles from "./SalesVisualShortcuts.module.css";

const budgetCards = [
  {
    href: "/podroze/wyjazdy-do-1000-zl",
    label: "DO 1000 ZŁ",
    title: "Tani city break",
    image: "/images/destinations/praga.jpg",
  },
  {
    href: "/podroze/wakacje-do-2000-zl",
    label: "DO 2000 ZŁ",
    title: "Wakacje w budżecie",
    image: "/images/destinations/djerba.jpg",
  },
  {
    href: "/podroze/wakacje-do-2500-zl",
    label: "DO 2500 ZŁ",
    title: "Więcej słońca",
    image: "/images/destinations/rodos.jpg",
  },
  {
    href: "/podroze/all-inclusive-do-2500-zl",
    label: "ALL INCLUSIVE",
    title: "Pakiet do 2500 zł",
    image: "/images/destinations/marsa-alam.jpg",
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
  function track(kind: "budget" | "seasonal", href: string) {
    trackEvent("homepage_sales_shortcut_click", { kind, href });
  }

  return (
    <section className={styles.section} aria-label="Szybkie skróty do ofert">
      <div className={styles.shell}>
        <div className={styles.rowHead}>
          <div>
            <small>SZYBKA DECYZJA</small>
            <h2>Wybierz budżet.</h2>
          </div>
          <Link href="/podroze">Więcej opcji <ArrowRight size={15}/></Link>
        </div>

        <div className={styles.budgetGrid}>
          {budgetCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={styles.budgetCard}
              onClick={() => track("budget", card.href)}
            >
              <Image src={card.image} alt="" fill sizes="(max-width: 620px) 78vw, (max-width: 980px) 45vw, 25vw" className={styles.image}/>
              <span className={styles.scrim} aria-hidden="true"/>
              <div className={styles.cardCopy}>
                <small>{card.label}</small>
                <strong>{card.title}</strong>
                <b>Sprawdź <ArrowRight size={14}/></b>
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
      </div>
    </section>
  );
}
