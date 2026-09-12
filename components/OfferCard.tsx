"use client";

import Link from "next/link";
import { Heart, Plane, Moon, Sun, ArrowRight, Clock3, Star, Zap, Utensils, CalendarDays, BadgeCheck, Scale, TrendingDown, TrendingUp, Minus, MapPinned } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { featuredOfferIds, publishedOfferOverrides, getLinkMatch, formatPriceCheckedAt } from "@/lib/offers";
import TravelImage from "@/components/TravelImage";
import { useEffect, useState } from "react";
import { getOfferOverride, type OfferOverride } from "@/lib/clientOfferOverrides";
import { isPriceStale } from "@/lib/offerQuality";
import { isOfferExpired } from "@/lib/offers";
import { getDealScore } from "@/lib/dealScore";
import { getPriceDecision } from "@/lib/priceDecision";

export default function OfferCard({ offer }: { offer: Offer }) {
  const [liked, setLiked] = useState(false);
  const [compared, setCompared] = useState(false);
  const [tripAdded, setTripAdded] = useState(false);
  const [override, setOverride] = useState<OfferOverride>({});

  useEffect(() => {
    const load = () => {
      setOverride(getOfferOverride(offer.id));
      const ids = JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[];
      setLiked(ids.includes(offer.id));
      const compareIds = JSON.parse(localStorage.getItem("tripownia-compare") || "[]") as number[];
      setCompared(compareIds.includes(offer.id));
      const trip = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null") as { offerId?: number } | null;
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
  const priceDecision = getPriceDecision(offer, displayPrice);

  function toggleLike() {
    const ids = JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[];
    const next = ids.includes(offer.id) ? ids.filter((id) => id !== offer.id) : [...ids, offer.id];
    localStorage.setItem("tripownia-favorites", JSON.stringify(next));
    setLiked(next.includes(offer.id));
    window.dispatchEvent(new Event("tripownia-favorites-updated"));
  }

  function toggleCompare() {
    const ids = JSON.parse(localStorage.getItem("tripownia-compare") || "[]") as number[];
    let next: number[];
    if (ids.includes(offer.id)) next = ids.filter((id) => id !== offer.id);
    else next = [...ids.filter((id) => id !== offer.id), offer.id].slice(-3);
    localStorage.setItem("tripownia-compare", JSON.stringify(next));
    setCompared(next.includes(offer.id));
    window.dispatchEvent(new Event("tripownia-compare-updated"));
  }

  function addToTrip() {
    const previous = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null") as Record<string, unknown> | null;
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
  const ctaText = isExpired ? "Zobacz podobne oferty" : linkMatch === "exact" ? "Sprawdź tę ofertę" : "Sprawdź aktualne opcje";
  const TrendIcon = priceDecision.trend === "spada" ? TrendingDown : priceDecision.trend === "rośnie" ? TrendingUp : Minus;

  return (
    <article className={`offer-card ${isFeatured ? "offer-card-featured" : ""} ${isExpired ? "offer-card-expired" : ""}`}>
      <Link href={isLiveExact ? offer.affiliateUrl : `/oferta/${offer.id}`} target={isLiveExact ? "_blank" : undefined} rel={isLiveExact ? "sponsored noopener noreferrer" : undefined} className="offer-image" aria-label={`Otwórz szczegóły oferty ${offer.city}`}>
        <TravelImage city={offer.city} country={offer.country} alt={`${offer.city}, ${offer.country}`} className="offer-photo-img" overrideSrc={displayImage || offer.image} />
        <span className={`badge ${(isLiveExact || offer.partner !== "exim") && offer.tag === "BIERZEMY" ? "hot" : ""}`}>{isExpired ? "WYGASŁA" : offer.tag}</span>
        {isFeatured && <span className="admin-featured-badge"><Star size={12} fill="currentColor" /> HIT</span>}
      </Link>

      <button className="heart" aria-label="Dodaj do ulubionych" onClick={toggleLike}><Heart size={20} fill={liked ? "currentColor" : "none"} /></button>

      <div className="offer-body">
        <div className="offer-topline">
          <div><div className="eyebrow">{offer.flag} {offer.country}</div><h3>{offer.city}</h3></div>
          <div className="score"><strong>{offer.score}</strong><span>/10</span></div>
        </div>

        {!isExpired && (
          <div className={`deal-score deal-score-${deal.verdict === "BIERZ" ? "buy" : deal.verdict === "DOBRA OPCJA" ? "good" : "check"}`}>
            <div className="deal-score-main"><div className="deal-score-number">{deal.score}<span>/100</span></div><div><span className="deal-score-label">TRIPOWNIA DEAL SCORE</span><strong><BadgeCheck size={16} /> {deal.verdict}</strong></div></div>
            <div className="deal-score-reasons">{deal.reasons.map((reason) => <span key={reason}>{reason}</span>)}</div>
            <small>Pewność oceny: {deal.confidence}{stalePrice ? " · cena może być nieaktualna" : ""}</small>
          </div>
        )}

        {!isExpired && (
          <div className={`price-decision price-decision-${priceDecision.action === "BRAĆ" ? "buy" : priceDecision.action === "OBSERWUJ" ? "watch" : "check"}`}>
            <div className="price-decision-head"><TrendIcon size={18} /><strong>{priceDecision.action}</strong><span>· {priceDecision.trend}</span></div>
            <p>{priceDecision.message}</p>
          </div>
        )}

        <div className="price"><small>cena od</small>{" "}<strong>{displayPrice.toLocaleString("pl-PL")} zł</strong> <span>/ os.</span></div>
        <div className="price-status"><Clock3 size={13} />{isExpired ? "Ta oferta wygasła — pokażemy podobne aktualne propozycje" : isLiveExact ? checkedAt ? `Dane z feedu sprawdzone: ${checkedAt}` : "Dane z aktualnego feedu partnera" : "Cena orientacyjna — sprawdź aktualną cenę przed rezerwacją"}</div>
        <div className="partner-chip partner-chip-tripownia"><strong>{isLiveExact ? "Oferta z feedu partnera" : "Inspiracja Tripowni"}</strong>{isLiveExact ? " · dostępność potwierdzisz przed płatnością" : " · cena nie jest potwierdzona na żywo"}</div>
        <div className="offer-date-line"><CalendarDays size={15} /> <strong>{offer.dates}</strong></div>
        <div className="meta"><span><Plane size={15} /> {offer.departure}</span><span><Moon size={15} /> {offer.nights} noce</span><span><Sun size={15} /> {offer.weather}</span><span><Utensils size={15} /> {offer.board}</span></div>
        <div className="why-now"><span>✨ DLACZEGO TERAZ</span><strong>{override.note || publishedOverride.note || offer.reason}</strong></div>

        {!isExpired && <button className={`compare-toggle ${compared ? "active" : ""}`} onClick={toggleCompare}><Scale size={16} /> {compared ? "Dodano do porównania" : "Porównaj"}</button>}
        {compared && <Link className="compare-link" href="/porownaj">Przejdź do porównania →</Link>}

        {!isExpired && <button className={`trip-toggle ${tripAdded ? "active" : ""}`} onClick={addToTrip}><MapPinned size={16} /> {tripAdded ? "W Mojej podróży" : "Dodaj do Mojej podróży"}</button>}
        {tripAdded && <Link className="compare-link" href="/moja-podroz">Otwórz Moją podróż →</Link>}

        <a className="card-cta" href={buyHref} target={isLiveExact ? "_blank" : undefined} rel={isExpired ? undefined : isLiveExact ? "sponsored noopener noreferrer" : "sponsored"}>{!isExpired && <Zap size={16} />}{ctaText}<ArrowRight size={17} /></a>

        {!isExpired && (isLiveExact ? <a className="admin-preview-link" href={offer.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer">Zobacz szczegóły i warunki →</a> : <Link className="admin-preview-link" href={`/oferta/${offer.id}`}>Zobacz szczegóły i warunki →</Link>)}
      </div>
    </article>
  );
}
