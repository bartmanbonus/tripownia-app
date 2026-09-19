"use client";

import Image from "next/image";
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
  Palmtree,
  Building2,
  Zap,
} from "lucide-react";

const primaryItems = [
  { href: "/okazje", label: "Okazje" },
  { href: "/wakacje", label: "Wakacje" },
  { href: "/city-break", label: "City break" },
  { href: "/last-minute", label: "Last minute" },
  { href: "/kierunki", label: "Kierunki" },
  { href: "/poradniki", label: "Poradniki" },
] as const;

const planningItems = [
  { href: "/wydarzenia", label: "Mecze i eventy", icon: Ticket },
  { href: "/podroze-po-przezycia", label: "Podróże po przeżycia", icon: Sparkles },
  { href: "/dalekie-podroze", label: "Dalekie podróże", icon: Palmtree },
  { href: "/sylwester", label: "Sylwester", icon: Zap },
  { href: "/inspiracje", label: "Inspiracje", icon: Lightbulb },
  { href: "/hotele", label: "Hotele", icon: BedDouble },
  { href: "/loty", label: "Loty", icon: Plane },
  { href: "/wynajem-auta", label: "Wynajem auta", icon: Car },
  { href: "/atrakcje", label: "Atrakcje", icon: Building2 },
] as const;

const myTripowniaItems = [
  { href: "/app", label: "Panel główny", icon: LayoutDashboard },
  { href: "/gdzie-leciec", label: "Gdzie lecieć?", icon: Compass },
  { href: "/dla-ciebie", label: "Dla Ciebie", icon: Sparkles },
  { href: "/moja-podroz", label: "Moja podróż", icon: MapPinned },
  { href: "/konto", label: "Konto i logowanie", icon: UserRound },
] as const;

const APP_PATHS = ["/app", "/dla-ciebie", "/moja-podroz", "/porownaj", "/ulubione", "/alerty", "/profil", "/konto"];
const OPEN_MENU_SELECTOR = "details.trip-mobile-menu[open], details.trip-header-menu[open]";

