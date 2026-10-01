"use client";

import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import OfferCard from "@/components/OfferCard";
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

  return (
    <section className="section shell recent-offers-sales" aria-labelledby="recent-offers-title">
      <div className="section-heading">
        <div>
          <div className="kicker"><Clock3 size={14}/> OSTATNIO OGLĄDANE</div>
          <h2 id="recent-offers-title">Wróć do ofert, które już Cię zainteresowały.</h2>
        </div>
        <Link className="section-premium-link" href="/ulubione">Zapisane oferty <ArrowRight size={16}/></Link>
      </div>
      <div className="recent-offers-sales-grid">
        {offers.slice(0, 4).map((offer) => <OfferCard key={offer.id} offer={offer}/>)}
      </div>
    </section>
  );
}
