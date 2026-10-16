import Link from "next/link";
import styles from "./WakacjePrimarySearch.module.css";

type Props = {
  title?: string;
  description?: string;
  compact?: boolean;
  id?: string;
};

export default function WakacjePrimarySearch({
  title = "Wyszukaj wakacje w pełnej ofercie",
  description = "All Inclusive, last minute, rodzinne wyjazdy i egzotyka. Porównaj wycieczki wielu organizatorów, lotniska i terminy w jednym miejscu.",
  compact = false,
  id,
}: Props) {
  return (
    <section id={id} className={`${styles.root} ${compact ? styles.compact : ""}`} aria-label="Główna wyszukiwarka wycieczek">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>GŁÓWNA WYSZUKIWARKA WAKACJI</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Link href="/szukaj-wakacji" className={styles.fullView}>
          Otwórz w pełnym widoku <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className={styles.frame}>
        <iframe
          title="Pełna wyszukiwarka wycieczek z wielu biur podróży"
          src="/widgets/wakacje-search.html"
          loading={compact ? "lazy" : "eager"}
          referrerPolicy="strict-origin-when-cross-origin"
          className={styles.iframe}
        />
      </div>
      <p className={styles.note}>
        Wyszukiwarka ma własne filtry. Wybierz w niej termin, lotnisko i kierunek, a następnie potwierdź ostateczną cenę i dostępność przed rezerwacją. Linki do rezerwacji mają charakter partnerski.
      </p>
    </section>
  );
}
