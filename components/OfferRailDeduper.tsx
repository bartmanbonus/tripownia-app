"use client";

import { useEffect } from "react";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function deduplicateRails() {
  const root = document.querySelector<HTMLElement>(".streaming-offers");
  if (!root) return;

  const seen = new Set<string>();
  const rows = root.querySelectorAll<HTMLElement>(".offer-stream-row");

  rows.forEach((row) => {
    const items = row.querySelectorAll<HTMLElement>(".offer-stream-item");
    items.forEach((item) => {
      item.hidden = false;
      const city = item.querySelector<HTMLElement>(".offer-card h3")?.textContent || "";
      const country = item.querySelector<HTMLElement>(".offer-card .eyebrow")?.textContent || "";
      const key = normalize(`${city}|${country.replace(/^[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+/, "")}`);
      if (!key) return;

      if (seen.has(key)) item.hidden = true;
      else seen.add(key);
    });

    const visibleItems = Array.from(items).filter((item) => !item.hidden);
    row.hidden = visibleItems.length === 0;
  });
}

function syncRadarLinks() {
  const radar = document.querySelector<HTMLElement>(".hero-radar-list");
  const daily = document.querySelector<HTMLElement>(".daily-carousel");
  if (!radar || !daily) return;

  const ctaByCity = new Map<string, string>();
  daily.querySelectorAll<HTMLElement>(".offer-card").forEach((card) => {
    const city = normalize(card.querySelector<HTMLElement>("h3")?.textContent || "");
    const cta = card.querySelector<HTMLAnchorElement>(".card-cta")?.getAttribute("href") || "";
    if (city && cta && !ctaByCity.has(city)) ctaByCity.set(city, cta);
  });

  radar.querySelectorAll<HTMLAnchorElement>(".hero-radar-offer").forEach((link) => {
    const city = normalize(link.querySelector<HTMLElement>("strong")?.textContent || "");
    const cardHref = ctaByCity.get(city);
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

function synchronizeOfferExperience() {
  deduplicateRails();
  syncRadarLinks();
}

export default function OfferRailDeduper() {
  useEffect(() => {
    synchronizeOfferExperience();

    const main = document.querySelector<HTMLElement>("main");
    if (!main) return;

    const observer = new MutationObserver(() => synchronizeOfferExperience());
    observer.observe(main, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
