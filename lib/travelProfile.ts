export type TravelScheduleMode = "any" | "weekend" | "short_leave" | "leave";
export type TravelIntent = "any" | "quick" | "rest" | "capitals" | "new_country" | "far";
export type TravelDurationPreference = "any" | "short" | "week" | "long";
export type TravelValuePriority = "price" | "balance" | "time";

export type TravelProfile = {
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
};

export const DEFAULT_TRAVEL_PROFILE: TravelProfile = {
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
};

export const TRAVEL_PROFILE_KEY = "tripownia-travel-profile";

function normalizeVisitedCountries(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 120);
}

export function readTravelProfile(): TravelProfile {
  if (typeof window === "undefined") return DEFAULT_TRAVEL_PROFILE;
  try {
    const parsed = JSON.parse(localStorage.getItem(TRAVEL_PROFILE_KEY) || "null") as Partial<TravelProfile> | null;
    if (!parsed) return DEFAULT_TRAVEL_PROFILE;
    return {
      ...DEFAULT_TRAVEL_PROFILE,
      ...parsed,
      styles: Array.isArray(parsed.styles) ? parsed.styles.filter((item): item is string => typeof item === "string") : DEFAULT_TRAVEL_PROFILE.styles,
      visitedCountries: normalizeVisitedCountries(parsed.visitedCountries),
    };
  } catch {
    return DEFAULT_TRAVEL_PROFILE;
  }
}

export function saveTravelProfile(profile: TravelProfile) {
  localStorage.setItem(TRAVEL_PROFILE_KEY, JSON.stringify({
    ...profile,
    visitedCountries: normalizeVisitedCountries(profile.visitedCountries),
  }));
  window.dispatchEvent(new Event("tripownia-profile-updated"));
}