function isAppPath(pathname: string) {
  return APP_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function closeOpenMenus(except?: HTMLDetailsElement | null) {
  document.querySelectorAll<HTMLDetailsElement>(OPEN_MENU_SELECTOR).forEach((details) => {
    if (details !== except) details.open = false;
  });
}

export default function SiteHeader() {
  const pathname = usePathname();
  const inApp = isAppPath(pathname);
  const mobileHomeHref = inApp ? "/app" : "/";
  const searchHref = inApp ? "/app#wyszukiwarka" : "/#wyszukiwarka";

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const clickedMenu = target.closest<HTMLDetailsElement>("details.trip-mobile-menu, details.trip-header-menu");
      if (!clickedMenu) {
        closeOpenMenus();
        return;
      }
      closeOpenMenus(clickedMenu);
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("details.trip-mobile-menu a, details.trip-header-menu a")) closeOpenMenus();
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
    <header className={`trip-header${inApp ? " trip-header-app" : ""}`}>
      <div className="trip-header-shell">
        <div className="trip-mobile-top">
          <Link className="trip-mobile-brand" href={mobileHomeHref} aria-label={inApp ? "Tripownia — start aplikacji" : "Tripownia.pl — strona główna"}>
            <Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={64} height={64} priority />
          </Link>
          <div className="trip-mobile-top-actions">
            <Link className="trip-mobile-search-shortcut" href={searchHref} aria-label="Przejdź do wyszukiwarki wyjazdów">
              <Search size={19} strokeWidth={2.2} /><span>Szukaj</span>
            </Link>
            <Link className="trip-mobile-account" href="/konto" aria-label="Konto i logowanie">
              <UserRound size={19} strokeWidth={2.2} /><span>Konto</span>
            </Link>
            <details className="trip-mobile-menu">
              <summary aria-label="Otwórz menu"><Menu size={20} strokeWidth={2.2} /><span>Menu</span></summary>
              <div className="trip-mobile-menu-panel">
                <div className="trip-mobile-menu-section">
                  <strong>Twoja Tripownia</strong>
                  <Link href="/app"><LayoutDashboard size={18} /><span>Start</span></Link>
                  <Link href="/moja-podroz"><MapPinned size={18} /><span>Moja podróż</span></Link>
                  <Link href="/ulubione"><Heart size={18} /><span>Ulubione</span></Link>
                  <Link href="/alerty"><Bell size={18} /><span>Alerty</span></Link>
                  <Link href="/dla-ciebie"><Sparkles size={18} /><span>Dla Ciebie</span></Link>
                  <Link href="/konto"><UserRound size={18} /><span>Konto i logowanie</span></Link>
                  <Link href="/profil"><UserRound size={18} /><span>Profil podróżnika</span></Link>
                </div>
                <div className="trip-mobile-menu-section">
                  <strong>Szukaj i planuj</strong>
                  <Link href="/okazje"><Sparkles size={18} /><span>Okazje</span></Link>
                  <Link href="/wakacje"><Palmtree size={18} /><span>Wakacje</span></Link>
                  <Link href="/city-break"><Building2 size={18} /><span>City break</span></Link>
                  <Link href="/last-minute"><Zap size={18} /><span>Last minute</span></Link>
                  <Link href="/kierunki"><Compass size={18} /><span>Kierunki</span></Link>
                  <Link href="/poradniki"><BookOpen size={18} /><span>Poradniki</span></Link>
                  <Link href="/atrakcje"><Building2 size={18} /><span>Atrakcje</span></Link>
                  <Link href="/loty"><Plane size={18} /><span>Loty</span></Link>
                  <Link href="/hotele"><BedDouble size={18} /><span>Hotele</span></Link>
                </div>
              </div>
            </details>
          </div>
        </div>

        <div className="trip-header-main">
          <Link className="trip-header-brand" href={inApp ? "/app" : "/"} aria-label={inApp ? "Tripownia — start aplikacji" : "Tripownia.pl — strona główna"}>
            <Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={68} height={68} priority />
          </Link>
          <Link className="trip-header-search" href={searchHref} aria-label="Przejdź do wyszukiwarki wyjazdów">
            <Search size={20} strokeWidth={2.3} />
            <span className="trip-header-search-copy"><strong>{inApp ? "Szukaj wyjazdu" : "Dokąd chcesz lecieć?"}</strong><small>{inApp ? "Przejdź do wyszukiwarki Tripowni" : "Loty, hotele, wakacje i gotowe okazje w jednym miejscu"}</small></span>
            <span className="trip-header-search-cta" aria-hidden="true"><Search size={24} strokeWidth={2.8} /></span>
          </Link>
          <nav className="trip-header-actions" aria-label="Twoje konto">
            <Link className="trip-header-action" href="/ulubione" aria-label="Ulubione"><Heart size={19} strokeWidth={2} /><span>Ulubione</span></Link>
            <Link className="trip-header-action" href="/moja-podroz" aria-label="Moja podróż"><MapPinned size={19} strokeWidth={2} /><span>Podróż</span></Link>
            <Link className="trip-header-action" href="/konto" aria-label="Konto i logowanie"><UserRound size={19} strokeWidth={2} /><span>Konto</span></Link>
          </nav>
        </div>

        <div className="trip-header-nav-wrap">
          <nav className="trip-header-nav" aria-label="Główne kategorie podróży">
            {primaryItems.map((item) => {
              const active = isActive(item.href);
              return <Link key={item.href} className={`trip-header-nav-link${active ? " is-active" : ""}`} href={item.href} aria-current={active ? "page" : undefined}><span>{item.label}</span></Link>;
            })}
          </nav>
          <div className="trip-header-tools">
            <details className="trip-header-menu">
              <summary><Globe2 size={16} strokeWidth={2} /><span>Więcej inspiracji</span><ChevronDown size={13} strokeWidth={2.2} /></summary>
              <div className="trip-header-popover">
                {planningItems.map((item) => {
                  const Icon = item.icon;
                  if ("external" in item && item.external) return <a key={item.label} href={item.href} target="_blank" rel="sponsored noopener noreferrer"><Icon size={18} strokeWidth={2}/><span>{item.label}</span></a>;
                  return <Link key={item.label} href={item.href}><Icon size={18} strokeWidth={2}/><span>{item.label}</span></Link>;
                })}
              </div>
            </details>
            <details className="trip-header-menu">
              <summary><Sparkles size={16} strokeWidth={2} /><span>Moja Tripownia</span><ChevronDown size={13} strokeWidth={2.2} /></summary>
              <div className="trip-header-popover">
                {myTripowniaItems.map((item) => { const Icon = item.icon; return <Link key={item.label} href={item.href}><Icon size={18} strokeWidth={2}/><span>{item.label}</span></Link>; })}
              </div>
            </details>
            <a className="trip-header-help" href="mailto:kontakt@tripownia.pl?subject=Pomoc%20Tripownia"><CircleHelp size={16} strokeWidth={2} /><span>Pomoc</span></a>
          </div>
        </div>
      </div>
    </header>
  </>;
}
