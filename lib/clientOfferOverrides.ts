export type OfferOverride = {
  hidden?: boolean;
  featured?: boolean;
  price?: number;
  affiliateUrl?: string;
  imageUrl?: string;
  note?: string;
  updatedAt?: string;
};

export type OfferOverrides = Record<string, OfferOverride>;

const KEY = "tripownia-offer-overrides";

export function readOfferOverrides(): OfferOverrides {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as OfferOverrides;
  } catch {
    return {};
  }
}

export function getOfferOverride(id: number): OfferOverride {
  return readOfferOverrides()[String(id)] || {};
}

export function saveOfferOverride(id: number, patch: OfferOverride) {
  if (typeof window === "undefined") return;
  const current = readOfferOverrides();
  current[String(id)] = {
    ...(current[String(id)] || {}),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(current));
  window.dispatchEvent(new CustomEvent("tripownia-offer-overrides-updated", { detail: { id } }));
}

export function clearOfferOverride(id: number) {
  if (typeof window === "undefined") return;
  const current = readOfferOverrides();
  delete current[String(id)];
  localStorage.setItem(KEY, JSON.stringify(current));
  window.dispatchEvent(new CustomEvent("tripownia-offer-overrides-updated", { detail: { id } }));
}

export function exportOfferOverrides() {
  return readOfferOverrides();
}
