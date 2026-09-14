"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let active = true;

    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((registration) => {
        if (!active) return;
        return registration.update().catch(() => undefined);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Baner instalacji aplikacji jest celowo wyłączony do czasu uruchomienia
  // oficjalnej aplikacji mobilnej Tripowni. Na stronie zostawiamy tylko
  // techniczne wsparcie PWA bez komunikowania użytkownikowi, że aplikacja
  // jest już dostępna.
  return null;
}
