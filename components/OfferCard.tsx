"use client";

import Link from "next/link";
import { Heart, Plane, Moon, Sun, ArrowRight, Clock3, Star, Zap, Utensils, CalendarDays, BadgeCheck, Scale, MapPinned } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { featuredOfferIds, publishedOfferOverrides, getLinkMatch, formatPriceCheckedAt } from "@/lib/offers";
import TravelImage from "@/components/TravelImage";
import { useEffect, useState } from "react";
import { getOfferOverride, type OfferOverride } from "@/lib/clientOfferOverrides";
import { isPriceStale } from "@/lib/offerQuality";
import { isOfferExpired } from "@/lib/offers";
import { getDealScore } from "@/lib/dealScore";

function readNumberArray(key: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((value): value is number => typeof value === "number") : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}

function readTrip() {
  try {
    const parsed = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null");
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    localStorage.removeItem("tripownia-my-trip");
    return null;
  }
}

export default function OfferCard({ offer }: { offer: Offer }) {
  const [liked, setLiked] = useState(false);
  const [compared, setCompared] = useState(false);
  const [tripAdded, setTripAdded] = useState(false);
  const [override, setOverride] = useState<OfferOverride>({});

  useEffect(() => {
    const load = () => {
      setOverride(getOfferOverride(offer.id));
      const ids = readNumberArray("tripownia-favorites");
      setLiked(ids.includes(offer.id));
      const compareIds = readNumberArray("tripownia-compare");
      setCompared(compareIds.includes(offer.id));
      const trip = readTrip();
      setTripAdded(trip?.offerId === offer.id);
    };

    load();
    window.addEventListener("tripownia-offer-overrides-updated", load as EventListener);
    window.addEventListener("tripownia-favorites-updated", load as EventListener);
    window.addEventListener("tripownia-compare-updated", load as EventListener);
    window.addEventListener("tripownia-my-trip-updated", load as EventListener);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("tripownia-offer-overrides-updated", load as EventListener);
      window.removeEventListener("tripownia-favorites-updated", load as EventListener);
      window.removeEventListener("tripownia-compare-updated", load as EventListener);
      window.removeEventListener("tripownia-my-trip-updated", load as EventListener);
      window.removeEventListener("storage", load);
    };
  }, [offer.id]);

  const publishedOverride = publishedOfferOverrides[String(offer.id)] || {};
  const displayPrice = override.price ?? publishedOverride.price ?? offer.price;
  const displayImage = override.imageUrl || publishedOverride.imageUrl;
  const isFeatured = override.featured ?? publishedOverride.featured ?? featuredOfferIds.has(offer.id);
  const linkMatch = override.linkMatch || publishedOverride.linkMatch || getLinkMatch(offer);
  const isLiveExact = offer.id >= 1_000_000 && linkMatch === "exact" && /^https?:\/\//.test(offer.affiliateUrl || "");
  const effectiveCheckedAt = override.updatedAt || publishedOverride.updatedAt || offer.priceCheckedAt;
  const checkedAt = formatPriceCheckedAt(effectiveCheckedAt);
  const availabilityStatus = override.availabilityStatus ?? publishedOverride.availabilityStatus ?? offer.availabilityStatus ?? "unknown";
  const isExpired = availabilityStatus === "expired" || isOfferExpired({ ...offer, availabilityStatus });
  const stalePrice = !isExpired && isPriceStale(effectiveCheckedAt);
  const deal = getDealScore(offer, displayPrice, isLiveExact);

  function toggleLike() {
    const ids = readNumberArray("tripownia-favorites");
    const next = ids.includes(offer.id) ? ids.filter((id) => id !== offer.id) : [...ids, offer.id];
    localStorage.setItem("tripownia-favorites", JSON.stringify(next));
    setLiked(next.includes(offer.id));
    window.dispatchEvent(new Event("tripownia-favorites-updated"));
  }

  function toggleCompare() {
    const ids = readNumberArray("tripownia-compare");
    let next: number[];
    if (ids.includes(offer.id)) next = ids.filter((id) => id !== offer.id);
    else next = [...ids.filter((id) => id !== offer.id), offer.id].slice(-3);
    localStorage.setItem("tripownia-compare", JSON.stringify(next));
    setCompared(next.includes(offer.id));
    window.dispatchEvent(new Event("tripownia-compare-updated"));
  }

  function addToTrip() {
    const previous = readTrip();
    const sameTrip = previous?.offerId === offer.id;
    const nextTrip = sameTrip
      ? { ...previous, offerId: offer.id }
      : { offerId: offer.id, checklist: {}, dayPlan: [] };
    localStorage.setItem("tripownia-my-trip", JSON.stringify(nextTrip));
    setTripAdded(true);
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));
  }

  if (override.hidden || publishedOverride.hidden) return null;

  const buyHref = isExpired ? `/oferta/${offer.id}` : isLiveExact ? offer.affiliateUrl : `/go/${offer.id}?source=offer_card`;
  const ctaText = isExpired ? "Zobacz podobne oferty" : isLiveExact ? "Sprawdź tę ofertę" : "Sprawdź aktualną cenę";
  const trustText = isExpired
    ? "Oferta wygasła"
    : isLiveExact
      ? checkedAt ? `Cena z feedu · ${checkedAt}` : "Cena z aktualnego feedu"
      : stalePrice ? "Cena orientacyjna · sprawdź przed rezerwacją" : "Cena orientacyjna";

  return (
    <article className={`offer-card offer-card-clean ${isFeatured ? "offer-card-featured" : ""} ${isExpired ? "offer-card-expired" : ""}`}>
      <Link href={isLiveExact ? offer.affiliateUrl : `/oferta/${offer.id}`} target={isLiveExact ? "_blank" : undefined} rel={isLiveExact ? "sponsored noopener noreferrer" : undefined} className="offer-image" aria-label={`Otwórz szczegóły oferty ${offer.city}`}>
        <TravelImage city={offer.city} country={offer.country} alt={`${offer.city}, ${offer.country}`} className="offer-photo-img" overrideSrc={displayImage || offer.image} />
        <span className={`badge ${(isLiveExact || offer.partner !== "exim") && offer.tag === "BIERZEMY" ? "hot" : ""}`}>{isExpired ? "WYGASŁA" : offer.tag}</span>
        {isFeatured && <span className="admin-featured-badge"><Star size={12} fill="currentColor" /> HIT</span>}
      </Link>

      <button className="heart" aria-label={liked ? "Usuń z ulubionych" : "Dodaj do ulubionych"} onClick={toggleLike}><Heart size={20} fill={liked ? "currentColor" : "none"} /></button>

      <div className="offer-body">
        <div className="offer-topline">
          <div><div className="eyebrow">{offer.flag} {offer.country}</div><h3>{offer.city}</h3></div>
          <div className="score"><strong>{offer.score}</strong><span>/10</span></div>
        </div>

        {!isExpired && (
          <div className={`deal-score deal-score-compact deal-score-${deal.verdict === "BIERZ" ? "buy" : deal.verdict === "DOBRA OPCJA" ? "good" : "check"}`} title={`Pewność oceny: ${deal.confidence}${stalePrice ? " · cena może być nieaktualna" : ""}`}>
            <BadgeCheck size={15} />
            <span>Deal Score</span>
            <strong>{deal.score}/100</strong>
            <em>{deal.verdict}</em>
          </div>
        )}

        <div className="price"><small>od</small>{" "}<strong>{displayPrice.toLocaleString("pl-PL")} zł</strong> <span>/ os.</span></div>
        <div className="offer-trust-line"><Clock3 size={12} /> {trustText}</div>

        <div className="offer-date-line"><CalendarDays size={15} /> <strong>{offer.dates}</strong></div>
        <div className="meta">
          <span><Plane size={15} /> {offer.departure}</span>
          <span><Moon size={15} /> {offer.nights} nocy</span>
          <span><Sun size={15} /> {offer.weather}</span>
          <span><Utensils size={15} /> {offer.board}</span>
        </div>

        <div className="why-now"><span>DLACZEGO WARTO</span><strong>{override.note || publishedOverride.note || offer.reason}</strong></div>

        {!isExpired && (
          <div className="offer-actions-row">
            <button className={`compare-toggle ${compared ? "active" : ""}`} onClick={toggleCompare}><Scale size={15} /> {compared ? "W porównaniu" : "Porównaj"}</button>
            <button className={`trip-toggle ${tripAdded ? "active" : ""}`} onClick={addToTrip}><MapPinned size={15} /> {tripAdded ? "W podróży" : "Moja podróż"}</button>
          </div>
        )}

        <a className="card-cta" href={buyHref} target={isLiveExact ? "_blank" : undefined} rel={isExpired ? undefined : isLiveExact ? "sponsored noopener noreferrer" : "sponsored"}>{!isExpired && <Zap size={16} />}{ctaText}<ArrowRight size={17} /></a>

        {(compared || tripAdded) && (
          <div className="offer-after-actions">
            {compared && <Link href="/porownaj">Otwórz porównanie</Link>}
            {tripAdded && <Link href="/moja-podroz">Otwórz Moją podróż</Link>}
          </div>
        )}
      </div>
    </article>
  );
}
