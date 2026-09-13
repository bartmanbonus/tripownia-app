"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
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
  Menu,
} from "lucide-react";
import { partners } from "@/lib/partners";

const primaryItems = [
  { href: "/okazje", label: "Okazje" },
  { href: "/wydarzenia", label: "Mecze i eventy" },
  { href: "/podroze-po-przezycia", label: "Przeżycia" },
  { href: "/jarmarki-bozonarodzeniowe", label: "Jarmarki", seasonal: true },
  { href: "/sylwester", label: "Sylwester" },
  { href: "/dalekie-podroze", label: "Dalekie podróże" },
] as const;

const planningItems = [
  { href: "/kierunki", label: "Kierunki", icon: Compass },
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

const OPEN_MENU_SELECTOR = "details.trip-mobile-menu[open], details.trip-header-menu[open]";

function closeOpenMenus(except?: HTMLDetailsElement | null) {
  document.querySelectorAll<HTMLDetailsElement>(OPEN_MENU_SELECTOR).forEach((details) => {
    if (details !== except) details.open = false;
  });
}

export default function SiteHeader() {
  const pathname = usePathname();
  const showMarkets = Date.now() <= new Date("2027-01-07T22:59:59Z").getTime();
  const visiblePrimaryItems = primaryItems.filter((item) => !("seasonal" in item && item.seasonal) || showMarkets);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const clickedMenu = target.closest<HTMLDetailsElement>("details.trip-mobile-menu, details.trip-header-menu");
      if (!clickedMenu) {
        closeOpenMenus();
        return;
      }

      // Only one header menu can stay open at a time.
      closeOpenMenus(clickedMenu);
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("details.trip-mobile-menu a, details.trip-header-menu a")) {
        closeOpenMenus();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeOpenMenus();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    closeOpenMenus();
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/okazje") return pathname === "/okazje" || pathname.startsWith("/oferta/");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

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
        <div className="trip-mobile-top">
          <Link className="trip-mobile-brand" href="/app" aria-label="Tripownia — start aplikacji">
            <img src="/tripownia-logo.webp" alt="Tripownia.pl" width="64" height="64" />
          </Link>
          <div className="trip-mobile-top-actions">
            <Link className="trip-mobile-account" href="/profil" aria-label="Konto">
              <UserRound size={19} strokeWidth={2.2} />
              <span>Konto</span>
            </Link>
            <details className="trip-mobile-menu">
              <summary aria-label="Otwórz menu">
                <Menu size={20} strokeWidth={2.2} />
                <span>Menu</span>
              </summary>
              <div className="trip-mobile-menu-panel">
                <div className="trip-mobile-menu-section">
                  <strong>Twoja Tripownia</strong>
                  <Link href="/app"><LayoutDashboard size={18} /><span>Start</span></Link>
                  <Link href="/moja-podroz"><MapPinned size={18} /><span>Moja podróż</span></Link>
                  <Link href="/ulubione"><Heart size={18} /><span>Ulubione</span></Link>
                  <Link href="/alerty"><Bell size={18} /><span>Alerty</span></Link>
                  <Link href="/dla-ciebie"><Sparkles size={18} /><span>Dla Ciebie</span></Link>
                  <Link href="/profil"><UserRound size={18} /><span>Profil i konto</span></Link>
                </div>
                <div className="trip-mobile-menu-section">
                  <strong>Planuj i rezerwuj</strong>
                  <Link href="/kierunki"><Compass size={18} /><span>Kierunki</span></Link>
                  <a href="https://kiwi.tpk.lv/7PnrR4dn" target="_blank" rel="sponsored noopener noreferrer"><Plane size={18} /><span>Loty</span></a>
                  <a href="https://www.booking.com/?aid=818288" target="_blank" rel="sponsored noopener noreferrer"><BedDouble size={18} /><span>Hotele</span></a>
                  <a href={partners.getyourguide.buildUrl("https://www.getyourguide.pl/")} target="_blank" rel="sponsored noopener noreferrer"><Ticket size={18} /><span>Atrakcje</span></a>
                  <Link href="/wynajem-auta"><Car size={18} /><span>Wynajem auta</span></Link>
                </div>
              </div>
            </details>
          </div>
        </div>

        <div className="trip-header-main">
          <Link className="trip-header-brand" href="/" aria-label="Tripownia.pl — strona główna">
            <img src="/tripownia-logo.webp" alt="Tripownia.pl" width="68" height="68" />
          </Link>

          <Link className="trip-header-search" href="/#wyszukiwarka" aria-label="Przejdź do wyszukiwarki wyjazdów">
            <Search size={20} strokeWidth={2.3} />
            <span className="trip-header-search-copy">
              <strong>Dokąd chcesz lecieć?</strong>
              <small>Loty, hotele, wakacje i gotowe okazje w jednym miejscu</small>
            </span>
            <span className="trip-header-search-cta" aria-hidden="true">
              <Search size={24} strokeWidth={2.8} />
            </span>
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
            {visiblePrimaryItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  className={`trip-header-nav-link${active ? " is-active" : ""}`}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
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
