/**
 * City-break quality gate. Days between the arrival and the departure are
 * destination days; check-in/check-out dates alone do NOT prove flight hours.
 * Never count the day of arrival or the day of departure as a full day.
 */
export const MIN_FULL_DESTINATION_DAYS = 2;

export type DestinationStay = {
  nights: number;
  category?: readonly string[];
  startDateISO?: string;
  endDateISO?: string;
  /** Explicit local airport time from a verified itinerary, with UTC offset. */
  outboundArrivalLocal?: string;
  /** Explicit local airport time from a verified itinerary, with UTC offset. */
  inboundDepartureLocal?: string;
};

function dayNumber(value: string | undefined): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const ms = Date.parse(value + "T00:00:00Z");
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === value
    ? Math.round(ms / 86_400_000)
    : null;
}

function localFlightDate(value: string | undefined): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:[+-]\d{2}:\d{2})$/.test(value)) return undefined;
  return Number.isFinite(Date.parse(value)) ? value.slice(0, 10) : undefined;
}

export function isFlightOnlyTrip(offer: DestinationStay) {
  return Boolean(offer?.category?.includes("flight"));
}

/** Whole local calendar days wholly between travel dates. */
export function fullDestinationDays(offer: DestinationStay): number {
  const nights = Number(offer?.nights);
  if (!Number.isInteger(nights) || nights < 1) return 0;
  const start = dayNumber(localFlightDate(offer.outboundArrivalLocal) || offer.startDateISO);
  const end = dayNumber(localFlightDate(offer.inboundDepartureLocal) || offer.endDateISO);
  if (start !== null && end !== null) {
    const dateSpan = end - start;
    if (dateSpan < 1 || dateSpan > 60) return 0;
    // For a hotel stay without known flight hours this is an upper bound,
    // not a confirmed itinerary. Explicit flight dates override hotel dates.
    return Math.max(0, Math.min(nights, dateSpan - 1));
  }
  return Math.max(0, nights - 1);
}

/** Applies to packages, not stand-alone flights or hotel-only searches. */
export function hasEnoughDestinationDays(offer: DestinationStay): boolean {
  if (isFlightOnlyTrip(offer)) return true;
  return fullDestinationDays(offer) >= MIN_FULL_DESTINATION_DAYS;
}

export function durationTruthLabel(offer: DestinationStay): string {
  if (isFlightOnlyTrip(offer)) return "";
  const days = fullDestinationDays(offer);
  const verified = Boolean(localFlightDate(offer.outboundArrivalLocal) && localFlightDate(offer.inboundDepartureLocal));
  const word = days === 1 ? "dzień" : "dni";
  return verified
    ? `${days} pełne ${word} między przylotem a wylotem`
    : `${days} ${word} między datami pobytu · sprawdź godziny lotów`;
}
