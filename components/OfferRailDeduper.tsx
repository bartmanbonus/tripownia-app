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

export default function OfferRailDeduper() {
  useEffect(() => {
    deduplicateRails();

    const root = document.querySelector<HTMLElement>(".streaming-offers");
    if (!root) return;

    const observer = new MutationObserver(() => deduplicateRails());
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
