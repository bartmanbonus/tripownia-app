"use client";

import Link from "next/link";
import { Heart, Plane, Moon, Sun, ArrowRight, Clock3, Star, Zap, Utensils, CalendarDays, Scale, MapPinned, BadgePercent, Bell } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { featuredOfferIds, publishedOfferOverrides, getLinkMatch, formatPriceCheckedAt } from "@/lib/offers";
import TravelImage from "@/components/TravelImage";
import { useEffect, useRef, useState } from "react";
import { getOfferOverride, type OfferOverride } from "@/lib/clientOfferOverrides";
import { isPriceStale } from "@/lib/offerQuality";
import { isOfferExpired } from "@/lib/offers";
import { ANALYTICS_CONSENT_EVENT, getAnalyticsConsent, trackEvent } from "@/lib/analytics";
import { trackMetaCustomEvent } from "@/lib/metaPixel";
import { readAccountSession } from "@/lib/accountAuth";
import { customerOfferReason } from "@/lib/customerOfferCopy";
import { liveOfferLandingHref } from "@/lib/liveOfferLanding";
import {
  COMPARE_OFFER_SNAPSHOTS_KEY,
  FAVORITE_OFFER_SNAPSHOTS_KEY,
  RECENT_OFFER_IDS_KEY,
  RECENT_OFFER_SNAPSHOTS_KEY,
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

function offerStoryHook(offer: Offer) {
  const categories = (offer.category || []).join(" ").toLowerCase();
  if (/all inclusive/i.test(offer.board || "")) return `🔥 ${offer.nights} nocy All Inclusive — gotowy pakiet na urlop`;
  if (offer.nights <= 4 && /city|weekend|tanio/.test(categories)) return `✈️ Krótki wypad na ${offer.nights} ${offer.nights === 1 ? "noc" : "noce"} — bez długiego urlopu`;
  if (/cieplo|plaza/.test(categories)) return `☀️ Słońce, ${offer.nights} nocy i konkretny termin`;
  return `✨ ${offer.nights} nocy · ${offer.board}`;
}


export default function OfferCard({ offer, priceHighlight, sourceSurface, showIndicativePrice = false }: { offer: Offer; priceHighlight?: PriceHighlight; sourceSurface?: string; showIndicativePrice?: boolean }) {
  const [liked, setLiked] = useState(false);
  const [compared, setCompared] = useState(false);
  const [compareCount, setCompareCount] = useState(0);
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
      setCompareCount(compareIds.length);
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
  const availabilityStatus = override.availabilityStatus ?? publishedOverride.availabilityStatus ?? offer.availabilityStatus ?? "unknown";
  // A commerce price is trusted for 6 hours. Older rows can stay in the broad
  // catalogue, but the customer sees a price-check CTA instead of a stale number.
  const priceStale = isPriceStale(effectiveCheckedAt, 0.25);
  const priceVerified = availabilityStatus === "available" && isExactLink && Boolean(effectiveCheckedAt) && !priceStale;
  const isLiveExact = isLiveOffer && priceVerified;
  const checkedAt = formatPriceCheckedAt(effectiveCheckedAt);
  const isExpired = availabilityStatus === "expired" || isOfferExpired({ ...offer, availabilityStatus });
  const stalePrice = !isExpired && priceStale;
  const customerReason = customerOfferReason(override.note || publishedOverride.note || offer.reason);

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
    source_surface: sourceSurface || "unknown",
  };

  useEffect(() => {
    hydrateViewedOfferIds();
    const node = cardRef.current;
    if (!node || viewedOfferIds.has(offer.id)) return;

    let visibleEnough = false;
    let observer: IntersectionObserver | null = null;

    const trackIfEligible = () => {
      const consent = getAnalyticsConsent();
      if (!visibleEnough || viewedOfferIds.has(offer.id) || !["analytics", "marketing"].includes(consent || "")) return;
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
  }, [offer.id, offer.city, offer.country, offer.partner, displayPrice, isLiveOffer, isLiveExact, isExactLink, sourceSurface]);

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
    setCompareCount(next.length);
    trackEvent(adding ? "compare_add" : "compare_remove", eventBase);
    window.dispatchEvent(new Event("tripownia-compare-updated"));
  }

  function addToTrip() {
    const signedIn = Boolean(readAccountSession());
    const previous = readTrip();
    const sameTrip = previous?.offerId === offer.id;
    const tripId = typeof previous?.tripId === "string" && previous.tripId ? previous.tripId : createTripId(offer.id);
    const nextTrip = sameTrip
      ? { ...previous, offerId: offer.id, tripId, offerSnapshot }
      : { tripId: createTripId(offer.id), offerId: offer.id, offerSnapshot, checklist: {}, dayPlan: [] };
    localStorage.setItem("tripownia-my-trip", JSON.stringify(nextTrip));
    setTripAdded(true);
    trackEvent("trip_add", { ...eventBase, trip_id: nextTrip.tripId, signed_in: signedIn });
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));
  }

  function rememberRecentOffer() {
    const current = readNumberArray(RECENT_OFFER_IDS_KEY).filter((id) => id !== offer.id);
    const next = [offer.id, ...current].slice(0, 8);
    localStorage.setItem(RECENT_OFFER_IDS_KEY, JSON.stringify(next));
    saveOfferSnapshot(RECENT_OFFER_SNAPSHOTS_KEY, offerSnapshot);
    pruneOfferSnapshots(RECENT_OFFER_SNAPSHOTS_KEY, next);
    window.dispatchEvent(new Event("tripownia-recent-offers-updated"));
  }

  function trackOfferClick(placement: "image" | "card_cta" | "card_detail", outboundOverride?: boolean) {
    rememberRecentOffer();
    const outbound = outboundOverride ?? (!isExpired && hasExternalAffiliateUrl);
    const params = { ...eventBase, placement, outbound };

    // Keep the funnel measurable even when a card click immediately leaves
    // Tripownia. offer_click is the bridge between impression and partner exit.
    trackEvent("offer_click", params);
    trackMetaCustomEvent("OfferClick", params);

    if (outbound) {
      trackEvent("outbound_partner_click", params);
      trackMetaCustomEvent("PartnerOutboundClick", params);
    } else {
      trackEvent("offer_open", params);
      trackMetaCustomEvent("OfferOpen", params);
    }
  }

  if (override.hidden || publishedOverride.hidden) return null;

  const liveDetailHref = isLiveOffer && hasExternalAffiliateUrl
    ? liveOfferLandingHref(offerSnapshot, { price: priceVerified ? displayPrice : null, note: customerReason, source: sourceSurface || "offer_card" })
    : "";
  const cardHref = isLiveOffer
    ? (liveDetailHref || "/okazje")
    : `/oferta/${offer.id}`;
  const detailHref = cardHref;
  const buyHref = cardHref;
  const alertParams = new URLSearchParams({
    destination: offer.city,
    departure: offer.departure,
  });
  if (priceVerified) alertParams.set("maxPrice", String(Math.ceil(displayPrice * 1.08)));
  const alertHref = `/alerty?${alertParams.toString()}`;
  const nightsLabel = offer.nights === 1 ? "noc" : offer.nights % 10 >= 2 && offer.nights % 10 <= 4 && !(offer.nights % 100 >= 12 && offer.nights % 100 <= 14) ? "noce" : "nocy";
  const ctaText = isExpired
    ? "Zobacz podobne oferty"
    : "Sprawdź cenę i dostępność";
  const trustText = isExpired
    ? "Oferta wygasła"
    : !priceVerified
      ? checkedAt
        ? `Ostatni odczyt: ${checkedAt} · sprawdź aktualną cenę`
        : "Cena niepotwierdzona · sprawdź aktualną u partnera"
      : checkedAt
        ? `Cena sprawdzona: ${checkedAt}`
        : "Aktualna cena może się zmienić do momentu rezerwacji";

  return (
    <article
      ref={cardRef}
      className={`offer-card offer-card-clean offer-card-conversion ${isFeatured ? "offer-card-featured" : ""} ${isExpired ? "offer-card-expired" : ""}`}
      data-offer-id={offer.id}
      data-offer-price={displayPrice}
      data-price-verified={priceVerified ? "true" : "false"}
      data-price-checked-at={effectiveCheckedAt || ""}
      data-offer-partner={offer.partner}
      data-offer-surface={sourceSurface || "unknown"}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("a,button,input,select,textarea,[role='button']")) return;
        trackOfferClick("card_cta", false);
        window.location.assign(cardHref);
      }}
    >
      <Link href={detailHref} onClick={() => trackOfferClick("image", false)} className="offer-image" aria-label={`Otwórz szczegóły oferty ${offer.city} w Tripowni`}>
        <TravelImage city={offer.city} country={offer.country} alt={`${offer.city}, ${offer.country}`} className="offer-photo-img" overrideSrc={displayImage || offer.image} />
        {isExpired && <span className="badge">WYGASŁA</span>}
        {isFeatured && !isExpired && <span className="admin-featured-badge"><Star size={12} fill="currentColor" /> HIT</span>}
      </Link>

      <button className="heart" aria-label={liked ? "Usuń z ulubionych" : "Dodaj do ulubionych"} onClick={toggleLike}><Heart size={20} fill={liked ? "currentColor" : "none"} /></button>

      <div className="offer-body">
        <div className="offer-topline">
          <div><div className="eyebrow">{offer.flag} {offer.country}</div><h3>{offer.city}</h3></div>
        </div>
        <p className="offer-story-hook">{offerStoryHook(offer)}</p>

        {offer.hotel && <p className="offer-hotel-name">{offer.hotel}</p>}

        {priceHighlight && !isExpired && priceVerified && (
          <div className="offer-price-highlight">
            <BadgePercent size={14} />
            <strong>{priceHighlight.label}</strong>
            {priceHighlight.detail && <span>{priceHighlight.detail}</span>}
          </div>
        )}

        {priceVerified ? (
          <div className="price"><small>od</small>{" "}<strong>{displayPrice.toLocaleString("pl-PL")} zł</strong> <span>/ os.</span></div>
        ) : (
          <div className="price"><strong>Sprawdź aktualną cenę</strong></div>
        )}
        <div className="offer-trust-line"><Clock3 size={12} /> {trustText}</div>
        <div className="offer-date-line"><CalendarDays size={15} /> <strong>{offer.dates}</strong></div>
        <div className="meta">
          <span><Plane size={15} /> {offer.departure}</span>
          <span><Moon size={15} /> {offer.nights} {nightsLabel}</span>
          <span><Utensils size={15} /> {offer.board}</span>
        </div>

        <div className="why-now"><span>DLACZEGO WARTO</span><strong>{customerReason}</strong></div>

        <Link
          className="card-cta"
          href={buyHref}
          onClick={() => trackOfferClick("card_cta", false)}
        >{!isExpired && <Zap size={16} />}{ctaText}<ArrowRight size={17} /></Link>
        {!isExpired && <small className="commercial-disclosure commercial-disclosure-card">Materiał reklamowy</small>}

        {!isExpired && (
          <Link className="offer-alert-link" href={alertHref} onClick={() => trackEvent("offer_alert_click", eventBase)}>
            <Bell size={13}/> Powiadom mnie, gdy pojawi się podobna cena
          </Link>
        )}

        {!isExpired && (
          <div className="offer-actions-row offer-actions-secondary">
            <button className={`compare-toggle ${compared ? "active" : ""}`} onClick={toggleCompare}><Scale size={15} /> {compared ? "W porównaniu" : "Porównaj"}</button>
            <button className={`trip-toggle ${tripAdded ? "active" : ""}`} onClick={addToTrip}><MapPinned size={15} /> {tripAdded ? "W podróży" : "Zapisz do podróży"}</button>
          </div>
        )}

        {(compared || tripAdded) && (
          <div className="offer-after-actions">
            {compared && compareCount >= 2 && <Link href="/porownaj">Porównaj teraz ({compareCount})</Link>}
            {compared && compareCount < 2 && <span className="offer-compare-hint">Dodaj jeszcze 1 ofertę</span>}
            {tripAdded && <Link href="/moja-podroz">Otwórz Moją podróż</Link>}
          </div>
        )}
      </div>
    </article>
  );
}
