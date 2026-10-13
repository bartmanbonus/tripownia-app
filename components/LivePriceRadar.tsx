"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Compass, Hotel, Palmtree, Plane, RefreshCw, Sparkles, Sun, Wallet } from "lucide-react";
import TravelImage from "@/components/TravelImage";
import { useLiveOffers } from "@/lib/useLiveOffers";
import { liveNightsLabel } from "@/lib/liveDealSelection";
import { liveOfferLandingHref } from "@/lib/liveOfferLanding";
import { RADAR_CATEGORIES, selectRadarFeed, type RadarKind, type RadarPick } from "@/lib/radarDealSelection";
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

function DealCard({ pick, featured = false }: { pick: RadarPick; featured?: boolean }) {
  const { offer, category, priceKind } = pick;
  const Icon = FILTERS.find((item) => item.kind === category.kind)?.icon || Compass;
  const isFlight = priceKind === "calendar";
  const href = liveOfferLandingHref(offer, {
    price: isFlight ? null : offer.price,
    source: "radar-tripowni",
  });
  const categoryLabel = isFlight ? "Sam lot" : /all[ -]?inclusive/i.test(offer.board) ? "All Inclusive" : "Lot + hotel";
  const includedLabel = isFlight
    ? "Cena z kalendarza lotów — potwierdź ją u partnera"
    : offer.board + " · cena z aktualnego feedu partnera";
  return <article
    className={featured ? styles.leadCard : styles.card}
    data-radar-kind={category.kind}
    data-radar-offer-id={offer.id}
    data-radar-price={offer.price}
    data-radar-checked-at={offer.priceCheckedAt || ""}
    data-price-provenance={priceKind}>
    <Link className={styles.cardLink} href={href}
      aria-label={"Zobacz ofertę: " + offer.city + ", " + offer.price.toLocaleString("pl-PL") + " zł"}
      onClick={() => trackEvent("radar_deal_click", { kind: category.kind, destination: offer.city, price: offer.price })}>
      <div className={styles.imageWrap}>
        <TravelImage className={styles.image} city={offer.city} country={offer.country}
          alt={offer.city + ", " + offer.country} overrideSrc={offer.image} priority={featured} />
        <span className={styles.categoryTag}><Icon size={13} aria-hidden="true"/>{category.title}</span>
      </div>
      <div className={styles.cardBody}>
        <div>
          <h3 className={styles.destination}>{offer.flag} {offer.city}</h3>
          <p className={styles.country}>{offer.country}{!isFlight ? " · " + offer.hotel : ""}</p>
        </div>
        <div className={styles.meta}>
          <span className={styles.metaItem}><Plane size={14} aria-hidden="true"/>{offer.departure}</span>
          <span className={styles.metaItem}><CalendarDays size={14} aria-hidden="true"/>{offer.dates.replace(/[–—]/g, " – ")}</span>
          <span className={styles.metaItem}><Hotel size={14} aria-hidden="true"/>{liveNightsLabel(offer.nights)}</span>
        </div>
        <div className={styles.priceFoot}>
          <div className={styles.priceColumn}>
            <span className={styles.priceCaption}>{categoryLabel} · od / os.</span>
            <div className={styles.price}>{offer.price.toLocaleString("pl-PL")} <span className={styles.currency}>zł</span></div>
          </div>
          <span className={styles.action}>{isFlight ? "Sprawdź lot" : "Sprawdź"} <ArrowRight size={15} aria-hidden="true"/></span>
        </div>
        <p className={styles.detail}>{includedLabel}. Cena końcowa może się zmienić przed rezerwacją.</p>
      </div>
    </Link>
  </article>;
}

