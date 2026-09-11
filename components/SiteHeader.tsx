"use client";

import Link from "next/link";
import {
  Heart,
  Plane,
  Search,
  BedDouble,
  Car,
  Ticket,
  BookOpen,
  Lightbulb,
  CircleHelp,
  UserRound,
} from "lucide-react";
import { partners } from "@/lib/partners";

const primaryItems = [
  { href: "/podroze", label: "Okazje Tripowni", note: "Nasze propozycje", image: "/images/menu/okazje-tripowni.svg", tone: "picks", badge: "TOP" },
  { href: "/wydarzenia", label: "Mecze i eventy", note: "Twoje emocje", image: "/images/menu/mecze-i-eventy.svg", tone: "events" },
  { href: "/podroze-po-przezycia", label: "Przeżycia", note: "Nasze inspiracje", image: "/images/menu/przezycia.svg", tone: "experience" },
  { href: "/jarmarki-bozonarodzeniowe", label: "Jarmarki", note: "Magia świąt", image: "/images/menu/jarmarki.svg", tone: "markets", seasonal: true },
  { href: "/sylwester", label: "Sylwester", note: "Powitaj rok z nami", image: "/images/destinations/dubaj.jpg", tone: "newyear" },
  { href: "/dalekie-podroze", label: "Dalekie podróże", note: "Świat czeka", image: "/images/menu/dalekie-podroze.svg", tone: "longhaul" },
] as const;

const serviceItems = [
  { href: "https://www.booking.com/?aid=818288", label: "Hotele", icon: BedDouble, tone: "hotel", external: true },
  { href: "https://kiwi.tpk.lv/7PnrR4dn", label: "Loty", icon: Plane, tone: "flight", external: true },
  { href: "/wynajem-auta", label: "Wynajem aut", icon: Car, tone: "car" },
  { href: partners.getyourguide.buildUrl("https://www.getyourguide.pl/"), label: "Atrakcje", icon: Ticket, tone: "insurance", external: true },
  { href: "/poradniki", label: "Poradniki", icon: BookOpen, tone: "guides" },
  { href: "/inspiracje", label: "Inspiracje", icon: Lightbulb, tone: "ideas" },
] as const;

export default function SiteHeader() {
  const showMarkets = Date.now() <= new Date("2027-01-07T22:59:59Z").getTime();
  const visiblePrimaryItems = primaryItems.filter(
    (item) => !("seasonal" in item && item.seasonal) || showMarkets,
  );
  const siteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://tripownia.pl/#organization", name: "Tripownia.pl", url: "https://tripownia.pl/", logo: "https://tripownia.pl/tripownia-logo.webp" },
      { "@type": "WebSite", "@id": "https://tripownia.pl/#website", url: "https://tripownia.pl/", name: "Tripownia.pl", publisher: { "@id": "https://tripownia.pl/#organization" }, inLanguage: "pl-PL" },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema).replace(/</g, "\\u003c") }} />
    <header className="menu-v5">
      <div className="menu-v5-shell">
        <Link className="menu-v5-brand" href="/" aria-label="Tripownia.pl — strona główna">
          <img src="/tripownia-logo.webp" alt="Tripownia.pl" width="92" height="92" />
        </Link>

        <nav className="menu-v5-primary" aria-label="Najważniejsze sekcje" style={{ gridTemplateColumns: `repeat(${visiblePrimaryItems.length}, 145px) 120px` }}>
          {visiblePrimaryItems.map((item) => (
            <Link key={item.label} className={`menu-v5-card menu-v5-${item.tone}`} href={item.href}>
              <span
                className="menu-v5-icon"
                aria-hidden="true"
                style={{
                  overflow: "hidden",
                  padding: 0,
                  background: "#fff",
                  border: "1px solid rgba(27, 31, 35, 0.08)",
                  boxShadow: "0 3px 10px rgba(27, 31, 35, 0.10)",
                }}
              >
                <img
                  src={item.image}
                  alt=""
                  width="80"
                  height="80"
                  loading="eager"
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </span>
              <span className="menu-v5-copy">
                {"badge" in item && item.badge ? <span className="menu-v5-badge">{item.badge}</span> : null}
                <strong>{item.label}</strong>
                <small>{item.note}</small>
              </span>
            </Link>
          ))}

          <Link className="menu-v5-search" href="/#wyszukiwarka" aria-label="Szukaj wyjazdu">
            <Search size={25} strokeWidth={2.2} />
            <span>Szukaj</span>
          </Link>
        </nav>

        <nav className="menu-v5-secondary" aria-label="Usługi i pozostałe sekcje">
          <div className="menu-v5-services">
            {serviceItems.map((item) => {
              const Icon = item.icon;
              const className = `menu-v5-service menu-v5-service-${item.tone}`;
              if ("external" in item && item.external) {
                return <a key={item.label} className={className} href={item.href} target="_blank" rel="sponsored noopener noreferrer"><Icon size={20} strokeWidth={2.1}/><span>{item.label}</span></a>;
              }
              return <Link key={item.label} className={className} href={item.href}><Icon size={20} strokeWidth={2.1}/><span>{item.label}</span></Link>;
            })}
          </div>

          <div className="menu-v5-account">
            <a href="mailto:kontakt@tripownia.pl?subject=Pomoc%20Tripownia"><CircleHelp size={20}/><span>Pomoc</span></a>
            <Link href="/ulubione"><Heart size={20}/><span>Ulubione</span></Link>
            <Link href="/ulubione"><UserRound size={20}/><span>Moje konto</span></Link>
          </div>
        </nav>
      </div>
    </header>
  </>;
}
