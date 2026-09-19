"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineStatusBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) return null;

  return (
    <div className="trip-offline-banner" role="status">
      <WifiOff size={16}/>
      <span><strong>Jesteś offline.</strong> Zapisany plan i dane podróży nadal są dostępne. Pogoda, ceny i linki partnerów odświeżą się po powrocie internetu.</span>
    </div>
  );
}
