"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type Partner =
  | "wakacje"
  | "exim"
  | "tui"
  | "getyourguide"
  | "seeplaces"
  | "holidaypark"
  | "fonia"
  | "parklot"
  | "kiwi"
  | "booking"
  | "rentacar"
  | "kiwitaxi"
  | "gettransfer";

function tradeDoublerProgram(url: URL) {
  const queryProgram = url.searchParams.get("p");
  if (queryProgram) return queryProgram;
  return url.toString().match(/p\((\d+)\)/)?.[1] || "";
}

function partnerFromUrl(value: string): Partner | null {
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin === window.location.origin) return null;
    const host = url.hostname.toLowerCase();

    if (host === "reklamy.exim.pl" || host === "exim.pl" || host === "www.exim.pl") return "exim";
    if (host === "tui.pl" || host === "www.tui.pl") return "tui";
    if (host === "wakacje.pl" || host === "www.wakacje.pl") return "wakacje";
    if (host === "c111.travelpayouts.com" || host === "kiwi.tpk.lv" || host === "kiwi.com" || host === "www.kiwi.com") return "kiwi";
    if (host === "booking.com" || host === "www.booking.com") return "booking";
    if (host === "getyourguide.pl" || host === "www.getyourguide.pl") return "getyourguide";
    if (host === "ad.seeplaces.com" || host === "seeplaces.com" || host === "www.seeplaces.com") return "seeplaces";
    if (host === "visit.holidaypark.pl" || host === "holidaypark.pl" || host === "www.holidaypark.pl") return "holidaypark";
    if (host === "fonia.app" || host === "www.fonia.app") return "fonia";
    if (host === "parklot.pl" || host === "www.parklot.pl") return "parklot";
    if (host === "getrentacar.tpk.lv") return "rentacar";
    if (host === "kiwitaxi.tpk.lv") return "kiwitaxi";
    if (host === "gettransfer.tpk.lv") return "gettransfer";

    if (host === "clk.tradedoubler.com") {
      const program = tradeDoublerProgram(url);
      if (program === "308388") return "tui";
      if (program === "356307") return "getyourguide";
      if (program === "383711") return "seeplaces";
      if (program === "357058") return "holidaypark";
      if (program === "373994") return "fonia";
    }
  } catch {}
  return null;
}

function sourceFor(anchor: HTMLAnchorElement) {
  if (anchor.classList.contains("card-cta")) return "offer_card";
  if (anchor.classList.contains("hero-radar-offer")) return "radar";
  if (anchor.closest(".surprise-result")) return "surprise";
  if (anchor.closest(".trip-header")) return "header";
  if (anchor.closest(".trip-attractions")) return "my_trip_attraction";
  if (anchor.closest(".trip-search-actions")) return "partner_search_results";
  if (anchor.closest(".trip-partner-mini")) return "partner_search_browse";
  if (anchor.closest(".trip-search-extras")) return "search_extras";
  if (anchor.closest(".trip-plan-option")) return "planner_partner";
  if (anchor.closest(".search-v3-empty-actions")) return "search_fallback";
  if (anchor.closest(".favorites-page")) return "favorites";
  if (anchor.closest(".compare-page")) return "compare";
  if (anchor.closest(".offer-card")) return "offer_image";
  return "site_outbound";
}

function cardContext(anchor: HTMLAnchorElement) {
  const card = anchor.closest<HTMLElement>(".offer-card");
  if (!card) return { destination: "", offer: "", price: "" };

  const city = card.querySelector<HTMLElement>("h3")?.textContent?.trim() || "";
  const country = card.querySelector<HTMLElement>(".eyebrow")?.textContent?.replace(/^[^\p{L}\p{N}]+/u, "").trim() || "";
  const offer = card.dataset.offerId || "";
  const price = card.dataset.offerPrice || "";
  return {
    destination: [city, country].filter(Boolean).join(", "),
    offer,
    price,
  };
}

