"use client";

import Link from "next/link";
import {
  Tag,
  Trophy,
  Heart,
  Star,
  TreePine,
  PartyPopper,
  Plane,
  Search,
  BedDouble,
  Car,
  ShieldCheck,
  BookOpen,
  Lightbulb,
  CircleHelp,
  UserRound,
} from "lucide-react";

const primaryItems = [
  { href: "/okazje", label: "Okazje", note: "Nasze najlepsze ceny", icon: Tag, tone: "deals" },
  { href: "/wydarzenia", label: "Mecze i eventy", note: "Twoje emocje", icon: Trophy, tone: "events" },
  { href: "/podroze-po-przezycia", label: "Przeżycia", note: "Nasze inspiracje", icon: Heart, tone: "experience" },
  { href: "/podroze", label: "Atrakcje Tripowni", note: "Nasze propozycje", icon: Star, tone: "picks", badge: "TOP" },
  { href: "/jarmarki-bozonarodzeniowe", label: "Jarmarki", note: "Magia świąt", icon: TreePine, tone: "markets", seasonal: true },
  { href: "/sylwester", label: "Sylwester", note: "Powitaj rok z nami", icon: PartyPopper, tone: "newyear" },
  { href: "/dalekie-podroze", label: "Dalekie podróże", note: "Świat czeka", icon: Plane, tone: "longhaul" },
] as const;

const serviceItems = [
  { href: "/#wyszukiwarka", label: "Hotele", icon: BedDouble, tone: "hotel" },
  { href: "/#wyszukiwarka", label: "Loty", icon: Plane, tone: "flight" },
  { href: "/podroze", label: "Wynajem aut", icon: Car, tone: "car" },
  { href: "/podroze", label: "Ubezpieczenia", icon: ShieldCheck, tone: "insurance" },
  { href: "/magazyn-podrozniczy", label: "Poradniki", icon: BookOpen, tone: "guides" },
  { href: "/podroze", label: "Inspiracje", icon: Lightbulb, tone: "ideas" },
] as const;

export default function SiteHeader() {
  const showMarkets = Date.now() <= new Date("2027-01-07T22:59:59Z").getTime();
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

        <nav className="menu-v5-primary" aria-label="Najważniejsze sekcje">
          {primaryItems.map((item) => {
            if ("seasonal" in item && item.seasonal && !showMarkets) return null;
            const Icon = item.icon;
            return (
              <Link key={item.label} className={`menu-v5-card menu-v5-${item.tone}`} href={item.href}>
                <span className="menu-v5-icon" aria-hidden="true"><Icon size={23} strokeWidth={2.2} /></span>
                <span className="menu-v5-copy">
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
                </span>
                {"badge" in item && item.badge ? <span className="menu-v5-badge">{item.badge}</span> : null}
              </Link>
            );
          })}

          <Link className="menu-v5-search" href="/#wyszukiwarka" aria-label="Szukaj wyjazdu">
            <Search size={25} strokeWidth={2.2} />
            <span>Szukaj</span>
          </Link>
        </nav>

        <nav className="menu-v5-secondary" aria-label="Usługi i pozostałe sekcje">
          <div className="menu-v5-services">
            {serviceItems.map((item) => {
              const Icon = item.icon;
              return <Link key={item.label} className={`menu-v5-service menu-v5-service-${item.tone}`} href={item.href}><Icon size={20} strokeWidth={2.1}/><span>{item.label}</span></Link>;
            })}
          </div>

          <div className="menu-v5-account">
            <Link href="/podroze"><CircleHelp size={20}/><span>Pomoc</span></Link>
            <Link href="/ulubione"><Heart size={20}/><span>Ulubione</span></Link>
            <Link href="/ulubione"><UserRound size={20}/><span>Moje konto</span></Link>
          </div>
        </nav>
      </div>
    </header>
  </>;
}
