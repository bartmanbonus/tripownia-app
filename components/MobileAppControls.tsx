"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, Compass, Home, MapPinned, RefreshCw, Search, UserRound } from "lucide-react";

const SERVICE_PATHS = [
  "/wynajem-auta",
  "/transfery",
  "/atrakcje",
  "/parkingi",
  "/esim",
];

const APP_PATHS = [
  "/app",
  "/dla-ciebie",
  "/gdzie-leciec",
  "/okazje",
  "/oferta",
  "/moja-podroz",
  "/moje-podroze",
  "/dodaj-podroz",
  "/organizer",
  "/porownaj",
  "/ulubione",
  "/alerty",
  "/profil",
  ...SERVICE_PATHS,
];

function isAppPath(pathname: string) {
  return APP_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isPlanningPath(pathname: string) {
  return pathname.startsWith("/gdzie-leciec")
    || pathname.startsWith("/okazje")
    || pathname.startsWith("/oferta")
    || SERVICE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function MobileAppControls() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const visible = isAppPath(pathname);

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => setShowTop(window.scrollY > 520);
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
        await Promise.all(keys.filter((key) => key.startsWith("tripownia-")).map((key) => caches.delete(key)));
      }

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.update().catch(() => undefined)));
      }
    } catch {
      // Cache cleanup is best-effort. Navigation below still forces a fresh page URL.
    }

    const url = new URL(window.location.href);
    url.searchParams.set("app_refresh", Date.now().toString());
    window.location.replace(url.toString());
  }

  if (!visible) return null;

  const nav = [
    { href: "/app", label: "Start", icon: Home, active: pathname === "/app" },
    { href: "/moja-podroz", label: "Planner", icon: MapPinned, active: pathname.startsWith("/moja-podroz") || pathname.startsWith("/moje-podroze") || pathname.startsWith("/dodaj-podroz") || pathname.startsWith("/organizer") },
    { href: "/app#wyszukiwarka", label: "Szukaj", icon: Search, active: isPlanningPath(pathname) },
    { href: "/dla-ciebie", label: "Dla Ciebie", icon: Compass, active: pathname.startsWith("/dla-ciebie") },
    { href: "/profil", label: "Ja", icon: UserRound, active: pathname.startsWith("/profil") || pathname.startsWith("/konto") || pathname.startsWith("/ulubione") || pathname.startsWith("/porownaj") || pathname.startsWith("/alerty") },
  ];

  return (
    <>
      <div className="mobile-app-quick-actions" aria-label="Szybkie akcje aplikacji">
        {showTop && (
          <button
            type="button"
            className="mobile-app-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Przewiń do góry"
            title="Do góry"
          >
            <ArrowUp size={18} strokeWidth={2.3} />
          </button>
        )}
        <button
          type="button"
          className="mobile-app-refresh"
          onClick={hardRefresh}
          aria-label="Pobierz najnowsze dane aplikacji"
          title="Odśwież"
          disabled={refreshing}
        >
          <RefreshCw className={refreshing ? "is-spinning" : undefined} size={18} strokeWidth={2.2} />
        </button>
      </div>

      <nav className="mobile-app-controls" aria-label="Nawigacja aplikacji Tripownia">
        {nav.map(({ href, label, icon: Icon, active }) => (
          <Link key={label} href={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
            <Icon size={20} strokeWidth={active ? 2.5 : 2.1} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
