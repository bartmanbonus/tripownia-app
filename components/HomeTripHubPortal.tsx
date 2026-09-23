"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Car, ClipboardCheck, MapPinned, Route, Sparkles } from "lucide-react";

const actions = [
  { href: "/transfery", icon: Car, title: "Transfer", text: "Dojazd z lotniska bez szukania po lądowaniu." },
  { href: "/atrakcje", icon: Sparkles, title: "Atrakcje", text: "Bilety i rzeczy, które warto rezerwować wcześniej." },
  { href: "/esim", icon: Route, title: "eSIM", text: "Internet gotowy od pierwszej chwili na miejscu." },
  { href: "/parkingi", icon: MapPinned, title: "Parking", text: "Parking przy lotnisku dopasowany do wylotu." },
  { href: "/przed-wyjazdem", icon: ClipboardCheck, title: "Checklista", text: "Dokumenty, bagaż i przygotowanie przed wyjazdem." },
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
        <div className="kicker">TU ZACZYNA SIĘ PRZEWAGA TRIPOWNI</div>
        <h2 id="already-booked-title">Kupiłaś wyjazd? Tripownia dopiero się zaczyna.</h2>
        <p>Dodaj lot i hotel — nawet kupione gdzie indziej. Dostaniesz jeden plan z dokumentami, checklistą i brakującymi elementami podróży.</p>
        <Link href="/dodaj-podroz" className="already-booked-primary">Dodaj mój wyjazd za darmo <ArrowRight size={17}/></Link>
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
