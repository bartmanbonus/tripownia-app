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

  function choose(next: Exclude<AnalyticsConsent, null> | "marketing") {
    if (next === "marketing") {
      window.localStorage.setItem("tripownia-consent-v1", "marketing");
      window.dispatchEvent(new CustomEvent("tripownia-consent-updated", { detail: "marketing" }));
    } else {
      setAnalyticsConsent(next);
    }
    setConsent(next === "marketing" ? "analytics" : next);
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
            <button type="button" onClick={() => choose("analytics")}>Analityka</button>
            <button type="button" onClick={() => choose("marketing")}>Analityka i marketing</button>
          </div>
        </aside>
      )}

      {consent !== null && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Otwórz ustawienia prywatności"
          style={{
            position: "fixed",
            right: 12,
            bottom: 12,
            zIndex: 40,
            border: "1px solid rgba(20,20,20,.14)",
            borderRadius: 999,
            background: "rgba(255,255,255,.94)",
            color: "#4f4f4b",
            padding: "8px 11px",
            font: "inherit",
            fontSize: 12,
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(0,0,0,.08)",
            cursor: "pointer",
          }}
        >
          Prywatność
        </button>
      )}
    </>
  );
}
