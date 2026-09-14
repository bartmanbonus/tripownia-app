"use client";

import { useEffect } from "react";
import { ACTIVE_TRIP_KEY, readActiveTrip, upsertTripArchive } from "@/lib/tripArchive";

export default function TripArchiveSync() {
  useEffect(() => {
    const sync = () => {
      const active = readActiveTrip();
      if (active) upsertTripArchive(active);
    };

    sync();
    window.addEventListener("tripownia-my-trip-updated", sync as EventListener);
    window.addEventListener("storage", (event) => {
      if (event.key === ACTIVE_TRIP_KEY) sync();
    });

    return () => {
      window.removeEventListener("tripownia-my-trip-updated", sync as EventListener);
    };
  }, []);

  return null;
}
