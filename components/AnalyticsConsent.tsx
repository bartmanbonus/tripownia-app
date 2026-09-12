"use client";

import { useEffect, useState } from "react";
import { getAnalyticsConsent, setAnalyticsConsent, type AnalyticsConsent } from "@/lib/analytics";

export default function AnalyticsConsentBanner() {
  const [consent, setConsent] = useState<AnalyticsConsent>(null);

  useEffect(() => {
    setConsent(getAnalyticsConsent());
  }, []);

  if (consent !== null) return null;

  return (
    <aside className="analytics-consent" role="dialog" aria-label="Ustawienia analityki" aria-live="polite">
      <div>
        <strong>Pomóż nam ulepszać Tripownię</strong>
        <p>Możemy mierzyć statystycznie, które kierunki, oferty i wyszukiwania są najbardziej przydatne. Analitykę uruchamiamy dopiero po Twojej zgodzie.</p>
      </div>
      <div className="analytics-consent-actions">
        <button type="button" className="secondary" onClick={() => { setAnalyticsConsent("necessary"); setConsent("necessary"); }}>Tylko niezbędne</button>
        <button type="button" onClick={() => { setAnalyticsConsent("analytics"); setConsent("analytics"); }}>Akceptuję analitykę</button>
      </div>
    </aside>
  );
}
