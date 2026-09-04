"use client";

import Link from "next/link";
import { Heart, Plane, Moon, Sun, ArrowRight, Clock3, Star, Zap, Utensils } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { featuredOfferIds, publishedOfferOverrides, getLinkMatch, formatPriceCheckedAt } from "@/lib/offers";
import { partners } from "@/lib/partners";
import TravelImage from "@/components/TravelImage";
import EximLivePrice from "@/components/EximLivePrice";
import EskyLivePackagePrice from "@/components/EskyLivePackagePrice";
import { useEffect, useState } from "react";
import { getOfferOverride, type OfferOverride } from "@/lib/clientOfferOverrides";
import { isPriceStale } from "@/lib/offerQuality";
import { isOfferExpired } from "@/lib/offers";

export default function OfferCard({ offer }: { offer: Offer }) {
  const [liked, setLiked] = useState(false);
  const [override, setOverride] = useState<OfferOverride>({});
  const [eximState, setEximState] = useState<{ loading: boolean; available: boolean; price?: number; isStillDeal?: boolean }>({ loading: offer.partner === "exim", available: offer.partner !== "exim" });
  const [eskyState, setEskyState] = useState<{ loading: boolean; verified: boolean; price?: number }>({ loading: offer.partner === "esky", verified: false });

  useEffect(() => {
    const load = () => {
      setOverride(getOfferOverride(offer.id));
      const ids = JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[];
      setLiked(ids.includes(offer.id));
    };

    load();
    window.addEventListener("tripownia-offer-overrides-updated", load as EventListener);
    window.addEventListener("tripownia-favorites-updated", load as EventListener);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("tripownia-offer-overrides-updated", load as EventListener);
      window.removeEventListener("tripownia-favorites-updated", load as EventListener);
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
  const availabilityStatus =
    override.availabilityStatus ??
    publishedOverride.availabilityStatus ??
    offer.availabilityStatus ??
    "unknown";

  const isExpired =
    availabilityStatus === "expired" ||
    isOfferExpired({ ...offer, availabilityStatus });

  const stalePrice = !isExpired && isPriceStale(effectiveCheckedAt);

  function toggleLike() {
    const ids = JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[];
    const next = ids.includes(offer.id)
      ? ids.filter((id) => id !== offer.id)
      : [...ids, offer.id];

    localStorage.setItem("tripownia-favorites", JSON.stringify(next));
    setLiked(next.includes(offer.id));
    window.dispatchEvent(new Event("tripownia-favorites-updated"));
  }

  if (override.hidden || publishedOverride.hidden) return null;

  // Nie pokazujemy w sekcji okazji EXIM-u, jeśli live feed potwierdził, że cena mocno odjechała od ceny referencyjnej.
  if (!isLiveExact && offer.partner === "exim" && !eximState.loading && eximState.available && eximState.isStillDeal === false) return null;

  const buyHref = isExpired
    ? `/oferta/${offer.id}`
    : isLiveExact
      ? offer.affiliateUrl
      : `/go/${offer.id}?source=offer_card`;

  const ctaText = isExpired
    ? "Zobacz podobne oferty"
    : linkMatch === "exact"
      ? "Biorę tę ofertę"
      : "Sprawdź najtańszą teraz";

  return (
    <article
      className={`offer-card ${isFeatured ? "offer-card-featured" : ""} ${
        isExpired ? "offer-card-expired" : ""
      }`}
    >
      <Link
        href={isLiveExact ? offer.affiliateUrl : `/oferta/${offer.id}`}
        target={isLiveExact ? "_blank" : undefined}
        rel={isLiveExact ? "sponsored noopener noreferrer" : undefined}
        className="offer-image"
        aria-label={`Otwórz szczegóły oferty ${offer.city}`}
      >
        <TravelImage
          city={offer.city}
          country={offer.country}
          alt={`${offer.city}, ${offer.country}`}
          className="offer-photo-img"
          overrideSrc={displayImage || offer.image}
        />
        <span className={`badge ${(isLiveExact || offer.partner !== "exim") && offer.tag === "BIERZEMY" ? "hot" : ""}`}>
          {isExpired
            ? "WYGASŁA"
            : isLiveExact
              ? offer.tag
              : offer.partner === "exim"
                ? eximState.loading
                  ? "SPRAWDZAMY"
                  : !eximState.available
                    ? "DO WERYFIKACJI"
                    : offer.tag
                : offer.tag}
        </span>
        {isFeatured && (
          <span className="admin-featured-badge">
            <Star size={12} fill="currentColor" /> HIT
          </span>
        )}
      </Link>

      <button className="heart" aria-label="Dodaj do ulubionych" onClick={toggleLike}>
        <Heart size={20} fill={liked ? "currentColor" : "none"} />
      </button>

      <div className="offer-body">
        <div className="offer-topline">
          <div>
            <div className="eyebrow">
              {offer.flag} {offer.country}
            </div>
            <h3>{offer.city}</h3>
          </div>
          <div className="score">
            <strong>{offer.score}</strong>
            <span>/10</span>
          </div>
        </div>

        <div className="price">
          <small>{isLiveExact ? `aktualnie w ${partners[offer.partner].name} od` : offer.partner === "exim" ? "aktualnie w EXIM od" : offer.partner === "esky" ? (eskyState.verified ? "aktualnie w eSky od" : "ostatnio znaleziona cena od") : "ostatnio potwierdziliśmy od"}</small>{" "}
          {isLiveExact ? (
            <><strong>{displayPrice} zł</strong> <span>/ os.</span></>
          ) : offer.partner === "exim" ? (
            <EximLivePrice destination={offer.city} country={offer.country} from={offer.airportCode} nights={offer.nights} board={offer.board} fallbackPrice={displayPrice} compact onStateChange={setEximState} />
          ) : offer.partner === "esky" ? (
            <EskyLivePackagePrice offerId={offer.id} fallbackPrice={displayPrice} board={offer.board} compact onStateChange={setEskyState} />
          ) : (
            <><strong>{displayPrice} zł</strong> <span>/ os.</span></>
          )}
        </div>

        <div className="price-status">
          <Clock3 size={13} />
          {isExpired
            ? "Ta oferta wygasła — pokażemy podobne aktualne propozycje"
            : isLiveExact
              ? "Cena i konkretna oferta pobrane automatycznie z aktualnego feedu partnera"
            : offer.partner === "esky"
              ? eskyState.loading
                ? "Automatycznie sprawdzamy cenę już na tej karcie"
                : eskyState.verified
                  ? "Cena potwierdzona dla właściwego kierunku w eSky"
                  : "* Aktualną cenę potwierdzimy po przejściu do eSky"
              : checkedAt
                ? `Cena sprawdzana ${checkedAt} · po kliknięciu potwierdzamy ją u partnera`
                : "Po kliknięciu potwierdzamy aktualną cenę u partnera"}
        </div>

        <div className="partner-chip">
          Selekcja Tripownia.pl · partner: <strong>{partners[offer.partner].name}</strong>
        </div>

        <div className="meta">
          <span>
            <Plane size={15} /> {offer.departure}
          </span>
          <span>
            <Moon size={15} /> {offer.nights} noce
          </span>
          <span>
            <Sun size={15} /> {offer.weather}
          </span>
          {offer.partner !== "esky" && (
            <span><Utensils size={15} /> {offer.board}</span>
          )}
        </div>

        <div className="why-now">
          <span>✨ DLACZEGO TERAZ</span>
          <strong>{override.note || publishedOverride.note || offer.reason}</strong>
        </div>

        <a
          className="card-cta"
          href={buyHref}
          target={isLiveExact ? "_blank" : undefined}
          rel={isExpired ? undefined : isLiveExact ? "sponsored noopener noreferrer" : "sponsored"}
        >
          {!isExpired && <Zap size={16} />}
          {ctaText}
          <ArrowRight size={17} />
        </a>

        {!isExpired && (
          isLiveExact ? (
            <a className="admin-preview-link" href={offer.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer">
              Zobacz szczegóły i warunki u partnera →
            </a>
          ) : (
            <Link className="admin-preview-link" href={`/oferta/${offer.id}`}>
              Zobacz szczegóły i warunki →
            </Link>
          )
        )}
      </div>
    </article>
  );
}
