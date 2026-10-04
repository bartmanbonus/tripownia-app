"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, Plane, Sparkles, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import styles from "./InspirationConcierge.module.css";

type Props = {
  nextMonth: string;
  nextMonthLabel: string;
  followingMonth: string;
  followingMonthLabel: string;
};

type Scenario = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  params: Record<string, string>;
  summary: string[];
};

const airports = [
  { code: "", label: "Wszystkie lotniska" },
  { code: "WAWA", label: "Warszawa" },
  { code: "KRK", label: "Kraków" },
  { code: "KTW", label: "Katowice" },
  { code: "POZ", label: "Poznań" },
  { code: "GDN", label: "Gdańsk" },
  { code: "WRO", label: "Wrocław" },
] as const;

const STORAGE_KEY = "tripownia-inspiracje-airport-v1";

export default function InspirationConcierge({
  nextMonth,
  nextMonthLabel,
  followingMonth,
  followingMonthLabel,
}: Props) {
  const [airport, setAirport] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || "";
      if (airports.some((item) => item.code === saved)) setAirport(saved);
    } catch {}
  }, []);

  const scenarios = useMemo((): Scenario[] => [
    {
      id: "city-weekend",
      eyebrow: "KRÓTKO I TANIO",
      title: "City break bez kombinowania",
      description: "Krótki wyjazd, sensowny budżet i od razu wyniki lot + hotel.",
      image: "/images/destinations/rzym.jpg",
      imageAlt: "Rzym — inspiracja na krótki city break",
      params: { tab: "City break", duration: "3-4", budget: "1200", weekend: "1" },
      summary: ["3–4 noce", "do 1 200 zł/os.", "weekend"],
    },
    {
      id: "warm-next-month",
      eyebrow: "CIEPŁO + WYGODNIE",
      title: `Ciepło w ${nextMonthLabel}`,
      description: "Nie wybierasz kraju. Ustawiamy miesiąc, długość i All Inclusive.",
      image: "/images/destinations/teneryfa.jpg",
      imageAlt: "Teneryfa — ciepły kierunek na wyjazd All Inclusive",
      params: { tab: "All Inclusive", month: nextMonth, duration: "5-7", budget: "3000", board: "all inclusive" },
      summary: ["5–7 nocy", "All Inclusive", "do 3 000 zł/os."],
    },
    {
      id: "cheapest-anywhere",
      eyebrow: "NAJPIERW CENA",
      title: "Najtaniej, nieważne gdzie",
      description: "Tripownia szuka szeroko i układa wyniki od najniższej ceny.",
      image: "/images/destinations/praga.jpg",
      imageAlt: "Praga — przykład taniego wyjazdu",
      params: { tab: "Lot + hotel", duration: "3-5", budget: "1500" },
      summary: ["Gdziekolwiek", "3–5 nocy", "do 1 500 zł/os."],
    },
    {
      id: "south-europe",
      eyebrow: "SŁOŃCE BLISKO",
      title: "Południe Europy na szybki reset",
      description: "Malta, Bari, Alicante i Malaga — cztery kierunki sprawdzane jednym kliknięciem.",
      image: "/images/destinations/malaga.jpg",
      imageAlt: "Malaga — słoneczny city break w południowej Europie",
      params: { destination: "Malta|Bari|Alicante|Malaga", tab: "City break", duration: "3-5", budget: "1800" },
      summary: ["4 kierunki", "3–5 nocy", "do 1 800 zł/os."],
    },
    {
      id: "exotic",
      eyebrow: "DALEJ, ALE GOTOWE",
      title: `Egzotyka w ${followingMonthLabel}`,
      description: "Bangkok, Bali, Malediwy i Zanzibar — sprawdzamy kilka kierunków naraz.",
      image: "/images/experiences/egzotyka.png",
      imageAlt: "Egzotyczna plaża — inspiracja na dalszy wyjazd",
      params: { destination: "Bangkok|Bali|Malediwy|Zanzibar", tab: "Lot + hotel", month: followingMonth, duration: "7-14", budget: "5500" },
      summary: ["4 kierunki", "7–14 nocy", "do 5 500 zł/os."],
    },
    {
      id: "all-inclusive-budget",
      eyebrow: "ZERO PLANOWANIA",
      title: "All Inclusive do 2 500 zł",
      description: "Bez wybierania kierunku. Interesuje Cię tylko cena i wygodny pakiet.",
      image: "/images/destinations/marsa-alam.jpg",
      imageAlt: "Marsa Alam — inspiracja na All Inclusive",
      params: { tab: "All Inclusive", duration: "5-7", budget: "2500", board: "all inclusive" },
      summary: ["5–7 nocy", "All Inclusive", "do 2 500 zł/os."],
    },
  ], [nextMonth, nextMonthLabel, followingMonth, followingMonthLabel]);

  const airportLabel = airports.find((item) => item.code === airport)?.label || "Wszystkie lotniska";

  function hrefFor(scenario: Scenario) {
    const params = new URLSearchParams(scenario.params);
    if (airport) params.set("airport", airport);
    return `/szukaj?${params.toString()}`;
  }

  function chooseAirport(code: string) {
    setAirport(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}
    trackEvent("inspiration_airport_select", { airport: code || "all" });
  }

  return (
    <section className={styles.panel} id="gotowce" aria-label="Gotowe scenariusze wyjazdu">
      <div className={styles.head}>
        <div>
          <span className={styles.kicker}><Sparkles size={14}/> TRIPOWNIA USTAWIA ZA CIEBIE</span>
          <h2>Wybierz tylko klimat. Resztę już ustawiliśmy.</h2>
          <p>Kierunek, długość, budżet i typ wyjazdu są gotowe. Klikasz kafel i od razu widzisz wyniki — bez kolejnego formularza.</p>
        </div>
        <div className={styles.promise}>
          <CheckCircle2 size={18}/>
          <span><strong>1 klik do wyników</strong><small>Najtańsze opcje pokazujemy pierwsze.</small></span>
        </div>
      </div>

      <div className={styles.departureBox}>
        <div className={styles.departureCopy}>
          <span className={styles.step}>1</span>
          <div><strong>Skąd chcesz lecieć?</strong><small>Możesz nic nie zmieniać — wtedy szukamy ze wszystkich lotnisk.</small></div>
        </div>
        <div className={styles.airports} role="group" aria-label="Lotnisko wylotu">
          {airports.map((item) => (
            <button
              type="button"
              key={item.code || "all"}
              className={airport === item.code ? styles.activeAirport : ""}
              aria-pressed={airport === item.code}
              onClick={() => chooseAirport(item.code)}
            >
              {item.code ? <Plane size={14}/> : <MapPin size={14}/>}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.choiceHead}>
        <span className={styles.step}>2</span>
        <div><strong>Kliknij gotowy wariant</strong><small>Aktualnie: wylot — {airportLabel}. Reszta parametrów jest już w kaflach.</small></div>
      </div>

      <div className={styles.grid}>
        {scenarios.map((scenario) => (
          <Link
            key={scenario.id}
            href={hrefFor(scenario)}
            className={styles.card}
            onClick={() => trackEvent("inspiration_ready_search_click", {
              scenario: scenario.id,
              airport: airport || "all",
            })}
          >
            <div className={styles.imageWrap}>
              <Image src={scenario.image} alt={scenario.imageAlt} fill sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 33vw"/>
              <span className={styles.scrim} aria-hidden="true"/>
              <small>{scenario.eyebrow}</small>
            </div>
            <div className={styles.body}>
              <strong>{scenario.title}</strong>
              <p>{scenario.description}</p>
              <div className={styles.summary}>
                {scenario.summary.map((item, index) => (
                  <span key={item}>
                    {index === 0 ? <CalendarDays size={13}/> : index === scenario.summary.length - 1 ? <Wallet size={13}/> : <CheckCircle2 size={13}/>}
                    {item}
                  </span>
                ))}
              </div>
              <b>Pokaż gotowe wyniki <ArrowRight size={16}/></b>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.bottom}>
        <div>
          <span className={styles.step}>3</span>
          <div><strong>Potem już tylko wybierasz ofertę</strong><small>Na wynikach termin, liczba nocy, lotnisko i cena są widoczne od razu.</small></div>
        </div>
        <Link
          href={`/szukaj?${new URLSearchParams({
            tab: "City break",
            duration: "3-5",
            budget: "1500",
            ...(airport ? { airport } : {}),
          }).toString()}`}
          onClick={() => trackEvent("inspiration_surprise_me_click", { airport: airport || "all" })}
        >
          Nie chcę wybierać — pokaż mi najlepsze <ArrowRight size={16}/>
        </Link>
      </div>
    </section>
  );
}
