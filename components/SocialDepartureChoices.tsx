"use client";

import Link from "next/link";
import { ArrowRight, Plane, UsersRound, Sun, CalendarDays } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import styles from "./SocialDepartureChoices.module.css";

const airports = [
  { name: "Warszawa", note: "Chopin i Modlin", code: "WAW / WMI", href: "/z-warszawy" },
  { name: "Kraków", note: "Balice", code: "KRK", href: "/z-krakowa" },
  { name: "Katowice", note: "Pyrzowice", code: "KTW", href: "/z-katowic" },
  { name: "Gdańsk", note: "Trójmiasto", code: "GDN", href: "/z-gdanska" },
  { name: "Wrocław", note: "Strachowice", code: "WRO", href: "/z-wroclawia" },
  { name: "Poznań", note: "Ławica", code: "POZ", href: "/z-poznania" },
] as const;

const travelTypes = [
  { label: "Krótki city break", note: "Kilka dni w Europie", icon: CalendarDays, href: "/city-break", key: "city_break" },
  { label: "All Inclusive", note: "Wakacje z wyżywieniem", icon: Sun, href: "/tanie-all-inclusive", key: "all_inclusive" },
  { label: "Wyjazd z dziećmi", note: "Porównaj pokoje i koszty całej rodziny", icon: UsersRound, href: "/wakacje-z-dziecmi", key: "family" },
] as const;

export default function SocialDepartureChoices() {
  return (
    <>
      <section className={styles.section} aria-labelledby="facebook-airport-heading">
        <div className={styles.heading}>
          <div className="kicker">TWÓJ WYLOT · GOTOWE OPCJE</div>
          <h2 id="facebook-airport-heading">Z którego lotniska chcesz polecieć?</h2>
          <p>W komentarzach często pytacie o wyjazdy z konkretnego miasta. Wybierz lotnisko i zobacz propozycje, które możesz dalej filtrować i porównywać.</p>
        </div>
        <div className={styles.airportGrid}>
          {airports.map(({ name, note, code, href }) => (
            <Link
              key={code}
              href={href}
              className={styles.airportCard}
              onClick={() => trackEvent("social_departure_choice", { placement: "social_comment_landing", airport: code, destination_page: href })}
            >
              <span className={styles.airportIcon}><Plane size={23} aria-hidden="true" /></span>
              <span className={styles.airportText}>
                <strong>{name}</strong>
                <small>{note} · {code}</small>
              </span>
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
      <section className={styles.section} aria-labelledby="facebook-trip-heading">
        <div className={styles.heading}>
          <div className="kicker">JAK CHCESZ PODRÓŻOWAĆ?</div>
          <h2 id="facebook-trip-heading">Wybierz wyjazd po swojemu.</h2>
          <p>Nie musisz przeglądać wszystkich ofert. Możesz od razu przejść do konkretnego typu podróży.</p>
        </div>
        <div className={styles.typeGrid}>
          {travelTypes.map(({ label, note, icon: Icon, href, key }) => (
            <Link
              key={key}
              href={href}
              className={styles.typeCard}
              onClick={() => trackEvent("social_trip_type_choice", { placement: "social_comment_landing", trip_type: key, destination_page: href })}
            >
              <Icon size={22} aria-hidden="true" />
              <span><strong>{label}</strong><small>{note}</small></span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
        <p className={styles.disclaimer}>Ceny i dostępność zmieniają się na bieżąco. Przy wyjeździe dla 2 osób, 2+1 lub większej rodziny sprawdź finalną cenę i liczbę osób przed rezerwacją.</p>
      </section>
    </>
  );
}
