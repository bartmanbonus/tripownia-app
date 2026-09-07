"use client";

import Link from "next/link";
import {
  Tag,
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


function SoccerBallIcon({ size = 23 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.9" />
      <path d="M9.2 8.2 12 6.6l2.8 1.6-.7 3.2H9.9l-.7-3.2Z" fill="currentColor" />
      <path d="m9.9 11.4-3 2.1 1.1 3.3 3.3.1M14.1 11.4l3 2.1-1.1 3.3-3.3.1M12 6.6l-.2-3M6.9 13.5 4.2 12M17.1 13.5l2.7-1.5M8 16.8 6.8 19M16 16.8l1.2 2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PalmIcon({ size = 23 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12.1 10.4c-.4 3.8-.1 7.2 1 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 10.5c-1.8-3.8-5.6-4.2-8-2.1 2.5.1 4.2 1 5.2 2.5M12 10.5c1.3-4.1 5.1-5.5 8-4.2-2.2.7-3.8 1.9-4.6 3.7M12 10.5c-.4-4-3.1-6.4-6-6.4 1.7 1.4 2.8 3.1 3.1 5.2M12 10.5c.9-3.8.1-6.5-1.7-8.5 2.8.5 4.5 2.9 4.4 6.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 21h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const primaryItems = [
  { href: "/okazje", label: "Okazje", note: "Nasze najlepsze ceny", icon: Tag, tone: "deals" },
  { href: "/wydarzenia", label: "Mecze i eventy", note: "Twoje emocje", icon: SoccerBallIcon, tone: "events" },
  { href: "/podroze-po-przezycia", label: "Przeżycia", note: "Nasze inspiracje", icon: Heart, tone: "experience" },
  { href: "/podroze", label: "Atrakcje Tripowni", note: "Nasze propozycje", icon: Star, tone: "picks", badge: "TOP" },
  { href: "/jarmarki-bozonarodzeniowe", label: "Jarmarki", note: "Magia świąt", icon: TreePine, tone: "markets", seasonal: true },
  { href: "/sylwester", label: "Sylwester", note: "Powitaj rok z nami", icon: PartyPopper, tone: "newyear" },
  { href: "/dalekie-podroze", label: "Dalekie podróże", note: "Świat czeka", icon: PalmIcon, tone: "longhaul" },
] as const;

const serviceItems = [
  { href: "https://www.booking.com/?aid=818288", label: "Hotele", icon: BedDouble, tone: "hotel", external: true },
  { href: "https://kiwi.tpk.lv/7PnrR4dn", label: "Loty", icon: Plane, tone: "flight", external: true },
  { href: "/wynajem-auta", label: "Wynajem aut", icon: Car, tone: "car" },
  { href: "/ubezpieczenia", label: "Ubezpieczenia", icon: ShieldCheck, tone: "insurance" },
  { href: "/poradniki", label: "Poradniki", icon: BookOpen, tone: "guides" },
  { href: "/inspiracje", label: "Inspiracje", icon: Lightbulb, tone: "ideas" },
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
              const className = `menu-v5-service menu-v5-service-${item.tone}`;
              if ("external" in item && item.external) {
                return <a key={item.label} className={className} href={item.href} target="_blank" rel="sponsored noopener noreferrer"><Icon size={20} strokeWidth={2.1}/><span>{item.label}</span></a>;
              }
              return <Link key={item.label} className={className} href={item.href}><Icon size={20} strokeWidth={2.1}/><span>{item.label}</span></Link>;
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