function destinationFor(anchor: HTMLAnchorElement) {
  const card = cardContext(anchor);
  if (card.destination) return card.destination;

  const surprise = anchor.closest<HTMLElement>(".surprise-result");
  const surpriseDestination = surprise?.querySelector<HTMLElement>("strong")?.textContent?.trim() || "";
  if (surpriseDestination) return surpriseDestination;

  const search = anchor.closest<HTMLElement>(".trip-search-engine");
  if (search) {
    const submittedDestination = search.querySelector<HTMLElement>(".trip-search-results strong")?.textContent?.trim() || "";
    if (submittedDestination && submittedDestination !== "Dowolny kierunek") return submittedDestination;
    const typedDestination = search.querySelector<HTMLInputElement>(".trip-destination input")?.value?.trim() || "";
    if (typedDestination) return typedDestination;
  }

  return "";
}

function createClickId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().slice(0, 18);
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function trackedHref(anchor: HTMLAnchorElement) {
  const original = anchor.href;
  const partner = partnerFromUrl(original);
  if (!partner) return null;

  const card = cardContext(anchor);
  const params = new URLSearchParams({
    target: original,
    partner,
    source: sourceFor(anchor),
    page: window.location.pathname,
    clickId: createClickId(),
  });
  const destination = destinationFor(anchor);
  if (destination) params.set("destination", destination);
  if (card.offer) params.set("offer", card.offer);
  if (card.price) params.set("price", card.price);
  return `/go/live?${params.toString()}`;
}

function isTrackedLiveHref(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href") || "";
  if (href.startsWith("/go/live?")) return true;
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin && url.pathname === "/go/live";
  } catch {
    return false;
  }
}

function wrapAnchor(anchor: HTMLAnchorElement) {
  if (anchor.dataset.tripowniaOutboundWrapped === "1" && isTrackedLiveHref(anchor)) return;

  // React can update href after a user changes search parameters while the DOM node
  // (and our data marker) stays the same. Re-wrap that fresh partner URL instead of
  // treating the anchor as permanently processed.
  if (anchor.dataset.tripowniaOutboundWrapped === "1") {
    delete anchor.dataset.tripowniaOutboundWrapped;
  }

  const href = trackedHref(anchor);
  if (!href) return;
  anchor.href = href;
  anchor.removeAttribute("target");
  anchor.dataset.tripowniaOutboundWrapped = "1";
}

function wrapInitialPartnerLinks() {
  document
    .querySelectorAll<HTMLAnchorElement>('a[href^="http://"], a[href^="https://"]')
    .forEach(wrapAnchor);
}

function interactiveAnchor(event: Event) {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLAnchorElement>("a[href]");
}

export default function AffiliateClickBridge() {
  useEffect(() => {
    wrapInitialPartnerLinks();

    const handleInteraction = (event: Event) => {
      const anchor = interactiveAnchor(event);
      if (!anchor) return;
      const before = anchor.href;
      wrapAnchor(anchor);
      if (event.type === "pointerdown" && isTrackedLiveHref(anchor)) {
        try {
          const tracked = new URL(anchor.href, window.location.origin);
          trackEvent("affiliate_click", {
            partner: tracked.searchParams.get("partner") || "unknown",
            source: tracked.searchParams.get("source") || sourceFor(anchor),
            destination: tracked.searchParams.get("destination") || destinationFor(anchor),
            page: window.location.pathname,
            outbound_host: (() => { try { return new URL(before).hostname; } catch { return ""; } })(),
          });
        } catch {}
      }
    };

    document.addEventListener("pointerdown", handleInteraction, true);
    document.addEventListener("focusin", handleInteraction, true);
    document.addEventListener("contextmenu", handleInteraction, true);

    return () => {
      document.removeEventListener("pointerdown", handleInteraction, true);
      document.removeEventListener("focusin", handleInteraction, true);
      document.removeEventListener("contextmenu", handleInteraction, true);
    };
  }, []);

  return null;
}
