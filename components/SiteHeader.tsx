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
  Bell,
  UserRound,
  Sparkles,
  Compass,
  MapPinned,
  LayoutDashboard,
  ChevronDown,
  Globe2,
} from "lucide-react";
import { partners } from "@/lib/partners";

const primaryItems = [
  { href: "/podroze", label: "Okazje" },
  { href: "/wydarzenia", label: "Mecze i eventy" },
  { href: "/podroze-po-przezycia", label: "Przeżycia" },
  { href: "/jarmarki-bozonarodzeniowe", label: "Jarmarki", seasonal: true },
  { href: "/sylwester", label: "Sylwester" },
  { href: "/dalekie-podroze", label: "Dalekie podróże" },
] as const;

const planningItems = [
  { href: "https://www.booking.com/?aid=818288", label: "Hotele", icon: BedDouble, external: true },
  { href: "https://kiwi.tpk.lv/7PnrR4dn", label: "Loty", icon: Plane, external: true },
  { href: "/wynajem-auta", label: "Wynajem auta", icon: Car },
  { href: partners.getyourguide.buildUrl("https://www.getyourguide.pl/"), label: "Atrakcje", icon: Ticket, external: true },
  { href: "/poradniki", label: "Poradniki", icon: BookOpen },
  { href: "/inspiracje", label: "Inspiracje", icon: Lightbulb },
] as const;

const myTripowniaItems = [
  { href: "/app", label: "Panel główny", icon: LayoutDashboard },
  { href: "/gdzie-leciec", label: "Gdzie lecieć?", icon: Compass },
  { href: "/dla-ciebie", label: "Dla Ciebie", icon: Sparkles },
  { href: "/moja-podroz", label: "Moja podróż", icon: MapPinned },
] as const;

export default function SiteHeader() {
  const showMarkets = Date.now() <= new Date("2027-01-07T22:59:59Z").getTime();
  const visiblePrimaryItems = primaryItems.filter((item) => !("seasonal" in item && item.seasonal) || showMarkets);

  const siteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://tripownia.pl/#organization", name: "Tripownia.pl", url: "https://tripownia.pl/", logo: "https://tripownia.pl/tripownia-logo.webp" },
      { "@type": "WebSite", "@id": "https://tripownia.pl/#website", url: "https://tripownia.pl/", name: "Tripownia.pl", publisher: { "@id": "https://tripownia.pl/#organization" }, inLanguage: "pl-PL" },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema).replace(/</g, "\\u003c") }} />

    <header className="trip-header">
      <div className="trip-header-shell">
        <div className="trip-header-main">
          <Link className="trip-header-brand" href="/" aria-label="Tripownia.pl — strona główna">
            <img src="/tripownia-logo.webp" alt="Tripownia.pl" width="68" height="68" />
          </Link>

          <Link className="trip-header-search" href="/#wyszukiwarka" aria-label="Przejdź do wyszukiwarki wyjazdów">
            <Search size={20} strokeWidth={2.1} />
            <span className="trip-header-search-copy">
              <strong>Dokąd chcesz lecieć?</strong>
              <small>Loty, hotele, wakacje i gotowe okazje w jednym miejscu</small>
            </span>
            <span className="trip-header-search-cta">Szukaj</span>
          </Link>

          <nav className="trip-header-actions" aria-label="Twoje konto">
            <Link className="trip-header-action" href="/ulubione" aria-label="Ulubione">
              <Heart size={19} strokeWidth={2} />
              <span>Ulubione</span>
            </Link>
            <Link className="trip-header-action" href="/alerty" aria-label="Alerty">
              <Bell size={19} strokeWidth={2} />
              <span>Alerty</span>
            </Link>
            <Link className="trip-header-action" href="/profil" aria-label="Profil">
              <UserRound size={19} strokeWidth={2} />
              <span>Profil</span>
            </Link>
          </nav>
        </div>

        <div className="trip-header-nav-wrap">
          <nav className="trip-header-nav" aria-label="Główne kategorie podróży">
            {visiblePrimaryItems.map((item, index) => (
              <Link key={item.href} className={`trip-header-nav-link${index === 0 ? " is-active" : ""}`} href={item.href}>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="trip-header-tools">
            <details className="trip-header-menu">
              <summary>
                <Globe2 size={16} strokeWidth={2} />
                <span>Planuj</span>
                <ChevronDown size={13} strokeWidth={2.2} />
              </summary>
              <div className="trip-header-popover">
                {planningItems.map((item) => {
                  const Icon = item.icon;
                  if ("external" in item && item.external) {
                    return <a key={item.label} href={item.href} target="_blank" rel="sponsored noopener noreferrer"><Icon size={18} strokeWidth={2}/><span>{item.label}</span></a>;
                  }
                  return <Link key={item.label} href={item.href}><Icon size={18} strokeWidth={2}/><span>{item.label}</span></Link>;
                })}
              </div>
            </details>

            <details className="trip-header-menu">
              <summary>
                <Sparkles size={16} strokeWidth={2} />
                <span>Moja Tripownia</span>
                <ChevronDown size={13} strokeWidth={2.2} />
              </summary>
              <div className="trip-header-popover">
                {myTripowniaItems.map((item) => {
                  const Icon = item.icon;
                  return <Link key={item.label} href={item.href}><Icon size={18} strokeWidth={2}/><span>{item.label}</span></Link>;
                })}
              </div>
            </details>

            <a className="trip-header-help" href="mailto:kontakt@tripownia.pl?subject=Pomoc%20Tripownia">
              <CircleHelp size={16} strokeWidth={2} />
              <span>Pomoc</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  </>;
}
