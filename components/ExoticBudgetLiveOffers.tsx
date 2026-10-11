"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OfferCard from "@/components/OfferCard";
import type { Offer } from "@/lib/offers";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";

type LiveOffer = Offer & { startDateISO?: string; endDateISO?: string };
type DealsPayload = { ok?: boolean; offers?: LiveOffer[]; partial?: boolean };
type Destination = "Zanzibar" | "Kenia" | "Tajlandia" | "Sri Lanka";
type DestinationResult = { destination: Destination; offers: LiveOffer[]; partial: boolean };

const DESTINATIONS: Destination[] = ["Zanzibar", "Kenia", "Tajlandia", "Sri Lanka"];
const COUNTRY_MATCH: Record<Destination, RegExp> = {
  Zanzibar: /zanzibar|tanzania/i,
  Kenia: /kenia|kenya/i,
  Tajlandia: /tajland|thailand/i,
  "Sri Lanka": /sri\s*lanka/i,
};
const MAX_PRICE_PLN = 5_000;
const MAX_PER_DESTINATION = 3;
const MAX_PRICE_AGE_MS = 6 * 60 * 60 * 1000;

function todayInWarsaw() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Warsaw",
  }).formatToParts(new Date());
  const get = (part: string) => parts.find((item) => item.type === part)?.value || "";
  return [get("year"), get("month"), get("day")].join("-");
}

function isFreshPrice(offer: LiveOffer, now = Date.now()) {
  const checkedAt = Date.parse(offer.priceCheckedAt || "");
  return Number.isFinite(checkedAt)
    && checkedAt <= now + 60_000
    && now - checkedAt <= MAX_PRICE_AGE_MS;
}

function matchesBudgetOffer(offer: LiveOffer, destination: Destination, today: string) {
  if (!offer || !Number.isSafeInteger(offer.id) || offer.id <= 0) return false;
  if (!Number.isFinite(offer.price) || offer.price <= 0 || offer.price > MAX_PRICE_PLN) return false;
  if (!COUNTRY_MATCH[destination].test(String(offer.country || "") + " " + String(offer.city || ""))) return false;
  if (!isTravelDestinationAllowed(offer.country, offer.city)) return false;
  if (offer.availabilityStatus === "expired" || offer.linkMatch !== "exact") return false;
  if (!offer.startDateISO || !/^20\d{2}-\d{2}-\d{2}$/.test(offer.startDateISO) || offer.startDateISO < today) return false;
  if (offer.endDateISO && offer.endDateISO <= offer.startDateISO) return false;
  if (!Number.isInteger(offer.nights) || offer.nights <= 0) return false;
  try {
    const url = new URL(offer.affiliateUrl);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function selectBudgetOffers(results: DestinationResult[], today: string) {
  const seen = new Set<string>();
  return DESTINATIONS.flatMap((destination) => {
    const source = results.find((result) => result.destination === destination);
    return (source?.offers || [])
      .filter((offer) => matchesBudgetOffer(offer, destination, today))
      .sort((a, b) => Number(isFreshPrice(b)) - Number(isFreshPrice(a)) || a.price - b.price)
      .filter((offer) => {
        const key = String(offer.partner) + ":" + String(offer.id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, MAX_PER_DESTINATION);
  }).sort((a, b) => Number(isFreshPrice(b)) - Number(isFreshPrice(a)) || a.price - b.price);
}

/**
 * The editorial/homepage fallback does not contain long-haul offers.
 * Query the same live offer API as destination pages, keep a hard 5000 PLN
 * ceiling, and never manufacture prices or send customers to generic
 * partner homepages when a live exact offer is unavailable.
 */
export default function ExoticBudgetLiveOffers() {
  const [offers, setOffers] = useState<LiveOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [partial, setPartial] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30_000);
    let cancelled = false;

    async function load() {
      const settled = await Promise.allSettled(DESTINATIONS.map(async (destination): Promise<DestinationResult> => {
        const response = await fetch("/api/deals?q=" + encodeURIComponent(destination), {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Live exotic offers unavailable");
        const payload = (await response.json()) as DealsPayload;
        if (!payload.ok || !Array.isArray(payload.offers)) throw new Error("Invalid live exotic offers response");
        return { destination, offers: payload.offers, partial: Boolean(payload.partial) };
      }));

      if (cancelled) return;
      const successful = settled.flatMap((item) => item.status === "fulfilled" ? [item.value] : []);
      setOffers(selectBudgetOffers(successful, todayInWarsaw()));
      setPartial(settled.some((item) => item.status === "rejected") || successful.some((item) => item.partial));
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="seo-live-status" role="status" aria-live="polite">
        <span className="seo-live-pulse" />
        <strong>Sprawdzamy ceny egzotycznych wyjazdów do 5 000 zł/os. — Zanzibar, Kenia, Tajlandia i Sri Lanka…</strong>
      </div>
    );
  }

  if (!offers.length) {
    return (
      <div className="seo-live-status seo-live-status-warning" role="status" aria-live="polite">
        <strong>Nie mamy teraz potwierdzonej propozycji do 5 000 zł/os. w sprawdzonych kierunkach.</strong>
        <span>Ceny zmieniają się na bieżąco. Sprawdź pełną pulę wybranego kierunku lub elastyczne terminy zamiast pustej listy.</span>
        <div className="seo-live-status-actions">
          {DESTINATIONS.map((destination) => (
            <Link key={destination} href={"/okazje?q=" + encodeURIComponent(destination)}>{destination}</Link>
          ))}
        </div>
      </div>
    );
  }

  const fresh = offers.filter((offer) => isFreshPrice(offer)).length;
  return (
    <>
      <p className="seo-live-note" role="status" aria-live="polite">
        {fresh > 0
          ? "Znaleźliśmy " + fresh + " propozycji z niedawnym odczytem ceny do 5 000 zł/os."
          : "Ostatnio znalezione pakiety do 5 000 zł/os. — sprawdź aktualną cenę przed rezerwacją."}
        {partial ? " Część źródeł może być chwilowo niedostępna." : ""}
        {" "}Ostateczną cenę i dostępność potwierdzisz po wybraniu oferty.
      </p>
      <div className="cards-grid">
        {offers.map((offer) => <OfferCard key={String(offer.partner) + "-" + offer.id} offer={offer} sourceSurface="motif_egzotyka_do_5000" />)}
      </div>
      <div className="motif-actions" aria-label="Więcej egzotycznych wyjazdów">
        {DESTINATIONS.map((destination) => (
          <Link key={destination} href={"/okazje?q=" + encodeURIComponent(destination)}>Więcej: {destination}</Link>
        ))}
      </div>
    </>
  );
}
