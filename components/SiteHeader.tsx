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
import { partners } from "@/lib/partners";

const primaryItems = [
  { href: "/#wyszukiwarka", label: "Znajdź wyjazd" },
  { href: "/okazje", label: "Okazje" },
  { href: "/kierunki", label: "Kierunki" },
  { href: "/wydarzenia", label: "Mecze i eventy" },
  { href: "/planer-podrozy", label: "Planner" },
] as const;

const bookingItems = [
  { href: partners.booking.buildUrl(), label: "Hotele", icon: BedDouble, external: true },
  { href: partners.kiwi.buildUrl(), label: "Loty", icon: Plane, external: true },
  { href: "/wynajem-auta", label: "Wynajem auta", icon: Car },
  { href: partners.getyourguide.buildUrl("https://www.getyourguide.pl/"), label: "Atrakcje", icon: Building2, external: true },
] as const;

const moreItems = [
  { href: "/podroze-po-przezycia", label: "Podróże po przeżycia", icon: Sparkles },
  { href: "/dalekie-podroze", label: "Dalekie podróże", icon: Palmtree },
  { href: "/sylwester", label: "Sylwester", icon: Zap },
  { href: "/inspiracje", label: "Inspiracje", icon: Lightbulb },
] as const;

const myTripowniaItems = [
  { href: "/app", label: "Panel główny", icon: LayoutDashboard },
  { href: "/gdzie-leciec", label: "Gdzie lecieć?", icon: Compass },
  { href: "/dla-ciebie", label: "Dla Ciebie", icon: Sparkles },
  { href: "/moja-podroz", label: "Mój planner", icon: MapPinned },
  { href: "/ulubione", label: "Ulubione", icon: Heart },
  { href: "/alerty", label: "Alerty", icon: Bell },
  { href: "/profil", label: "Profil podróżnika", icon: UserRound },
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
  const bookingActive = pathname.startsWith("/wynajem-auta") || pathname.startsWith("/transfery") || pathname.startsWith("/parkingi") || pathname.startsWith("/esim") || pathname.startsWith("/ubezpieczenia");
  const moreActive = ["/podroze-po-przezycia", "/dalekie-podroze", "/sylwester", "/inspiracje"].some((path) => pathname === path || pathname.startsWith(`${path}/`));

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
          <Link className="trip-mobile-brand" href={mobileHomeHref} aria-label={inApp ? "Tripownia — start aplikacji" : "Tripownia.pl — strona główna"}>
            <Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={64} height={64} priority />
          </Link>
          <div className="trip-mobile-top-actions">
            <Link className="trip-mobile-account trip-mobile-plan" href="/dodaj-podroz" aria-label="Ułóż darmowy plan podróży">
              <Sparkles size={19} strokeWidth={2.2} /><span>Plan za 0 zł</span>
            </Link>
            <details className="trip-mobile-menu">
              <summary aria-label="Otwórz menu"><Menu size={20} strokeWidth={2.2} /><span>Menu</span></summary>
              <div className="trip-mobile-menu-panel">
                <div className="trip-mobile-menu-section">
                  <strong>Twoja Tripownia</strong>
                  <Link href="/dodaj-podroz"><Sparkles size={18} /><span>Ułóż plan za darmo</span></Link>
                  <Link href="/moja-podroz"><MapPinned size={18} /><span>Mój planner</span></Link>
                  <Link href="/app"><LayoutDashboard size={18} /><span>Start</span></Link>
                  <Link href="/ulubione"><Heart size={18} /><span>Ulubione</span></Link>
                  <Link href="/alerty"><Bell size={18} /><span>Alerty</span></Link>
                  <Link href="/dla-ciebie"><Sparkles size={18} /><span>Dla Ciebie</span></Link>
                  <Link href="/konto"><UserRound size={18} /><span>Konto i logowanie</span></Link>
                  <Link href="/profil"><UserRound size={18} /><span>Profil podróżnika</span></Link>
                </div>
                <div className="trip-mobile-menu-section">
                  <strong>Szukaj i planuj</strong>
                  <Link href="/okazje"><Sparkles size={18} /><span>Okazje</span></Link>
                  <Link href="/wydarzenia"><Ticket size={18} /><span>Mecze i eventy</span></Link>
                  <Link href="/radar-tripowni"><Compass size={18} /><span>Radar Tripowni</span></Link>
                  <Link href="/wakacje"><Palmtree size={18} /><span>Wakacje</span></Link>
                  <Link href="/city-break"><Building2 size={18} /><span>City break</span></Link>
                  <Link href="/last-minute"><Zap size={18} /><span>Last minute</span></Link>
                  <Link href="/kierunki"><Compass size={18} /><span>Kierunki</span></Link>
                  <Link href="/poradniki"><BookOpen size={18} /><span>Poradniki</span></Link>
                </div>
                <div className="trip-mobile-menu-section">
                  <strong>Rezerwuj</strong>
                  <a href={partners.booking.buildUrl()} target="_blank" rel="sponsored noopener noreferrer"><BedDouble size={18} /><span>Hotele</span></a>
                  <a href={partners.kiwi.buildUrl()} target="_blank" rel="sponsored noopener noreferrer"><Plane size={18} /><span>Loty</span></a>
                  <Link href="/wynajem-auta"><Car size={18} /><span>Wynajem auta</span></Link>
                  <a href={partners.getyourguide.buildUrl("https://www.getyourguide.pl/")} target="_blank" rel="sponsored noopener noreferrer"><Building2 size={18} /><span>Atrakcje</span></a>
                </div>
                <div className="trip-mobile-menu-section">
                  <strong>Inspiracje</strong>
                  <Link href="/podroze-po-przezycia"><Sparkles size={18} /><span>Podróże po przeżycia</span></Link>
                  <Link href="/dalekie-podroze"><Palmtree size={18} /><span>Dalekie podróże</span></Link>
                  <Link href="/sylwester"><Zap size={18} /><span>Sylwester</span></Link>
                  <Link href="/inspiracje"><Lightbulb size={18} /><span>Inspiracje</span></Link>
                </div>
              </div>
            </details>
          </div>
        </div>

        <div className="trip-header-main">
          <Link className="trip-header-brand" href={inApp ? "/app" : "/"} aria-label={inApp ? "Tripownia — start aplikacji" : "Tripownia.pl — strona główna"}>
            <Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={68} height={68} priority />
          </Link>
          <Link className="trip-header-search" style={{ display: "grid", gridTemplateColumns: "20px minmax(0, 1fr) 44px", gap: 10 }} href={searchHref} aria-label="Przejdź do wyszukiwarki wyjazdów">
            <Search size={20} strokeWidth={2.3} />
            <span className="trip-header-search-copy" style={{ minWidth: 0, overflow: "hidden" }}><strong>Znajdź wyjazd</strong><small>Wakacje, loty, hotele i atrakcje — planner ogarnie resztę</small></span>
            <span className="trip-header-search-cta" style={{ position: "static", width: 44, minWidth: 44, height: 44, padding: 0, transform: "none" }} aria-hidden="true"><Search size={24} strokeWidth={2.8} /></span>
          </Link>
          <nav className="trip-header-actions" aria-label="Twoje konto">
            <Link className="trip-header-action trip-header-action-primary" href="/dodaj-podroz" aria-label="Ułóż darmowy plan podróży"><Sparkles size={19} strokeWidth={2} /><span>Plan za 0 zł</span></Link>
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
              <summary className={bookingActive ? "is-active" : undefined}><Ticket size={16} strokeWidth={2} /><span>Rezerwuj</span><ChevronDown size={13} strokeWidth={2.2} /></summary>
              <div className="trip-header-popover">
                {bookingItems.map((item) => {
                  const Icon = item.icon;
                  if ("external" in item && item.external) return <a key={item.label} href={item.href} target="_blank" rel="sponsored noopener noreferrer"><Icon size={18} strokeWidth={2}/><span>{item.label}</span></a>;
                  return <Link key={item.label} href={item.href}><Icon size={18} strokeWidth={2}/><span>{item.label}</span></Link>;
                })}
              </div>
            </details>
            <details className="trip-header-menu">
              <summary className={moreActive ? "is-active" : undefined}><Globe2 size={16} strokeWidth={2} /><span>Więcej</span><ChevronDown size={13} strokeWidth={2.2} /></summary>
              <div className="trip-header-popover">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  return <Link key={item.label} href={item.href}><Icon size={18} strokeWidth={2}/><span>{item.label}</span></Link>;
                })}
              </div>
            </details>
            <details className="trip-header-menu">
              <summary className={inApp ? "is-active" : undefined}><Sparkles size={16} strokeWidth={2} /><span>Moja Tripownia</span><ChevronDown size={13} strokeWidth={2.2} /></summary>
              <div className="trip-header-popover">
                {myTripowniaItems.map((item) => { const Icon = item.icon; return <Link key={item.label} href={item.href}><Icon size={18} strokeWidth={2}/><span>{item.label}</span></Link>; })}
              </div>
            </details>
            <Link className="trip-header-help" href="/faq"><CircleHelp size={16} strokeWidth={2} /><span>Pomoc</span></Link>
          </div>
        </div>
      </div>
    </header>
  </>;
}
