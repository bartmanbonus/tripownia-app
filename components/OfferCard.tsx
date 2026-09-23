"use client";

import Link from "next/link";
import { Heart, Plane, Moon, Sun, ArrowRight, Clock3, Star, Zap, Utensils, CalendarDays, BadgeCheck, Scale, MapPinned, BadgePercent } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { featuredOfferIds, publishedOfferOverrides, getLinkMatch, formatPriceCheckedAt } from "@/lib/offers";
import TravelImage from "@/components/TravelImage";
import { useEffect, useRef, useState } from "react";
import { getOfferOverride, type OfferOverride } from "@/lib/clientOfferOverrides";
import { isPriceStale } from "@/lib/offerQuality";
import { isOfferExpired } from "@/lib/offers";
import { getDealScore } from "@/lib/dealScore";
import { ANALYTICS_CONSENT_EVENT, getAnalyticsConsent, trackEvent } from "@/lib/analytics";
import { readAccountSession } from "@/lib/accountAuth";
import {
  COMPARE_OFFER_SNAPSHOTS_KEY,
  FAVORITE_OFFER_SNAPSHOTS_KEY,
  pruneOfferSnapshots,
  removeOfferSnapshot,
  saveOfferSnapshot,
} from "@/lib/savedOfferSnapshots";

const OFFER_VIEW_SESSION_KEY = "tripownia-viewed-offers-v1";
const viewedOfferIds = new Set<number>();
let hydratedViewedOfferIds = false;

type PriceHighlight = {
  label: string;
  detail?: string;
};

