"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Compass, Home, MapPinned, Search, UserRound } from "lucide-react";

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
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const nextY = window.scrollY;
      const delta = nextY - lastY;
      if (Math.abs(delta) < 8) return;
      setHidden(delta > 0 && nextY > 120);
      lastY = nextY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
  if (!isAppPath(pathname) || pathname.startsWith("/dodaj-podroz")) return null;

  const nav = [
    { href: "/app", label: "Start", icon: Home, active: pathname === "/app" },
    { href: "/moja-podroz", label: "Planner", icon: MapPinned, active: pathname.startsWith("/moja-podroz") || pathname.startsWith("/moje-podroze") || pathname.startsWith("/dodaj-podroz") || pathname.startsWith("/organizer") },
    { href: "/app#wyszukiwarka", label: "Szukaj", icon: Search, active: isPlanningPath(pathname) },
    { href: "/dla-ciebie", label: "Dla Ciebie", icon: Compass, active: pathname.startsWith("/dla-ciebie") },
    { href: "/profil", label: "Ja", icon: UserRound, active: pathname.startsWith("/profil") || pathname.startsWith("/konto") || pathname.startsWith("/ulubione") || pathname.startsWith("/porownaj") || pathname.startsWith("/alerty") },
  ];

  return (
    <nav className={`mobile-app-controls${hidden ? " is-hidden" : ""}`} aria-label="Nawigacja aplikacji Tripownia">
      {nav.map(({ href, label, icon: Icon, active }) => (
        <Link key={label} href={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
          <Icon size={20} strokeWidth={active ? 2.5 : 2.1} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
