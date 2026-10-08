"use client";

import { useEffect, useRef } from "react";
import { ANALYTICS_CONSENT_EVENT, getAnalyticsConsent, trackEvent } from "@/lib/analytics";

export default function OfferJourney({ offerId, destination, partner, price, source = "offer_detail" }: {
  offerId: string; destination: string; partner: string; price?: number; source?: string;
}) {
  const sent = useRef("");
  useEffect(() => {
    const key = `${offerId}|${destination}|${source}`;
    const record = () => {
      if (sent.current === key || !["analytics", "marketing"].includes(getAnalyticsConsent() || "")) return;
      trackEvent("offer_detail_view", { offer_id: offerId, destination, partner, price, source, currency: "PLN" });
      sent.current = key;
    };
    record();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, record);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, record);
  }, [offerId, destination, partner, price, source]);
  return <nav className="offer-journey" aria-label="Etapy rezerwacji">
    <span>1. Wybór oferty</span><strong aria-current="step">2. Szczegóły w Tripowni</strong><span>3. Rezerwacja u partnera</span>
  </nav>;
}
