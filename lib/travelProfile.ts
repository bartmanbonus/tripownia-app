export type TravelProfile = {
  departure: string;
  budget: number;
  styles: string[];
  companion: "solo" | "couple" | "family" | "friends";
  standard: "budget" | "comfort" | "premium";
  avoidTransfers: boolean;
  warmOnly: boolean;
};

export const DEFAULT_TRAVEL_PROFILE: TravelProfile = {
  departure: "Warszawa",
  budget: 1800,
  styles: ["city", "cieplo"],
  companion: "couple",
  standard: "comfort",
  avoidTransfers: true,
  warmOnly: false,
};

export const TRAVEL_PROFILE_KEY = "tripownia-travel-profile";

const ALLOWED_STYLES = new Set(["city", "plaza", "cieplo", "tanio", "weekend", "allinclusive"]);
const ALLOWED_COMPANIONS = new Set<TravelProfile["companion"]>(["solo", "couple", "family", "friends"]);
const ALLOWED_STANDARDS = new Set<TravelProfile["standard"]>(["budget", "comfort", "premium"]);

export function normalizeTravelProfile(input: Partial<TravelProfile> | null | undefined): TravelProfile {
  if (!input) return { ...DEFAULT_TRAVEL_PROFILE, styles: [...DEFAULT_TRAVEL_PROFILE.styles] };

  const rawBudget = Number(input.budget);
  const budget = Number.isFinite(rawBudget) && rawBudget >= 300 && rawBudget <= 50000
    ? Math.round(rawBudget)
    : DEFAULT_TRAVEL_PROFILE.budget;

  const styles = Array.isArray(input.styles)
    ? Array.from(new Set(input.styles.filter((style): style is string => typeof style === "string" && ALLOWED_STYLES.has(style))))
    : [...DEFAULT_TRAVEL_PROFILE.styles];

  const companion = ALLOWED_COMPANIONS.has(input.companion as TravelProfile["companion"])
    ? input.companion as TravelProfile["companion"]
    : DEFAULT_TRAVEL_PROFILE.companion;

  const standard = ALLOWED_STANDARDS.has(input.standard as TravelProfile["standard"])
    ? input.standard as TravelProfile["standard"]
    : DEFAULT_TRAVEL_PROFILE.standard;

  return {
    departure: typeof input.departure === "string" && input.departure.trim()
      ? input.departure.trim().slice(0, 80)
      : DEFAULT_TRAVEL_PROFILE.departure,
    budget,
    styles,
    companion,
    standard,
    avoidTransfers: typeof input.avoidTransfers === "boolean" ? input.avoidTransfers : DEFAULT_TRAVEL_PROFILE.avoidTransfers,
    warmOnly: typeof input.warmOnly === "boolean" ? input.warmOnly : DEFAULT_TRAVEL_PROFILE.warmOnly,
  };
}

export function readTravelProfile(): TravelProfile {
  if (typeof window === "undefined") return normalizeTravelProfile(DEFAULT_TRAVEL_PROFILE);
  try {
    const parsed = JSON.parse(localStorage.getItem(TRAVEL_PROFILE_KEY) || "null") as Partial<TravelProfile> | null;
    return normalizeTravelProfile(parsed);
  } catch {
    return normalizeTravelProfile(DEFAULT_TRAVEL_PROFILE);
  }
}

export function saveTravelProfile(profile: TravelProfile) {
  const normalized = normalizeTravelProfile(profile);
  localStorage.setItem(TRAVEL_PROFILE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event("tripownia-profile-updated"));
}
