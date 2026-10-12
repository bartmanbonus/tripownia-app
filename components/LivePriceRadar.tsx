"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Compass, Hotel, Palmtree, Plane, RefreshCw, Sparkles, Sun, Wallet } from "lucide-react";
import TravelImage from "@/components/TravelImage";
import { useLiveOffers } from "@/lib/useLiveOffers";
import { liveOfferLandingHref } from "@/lib/liveOfferLanding";
import { selectRadarSlots, type RadarKind, type RadarSlot } from "@/lib/radarDealSelection";
import { trackEvent } from "@/lib/analytics";
import styles from "./LivePriceRadar.module.css";

type Filter = "all" | RadarKind;
const FILTERS: Array<{ kind: Filter; text: string; icon: typeof Sparkles }> = [
  { kind: "all", text: "Wszystkie", icon: Sparkles },
  { kind: "flight", text: "Same loty", icon: Plane },
  { kind: "city", text: "City break", icon: Compass },
  { kind: "allinclusive", text: "All Inclusive", icon: Sun },
  { kind: "beach", text: "Plaża", icon: Palmtree },
  { kind: "exotic", text: "Egzotyka", icon: Wallet },
];

function Card({ slot, featured = false }: { slot: RadarSlot; featured?: boolean }) {
  const { offer, category, priceKind } = slot;
  if (!offer) return null;
  const Icon = FILTERS.find((item) => item.kind === category.kind)?.icon || Compass;
  const href = liveOfferLandingHref(offer, {
    price: priceKind === "calendar" ? null : offer.price,
    source: "radar-tripowni",
  });
  const dateText = offer.dates.replace(/[–—]/g, " – ");
  return <article className={featured ? styles.leadCard : styles.card}>
    <Link className={styles.cardLink} href={href}
      onClick={() => trackEvent("radar_deal_click", { kind: category.kind, destination: offer.city, price: offer.price })}>
      <div className={styles.imageWrap}>
        <TravelImage className={styles.image} city={offer.city} country={offer.country}
          alt={offer.city + ", " + offer.country} overrideSrc={offer.image} priority={featured} />
        <span className={styles.categoryTag}><Icon size={13} aria-hidden="true" />{category.title}</span>
      </div>
      <div className={styles.cardBody}>
        <div>
          <h3 className={styles.destination}>{offer.flag} {offer.city}</h3>
          <p className={styles.country}>{offer.country}{offer.hotel && offer.hotel !== "Sam lot" ? " · " + offer.hotel : ""}</p>
        </div>
        <div className={styles.meta}>
          <span className={styles.metaItem}><Plane size={14} />{offer.departure}</span>
          <span className={styles.metaItem}><CalendarDays size={14} />{dateText}</span>
          <span className={styles.metaItem}><Hotel size={14} />{offer.nights} {offer.nights === 1 ? "noc" : "nocy"}</span>
        </div>
        <div className={styles.priceFoot}>
          <div className={styles.priceColumn}>
            <span className={styles.priceCaption}>{priceKind === "calendar" ? "Cena z kalendarza lotów" : "Cena pakietu od / os."}</span>
            <div className={styles.price}>{offer.price.toLocaleString("pl-PL")} <span className={styles.currency}>zł</span></div>
          </div>
          <span className={styles.action}>Zobacz <ArrowRight size={15} /></span>
        </div>
        <p className={styles.detail}>
          {priceKind === "calendar"
            ? "Lot w obie strony · cena orientacyjna z wyszukiwarki; sprawdź przed zakupem"
            : offer.board + " · cena z feedu partnera, końcową kwotę potwierdź przy rezerwacji"}
        </p>
      </div>
    </Link>
  </article>;
}

function EmptyCategory({ slot }: { slot: RadarSlot }) {
  const Icon = FILTERS.find((item) => item.kind === slot.category.kind)?.icon || Compass;
  return <div className={styles.emptyCard}>
    <div className={styles.emptyIcon}><Icon size={18} /></div>
    <div>
      <strong>{slot.category.title}</strong>
      <p>Brak oferty poniżej {slot.category.maxPrice.toLocaleString("pl-PL")} zł spełniającej warunki aktualności.</p>
      <Link href={slot.category.url}>Sprawdź więcej <ArrowRight size={13} /></Link>
    </div>
  </div>;
}

