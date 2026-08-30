"use client";

import Link from "next/link";
import { Heart, Plane, Moon, Sun, ArrowRight } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { partners } from "@/lib/partners";
import { getVerifiedImage } from "@/lib/verifiedImages";
import TravelImage from "@/components/TravelImage";
import { useEffect, useState } from "react";

export default function OfferCard({ offer }: { offer: Offer }) {
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[];
    setLiked(ids.includes(offer.id));
  }, [offer.id]);

  function toggleLike() {
    const ids = JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[];
    const next = ids.includes(offer.id) ? ids.filter(id => id !== offer.id) : [...ids, offer.id];
    localStorage.setItem("tripownia-favorites", JSON.stringify(next));
    setLiked(next.includes(offer.id));
    window.dispatchEvent(new Event("tripownia-favorites-updated"));
  }

  const verifiedImage = getVerifiedImage(offer.city);

  return (
    <article className="offer-card">
      <Link href={`/oferta/${offer.id}`} className="offer-image" aria-label={`Otwórz ofertę ${offer.city}`}>
        <TravelImage src={verifiedImage} alt={`${offer.city}, ${offer.country}`} className="offer-photo-img" />
        <span className={`badge ${offer.tag === "BIERZEMY" ? "hot" : ""}`}>{offer.tag}</span>
      </Link>
      <button className="heart" aria-label="Dodaj do ulubionych" onClick={toggleLike}>
        <Heart size={20} fill={liked ? "currentColor" : "none"}/>
      </button>
      <div className="offer-body">
        <div className="offer-topline">
          <div><div className="eyebrow">{offer.flag} {offer.country}</div><h3>{offer.city}</h3></div>
          <div className="score"><strong>{offer.score}</strong><span>/10</span></div>
        </div>
        <div className="price">od <strong>{offer.price} zł</strong> <span>/ os.</span></div>
        <div className="partner-chip">Rekomendacja Tripownia.pl · partner: <strong>{partners[offer.partner].name}</strong></div>
        <div className="meta">
          <span><Plane size={15}/> {offer.departure}</span>
          <span><Moon size={15}/> {offer.nights} noce</span>
          <span><Sun size={15}/> {offer.weather}</span>
        </div>
        <p>{offer.reason}</p>
        <Link className="card-cta" href={`/oferta/${offer.id}`}>Zobacz ofertę na Tripowni <ArrowRight size={17}/></Link>
      </div>
    </article>
  );
}
