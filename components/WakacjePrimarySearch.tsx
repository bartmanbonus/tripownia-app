"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Compass, PlaneTakeoff, ShieldCheck, SunMedium } from "lucide-react";
import styles from "./WakacjePrimarySearch.module.css";

type Props = { title?: string; description?: string; compact?: boolean; featured?: boolean; id?: string };

export default function WakacjePrimarySearch({
  title = "Pełna oferta wakacji Tripowni",
  description = "Wakacje, All Inclusive, egzotyka i last minute. Znajdź wyjazd, a rezerwację dokończ bezpiecznie u partnera.",
  compact = false,
  featured = false,
  id,
}: Props) {
  const [expanded, setExpanded] = useState(!compact);
  const [widgetHeight, setWidgetHeight] = useState(440);
  const widgetRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const onHeight = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== widgetRef.current?.contentWindow) return;
      if (event.data?.type !== "tripownia:wk-widget-height") return;
      const measured = Number(event.data.height);
      if (!Number.isFinite(measured) || measured < 150) return;
      const next = Math.min(1600, Math.max(330, Math.ceil(measured) + 12));
      setWidgetHeight(current => Math.abs(current - next) >= 12 ? next : current);
    };
    window.addEventListener("message", onHeight);
    return () => window.removeEventListener("message", onHeight);
  }, []);

  return (
    <section id={id} className={`${styles.root} ${compact ? styles.compact : ""} ${featured ? styles.featured : ""}`} aria-label="Wyszukiwarka wakacji Tripowni">
      <div className={styles.heading}>
        <div className={styles.headingCopy}>
          <span className={styles.eyebrow}>TRIPOWNIA · WAKACJE I EGZOTYKA</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className={styles.scenic} role="img" aria-label="Majorka, turkusowe morze i śródziemnomorski krajobraz">
          <span><SunMedium size={18}/> Słońce czeka!</span>
        </div>
        {compact && (
          <Link href="/szukaj-wakacji" className={styles.fullView}>
            Pełna wyszukiwarka <ArrowRight size={17} aria-hidden="true" />
          </Link>
        )}
      </div>
      {featured && <div className={styles.partnerNotice} aria-label="Informacja o dostawcy wyszukiwarki">
        <span><strong>Wybierz kierunek i termin w formularzu poniżej.</strong> Cenę i dostępność potwierdzisz przed rezerwacją.</span>
        <small>Wyszukiwarka Wakacje.pl · afiliacja Tripowni 3212</small>
      </div>}
      <div className={styles.steps} aria-label="Jak działa wyszukiwanie">
        <div className={styles.step}><span className={styles.stepIcon}><Compass size={23}/></span><span><b>1</b><strong>Znajdź wyjazd</strong><small>Wybierz kierunek, termin i lotnisko.</small></span></div>
        <div className={styles.step}><span className={styles.stepIcon}><CalendarDays size={23}/></span><span><b>2</b><strong>Wybierz ofertę</strong><small>Porównaj wyjazdy i dostępne warianty.</small></span></div>
        <div className={styles.step}><span className={styles.stepIcon}><PlaneTakeoff size={23}/></span><span><b>3</b><strong>Zarezerwuj u partnera</strong><small>Sprawdź cenę i dokończ rezerwację.</small></span></div>
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
          <ArrowRight size={22} aria-hidden="true" />
        </button>
      )}
      {expanded && (
        <div id={compact ? "wakacje-partner-search" : undefined} className={styles.frame}>
          <iframe
            ref={widgetRef}
            title="Wyszukiwarka ofert wakacyjnych partnera rezerwacyjnego"
            src="/widgets/wakacje-search.html"
            loading={compact ? "lazy" : "eager"}
            referrerPolicy="strict-origin-when-cross-origin"
            className={styles.iframe}
            style={{ height: widgetHeight, minHeight: widgetHeight }}
          />
        </div>
      )}
      <p className={styles.note}><ShieldCheck size={17} aria-hidden="true"/>
        <span>Wyszukujesz w Tripowni, a finalizujesz rezerwację u sprawdzonego partnera. Cenę i dostępność potwierdzisz przed zakupem.</span>
      </p>
    </section>
  );
}
