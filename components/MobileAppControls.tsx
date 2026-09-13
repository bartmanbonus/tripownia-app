"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, RefreshCw } from "lucide-react";

export default function MobileAppControls() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const visible = pathname === "/app" || pathname.startsWith("/moja-podroz");

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => setShowTop(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [visible]);

  async function hardRefresh() {
    if (refreshing) return;
    setRefreshing(true);

    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((key) => key.startsWith("tripownia-"))
            .map((key) => caches.delete(key))
        );
      }

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.update().catch(() => undefined)));
      }
    } catch {
      // Cache cleanup is best-effort. The cache-busting navigation below still forces a fresh page URL.
    }

    const url = new URL(window.location.href);
    url.searchParams.set("app_refresh", Date.now().toString());
    window.location.replace(url.toString());
  }

  if (!visible) return null;

  return (
    <div className="mobile-app-controls" aria-label="Szybkie akcje aplikacji">
      <button
        type="button"
        onClick={hardRefresh}
        aria-label="Pobierz najnowszą wersję aplikacji"
        title="Odśwież"
        disabled={refreshing}
      >
        <RefreshCw className={refreshing ? "is-spinning" : undefined} size={18} strokeWidth={2.2} />
        <span>{refreshing ? "Odświeżam…" : "Odśwież"}</span>
      </button>
      {showTop && (
        <button
          type="button"
          className="mobile-app-controls-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Przewiń do góry"
          title="Do góry"
        >
          <ArrowUp size={19} strokeWidth={2.3} />
          <span>Góra</span>
        </button>
      )}
    </div>
  );
}
