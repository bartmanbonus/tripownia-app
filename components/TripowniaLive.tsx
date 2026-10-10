"use client";

import Link from "next/link";
import { Bell, Clock3, Flame, ArrowRight, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getLinkMatch, type Offer } from "@/lib/offers";
import { isPriceStale } from "@/lib/offerQuality";
import { liveOfferLandingHref } from "@/lib/liveOfferLanding";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";

type ApiResponse = { offers?: Offer[]; checkedAt?: string; sourceType?: string; fallback?: boolean };

function ageLabel(value?: string) {
  if (!value) return "sprawdź cenę";
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "sprawdź cenę";
  const minutes = Math.max(0, Math.round((Date.now() - time) / 60000));
  if (minutes < 2) return "przed chwilą";
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h temu`;
  return "dzisiaj";
}

function storyTitle(offer: Offer) {
  const warm = /cieplo|plaza|allinclusive/i.test((offer.category || []).join(" "));
  const short = offer.nights <= 5;
  if (/all inclusive/i.test(offer.board || "")) return `🔥 ${offer.city}: ${offer.nights} nocy All Inclusive`;
  if (short) return `✈️ ${offer.city} na ${offer.nights} ${offer.nights === 1 ? "noc" : "noce"}`;
  if (warm) return `☀️ ${offer.city}: ciepły wyjazd na ${offer.nights} nocy`;
  return `✨ ${offer.city}: ${offer.nights} nocy`;
}

export default function TripowniaLive() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [checkedAt, setCheckedAt] = useState<string>("");
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`/api/today-offers?mode=search&broad=1&refresh=${Date.now()}`, { cache: "no-store", signal: controller.signal });
        const data = await response.json() as ApiResponse;
        if (!active || !response.ok) return;
        const rows = Array.isArray(data.offers) ? data.offers : [];
        const safe = rows
          .filter((offer) => offer && offer.id && offer.price > 0 && offer.affiliateUrl)
          .filter((offer) => offer.availabilityStatus !== "expired")
          .filter((offer) => isTravelDestinationAllowed(offer.city, offer.country))
          .sort((a, b) => Number(a.price) - Number(b.price))
          .slice(0, 8);
        setOffers(safe);
        setCheckedAt(data.checkedAt || "");
        setLive(Boolean(data.checkedAt) && data.fallback !== true && !/fallback/i.test(data.sourceType || ""));
      } catch {}
    };

    void load();
    const timer = window.setInterval(load, 5 * 60 * 1000);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);

  const rows = useMemo(() => offers.slice(0, 6), [offers]);
  if (!rows.length) return null;

  return (
    <section className="section shell tripownia-live" aria-labelledby="tripownia-live-title">
      <div className="tripownia-live-head">
        <div>
          <div className="kicker"><Flame size={14}/> TRIPOWNIA LIVE</div>
          <h2 id="tripownia-live-title">Właśnie znalezione.</h2>
          <p>Aktualne propozycje z bieżących źródeł. Pokazujemy czas ostatniego sprawdzenia — bez udawanej presji i sztucznego odliczania.</p>
        </div>
        <Link href="/okazje">Wszystkie okazje <ArrowRight size={16}/></Link>
      </div>

      <div className="tripownia-live-list">
        {rows.map((offer, index) => {
          const effectiveCheckedAt = offer.priceCheckedAt || checkedAt;
          const canFastBook = live
            && offer.availabilityStatus === "available"
            && getLinkMatch(offer) === "exact"
            && /^https?:\/\//.test(offer.affiliateUrl || "")
            && Boolean(effectiveCheckedAt)
            && !isPriceStale(effectiveCheckedAt, 0.25);

          return (
            <article className="tripownia-live-row" key={`${offer.id}-${index}`}>
              <div className="tripownia-live-time">
                <Clock3 size={15}/>
                <span>{live ? ageLabel(effectiveCheckedAt) : "ostatnio znalezione"}</span>
              </div>
              <Link className="tripownia-live-main" href={liveOfferLandingHref(offer, { source: "tripownia_live" })}>
                <strong>{storyTitle(offer)}</strong>
                <span>{offer.departure} · {offer.dates} · {offer.board}</span>
              </Link>
              <div className="tripownia-live-price">
                {canFastBook ? <><small>od</small><strong>{Number(offer.price).toLocaleString("pl-PL")} zł</strong><span>/ os.</span></> : <strong>Sprawdź aktualną cenę</strong>}
              </div>
              <div className="tripownia-live-actions">
                <Link
                  className="tripownia-live-book"
                  href={liveOfferLandingHref(offer, { source: "tripownia_live" })}
                  aria-label={`Sprawdź cenę i dostępność: ${offer.city}, ${offer.departure}, ${offer.dates}`}
                ><Zap size={14}/> {canFastBook ? "Zobacz ofertę" : "Sprawdź cenę"}</Link>
                <Link
                  className="tripownia-live-alert"
                  href={`/alerty?destination=${encodeURIComponent(offer.city)}&departure=${encodeURIComponent(offer.departure)}`}
                  aria-label={`Ustaw alert na podobną cenę do ${offer.city}`}
                ><Bell size={15}/> Alert</Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
