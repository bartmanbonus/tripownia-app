import Image from "next/image";
import Link from "next/link";
import styles from "./GoogleIntentGateway.module.css";

const intentLinks = [
  {
    href: "/gdzie-leciec",
    kicker: "NIE WIEM GDZIE",
    title: "Gdzie lecieć?",
    image: "/images/destinations/madera.jpg",
  },
  {
    href: "/tanie-loty",
    kicker: "NAJTANIEJ",
    title: "Tanie loty",
    image: "/images/destinations/barcelona.jpg",
  },
  {
    href: "/city-break",
    kicker: "2–5 DNI",
    title: "City break",
    image: "/images/destinations/rzym.jpg",
  },
  {
    href: "/gdzie-jest-cieplo-zima-bez-dalekiego-lotu",
    kicker: "SŁOŃCE",
    title: "Ciepło zimą",
    image: "/images/destinations/teneryfa.jpg",
  },
  {
    href: "/podroze/wakacje-do-2500-zl",
    kicker: "BUDŻET",
    title: "Wakacje do 2500 zł",
    image: "/images/destinations/djerba.jpg",
  },
  {
    href: "/tanie-all-inclusive",
    kicker: "PAKIET",
    title: "Tanie All Inclusive",
    image: "/images/destinations/marsa-alam.jpg",
  },
];

export default function GoogleIntentGateway() {
  return (
    <section className={styles.section} aria-labelledby="google-intent-title">
      <div className={styles.shell}>
        <div className={styles.head}>
          <div>
            <div className={styles.kicker}>WYBIERZ SZYBKO</div>
            <h2 id="google-intent-title">Czego dziś szukasz?</h2>
          </div>
          <Link href="/podroze" className={styles.allLink}>Wszystkie pomysły →</Link>
        </div>

        <div className={styles.grid}>
          {intentLinks.map((item) => (
            <Link key={item.href} href={item.href} className={styles.card}>
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(max-width: 620px) 90vw, (max-width: 980px) 46vw, 31vw"
                className={styles.image}
              />
              <span className={styles.scrim} aria-hidden="true" />
              <div className={styles.cardCopy}>
                <small>{item.kicker}</small>
                <strong>{item.title}</strong>
                <b>Sprawdź →</b>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
