"use client";

import { useEffect, useState } from "react";
import MyTrip, { type TripState } from "@/components/MyTrip";

function readStoredTrip(): TripState | undefined {
  try {
    const parsed = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null") as TripState | null;
    return parsed || undefined;
  } catch {
    return undefined;
  }
}

export default function MyTripResolver() {
  const [ready, setReady] = useState(false);
  const [trip, setTrip] = useState<TripState | undefined>(undefined);

  useEffect(() => {
    const load = () => {
      setTrip(readStoredTrip());
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
  return <MyTrip initialTrip={trip} />;
}
