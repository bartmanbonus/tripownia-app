import Link from "next/link";
import styles from "./GoogleIntentGateway.module.css";

const intentLinks = [
  {
    href: "/gdzie-leciec",
    kicker: "NIE WIEM GDZIE",
    title: "Gdzie lecieć?",
    text: "Dobierz kierunek do budżetu, terminu i stylu wyjazdu.",
  },
  {
    href: "/tanie-loty",
    kicker: "NAJTANIEJ",
    title: "Tanie loty z Polski",
    text: "Sprawdź okazje lotnicze i lotniska wylotu.",
  },
  {
    href: "/city-break",
    kicker: "2–5 DNI",
    title: "City break",
    text: "Lot + hotel, krótki weekend i konkretne terminy.",
  },
  {
    href: "/gdzie-jest-cieplo-zima-bez-dalekiego-lotu",
    kicker: "SŁOŃCE",
    title: "Gdzie jest ciepło zimą?",
    text: "Porównaj ciepłe kierunki bez bardzo długiego lotu.",
  },
  {
    href: "/podroze/wakacje-do-2500-zl",
    kicker: "BUDŻET",
    title: "Wakacje do 2500 zł",
    text: "Zobacz wyjazdy dopasowane do konkretnego budżetu.",
  },
  {
    href: "/tanie-all-inclusive",
    kicker: "PAKIET",
    title: "Tanie All Inclusive",
    text: "Porównaj pełne pakiety, hotele, wyżywienie i terminy.",
  },
];

export default function GoogleIntentGateway() {
  return (
    <section className={styles.section} aria-labelledby="google-intent-title">
      <div className={styles.shell}>
        <div className={styles.head}>
          <div>
            <div className={styles.kicker}>SZUKAJ TAK, JAK W GOOGLE</div>
            <h2 id="google-intent-title">Od pytania do konkretnego wyjazdu.</h2>
            <p>
              Wybierz to, czego naprawdę szukasz. Tripownia prowadzi od inspiracji do aktualnych ofert,
              lotów, hoteli i gotowych pakietów.
            </p>
          </div>
          <Link href="/podroze" className={styles.allLink}>Zobacz wszystkie pomysły →</Link>
        </div>

        <div className={styles.grid}>
          {intentLinks.map((item) => (
            <Link key={item.href} href={item.href} className={styles.card}>
              <small>{item.kicker}</small>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
              <b>Sprawdź →</b>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
