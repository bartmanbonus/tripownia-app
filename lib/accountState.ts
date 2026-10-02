"use client";

import type { TripowniaUserState } from "@/lib/accountAuth";
import { readTravelProfile, saveTravelProfile, TRAVEL_PROFILE_KEY, type TravelProfile } from "@/lib/travelProfile";
import { ACTIVE_TRIP_KEY, TRIP_ARCHIVE_KEY } from "@/lib/tripArchive";
import { FAVORITE_OFFER_SNAPSHOTS_KEY, COMPARE_OFFER_SNAPSHOTS_KEY } from "@/lib/savedOfferSnapshots";

const FAVORITES_KEY = "tripownia-favorites";
const COMPARE_KEY = "tripownia-compare";
const ALERTS_KEY = "tripownia-alert-settings";
const TOOLKIT_PREFIX = "tripownia-trip-toolkit:";
const ORGANIZER_PREFIX = "tripownia-organizer:";

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

function organizerByTrip() {
  if (typeof window === "undefined") return {};
  const result: Record<string, unknown> = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(ORGANIZER_PREFIX)) continue;
    const tripId = key.slice(ORGANIZER_PREFIX.length);
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
    organizer_by_trip: organizerByTrip(),
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
    Object.keys(toolkitByTrip()).length ||
    Object.keys(organizerByTrip()).length
  );
}


function uniqueNumbers(...groups: Array<number[] | undefined>) {
  return Array.from(new Set(groups.flatMap((group) => Array.isArray(group) ? group : []).filter((value) => typeof value === "number" && Number.isFinite(value))));
}

function uniqueStrings(...groups: Array<string[] | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of groups.flatMap((group) => Array.isArray(group) ? group : [])) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    const key = trimmed.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

function mergeTripArchive(remote: unknown[] | undefined, local: unknown[] | undefined) {
  const byId = new Map<string, Record<string, unknown>>();
  const extras: unknown[] = [];

  for (const item of [...(Array.isArray(remote) ? remote : []), ...(Array.isArray(local) ? local : [])]) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      extras.push(item);
      continue;
    }
    const record = item as Record<string, unknown>;
    const tripId = typeof record.tripId === "string" ? record.tripId.trim() : "";
    if (!tripId) {
      extras.push(record);
      continue;
    }
    const current = byId.get(tripId);
    if (!current) {
      byId.set(tripId, record);
      continue;
    }
    const currentUpdated = typeof current.updatedAt === "string" ? current.updatedAt : "";
    const nextUpdated = typeof record.updatedAt === "string" ? record.updatedAt : "";
    if (!currentUpdated || (nextUpdated && nextUpdated >= currentUpdated)) byId.set(tripId, record);
  }

  return [...byId.values(), ...extras].slice(0, 30);
}

export function mergeAnonymousAccountState(
  remote: TripowniaUserState,
  local: Omit<TripowniaUserState, "user_id">,
): Omit<TripowniaUserState, "user_id"> {
  const hasLocalProfile = typeof window !== "undefined" && Boolean(localStorage.getItem(TRAVEL_PROFILE_KEY));
  const hasLocalTrip = typeof window !== "undefined" && Boolean(localStorage.getItem(ACTIVE_TRIP_KEY));
  const hasLocalAlerts = typeof window !== "undefined" && Boolean(localStorage.getItem(ALERTS_KEY));

  const remoteProfile = remote.travel_profile && typeof remote.travel_profile === "object" ? remote.travel_profile : {};
  const localProfile = local.travel_profile && typeof local.travel_profile === "object" ? local.travel_profile : {};
  const visited = uniqueStrings(remote.visited_countries, local.visited_countries);
  const excluded = uniqueStrings(remote.excluded_visited_countries, local.excluded_visited_countries)
    .filter((country) => visited.some((visitedCountry) => visitedCountry.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === country.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()));

  return {
    travel_profile: hasLocalProfile ? { ...remoteProfile, ...localProfile, visitedCountries: visited, excludedVisitedCountries: excluded } : remoteProfile,
    favorite_offer_ids: uniqueNumbers(remote.favorite_offer_ids, local.favorite_offer_ids),
    compare_offer_ids: uniqueNumbers(remote.compare_offer_ids, local.compare_offer_ids),
    current_trip: hasLocalTrip ? local.current_trip : remote.current_trip,
    visited_countries: visited,
    excluded_visited_countries: excluded,
    favorite_offer_snapshots: { ...(remote.favorite_offer_snapshots || {}), ...(local.favorite_offer_snapshots || {}) },
    compare_offer_snapshots: { ...(remote.compare_offer_snapshots || {}), ...(local.compare_offer_snapshots || {}) },
    trip_archive: mergeTripArchive(remote.trip_archive, local.trip_archive),
    alert_settings: hasLocalAlerts ? { ...(remote.alert_settings || {}), ...(local.alert_settings || {}) } : (remote.alert_settings || {}),
    toolkit_by_trip: { ...(remote.toolkit_by_trip || {}), ...(local.toolkit_by_trip || {}) },
    organizer_by_trip: { ...(remote.organizer_by_trip || {}), ...(local.organizer_by_trip || {}) },
  };
}

export function applyCloudAccountState(state: TripowniaUserState) {
  if (typeof window === "undefined") return;

  const scopedKeysToReplace: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(TOOLKIT_PREFIX) || key?.startsWith(ORGANIZER_PREFIX)) scopedKeysToReplace.push(key);
  }
  scopedKeysToReplace.forEach((key) => localStorage.removeItem(key));

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
  Object.entries(state.organizer_by_trip || {}).forEach(([tripId, value]) => {
    if (tripId) localStorage.setItem(`${ORGANIZER_PREFIX}${tripId}`, JSON.stringify(value));
  });

  ["tripownia-profile-updated","tripownia-favorites-updated","tripownia-compare-updated","tripownia-my-trip-updated","tripownia-trips-updated","tripownia-alerts-updated","tripownia-toolkit-updated","tripownia-organizer-updated"]
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

  const scopedKeys: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(TOOLKIT_PREFIX) || key?.startsWith(ORGANIZER_PREFIX)) scopedKeys.push(key);
  }
  scopedKeys.forEach((key) => localStorage.removeItem(key));

  ["tripownia-profile-updated","tripownia-favorites-updated","tripownia-compare-updated","tripownia-my-trip-updated","tripownia-trips-updated","tripownia-alerts-updated","tripownia-toolkit-updated","tripownia-organizer-updated"]
    .forEach((name) => window.dispatchEvent(new Event(name)));
}
