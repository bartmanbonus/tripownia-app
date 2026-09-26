export type TravelScheduleMode = "any" | "weekend" | "short_leave" | "leave";
export type TravelIntent = "any" | "quick" | "rest" | "capitals" | "new_country" | "far";
export type TravelDurationPreference = "any" | "short" | "week" | "long";
export type TravelValuePriority = "price" | "balance" | "time";

export type TravelProfile = {
  displayName: string;
  departure: string;
  budget: number;
  styles: string[];
  companion: "solo" | "couple" | "family" | "friends";
  standard: "budget" | "comfort" | "premium";
  avoidTransfers: boolean;
  warmOnly: boolean;
  scheduleMode: TravelScheduleMode;
  maxLeaveDays: number;
  tripIntent: TravelIntent;
  durationPreference: TravelDurationPreference;
  valuePriority: TravelValuePriority;
  visitedCountries: string[];
  excludedVisitedCountries: string[];
};

export const DEFAULT_TRAVEL_PROFILE: TravelProfile = {
  displayName: "",
  departure: "Warszawa",
  budget: 1800,
  styles: ["city", "cieplo"],
  companion: "couple",
  standard: "comfort",
  avoidTransfers: true,
  warmOnly: false,
  scheduleMode: "any",
  maxLeaveDays: 5,
  tripIntent: "any",
  durationPreference: "any",
  valuePriority: "balance",
  visitedCountries: [],
  excludedVisitedCountries: [],
};

export const TRAVEL_PROFILE_KEY = "tripownia-travel-profile";

function normalizeCountryList(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => {
      if (!item) return false;
      const key = item.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 200);
}

export function readTravelProfile(): TravelProfile {
  if (typeof window === "undefined") return DEFAULT_TRAVEL_PROFILE;
  try {
    const parsed = JSON.parse(localStorage.getItem(TRAVEL_PROFILE_KEY) || "null") as Partial<TravelProfile> | null;
    if (!parsed) return DEFAULT_TRAVEL_PROFILE;
    const visitedCountries = normalizeCountryList(parsed.visitedCountries);
    const visitedKeys = new Set(visitedCountries.map((item) => item.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()));
    const excludedVisitedCountries = normalizeCountryList(parsed.excludedVisitedCountries).filter((item) => visitedKeys.has(item.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()));
    return {
      ...DEFAULT_TRAVEL_PROFILE,
      ...parsed,
      styles: Array.isArray(parsed.styles) ? parsed.styles.filter((item): item is string => typeof item === "string") : DEFAULT_TRAVEL_PROFILE.styles,
      visitedCountries,
      excludedVisitedCountries,
    };
  } catch {
    return DEFAULT_TRAVEL_PROFILE;
  }
}

export function saveTravelProfile(profile: TravelProfile) {
  const visitedCountries = normalizeCountryList(profile.visitedCountries);
  const visitedKeys = new Set(visitedCountries.map((item) => item.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()));
  const excludedVisitedCountries = normalizeCountryList(profile.excludedVisitedCountries).filter((item) => visitedKeys.has(item.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()));
  localStorage.setItem(TRAVEL_PROFILE_KEY, JSON.stringify({
    ...profile,
    visitedCountries,
    excludedVisitedCountries,
  }));
  window.dispatchEvent(new Event("tripownia-profile-updated"));
}