export default function LivePriceRadar() {
  const [filter, setFilter] = useState<Filter>("all");
  const { offers, source, loading, checkedAt, refresh, notice } = useLiveOffers("/api/deals?strict=1", 5 * 60 * 1000);
  const picks = useMemo(
    () => source === "live" ? selectRadarFeed(offers, Date.now(), 8) : [],
    [offers, source]
  );
  const shown = filter === "all" ? picks : picks.filter((pick) => pick.category.kind === filter);
  const active = RADAR_CATEGORIES.find((item) => item.kind === filter);
  const missing = RADAR_CATEGORIES.filter((item) => !picks.some((pick) => pick.category.kind === item.kind));
  const waitingForFeed = loading && !picks.length;

  const formattedTime = checkedAt && !Number.isNaN(Date.parse(checkedAt))
    ? new Intl.DateTimeFormat("pl-PL", {
        dateStyle: "short", timeStyle: "short", timeZone: "Europe/Warsaw",
      }).format(new Date(checkedAt))
    : "";

  return <section className={styles.root} aria-label="Radar okazji Tripowni">
    <div className={styles.hero}>
      <div className={styles.heroCopy}>
        <div className={styles.kicker}><span className={styles.kickerDot}/>RADAR CENOWY TRIPOWNI</div>
        <h1 className={styles.heroTitle}>Mniej za podróż.<br/><span className={styles.heroAccent}>Więcej za wspomnienia.</span></h1>
        <p className={styles.heroText}>Tanie loty, city breaki, wakacje i egzotyka. Tylko konkretne terminy, ograniczone progi cenowe i prawidłowe linki do rezerwacji.</p>
      </div>
      <div className={styles.heroAside}>
        <div>
          <p className={styles.asideLabel}>Dzisiejsza selekcja</p>
          {waitingForFeed
            ? <div className={styles.asideNumber}>…</div>
            : <div className={styles.asideNumber}>{picks.length}<small>ofert</small></div>}
          <p className={styles.asideInfo}>Z różnych kierunków, bez dublowania tej samej wycieczki i bez drogich propozycji dla wypełnienia listy.</p>
        </div>
        <button type="button" className={styles.refresh} onClick={() => {
          refresh();
          trackEvent("radar_refresh", {});
        }} disabled={loading} aria-label="Odśwież ceny okazji">
          <RefreshCw size={15} aria-hidden="true"/>{loading ? "Sprawdzamy…" : "Odśwież oferty"}
        </button>
      </div>
    </div>

    <div className={styles.infoStrip}>
      <span className={styles.stripNote}>
        <Sparkles size={15} aria-hidden="true"/>
        <strong>{waitingForFeed ? "Sprawdzamy źródła ofert" : picks.length + " ofert poniżej limitów"}</strong>
        <span> · ceny pakietów do 6 h, loty z kalendarza cenowego</span>
      </span>
      <span>{formattedTime ? "Odczyt wyszukiwarki: " + formattedTime : "Ceny są aktualizowane automatycznie"}</span>
    </div>

    <div className={styles.controlHead}>
      <div>
        <h2 className={styles.heading}>Okazje, które warto sprawdzić</h2>
        <p className={styles.headingDescription}>Zmieniamy kierunki, nie rozluźniamy limitów cen. Najpierw pokazujemy różne typy wyjazdów.</p>
      </div>
      {!waitingForFeed && <span className={styles.tinyCount}>{picks.length} propozycji</span>}
    </div>

    <div className={styles.filters} role="group" aria-label="Rodzaj podróży">
      {FILTERS.map(({ kind, text, icon: Icon }) => {
        const number = kind === "all" ? picks.length : picks.filter((pick) => pick.category.kind === kind).length;
        return <button key={kind} type="button"
          className={styles.filter + (filter === kind ? " " + styles.filterActive : "")}
          onClick={() => { setFilter(kind); trackEvent("radar_filter", { kind }); }}
          aria-pressed={filter === kind}>
          <Icon size={15} aria-hidden="true"/>{text}{!waitingForFeed && <span className={styles.filterCount}>{number}</span>}
        </button>;
      })}
    </div>

    <div aria-live="polite">
      {waitingForFeed ? <div className={styles.loadingSkeleton} aria-label="Szukamy aktualnych okazji"/> : shown.length > 0 ? (
        <>
          <div className={styles.grid + (shown.length === 1 ? " " + styles.gridSolo : "")}>
            <DealCard pick={shown[0]} featured/>
            {shown.length > 1 && <div className={styles.sideGrid}>
              {shown.slice(1, 5).map((pick) => <DealCard key={pick.offer.id} pick={pick}/>)}
            </div>}
          </div>
          {shown.length > 5 && <div className={styles.moreGrid}>
            {shown.slice(5).map((pick) => <DealCard key={pick.offer.id} pick={pick}/>)}
          </div>}
        </>
      ) : <div className={styles.allEmpty} role="status">
        <strong>{active ? "Nie znaleźliśmy obecnie dobrej ceny w tej kategorii." : "Na tę chwilę nie znaleźliśmy wystarczająco tanich, aktualnych ofert."}</strong>
        <p>Nie zastępujemy prawdziwych cen starymi reklamami ani drogimi wyjazdami. Zobacz inne terminy lub skorzystaj z wyszukiwarki.</p>
        <Link href={active?.url || "/okazje"}>{active ? "Szukaj: " + active.title : "Wyszukaj wszystkie okazje"} <ArrowRight size={14}/></Link>
      </div>}
    </div>

    {!waitingForFeed && filter === "all" && missing.length > 0 && picks.length > 0 &&
      <div className={styles.missingRow} aria-label="Kategorie bez potwierdzonych ofert">
        <span>W pozostałych kategoriach nie ma teraz ceny poniżej naszego limitu:</span>
        {missing.map((category) => <Link key={category.kind} href={category.url}>
          {category.title} (do {category.maxPrice.toLocaleString("pl-PL")} zł) <ArrowRight size={12}/>
        </Link>)}
      </div>
    }

    {notice && !waitingForFeed && <p className={styles.notice}>Wyniki mogą być niepełne, gdy dostawca chwilowo nie odpowiada. Cenę i dostępność zawsze potwierdź u partnera.</p>}

    <div className={styles.bottom}>
      <div><strong>Szukasz innego terminu albo lotniska?</strong>
        <p>W pełnej wyszukiwarce dostępna jest szersza pula ofert, także poza progami Radaru.</p></div>
      <Link href="/okazje">Zobacz wszystkie oferty <ArrowRight size={15} aria-hidden="true"/></Link>
    </div>
  </section>;
}
