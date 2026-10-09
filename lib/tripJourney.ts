import { upsertTripArchive } from "@/lib/tripArchive";

export type JourneyPieceKey = "flight" | "hotel" | "transfer" | "attractions" | "car" | "esim" | "parking";

export type JourneyPieceMeta = {
  status?: "owned" | "selected" | "missing";
  provider?: string;
  label?: string;
  price?: number;
  href?: string;
  selectedAt?: string;
  bookedAt?: string;
};

type ActiveTrip = {
  tripId?: string;
  offerSnapshot?: { city?: string; country?: string };
  journeyPieces?: Partial<Record<JourneyPieceKey, JourneyPieceMeta>>;
  checklist?: Record<string, boolean>;
  [key: string]: unknown;
};

export function normalizeTripPlace(value?: string) {
  return (value || "")
    .toLocaleLowerCase("pl")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function readActiveTripJourney(): ActiveTrip | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null");
    return value && typeof value === "object" ? value as ActiveTrip : null;
  } catch {
    return null;
  }
}

export function activeTripMatchesDestination(destination?: string) {
  const trip = readActiveTripJourney();
  if (!trip?.offerSnapshot) return false;
  const wanted = normalizeTripPlace(destination);
  if (!wanted) return true;
  const city = normalizeTripPlace(trip.offerSnapshot.city);
  const country = normalizeTripPlace(trip.offerSnapshot.country);
  const place = normalizeTripPlace([trip.offerSnapshot.city, trip.offerSnapshot.country].filter(Boolean).join(" "));
  return Boolean(
    (city && (wanted.includes(city) || city.includes(wanted))) ||
    (country && wanted === country) ||
    (place && (place.includes(wanted) || wanted.includes(place)))
  );
}

function checklistForPiece(piece: JourneyPieceKey) {
  const map: Partial<Record<JourneyPieceKey, string>> = {
    transfer: "Sprawdź transfer z lotniska i taxi na miejscu",
    attractions: "Zarezerwuj najważniejsze atrakcje",
    car: "Sprawdź wynajem auta na miejscu",
    esim: "Sprawdź internet / eSIM",
    parking: "Zarezerwuj parking przy lotnisku",
  };
  return map[piece];
}

export function updateActiveTripJourneyPiece(
  piece: JourneyPieceKey,
  patch: JourneyPieceMeta,
  options?: { destination?: string; requireDestinationMatch?: boolean },
) {
  if (typeof window === "undefined") return null;
  const trip = readActiveTripJourney();
  if (!trip) return null;
  if (options?.requireDestinationMatch !== false && options?.destination && !activeTripMatchesDestination(options.destination)) return null;

  const checklist = { ...(trip.checklist || {}) };
  const checklistKey = checklistForPiece(piece);
  if (patch.status === "owned" && checklistKey) checklist[checklistKey] = true;
  if (patch.status === "missing" && checklistKey) checklist[checklistKey] = false;

  const next: ActiveTrip = {
    ...trip,
    checklist,
    journeyPieces: {
      ...(trip.journeyPieces || {}),
      [piece]: {
        ...(trip.journeyPieces?.[piece] || {}),
        ...patch,
      },
    },
  };

  localStorage.setItem("tripownia-my-trip", JSON.stringify(next));
  upsertTripArchive(next);
  window.dispatchEvent(new Event("tripownia-my-trip-updated"));
  return next;
}
