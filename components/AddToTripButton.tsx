"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MapPinned } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { trackEvent } from "@/lib/analytics";
import { readActiveTrip, setActiveOfferTrip } from "@/lib/tripArchive";
import styles from "./AddToTripButton.module.css";

export default function AddToTripButton({ offer }: { offer: Offer }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const load = () => setAdded(readActiveTrip()?.offerId === offer.id);
    load();
    window.addEventListener("tripownia-my-trip-updated", load as EventListener);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("tripownia-my-trip-updated", load as EventListener);
      window.removeEventListener("storage", load);
    };
  }, [offer.id]);

  function add() {
    const trip = setActiveOfferTrip(offer);
    if (!trip) return;
    setAdded(true);
    trackEvent("trip_add", {
      offer_id: offer.id,
      destination: offer.city,
      country: offer.country,
      partner: offer.partner,
      price: offer.price,
      trip_id: trip.tripId,
      placement: "offer_detail",
    });
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${added ? styles.added : ""}`}
      onClick={add}
      aria-pressed={added}
    >
      {added ? <CheckCircle2 size={18}/> : <MapPinned size={18}/>}
      {added ? "Ta oferta jest w Mojej podróży" : "Dodaj do Mojej podróży"}
    </button>
  );
}
