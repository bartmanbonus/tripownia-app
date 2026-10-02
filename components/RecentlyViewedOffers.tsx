"use client";

import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
    () => ids.map((id) => snapshots[String(id)]).filter((offer): offer is Offer => Boolean(offer)).slice(0, 5),
    [ids, snapshots]
  );

  if (!offers.length) return null;

  return (
    <section className="section shell recent-offers-sales recent-offers-list-section" aria-labelledby="recent-offers-title">
      <div className="section-heading recent-offers-heading">
        <div>
          <div className="kicker"><Clock3 size={14}/> OSTATNIO OGLĄDANE</div>
          <h2 id="recent-offers-title">Wróć do przejrzanych ofert.</h2>
        </div>
        <Link className="section-premium-link" href="/ulubione">Zapisane oferty <ArrowRight size={16}/></Link>
      </div>

      <div className="recent-offers-price-list">
        {offers.map((offer) => {
          const href = offerHref(offer);
          const external = href.startsWith("http");
          return (
            <a
              key={offer.id}
              className="recent-offer-price-row"
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "sponsored noopener noreferrer" : undefined}
              aria-label={`Otwórz ofertę ${offer.city}`}
            >
              <div className="recent-offer-price-main">
                <strong>{offer.flag} {offer.city}</strong>
                <span>{offer.hotel || offer.country}</span>
              </div>
              <div className="recent-offer-price-details">
                <span>{offer.dates}</span>
                <span>{offer.nights} {offer.nights === 1 ? "noc" : "nocy"}</span>
              </div>
              <div className="recent-offer-price-value">
                <small>od</small>
                <b>{offer.price.toLocaleString("pl-PL")} zł</b>
                <span>/os.</span>
              </div>
              <ArrowRight className="recent-offer-price-arrow" size={18}/>
            </a>
          );
        })}
      </div>
    </section>
  );
}
