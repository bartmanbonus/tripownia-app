"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Car, ClipboardCheck, MapPinned, Route, Sparkles } from "lucide-react";

const actions = [
  { href: "/dodaj-podroz", icon: Route, title: "Dodaj podróż", text: "Masz już lot lub hotel? Zacznij własny plan." },
  { href: "/moja-podroz", icon: MapPinned, title: "Mój planner", text: "Rezerwacje, checklista i plan dzień po dniu." },
  { href: "/przed-wyjazdem", icon: ClipboardCheck, title: "Przed wyjazdem", text: "Dokumenty, bagaż, odprawa i ostatnie przygotowania." },
  { href: "/transfery", icon: Car, title: "Transfer", text: "Ogarnij dojazd z lotniska zanim wylądujesz." },
  { href: "/atrakcje", icon: Sparkles, title: "Atrakcje", text: "Zapisz to, co naprawdę chcesz zrobić na miejscu." },
];

export default function HomeTripHubPortal() {
  const pathname = usePathname();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const visible = pathname === "/" || pathname === "/app";

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
      <div className="already-booked-copy">
        <div className="kicker">MASZ JUŻ WYJAZD?</div>
        <h2 id="already-booked-title">Nie musisz niczego kupować w Tripowni, żeby z niej korzystać.</h2>
        <p>Dodaj swój lot, hotel i termin, a Tripownia pomoże Ci ogarnąć wszystko od przygotowania do planu na miejscu.</p>
        <Link href="/dodaj-podroz" className="already-booked-primary">Ułóż mój plan za darmo <ArrowRight size={17}/></Link>
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
