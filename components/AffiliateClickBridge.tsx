"use client";

import { useEffect } from "react";

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
  if (anchor.closest(".trip-search-extras")) return "search_extras";
  if (anchor.closest(".favorites-page")) return "favorites";
  if (anchor.closest(".compare-page")) return "compare";
  if (anchor.closest(".offer-card")) return "offer_image";
  return "site_outbound";
}

function destinationFor(anchor: HTMLAnchorElement) {
  const card = anchor.closest<HTMLElement>(".offer-card");
  if (card) {
    const city = card.querySelector<HTMLElement>("h3")?.textContent?.trim() || "";
    const country = card.querySelector<HTMLElement>(".eyebrow")?.textContent?.replace(/^[^\p{L}\p{N}]+/u, "").trim() || "";
    return [city, country].filter(Boolean).join(", ");
  }

  const surprise = anchor.closest<HTMLElement>(".surprise-result");
  return surprise?.querySelector<HTMLElement>("strong")?.textContent?.trim() || "";
}

function trackedHref(anchor: HTMLAnchorElement) {
  const original = anchor.href;
  const partner = partnerFromUrl(original);
  if (!partner) return null;

  const params = new URLSearchParams({
    target: original,
    partner,
    source: sourceFor(anchor),
  });
  const destination = destinationFor(anchor);
  if (destination) params.set("destination", destination);
  return `/go/live?${params.toString()}`;
}

function wrapAnchor(anchor: HTMLAnchorElement) {
  const href = trackedHref(anchor);
  if (!href) return;
  anchor.href = href;
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
    // One cheap initial pass keeps copy-link/context-menu behavior correct for
    // links already present at hydration. Dynamic links are wrapped lazily on
    // first interaction instead of keeping a MutationObserver on document.body.
    wrapInitialPartnerLinks();

    const handleInteraction = (event: Event) => {
      const anchor = interactiveAnchor(event);
      if (anchor) wrapAnchor(anchor);
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
