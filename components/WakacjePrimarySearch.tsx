"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Compass, PlaneTakeoff, ShieldCheck, SunMedium } from "lucide-react";
import styles from "./WakacjePrimarySearch.module.css";

type Props = { title?: string; description?: string; compact?: boolean; featured?: boolean; inline?: boolean; id?: string };

export default function WakacjePrimarySearch({
  title = "Pełna oferta wakacji Tripowni",
  description = "Wakacje, All Inclusive, egzotyka i last minute. Znajdź wyjazd, a rezerwację dokończ bezpiecznie u partnera.",
  compact = false,
  featured = false,
  inline = false,
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
      const next = Math.max(420, Math.ceil(measured) + 32);
      setWidgetHeight(current => Math.abs(current - next) >= 12 ? next : current);
    };
    window.addEventListener("message", onHeight);
    return () => window.removeEventListener("message", onHeight);
  }, []);

  return (
    <section id={id} className={`${styles.root} ${compact ? styles.compact : ""} ${featured ? styles.featured : ""} ${inline ? styles.inline : ""}`} aria-label="Wyszukiwarka wakacji Tripowni">
      {inline ? (
        <div className={styles.inlineHeading}>
          <div>
            <span className={styles.eyebrow}>TRIPOWNIA · WAKACJE I EGZOTYKA</span>
            <h3>Wakacje i wycieczki</h3>

          </div>
          <span className={styles.inlineTrust}><ShieldCheck size={17} aria-hidden="true"/> Rezerwacja u partnera</span>
        </div>
      ) : (
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
      )}
      {compact && !inline && (
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
      {(expanded || inline) && (
        <div id={compact ? "wakacje-partner-search" : undefined} className={styles.frame}>
          <iframe
            ref={widgetRef}
            title="Wyszukiwarka ofert wakacyjnych partnera rezerwacyjnego"
            src="/widgets/wakacje-search.html"
            loading={inline ? "eager" : compact ? "lazy" : "eager"}
            referrerPolicy="strict-origin-when-cross-origin"
            className={styles.iframe}
            style={{ height: widgetHeight, minHeight: widgetHeight }}
          />
        </div>
      )}
      <p className={styles.note}><ShieldCheck size={17} aria-hidden="true"/>
        <span>Cenę i dostępność potwierdzisz u partnera przed rezerwacją.</span>
      </p>
    </section>
  );
}
