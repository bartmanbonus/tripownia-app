"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { touristDestinationKey } from "@/lib/destinationGrouping";

function cardDestination(card: ParentNode) {
  const city = card.querySelector<HTMLElement>(".offer-card h3")?.textContent?.trim() || "";
  const country = card
    .querySelector<HTMLElement>(".offer-card .eyebrow")
    ?.textContent?.replace(/^[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+/, "")
    .trim() || "";
  return { city, country };
}

function deduplicateRails() {
  const root = document.querySelector<HTMLElement>(".streaming-offers");
  if (!root) return;

  const rows = root.querySelectorAll<HTMLElement>(".offer-stream-row");

  rows.forEach((row) => {
    const seen = new Set<string>();
    const items = row.querySelectorAll<HTMLElement>(".offer-stream-item");

    items.forEach((item) => {
      item.hidden = false;
      const key = touristDestinationKey(cardDestination(item));
      if (!key) return;

      if (seen.has(key)) item.hidden = true;
      else seen.add(key);
    });

    row.hidden = Array.from(items).every((item) => item.hidden);
  });
}

function syncRadarLinks() {
  const radar = document.querySelector<HTMLElement>(".hero-radar-list");
  const daily = document.querySelector<HTMLElement>(".daily-carousel");
  if (!radar || !daily) return;

  const ctaByDestination = new Map<string, string>();
  daily.querySelectorAll<HTMLElement>(".offer-card").forEach((card) => {
    const destination = touristDestinationKey(cardDestination(card));
    const cta = card.querySelector<HTMLAnchorElement>(".card-cta")?.getAttribute("href") || "";
    if (destination && cta && !ctaByDestination.has(destination)) {
      ctaByDestination.set(destination, cta);
    }
  });

  radar.querySelectorAll<HTMLAnchorElement>(".hero-radar-offer").forEach((link) => {
    const city = link.querySelector<HTMLElement>("strong")?.textContent?.trim() || "";
    const destination = touristDestinationKey({ city, country: "" });
    const cardHref = ctaByDestination.get(destination);
    if (!cardHref) return;

    if (cardHref.startsWith("/go/")) {
      const url = new URL(cardHref, window.location.origin);
      url.searchParams.set("source", "radar");
      link.href = `${url.pathname}${url.search}`;
      link.removeAttribute("target");
      link.setAttribute("rel", "sponsored");
      return;
    }

    if (/^https?:\/\//.test(cardHref)) {
      link.href = cardHref;
      link.target = "_blank";
      link.rel = "sponsored noopener noreferrer";
    }
  });
}

function synchronizeHomepage() {
  deduplicateRails();
  syncRadarLinks();
}

export default function OfferRailDeduper() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        synchronizeHomepage();
      });
    };

    schedule();

    const main = document.querySelector<HTMLElement>("main");
    if (!main) return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(main, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