export default function LivePriceRadar() {
  const [filter, setFilter] = useState<Filter>("all");
  const { offers, source, loading, checkedAt, refresh } = useLiveOffers("/api/deals?strict=1", 5 * 60 * 1000);
  const slots = useMemo(() => selectRadarSlots(source === "live" ? offers : []), [offers, source]);
  const shown = filter === "all" ? slots : slots.filter((slot) => slot.category.kind === filter);
  const ready = shown.filter((slot) => slot.offer);
  const empty = shown.filter((slot) => !slot.offer);
  const time = checkedAt && !Number.isNaN(Date.parse(checkedAt))
    ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Warsaw" }).format(new Date(checkedAt))
    : "";

  return <section className={styles.root} aria-label="Radar okazji Tripowni">
    <div className={styles.hero}>
      <div className={styles.heroCopy}>
        <div className={styles.kicker}><span className={styles.kickerDot}/>RADAR PRAWDZIWYCH OKAZJI</div>
        <h1 className={styles.heroTitle}>Mało wydajesz.<br/><span className={styles.heroAccent}>Dużo podróżujesz.</span></h1>
        <p className={styles.heroText}>Wybieramy tylko najtańsze opcje w 5 różnych rodzajach podróży. Bez drogich zapychaczy, bez powtarzania tych samych kierunków i bez zmyślonych cen.</p>
      </div>
      <div className={styles.heroAside}>
        <div><p className={styles.asideLabel}>Oferty spełniające progi</p>
          <div className={styles.asideNumber}>{ready.length}<small> / {shown.length}</small></div>
          <p className={styles.asideInfo}>Ceny pakietów sprawdzone w źródle nie dawniej niż 6 godzin; loty to orientacyjna cena kalendarzowa.</p>
        </div>
        <button type="button" className={styles.refresh} onClick={() => { refresh(); trackEvent("radar_refresh", {}); }} disabled={loading}>
          <RefreshCw size={15}/>{loading ? "Sprawdzamy…" : "Odśwież oferty"}
        </button>
      </div>
    </div>

    <div className={styles.infoStrip}>
      <span className={styles.stripNote}><Sparkles size={15} /><strong>5 kategorii · 5 progów cenowych</strong> · bez sztucznego uzupełniania wyników</span>
      <span>{time ? "Ostatni odczyt: " + time : "Ceny aktualizują się automatycznie"}</span>
    </div>
    <div className={styles.controlHead}>
      <div><h2 className={styles.heading}>Wybierz swój sposób podróżowania</h2>
        <p className={styles.headingDescription}>Najniższa cena w każdej kategorii. Pozostałe kierunki sprawdzisz w wyszukiwarce.</p>
      </div>
      <span className={styles.tinyCount}>{ready.length} z {shown.length} kategorii z ofertą</span>
    </div>
    <div className={styles.filters} role="group" aria-label="Rodzaj podróży">
      {FILTERS.map(({ kind, text, icon: Icon }) =>
        <button key={kind} type="button" className={styles.filter + (filter === kind ? " " + styles.filterActive : "")}
          onClick={() => setFilter(kind)} aria-pressed={filter === kind}><Icon size={15}/>{text}</button>)}
    </div>

    {ready.length ? <div className={styles.grid}>
      <Card slot={ready[0]} featured />
      <div className={styles.sideGrid}>{ready.slice(1).map((slot) => <Card key={slot.category.kind} slot={slot}/>)}</div>
    </div> : !loading ? <div className={styles.allEmpty}>
      <strong>Teraz nie ma okazji, którą warto polecić.</strong>
      <p>Nie pokazujemy cen sprzed kilku dni ani drogich wyjazdów jako okazji. Spróbuj odświeżyć dane albo przejrzyj wszystkie terminy.</p>
    </div> : <div className={styles.loadingSkeleton} aria-label="Trwa wyszukiwanie ofert"/>}

    {!!empty.length && <div className={styles.emptySlots}>
      {empty.map((slot) => <EmptyCategory key={slot.category.kind} slot={slot}/>)}
    </div>}
    <div className={styles.bottom}>
      <div><strong>Nie ma Twojego kierunku w dzisiejszej selekcji?</strong>
        <p>W pełnej wyszukiwarce masz więcej lotnisk, terminów i wariantów podróży.</p></div>
      <Link href="/okazje">Wszystkie okazje <ArrowRight size={15}/></Link>
    </div>
  </section>;
}
