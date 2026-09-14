import type { Offer } from "@/lib/offers";

export const FAVORITE_OFFER_SNAPSHOTS_KEY = "tripownia-favorite-offers-v1";
export const COMPARE_OFFER_SNAPSHOTS_KEY = "tripownia-compare-offers-v1";

export type SavedOfferSnapshots = Record<string, Offer>;

export function readSavedOfferSnapshots(key: string): SavedOfferSnapshots {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as SavedOfferSnapshots : {};
  } catch {
    localStorage.removeItem(key);
    return {};
  }
}

export function saveOfferSnapshot(key: string, offer: Offer) {
  const snapshots = readSavedOfferSnapshots(key);
  snapshots[String(offer.id)] = offer;
  localStorage.setItem(key, JSON.stringify(snapshots));
}

export function removeOfferSnapshot(key: string, offerId: number) {
  const snapshots = readSavedOfferSnapshots(key);
  delete snapshots[String(offerId)];
  localStorage.setItem(key, JSON.stringify(snapshots));
}

export function pruneOfferSnapshots(key: string, activeIds: number[]) {
  const snapshots = readSavedOfferSnapshots(key);
  const allowed = new Set(activeIds.map(String));
  let changed = false;

  Object.keys(snapshots).forEach((id) => {
    if (!allowed.has(id)) {
      delete snapshots[id];
      changed = true;
    }
  });

  if (changed) localStorage.setItem(key, JSON.stringify(snapshots));
}
