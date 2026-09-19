"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Car, ClipboardCheck, MapPinned, Route, Sparkles, Plane } from "lucide-react";
import { readActiveTrip } from "@/lib/tripArchive";

const actions = [
  { href: "/dodaj-podroz", icon: Route, title: "Dodaj podróż", text: "Masz już lot lub hotel? Zacznij własny plan." },
  { href: "/organizer", icon: MapPinned, title: "Organizer", text: "Rezerwacje, pakowanie i plan dzień po dniu." },
  { href: "/przed-wyjazdem", icon: ClipboardCheck, title: "Przed wyjazdem", text: "Dokumenty, bagaż, odprawa i ostatnie przygotowania." },
  { href: "/transfery", icon: Car, title: "Transfer", text: "Ogarnij dojazd z lotniska zanim wylądujesz." },
  { href: "/atrakcje", icon: Sparkles, title: "Atrakcje", text: "Zapisz to, co naprawdę chcesz zrobić na miejscu." },
];

export default function HomeTripHubPortal() {
  const pathname = usePathname();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);
  const visible = pathname === "/" || pathname === "/app";

  useEffect(() => {
    const refreshTrip = () => setHasActiveTrip(Boolean(readActiveTrip()));
    refreshTrip();
    window.addEventListener("tripownia-my-trip-updated", refreshTrip as EventListener);
    window.addEventListener("storage", refreshTrip as EventListener);
    return () => {
      window.removeEventListener("tripownia-my-trip-updated", refreshTrip as EventListener);
      window.removeEventListener("storage", refreshTrip as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      setHost(null);
      return;
    }

    const target = document.querySelector<HTMLElement>("#wyszukiwarka");
    if (!target) return;

    const mount = document.createElement("div");
    mount.className = "home-trip-hub-mount";
    target.insertAdjacentElement("afterend", mount);
    setHost(mount);

    return () => {
      mount.remove();
      setHost(null);
    };
  }, [pathname, visible]);

  if (!visible || !host) return null;

  return createPortal(
    <section className="shell already-booked-hub" aria-labelledby="already-booked-title">
      {hasActiveTrip && (
        <Link href="/moja-podroz" className="already-booked-active-trip">
          <span className="already-booked-action-icon"><Plane size={20}/></span>
          <span><small>MASZ AKTYWNĄ PODRÓŻ</small><strong>Wróć do swojej podróży</strong><em>Plan, rezerwacje, przygotowania i rzeczy do zrobienia są już zapisane.</em></span>
          <ArrowRight size={18}/>
        </Link>
      )}
      <div className="already-booked-copy">
        <div className="kicker">MASZ JUŻ WYJAZD?</div>
        <h2 id="already-booked-title">Nie musisz niczego kupować w Tripowni, żeby z niej korzystać.</h2>
        <p>Dodaj swój lot, hotel i termin, a Tripownia pomoże Ci ogarnąć wszystko od przygotowania do planu na miejscu.</p>
        <Link href="/dodaj-podroz" className="already-booked-primary">Dodaj własną podróż <ArrowRight size={17}/></Link>
      </div>

      <div className="already-booked-actions">
        {actions.map(({ href, icon: Icon, title, text }) => (
          <Link href={href} key={href}>
            <span className="already-booked-action-icon"><Icon size={20}/></span>
            <span><strong>{title}</strong><small>{text}</small></span>
            <ArrowRight size={16} className="already-booked-arrow"/>
          </Link>
        ))}
      </div>
    </section>,
    host,
  );
}
