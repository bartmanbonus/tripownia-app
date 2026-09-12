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

export function readTravelProfile(): TravelProfile {
  if (typeof window === "undefined") return DEFAULT_TRAVEL_PROFILE;
  try {
    const parsed = JSON.parse(localStorage.getItem(TRAVEL_PROFILE_KEY) || "null") as Partial<TravelProfile> | null;
    return parsed ? { ...DEFAULT_TRAVEL_PROFILE, ...parsed } : DEFAULT_TRAVEL_PROFILE;
  } catch {
    return DEFAULT_TRAVEL_PROFILE;
  }
}

export function saveTravelProfile(profile: TravelProfile) {
  localStorage.setItem(TRAVEL_PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("tripownia-profile-updated"));
}
