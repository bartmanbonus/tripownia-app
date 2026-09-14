"use client";

import { useEffect } from "react";
import { ACTIVE_TRIP_KEY, readActiveTrip, upsertTripArchive } from "@/lib/tripArchive";

export default function TripArchiveSync() {
  useEffect(() => {
    const sync = () => {
      const active = readActiveTrip();
      if (active) upsertTripArchive(active);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ACTIVE_TRIP_KEY) sync();
    };

    sync();
    window.addEventListener("tripownia-my-trip-updated", sync as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("tripownia-my-trip-updated", sync as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return null;
}
