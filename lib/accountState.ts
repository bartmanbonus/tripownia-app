"use client";

import type { TripowniaUserState } from "@/lib/accountAuth";
import { readTravelProfile, saveTravelProfile, TRAVEL_PROFILE_KEY, type TravelProfile } from "@/lib/travelProfile";
import { ACTIVE_TRIP_KEY, TRIP_ARCHIVE_KEY } from "@/lib/tripArchive";
import { FAVORITE_OFFER_SNAPSHOTS_KEY, COMPARE_OFFER_SNAPSHOTS_KEY } from "@/lib/savedOfferSnapshots";

const FAVORITES_KEY = "tripownia-favorites";
const COMPARE_KEY = "tripownia-compare";
const ALERTS_KEY = "tripownia-alert-settings";
const TOOLKIT_PREFIX = "tripownia-trip-toolkit:";

function parseJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    return parsed == null ? fallback : parsed as T;
  } catch {
    return fallback;
  }
}

function numberList(key: string) {
  const value = parseJson<unknown[]>(key, []);
  return Array.isArray(value) ? value.filter((item): item is number => typeof item === "number" && Number.isFinite(item)) : [];
}

function recordValue(key: string) {
  const value = parseJson<Record<string, unknown>>(key, {});
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function toolkitByTrip() {
  if (typeof window === "undefined") return {};
  const result: Record<string, unknown> = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(TOOLKIT_PREFIX)) continue;
    const tripId = key.slice(TOOLKIT_PREFIX.length);
    if (!tripId) continue;
    result[tripId] = parseJson<unknown>(key, {});
  }
  return result;
}

export function collectLocalAccountState(): Omit<TripowniaUserState, "user_id"> {
  const profile = readTravelProfile();
  return {
    travel_profile: profile as unknown as Record<string, unknown>,
    favorite_offer_ids: numberList(FAVORITES_KEY),
    compare_offer_ids: numberList(COMPARE_KEY),
    current_trip: parseJson<Record<string, unknown> | null>(ACTIVE_TRIP_KEY, null),
    visited_countries: profile.visitedCountries,
    excluded_visited_countries: profile.excludedVisitedCountries,
    favorite_offer_snapshots: recordValue(FAVORITE_OFFER_SNAPSHOTS_KEY),
    compare_offer_snapshots: recordValue(COMPARE_OFFER_SNAPSHOTS_KEY),
    trip_archive: parseJson<unknown[]>(TRIP_ARCHIVE_KEY, []),
    alert_settings: recordValue(ALERTS_KEY),
    toolkit_by_trip: toolkitByTrip(),
  };
}

export function hasMeaningfulLocalAccountState() {
  if (typeof window === "undefined") return false;
  return Boolean(
    localStorage.getItem(TRAVEL_PROFILE_KEY) ||
    localStorage.getItem(FAVORITES_KEY) ||
    localStorage.getItem(COMPARE_KEY) ||
    localStorage.getItem(ACTIVE_TRIP_KEY) ||
    localStorage.getItem(TRIP_ARCHIVE_KEY) ||
    localStorage.getItem(ALERTS_KEY) ||
    Object.keys(toolkitByTrip()).length
  );
}

export function applyCloudAccountState(state: TripowniaUserState) {
  if (typeof window === "undefined") return;

  const profile = state.travel_profile as unknown as Partial<TravelProfile>;
  if (profile && typeof profile === "object") saveTravelProfile({ ...readTravelProfile(), ...profile });

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorite_offer_ids || []));
  localStorage.setItem(COMPARE_KEY, JSON.stringify(state.compare_offer_ids || []));
  localStorage.setItem(FAVORITE_OFFER_SNAPSHOTS_KEY, JSON.stringify(state.favorite_offer_snapshots || {}));
  localStorage.setItem(COMPARE_OFFER_SNAPSHOTS_KEY, JSON.stringify(state.compare_offer_snapshots || {}));
  localStorage.setItem(TRIP_ARCHIVE_KEY, JSON.stringify(Array.isArray(state.trip_archive) ? state.trip_archive : []));
  localStorage.setItem(ALERTS_KEY, JSON.stringify(state.alert_settings || {}));

  if (state.current_trip) localStorage.setItem(ACTIVE_TRIP_KEY, JSON.stringify(state.current_trip));
  else localStorage.removeItem(ACTIVE_TRIP_KEY);

  Object.entries(state.toolkit_by_trip || {}).forEach(([tripId, value]) => {
    if (tripId) localStorage.setItem(`${TOOLKIT_PREFIX}${tripId}`, JSON.stringify(value));
  });

  ["tripownia-profile-updated","tripownia-favorites-updated","tripownia-compare-updated","tripownia-my-trip-updated","tripownia-trips-updated","tripownia-alerts-updated","tripownia-toolkit-updated"]
    .forEach((name) => window.dispatchEvent(new Event(name)));
}


export function clearLocalAccountState() {
  if (typeof window === "undefined") return;

  [
    TRAVEL_PROFILE_KEY,
    FAVORITES_KEY,
    COMPARE_KEY,
    ACTIVE_TRIP_KEY,
    TRIP_ARCHIVE_KEY,
    ALERTS_KEY,
    FAVORITE_OFFER_SNAPSHOTS_KEY,
    COMPARE_OFFER_SNAPSHOTS_KEY,
    "tripownia-local-owner-v1",
    "tripownia-local-dirty-v1",
    "tripownia-alert-last-notified",
  ].forEach((key) => localStorage.removeItem(key));

  const toolkitKeys: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(TOOLKIT_PREFIX)) toolkitKeys.push(key);
  }
  toolkitKeys.forEach((key) => localStorage.removeItem(key));

  ["tripownia-profile-updated","tripownia-favorites-updated","tripownia-compare-updated","tripownia-my-trip-updated","tripownia-trips-updated","tripownia-alerts-updated","tripownia-toolkit-updated"]
    .forEach((name) => window.dispatchEvent(new Event(name)));
}
