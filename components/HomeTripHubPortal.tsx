"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Car, ClipboardCheck, MapPinned, Route, Sparkles, Plane } from "lucide-react";
import { readActiveTrip } from "@/lib/tripArchive";
import { offers } from "@/lib/offers";

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
  const [activeTripLabel, setActiveTripLabel] = useState<{ title: string; meta: string } | null>(null);
  const visible = pathname === "/" || pathname === "/app";

  useEffect(() => {
    const refreshTrip = () => {
      const trip = readActiveTrip();
      if (!trip) {
        setActiveTripLabel(null);
        return;
      }

      const snapshot = trip.offerSnapshot as { city?: string; country?: string; dates?: string } | undefined;
      const staticOffer = typeof trip.offerId === "number" ? offers.find((offer) => offer.id === trip.offerId) : undefined;
      const city = snapshot?.city || staticOffer?.city || "";
      const country = snapshot?.country || staticOffer?.country || "";
      const dates = snapshot?.dates || staticOffer?.dates || "";
      const title = city ? `${city}${country ? `, ${country}` : ""}` : "Wróć do swojej podróży";
      const meta = dates || "Plan, przygotowania i rezerwacje są już zapisane.";
      setActiveTripLabel({ title, meta });
    };
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
      {activeTripLabel && (
        <Link href="/moja-podroz" className="already-booked-active-trip">
          <span className="already-booked-action-icon"><Plane size={20}/></span>
          <span><small>AKTYWNA PODRÓŻ</small><strong>{activeTripLabel.title}</strong><em>{activeTripLabel.meta}</em></span>
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