function createTripId(offerId: number) {
  return `trip-${offerId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hydrateViewedOfferIds() {
  if (hydratedViewedOfferIds || typeof window === "undefined") return;
  hydratedViewedOfferIds = true;

  try {
    const parsed = JSON.parse(sessionStorage.getItem(OFFER_VIEW_SESSION_KEY) || "[]");
    if (!Array.isArray(parsed)) return;
    parsed.forEach((value) => {
      if (typeof value === "number" && Number.isFinite(value)) viewedOfferIds.add(value);
    });
  } catch {
    sessionStorage.removeItem(OFFER_VIEW_SESSION_KEY);
  }
}

function rememberViewedOffer(id: number) {
  viewedOfferIds.add(id);
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(OFFER_VIEW_SESSION_KEY, JSON.stringify([...viewedOfferIds]));
  } catch {}
}

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

export default function OfferCard({ offer, priceHighlight }: { offer: Offer; priceHighlight?: PriceHighlight }) {
  const [liked, setLiked] = useState(false);
  const [compared, setCompared] = useState(false);
  const [tripAdded, setTripAdded] = useState(false);
  const [override, setOverride] = useState<OfferOverride>({});
  const cardRef = useRef<HTMLElement | null>(null);

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
  const linkMatch = override.linkMatch || publishedOfferOverrides[String(offer.id)]?.linkMatch || getLinkMatch(offer);
  const hasExternalAffiliateUrl = /^https?:\/\//.test(offer.affiliateUrl || "");
  const isLiveOffer = offer.id >= 1_000_000;
  const isExactLink = linkMatch === "exact" && hasExternalAffiliateUrl;
  const isLivePartnerLink = isLiveOffer && hasExternalAffiliateUrl;
  const effectiveCheckedAt = override.updatedAt || publishedOverride.updatedAt || offer.priceCheckedAt;
  const priceStale = isPriceStale(effectiveCheckedAt);
  const isLiveExact = isLiveOffer && isExactLink && Boolean(effectiveCheckedAt) && !priceStale;
  const checkedAt = formatPriceCheckedAt(effectiveCheckedAt);
  const availabilityStatus = override.availabilityStatus ?? publishedOverride.availabilityStatus ?? offer.availabilityStatus ?? "unknown";
  const isExpired = availabilityStatus === "expired" || isOfferExpired({ ...offer, availabilityStatus });
  const stalePrice = !isExpired && priceStale;
  const deal = getDealScore(offer, displayPrice, isLiveExact);

  const offerSnapshot: Offer = {
    ...offer,
    price: displayPrice,
    image: displayImage || offer.image,
    linkMatch,
    priceCheckedAt: effectiveCheckedAt,
    availabilityStatus,
  };

  const eventBase = {
    offer_id: offer.id,
    destination: offer.city,
    country: offer.country,
    partner: offer.partner,
    price: displayPrice,
    live_offer: isLiveOffer,
    live_exact: isLiveExact,
    exact_link: isExactLink,
  };

  useEffect(() => {
    hydrateViewedOfferIds();
    const node = cardRef.current;
    if (!node || viewedOfferIds.has(offer.id)) return;

    let visibleEnough = false;
    let observer: IntersectionObserver | null = null;

    const trackIfEligible = () => {
      if (!visibleEnough || viewedOfferIds.has(offer.id) || getAnalyticsConsent() !== "analytics") return;
      rememberViewedOffer(offer.id);
      trackEvent("offer_view", eventBase);
      observer?.disconnect();
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        visibleEnough = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.5);
        trackIfEligible();
      }, { threshold: [0.5] });
      observer.observe(node);
    } else {
      visibleEnough = true;
      trackIfEligible();
    }

    const handleConsent = () => trackIfEligible();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsent as EventListener);

    return () => {
      observer?.disconnect();
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsent as EventListener);
    };
  }, [offer.id, offer.city, offer.country, offer.partner, displayPrice, isLiveOffer, isLiveExact, isExactLink]);

  function toggleLike() {
    const ids = readNumberArray("tripownia-favorites");
    const adding = !ids.includes(offer.id);
    const next = adding ? [...ids, offer.id] : ids.filter((id) => id !== offer.id);
    localStorage.setItem("tripownia-favorites", JSON.stringify(next));
    if (adding) saveOfferSnapshot(FAVORITE_OFFER_SNAPSHOTS_KEY, offerSnapshot);
    else removeOfferSnapshot(FAVORITE_OFFER_SNAPSHOTS_KEY, offer.id);
    pruneOfferSnapshots(FAVORITE_OFFER_SNAPSHOTS_KEY, next);
    setLiked(adding);
    trackEvent(adding ? "favorite_add" : "favorite_remove", eventBase);
    window.dispatchEvent(new Event("tripownia-favorites-updated"));
  }

  function toggleCompare() {
    const ids = readNumberArray("tripownia-compare");
    const adding = !ids.includes(offer.id);
    let next: number[];
    if (!adding) next = ids.filter((id) => id !== offer.id);
    else next = [...ids.filter((id) => id !== offer.id), offer.id].slice(-3);
    localStorage.setItem("tripownia-compare", JSON.stringify(next));
    if (adding) saveOfferSnapshot(COMPARE_OFFER_SNAPSHOTS_KEY, offerSnapshot);
    else removeOfferSnapshot(COMPARE_OFFER_SNAPSHOTS_KEY, offer.id);
    pruneOfferSnapshots(COMPARE_OFFER_SNAPSHOTS_KEY, next);
    setCompared(next.includes(offer.id));
    trackEvent(adding ? "compare_add" : "compare_remove", eventBase);
    window.dispatchEvent(new Event("tripownia-compare-updated"));
  }

  function addToTrip() {
    if (!readAccountSession()) {
      try { sessionStorage.setItem("tripownia-pending-offer-v1", JSON.stringify(offerSnapshot)); } catch {}
      window.location.href = "/konto?next=/dodaj-podroz";
      return;
    }
    const previous = readTrip();
    const sameTrip = previous?.offerId === offer.id;
    const tripId = typeof previous?.tripId === "string" && previous.tripId ? previous.tripId : createTripId(offer.id);
    const nextTrip = sameTrip
      ? { ...previous, offerId: offer.id, tripId, offerSnapshot }
      : { tripId: createTripId(offer.id), offerId: offer.id, offerSnapshot, checklist: {}, dayPlan: [] };
    localStorage.setItem("tripownia-my-trip", JSON.stringify(nextTrip));
    setTripAdded(true);
    trackEvent("trip_add", { ...eventBase, trip_id: nextTrip.tripId });
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));
  }

  function trackOfferClick(placement: "image" | "card_cta") {
    const outbound = !isExpired && hasExternalAffiliateUrl;
    trackEvent(outbound ? "outbound_partner_click" : "offer_open", { ...eventBase, placement });
  }

  if (override.hidden || publishedOverride.hidden) return null;

  const directAffiliate = !isExpired && hasExternalAffiliateUrl;
  const cardHref = directAffiliate
    ? offer.affiliateUrl
    : isLiveOffer
      ? "/okazje"
      : `/oferta/${offer.id}`;
  const buyHref = cardHref;
  const ctaText = isExpired
    ? "Zobacz podobne oferty"
    : isLiveExact
      ? "Sprawdź dostępność i rezerwuj"
      : isExactLink
        ? "Sprawdź dostępność i rezerwuj"
        : "Sprawdź aktualną cenę";
  const trustText = isExpired
    ? "Oferta wygasła"
    : isLiveExact
      ? checkedAt ? `Cena z feedu · ${checkedAt}` : "Cena z aktualnego feedu"
      : isExactLink
        ? "Dokładny link do oferty · finalna cena u partnera"
        : isLiveOffer
          ? "Oferta z feedu · finalna cena u partnera"
          : "Cena orientacyjna · finalna cena u partnera";

  return (
    <article
      ref={cardRef}
      className={`offer-card offer-card-clean offer-card-conversion ${isFeatured ? "offer-card-featured" : ""} ${isExpired ? "offer-card-expired" : ""}`}
      data-offer-id={offer.id}
      data-offer-price={displayPrice}
      data-offer-partner={offer.partner}
    >
      {directAffiliate ? (
        <a
          href={cardHref}
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={() => trackOfferClick("image")}
          className="offer-image"
          aria-label={`Otwórz ofertę ${offer.city} u partnera`}
        >
          <TravelImage city={offer.city} country={offer.country} alt={`${offer.city}, ${offer.country}`} className="offer-photo-img" overrideSrc={displayImage || offer.image} />
          <span className={`badge ${(isLiveExact || offer.partner !== "exim") && offer.tag === "BIERZEMY" ? "hot" : ""}`}>{isExpired ? "WYGASŁA" : offer.tag}</span>
          {isFeatured && <span className="admin-featured-badge"><Star size={12} fill="currentColor" /> HIT</span>}
        </a>
      ) : (
        <Link href={cardHref} onClick={() => trackOfferClick("image")} className="offer-image" aria-label={`Otwórz szczegóły oferty ${offer.city}`}>
          <TravelImage city={offer.city} country={offer.country} alt={`${offer.city}, ${offer.country}`} className="offer-photo-img" overrideSrc={displayImage || offer.image} />
          <span className={`badge ${(isLiveExact || offer.partner !== "exim") && offer.tag === "BIERZEMY" ? "hot" : ""}`}>{isExpired ? "WYGASŁA" : offer.tag}</span>
          {isFeatured && <span className="admin-featured-badge"><Star size={12} fill="currentColor" /> HIT</span>}
        </Link>
      )}

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

        {priceHighlight && !isExpired && (
          <div className="offer-price-highlight">
            <BadgePercent size={14} />
            <strong>{priceHighlight.label}</strong>
            {priceHighlight.detail && <span>{priceHighlight.detail}</span>}
          </div>
        )}

        <div className="price"><small>od</small>{" "}<strong>{displayPrice.toLocaleString("pl-PL")} zł</strong> <span>/ os.</span></div>
        <div className="offer-trust-line"><Clock3 size={12} /> {trustText}</div>

        <div className="offer-date-line"><CalendarDays size={15} /> <strong>{offer.dates}</strong></div>
        <div className="meta">
          <span><Plane size={15} /> {offer.departure}</span>
          <span><Moon size={15} /> {offer.nights} nocy</span>
          <span><Utensils size={15} /> {offer.board}</span>
        </div>

        <div className="why-now"><span>DLACZEGO WARTO</span><strong>{override.note || publishedOverride.note || offer.reason}</strong></div>

        <a
          className="card-cta"
          href={buyHref}
          target={directAffiliate ? "_blank" : undefined}
          rel={directAffiliate ? "sponsored noopener noreferrer" : undefined}
          onClick={() => trackOfferClick("card_cta")}
        >{!isExpired && <Zap size={16} />}{ctaText}<ArrowRight size={17} /></a>

        {!isExpired && (
          <div className="offer-actions-row offer-actions-secondary">
            <button className={`compare-toggle ${compared ? "active" : ""}`} onClick={toggleCompare}><Scale size={15} /> {compared ? "W porównaniu" : "Porównaj"}</button>
            <button className={`trip-toggle ${tripAdded ? "active" : ""}`} onClick={addToTrip}><MapPinned size={15} /> {tripAdded ? "W podróży" : "Zapisz do podróży"}</button>
          </div>
        )}

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
