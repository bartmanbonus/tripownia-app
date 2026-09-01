"use client";

import Link from "next/link";
import { Heart, Plane, Moon, Sun, ArrowRight, Clock3, Star } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { featuredOfferIds, publishedOfferOverrides, getLinkMatch } from "@/lib/offers";
import { partners } from "@/lib/partners";
import TravelImage from "@/components/TravelImage";
import { useEffect, useMemo, useState } from "react";
import { getOfferOverride, type OfferOverride } from "@/lib/clientOfferOverrides";

export default function OfferCard({ offer }: { offer: Offer }) {
  const [liked, setLiked] = useState(false);
  const [override, setOverride] = useState<OfferOverride>({});

  useEffect(() => {
    const load = () => {
      setOverride(getOfferOverride(offer.id));
      const ids = JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[];
      setLiked(ids.includes(offer.id));
    };
    load();
    window.addEventListener("tripownia-offer-overrides-updated", load as EventListener);
    return () => window.removeEventListener("tripownia-offer-overrides-updated", load as EventListener);
  }, [offer.id]);

  const publishedOverride = publishedOfferOverrides[String(offer.id)] || {};
  const displayPrice = override.price ?? offer.price;
  const displayUrl = override.affiliateUrl || offer.affiliateUrl;
  const displayImage = override.imageUrl || publishedOverride.imageUrl;
  const isFeatured = override.featured ?? featuredOfferIds.has(offer.id);
  const linkMatch = override.linkMatch || getLinkMatch(offer);

  function toggleLike() {
    const ids = JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[];
    const next = ids.includes(offer.id) ? ids.filter(id => id !== offer.id) : [...ids, offer.id];
    localStorage.setItem("tripownia-favorites", JSON.stringify(next));
    setLiked(next.includes(offer.id));
    window.dispatchEvent(new Event("tripownia-favorites-updated"));
  }

  if (override.hidden) return null;

  return (
    <article className={`offer-card ${isFeatured ? "offer-card-featured" : ""}`}>
      <Link href={`/oferta/${offer.id}`} className="offer-image" aria-label={`Otwórz ofertę ${offer.city}`}>
        <TravelImage
          city={offer.city}
          country={offer.country}
          alt={`${offer.city}, ${offer.country}`}
          className="offer-photo-img"
          overrideSrc={displayImage}
        />
        <span className={`badge ${offer.tag === "BIERZEMY" ? "hot" : ""}`}>{offer.tag}</span>
        {isFeatured && <span className="admin-featured-badge"><Star size={12} fill="currentColor"/> HIT</span>}
      </Link>

      <button className="heart" aria-label="Dodaj do ulubionych" onClick={toggleLike}>
        <Heart size={20} fill={liked ? "currentColor" : "none"}/>
      </button>

      <div className="offer-body">
        <div className="offer-topline">
          <div><div className="eyebrow">{offer.flag} {offer.country}</div><h3>{offer.city}</h3></div>
          <div className="score"><strong>{offer.score}</strong><span>/10</span></div>
        </div>

        <div className="price">od <strong>{displayPrice} zł</strong> <span>/ os.</span></div>

        <div className="price-status">
          <Clock3 size={13}/>
          {linkMatch === "exact"
            ? "Konkretna oferta · sprawdź aktualną cenę u partnera"
            : linkMatch === "parameters"
              ? "Ostatnio od tej ceny · link otwiera wyszukiwanie z podobnymi parametrami"
              : "Cena z ostatniej selekcji · link otwiera aktualne oferty dla kierunku"}
        </div>

        <div className="partner-chip">
          Rekomendacja Tripownia.pl · partner: <strong>{partners[offer.partner].name}</strong>
        </div>

        <div className="meta">
          <span><Plane size={15}/> {offer.departure}</span>
          <span><Moon size={15}/> {offer.nights} noce</span>
          <span><Sun size={15}/> {offer.weather}</span>
        </div>

        <p>{override.note || offer.reason}</p>

        <Link className="card-cta" href={`/oferta/${offer.id}`}>
          Zobacz ofertę na Tripowni <ArrowRight size={17}/>
        </Link>

        {override.affiliateUrl && (
          <a className="admin-preview-link" href={displayUrl} target="_blank" rel="sponsored noopener noreferrer">
            Podgląd nowego linku partnera →
          </a>
        )}
      </div>
    </article>
  );
}
