"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Baner instalacji aplikacji jest celowo wyłączony do czasu uruchomienia
  // oficjalnej aplikacji mobilnej Tripowni. Na stronie zostawiamy tylko
  // techniczne wsparcie PWA bez komunikowania użytkownikowi, że aplikacja
  // jest już dostępna.
  return null;
}
