"use client";

import { useEffect, useState } from "react";
import MyTrip from "@/components/MyTrip";
import type { Offer } from "@/lib/offers";

type StoredTrip = {
  tripId?: string;
  offerId?: number;
  offerSnapshot?: Offer & { manual?: boolean };
};

function storedTripKey() {
  try {
    const saved = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null") as StoredTrip | null;
    const snapshot = saved?.offerSnapshot;
    if (!saved) return "empty";
    const tripId = saved.tripId || "legacy";
    if (snapshot?.id) return `${tripId}-snapshot-${snapshot.id}-${snapshot.priceCheckedAt || snapshot.price || "saved"}`;
    return `${tripId}-offer-${saved.offerId || "unknown"}`;
  } catch {
    return "empty";
  }
}

export default function MyTripResolver() {
  const [ready, setReady] = useState(false);
  const [tripKey, setTripKey] = useState("empty");

  useEffect(() => {
    const load = () => {
      setTripKey(storedTripKey());
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
