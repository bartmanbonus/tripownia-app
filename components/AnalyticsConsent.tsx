"use client";

import { useEffect, useState } from "react";
import { getAnalyticsConsent, setAnalyticsConsent, type AnalyticsConsent } from "@/lib/analytics";

export default function AnalyticsConsentBanner() {
  const [consent, setConsent] = useState<AnalyticsConsent>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const current = getAnalyticsConsent();
    setConsent(current);
    setOpen(current === null);
  }, []);

  function choose(next: Exclude<AnalyticsConsent, null>) {
    setAnalyticsConsent(next);
    setConsent(next);
    setOpen(false);
  }

  return (
    <>
      {open && (
        <aside className="analytics-consent" role="dialog" aria-label="Ustawienia analityki" aria-live="polite">
          <div>
            <strong>Pomóż nam ulepszać Tripownię</strong>
            <p>Możemy mierzyć statystycznie, które kierunki, oferty i wyszukiwania są najbardziej przydatne. Analitykę uruchamiamy dopiero po Twojej zgodzie.</p>
          </div>
          <div className="analytics-consent-actions">
            <button type="button" className="secondary" onClick={() => choose("necessary")}>Tylko niezbędne</button>
            <button type="button" onClick={() => choose("analytics")}>Akceptuję analitykę</button>
          </div>
        </aside>
      )}

      {consent !== null && !open && (
        <button
          type="button"
          className="analytics-consent-reopen"
          onClick={() => setOpen(true)}
          aria-label="Otwórz ustawienia prywatności"
        >
          Prywatność
        </button>
      )}
    </>
  );
}
