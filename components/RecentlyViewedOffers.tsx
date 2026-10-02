"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, Moon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TravelImage from "@/components/TravelImage";
import {
  RECENT_OFFER_IDS_KEY,
  RECENT_OFFER_SNAPSHOTS_KEY,
  readSavedOfferSnapshots,
  type SavedOfferSnapshots,
} from "@/lib/savedOfferSnapshots";
import type { Offer } from "@/lib/offers";

function readRecentIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_OFFER_IDS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === "number").slice(0, 8) : [];
  } catch {
    localStorage.removeItem(RECENT_OFFER_IDS_KEY);
    return [];
  }
}

function offerHref(offer: Offer) {
  const external = /^https?:\/\//.test(offer.affiliateUrl || "");
  if (offer.id >= 1_000_000 && external) return offer.affiliateUrl;
  return `/oferta/${offer.id}`;
}

function nightsLabel(nights: number) {
  if (nights === 1) return "noc";
  if (nights % 10 >= 2 && nights % 10 <= 4 && !(nights % 100 >= 12 && nights % 100 <= 14)) return "noce";
  return "nocy";
}

export default function RecentlyViewedOffers() {
  const [ids, setIds] = useState<number[]>([]);
  const [snapshots, setSnapshots] = useState<SavedOfferSnapshots>({});

  useEffect(() => {
    const load = () => {
      setIds(readRecentIds());
      setSnapshots(readSavedOfferSnapshots(RECENT_OFFER_SNAPSHOTS_KEY));
    };
    load();
    window.addEventListener("tripownia-recent-offers-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("tripownia-recent-offers-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const offers = useMemo(
    () => ids.map((id) => snapshots[String(id)]).filter((offer): offer is Offer => Boolean(offer)),
    [ids, snapshots]
  );

  if (!offers.length) return null;

  const visibleOffers = offers.slice(0, 3);

  return (
    <section className="section shell recent-offers-sales recent-offers-teaser-section" aria-labelledby="recent-offers-title">
      <div className="section-heading recent-offers-heading">
        <div>
          <div className="kicker"><Clock3 size={14}/> OSTATNIO OGLĄDANE</div>
          <h2 id="recent-offers-title">Wróć do ofert, które wpadły Ci w oko.</h2>
          <p>{visibleOffers.length === 1 ? "Ostatnio oglądana oferta" : `${visibleOffers.length} ostatnio oglądane oferty`}</p>
        </div>
        <Link className="section-premium-link" href="/ulubione">Zapisane oferty <ArrowRight size={16}/></Link>
      </div>

      <div className="recent-offers-teaser-list">
        {visibleOffers.map((offer) => {
          const href = offerHref(offer);
          const external = href.startsWith("http");
          return (
            <a
              key={offer.id}
              className="recent-offer-teaser"
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "sponsored noopener noreferrer" : undefined}
              aria-label={`Otwórz ofertę ${offer.city}`}
            >
              <div className="recent-offer-teaser-image">
                <TravelImage
                  city={offer.city}
                  country={offer.country}
                  alt={`${offer.city}, ${offer.country}`}
                  overrideSrc={offer.image}
                />
              </div>

              <div className="recent-offer-teaser-body">
                <div className="recent-offer-teaser-country">{offer.flag} {offer.country}</div>
                <strong className="recent-offer-teaser-title">{offer.city}</strong>
                {offer.hotel && <span className="recent-offer-teaser-hotel">{offer.hotel}</span>}

                <div className="recent-offer-teaser-meta">
                  <span><CalendarDays size={14}/>{offer.dates}</span>
                  <span><Moon size={14}/>{offer.nights} {nightsLabel(offer.nights)}</span>
                </div>

                <div className="recent-offer-teaser-bottom">
                  <div><small>od</small><b>{offer.price.toLocaleString("pl-PL")} zł</b><span>/os.</span></div>
                  <span className="recent-offer-teaser-arrow" aria-hidden="true"><ArrowRight size={19}/></span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
