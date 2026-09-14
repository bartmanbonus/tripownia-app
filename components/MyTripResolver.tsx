"use client";

import { useEffect, useState } from "react";
import MyTrip from "@/components/MyTrip";
import { offers, type Offer } from "@/lib/offers";

type StoredTrip = {
  offerId?: number;
  offerSnapshot?: Offer;
};

function hydrateStoredOffer() {
  try {
    const saved = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null") as StoredTrip | null;
    const snapshot = saved?.offerSnapshot;
    if (!snapshot?.id || !snapshot.city || !snapshot.country) return "static";

    const index = offers.findIndex((offer) => offer.id === snapshot.id);
    if (index >= 0) offers[index] = { ...offers[index], ...snapshot };
    else offers.push(snapshot);

    return `live-${snapshot.id}-${snapshot.priceCheckedAt || snapshot.price || "saved"}`;
  } catch {
    return "static";
  }
}

export default function MyTripResolver() {
  const [ready, setReady] = useState(false);
  const [tripKey, setTripKey] = useState("static");

  useEffect(() => {
    const load = () => {
      setTripKey(hydrateStoredOffer());
      setReady(true);
    };

    load();
    window.addEventListener("tripownia-my-trip-updated", load as EventListener);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("tripownia-my-trip-updated", load as EventListener);
      window.removeEventListener("storage", load);
    };
  }, []);

  if (!ready) return null;
  return <MyTrip key={tripKey} />;
}
