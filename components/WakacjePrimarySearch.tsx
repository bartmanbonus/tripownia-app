"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./WakacjePrimarySearch.module.css";

type Props = { title?: string; description?: string; compact?: boolean; id?: string };

export default function WakacjePrimarySearch({
  title = "Pełna oferta wakacji Tripowni",
  description = "Wakacje, All Inclusive, egzotyka i last minute. Znajdź wyjazd, a rezerwację dokończ bezpiecznie u partnera.",
  compact = false,
  id,
}: Props) {
  const [expanded, setExpanded] = useState(!compact);

  return (
    <section id={id} className={`${styles.root} ${compact ? styles.compact : ""}`} aria-label="Wyszukiwarka wakacji Tripowni">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>TRIPOWNIA · WAKACJE I EGZOTYKA</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {compact && (
          <Link href="/szukaj-wakacji" className={styles.fullView}>
            Pełna wyszukiwarka <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
      <div className={styles.steps} aria-label="Jak działa wyszukiwanie">
        <span><b>1</b> Znajdź wyjazd</span>
        <span><b>2</b> Wybierz ofertę</span>
        <span><b>3</b> Zarezerwuj u partnera</span>
      </div>
      {compact && (
        <button
          type="button"
          className={styles.reveal}
          aria-expanded={expanded}
          aria-controls="wakacje-partner-search"
          onClick={() => setExpanded(value => !value)}
        >
          {expanded ? "Zwiń dodatkową wyszukiwarkę" : "Przeszukaj więcej wakacji i ofert All Inclusive"}
          <span aria-hidden="true">{expanded ? "−" : "→"}</span>
        </button>
      )}
      {expanded && (
        <div id={compact ? "wakacje-partner-search" : undefined} className={styles.frame}>
          <iframe
            title="Wyszukiwarka ofert wakacyjnych partnera rezerwacyjnego"
            src="/widgets/wakacje-search.html"
            loading={compact ? "lazy" : "eager"}
            referrerPolicy="strict-origin-when-cross-origin"
            className={styles.iframe}
          />
        </div>
      )}
      <p className={styles.note}>
        Oferty partnerskie dostępne przez Tripownię. Formularz i rezerwacja są obsługiwane przez zewnętrznego partnera; ceny i dostępność potwierdzisz przed zakupem.
      </p>
    </section>
  );
}
