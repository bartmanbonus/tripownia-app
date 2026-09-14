export type TripArchiveSnapshot = {
  tripId: string;
  offerId?: number;
  offerSnapshot?: Record<string, unknown>;
  flight?: string;
  departureAt?: string;
  hotel?: string;
  notes?: string;
  checklist?: Record<string, boolean>;
  dayPlan?: Array<Record<string, unknown>>;
  remindersEnabled?: boolean;
  updatedAt: string;
};

export const TRIP_ARCHIVE_KEY = "tripownia-trips-v1";
export const ACTIVE_TRIP_KEY = "tripownia-my-trip";
export const TRIP_ARCHIVE_EVENT = "tripownia-trips-updated";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeTrip(value: unknown): TripArchiveSnapshot | null {
  if (!isRecord(value)) return null;
  const rawTripId = typeof value.tripId === "string" ? value.tripId.trim() : "";
  const offerId = typeof value.offerId === "number" && Number.isFinite(value.offerId) ? value.offerId : undefined;
  const tripId = rawTripId || `trip-${offerId ?? "custom"}-${Date.now()}`;
  const checklist = isRecord(value.checklist)
    ? Object.fromEntries(Object.entries(value.checklist).map(([key, checked]) => [key, Boolean(checked)]))
    : {};
  const dayPlan = Array.isArray(value.dayPlan)
    ? value.dayPlan.filter(isRecord)
    : [];

  return {
    ...value,
    tripId,
    offerId,
    offerSnapshot: isRecord(value.offerSnapshot) ? value.offerSnapshot : undefined,
    checklist,
    dayPlan,
    updatedAt: typeof value.updatedAt === "string" && value.updatedAt ? value.updatedAt : new Date().toISOString(),
  } as TripArchiveSnapshot;
}

export function readTripArchive(): TripArchiveSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(TRIP_ARCHIVE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeTrip)
      .filter((trip): trip is TripArchiveSnapshot => Boolean(trip))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    localStorage.removeItem(TRIP_ARCHIVE_KEY);
    return [];
  }
}

export function readActiveTrip(): TripArchiveSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(ACTIVE_TRIP_KEY) || "null");
    return normalizeTrip(parsed);
  } catch {
    return null;
  }
}

export function upsertTripArchive(value: unknown, emit = true) {
  if (typeof window === "undefined") return null;
  const trip = normalizeTrip(value);
  if (!trip) return null;

  const nextTrip: TripArchiveSnapshot = { ...trip, updatedAt: new Date().toISOString() };
  const current = readTripArchive();
  const next = [nextTrip, ...current.filter((item) => item.tripId !== nextTrip.tripId)].slice(0, 30);
  localStorage.setItem(TRIP_ARCHIVE_KEY, JSON.stringify(next));
  if (emit) window.dispatchEvent(new Event(TRIP_ARCHIVE_EVENT));
  return nextTrip;
}

export function activateArchivedTrip(tripId: string) {
  if (typeof window === "undefined") return false;
  const trip = readTripArchive().find((item) => item.tripId === tripId);
  if (!trip) return false;
  const { updatedAt: _updatedAt, ...activeTrip } = trip;
  localStorage.setItem(ACTIVE_TRIP_KEY, JSON.stringify(activeTrip));
  upsertTripArchive(activeTrip, false);
  window.dispatchEvent(new Event("tripownia-my-trip-updated"));
  window.dispatchEvent(new Event(TRIP_ARCHIVE_EVENT));
  return true;
}

export function removeArchivedTrip(tripId: string) {
  if (typeof window === "undefined") return;
  const next = readTripArchive().filter((item) => item.tripId !== tripId);
  localStorage.setItem(TRIP_ARCHIVE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(TRIP_ARCHIVE_EVENT));
}
