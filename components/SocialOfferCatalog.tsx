"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSocialOfferSlugs, getSocialOfferForLanding, isSocialOfferExpired } from "@/lib/socialOffers";
import { trackEvent } from "@/lib/analytics";
import TravelImage from "@/components/TravelImage";
import styles from "./SocialOfferCatalog.module.css";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").toLowerCase();

export default function SocialOfferCatalog({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);
  const entries = useMemo(() => getSocialOfferSlugs()
    .flatMap(slug => { const offer = getSocialOfferForLanding(slug); return offer ? [offer] : []; })
    .sort((a, b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt)), []);
  const matches = entries.filter(offer => normalize(`${offer.city} ${offer.country} ${offer.hotel} ${offer.departure} ${offer.price}`).includes(normalize(query.trim())));
  const visible = compact ? matches.slice(0, 4) : matches;

  return <section className={`section shell ${styles.section}`} aria-labelledby="social-offers-title" id="oferty-z-postow">
    <div className={styles.heading}>
      <div><div className="kicker">TRIPOWNIA W SOCIAL MEDIACH</div>
        <h2 id="social-offers-title">Oferta z posta? Znajdź ją tutaj.</h2>
        <p>Wybierz kierunek lub hotel i wróć do szczegółów wyjazdu. Ceny z publikacji mogą się zmienić.</p>
      </div>
      {compact && <Link className={styles.all} href="/oferty-z-postow">Wszystkie oferty z social mediów</Link>}
    </div>
    {!compact && <div className={styles.search}>
      <label htmlFor="social-offer-search">Kierunek, hotel, lotnisko lub cena z posta</label>
      <input id="social-offer-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Np. Alicante, Brisa Sol, 669" />
      <p role="status">Znalezione propozycje: {matches.length}</p>
    </div>}
    <div className={styles.grid}>
      {visible.map(offer => {
        const expired = offer.status === "expired" || (now ? isSocialOfferExpired(offer, now) : false);
        return <article className={styles.card} key={offer.slug}>
          <TravelImage city={offer.city} country={offer.country} overrideSrc={offer.imageSrc} alt={`${offer.city}, ${offer.country} — ilustracja kierunku lub oferty`} className={styles.image} />
          <div className={styles.body}>
            <span className={styles.status}>{expired ? "Archiwalna propozycja" : "Sprawdź dostępność"}</span>
            <h3>{offer.city}</h3><p className={styles.hotel}>{offer.hotel}</p>
            <p>{offer.dates}<br />{offer.departure} · {offer.nights} {offer.nights === 1 ? "noc" : offer.nights >= 2 && offer.nights <= 4 ? "noce" : "nocy"}<br />{offer.board}</p>
            <p className={styles.price}><small>Ostatnia zapisana cena od</small><strong>{offer.price.toLocaleString("pl-PL")} zł <span>/ os.</span></strong></p>
            <p className={styles.checked}>Zapisano {new Intl.DateTimeFormat("pl-PL", { timeZone: "Europe/Warsaw", day: "numeric", month: "long", year: "numeric" }).format(new Date(offer.checkedAt))}</p>
            <Link href={`/o/${offer.slug}`} className={styles.cta} onClick={() => trackEvent("social_offer_catalog_click", { offer_id: offer.slug, destination: offer.city, partner: offer.partner, placement: compact ? "homepage" : "social_catalog", price: offer.price })}>Zobacz szczegóły</Link>
          </div>
        </article>;
      })}
    </div>
    {!matches.length && <p className={styles.empty}>Nie znaleźliśmy takiej propozycji. Spróbuj nazwy kraju lub hotelu albo <Link href="/okazje">zobacz pozostałe okazje</Link>.</p>}
  </section>;
}
