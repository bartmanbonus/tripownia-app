"use client";

import { Heart, Plane, Moon, Sun, ArrowRight } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { useState } from "react";

export default function OfferCard({ offer }: { offer: Offer }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className="offer-card">
      <div className="offer-image" style={{ backgroundImage: `url(${offer.image})` }}>
        <span className={`badge ${offer.tag === "BIERZEMY" ? "hot" : ""}`}>{offer.tag}</span>
        <button className="heart" aria-label="Dodaj do ulubionych" onClick={() => setLiked(!liked)}>
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="offer-body">
        <div className="offer-topline">
          <div>
            <div className="eyebrow">{offer.flag} {offer.country}</div>
            <h3>{offer.city}</h3>
          </div>
          <div className="score"><strong>{offer.score}</strong><span>/10</span></div>
        </div>
        <div className="price">od <strong>{offer.price} zł</strong> <span>/ os.</span></div>
        <div className="meta">
          <span><Plane size={15}/> {offer.departure}</span>
          <span><Moon size={15}/> {offer.nights} noce</span>
          <span><Sun size={15}/> {offer.weather}</span>
        </div>
        <p>{offer.reason}</p>
        <button className="card-cta">Sprawdź ofertę <ArrowRight size={17}/></button>
      </div>
    </article>
  );
}
