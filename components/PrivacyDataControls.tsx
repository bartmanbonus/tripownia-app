"use client";

import { useState } from "react";
import { Download, ShieldCheck, Trash2 } from "lucide-react";

const PERSONAL_PREFIXES = [
  "tripownia-my-trip",
  "tripownia-trips",
  "tripownia-organizer",
  "tripownia-favorites",
  "tripownia-compare",
  "tripownia-alert",
  "tripownia-profile",
  "tripownia-trip-toolkit",
  "tripownia:deal-price-history",
];

function personalKeys() {
  if (typeof window === "undefined") return [] as string[];
  return Object.keys(localStorage).filter((key) => PERSONAL_PREFIXES.some((prefix) => key.startsWith(prefix)));
}

export default function PrivacyDataControls() {
  const [status, setStatus] = useState("");

  function exportData() {
    const payload = Object.fromEntries(personalKeys().map((key) => [key, localStorage.getItem(key)]));
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data: payload }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `tripownia-dane-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus("Eksport danych został przygotowany.");
  }

  function clearData() {
    const keys = personalKeys();
    keys.forEach((key) => localStorage.removeItem(key));
    setStatus("Dane osobiste Tripowni zostały usunięte z tego urządzenia.");
    window.dispatchEvent(new Event("tripownia-profile-updated"));
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));
    window.dispatchEvent(new Event("tripownia-trips-updated"));
    window.dispatchEvent(new Event("tripownia-favorites-updated"));
    window.dispatchEvent(new Event("tripownia-alerts-updated"));
  }

  return (
    <section className="privacy-data-card" aria-labelledby="privacy-data-title">
      <div className="privacy-data-head">
        <ShieldCheck size={21} />
        <div>
          <strong id="privacy-data-title">Twoje dane na tym urządzeniu</strong>
          <span>Profil, zapisane podróże, organizer, checklisty, ulubione i alerty są dziś przechowywane lokalnie.</span>
        </div>
      </div>
      <div className="privacy-data-actions">
        <button type="button" onClick={exportData}><Download size={16} /> Eksportuj moje dane</button>
        <button type="button" className="danger" onClick={clearData}><Trash2 size={16} /> Usuń dane z urządzenia</button>
      </div>
      {status && <small role="status">{status}</small>}
    </section>
  );
}