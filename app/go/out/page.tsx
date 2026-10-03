"use client";

import { useEffect, useState } from "react";

const ALLOWED_HOSTS = new Set([
  "reklamy.exim.pl",
  "www.exim.pl",
  "www2.esky.pl",
  "www.esky.pl",
  "exim.pl",
  "clk.tradedoubler.com",
  "www.tui.pl",
  "tui.pl",
  "www.wakacje.pl",
  "wakacje.pl",
  "c111.travelpayouts.com",
  "kiwi.tpk.lv",
  "www.kiwi.com",
  "kiwi.com",
  "www.booking.com",
  "booking.com",
  "www.getyourguide.pl",
  "getyourguide.pl",
  "www.getyourguide.com",
  "getyourguide.com",
  "ad.seeplaces.com",
  "seeplaces.com",
  "www.seeplaces.com",
  "visit.holidaypark.pl",
  "www.holidaypark.pl",
  "holidaypark.pl",
  "fonia.app",
  "www.fonia.app",
  "www.parklot.pl",
  "parklot.pl",
  "getrentacar.tpk.lv",
  "kiwitaxi.tpk.lv",
  "gettransfer.tpk.lv",
]);

function safeExternalTarget(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname.toLowerCase())
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function safeReturnPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : "/";
  } catch {
    return "/";
  }
}

export default function PartnerExitPage() {
  const [target, setTarget] = useState("");
  const [returnPath, setReturnPath] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextTarget = safeExternalTarget(params.get("target") || "");
    const nextReturnPath = safeReturnPath(params.get("return") || "/");
    setTarget(nextTarget);
    setReturnPath(nextReturnPath);

    if (!nextTarget) {
      window.location.replace(nextReturnPath || "/");
      return;
    }

    // replace() is intentional: the technical Tripownia exit page must not
    // remain in browser history. Pressing Back at the partner returns to
    // the actual Tripownia page the user came from.
    window.location.replace(nextTarget);
  }, []);

  return (
    <main className="system-state-page" aria-live="polite">
      <div className="system-loading-mark" aria-hidden="true">✈</div>
      <div>
        <div className="kicker">TRIPOWNIA</div>
        <strong className="system-loading-title">Przenosimy do partnera.</strong>
        <p>Po użyciu „wstecz” wrócisz do poprzedniej strony Tripowni.</p>
        {target && <a href={target} rel="sponsored">Przejdź do oferty</a>}
        <a href={returnPath}>Wróć do Tripowni</a>
      </div>
    </main>
  );
}
