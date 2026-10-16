"use client";

import {
  ACTIVE_TRIP_KEY,
  readActiveTrip,
  readTripArchive,
  upsertTripArchive,
  activateArchivedTrip,
  type TripArchiveSnapshot,
} from "@/lib/tripArchive";
import { normalizeTripPlace } from "@/lib/tripJourney";

export type SavedBooking = {
  id: string;
  type: "flight" | "hotel" | "attraction" | "car" | "transfer" | "other";
  title: string;
  status?: "selected" | "confirmed";
  provider?: string;
  reference?: string;
  date?: string;
  url?: string;
  note?: string;
  createdAt?: string;
  source?: "partner" | "email" | "manual";
};

type ToolkitRecord = {
  travelers: string[];
  reservations: SavedBooking[];
  expenses: unknown[];
  photoSpots: unknown[];
  [key: string]: unknown;
};

type OutboundSelection = {
  destination: string;
  partner: string;
  offerId?: string;
  price?: string;
  start?: string;
  end?: string;
  departure?: string;
  hotel?: string;
  nights?: string;
  piece?: string;
  tripKind: "flight" | "hotel" | "package";
};

const TOOLKIT_PREFIX = "tripownia-trip-toolkit:";

function nextId(prefix: string) {
  return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

function readToolkit(tripId: string): ToolkitRecord {
  if (typeof window === "undefined") return { travelers: ["Ja"], reservations: [], expenses: [], photoSpots: [] };
  try {
    const raw = JSON.parse(localStorage.getItem(TOOLKIT_PREFIX + tripId) || "null");
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      return {
        ...raw,
        travelers: Array.isArray(raw.travelers) && raw.travelers.length ? raw.travelers : ["Ja"],
        reservations: Array.isArray(raw.reservations) ? raw.reservations : [],
        expenses: Array.isArray(raw.expenses) ? raw.expenses : [],
        photoSpots: Array.isArray(raw.photoSpots) ? raw.photoSpots : [],
      };
    }
  } catch {}
  return { travelers: ["Ja"], reservations: [], expenses: [], photoSpots: [] };
}

export function readTripBookings(tripId: string): SavedBooking[] {
  return tripId ? readToolkit(tripId).reservations : [];
}

function writeBookings(tripId: string, reservations: SavedBooking[]) {
  const state = readToolkit(tripId);
  localStorage.setItem(TOOLKIT_PREFIX + tripId, JSON.stringify({ ...state, reservations }));
  window.dispatchEvent(new Event("tripownia-toolkit-updated"));
}

function sameDestination(trip: TripArchiveSnapshot, destination: string) {
  const offer = trip.offerSnapshot || {};
  const city = normalizeTripPlace(typeof offer.city === "string" ? offer.city : "");
  const country = normalizeTripPlace(typeof offer.country === "string" ? offer.country : "");
  const wanted = normalizeTripPlace(destination);
  if (!wanted || wanted === "gdziekolwiek" || wanted === "dowolny kierunek") return false;
  if (city && city !== "kierunek jeszcze nie wybrany") {
    return wanted === city || wanted.startsWith(city + " ") || wanted === [city, country].filter(Boolean).join(" ");
  }
  return Boolean(country && country.length > 3 && country === wanted);
}

function isSameDates(trip: TripArchiveSnapshot, start?: string) {
  if (!start) return true;
  const prefs = (trip as TripArchiveSnapshot & { searchPreferences?: { startDate?: string } }).searchPreferences;
  return !prefs?.startDate || prefs.startDate === start;
}

function typeFromSelection(selection: OutboundSelection): SavedBooking["type"] {
  if (selection.piece === "attractions") return "attraction";
  if (selection.piece === "flight" || selection.piece === "hotel" || selection.piece === "car" || selection.piece === "transfer") return selection.piece;
  if (selection.tripKind === "flight") return "flight";
  if (selection.tripKind === "hotel") return "hotel";
  return "other";
}

function makePendingTrip(selection: OutboundSelection): TripArchiveSnapshot {
  const now = Date.now();
  const [city, ...country] = selection.destination.split(",").map((item) => item.trim());
  const nights = Math.max(0, Number(selection.nights || 0)) || 0;
  const dateLabel = selection.start && selection.end
    ? selection.start + " – " + selection.end
    : selection.start || "Termin do potwierdzenia";
  return {
    tripId: nextId("trip-from-partner"),
    offerId: -now,
    offerSnapshot: {
      id: -now,
      flag: "🌍",
      city: city || selection.destination,
      country: country.join(", "),
      price: Math.max(0, Number(selection.price || 0)) || 0,
      departure: selection.departure || "",
      airportCode: "",
      nights,
      weather: "",
      score: 0,
      tag: "PLANOWANY",
      reason: "Plan zapisany przed przejściem do partnera. Zakup nie jest jeszcze potwierdzony.",
      image: "/tripownia-app-icon-v2.png",
      category: [],
      hotel: selection.hotel || "",
      board: "",
      dates: dateLabel,
      partner: selection.partner || "kiwi",
      affiliateUrl: "/moja-podroz",
      manual: true,
    },
    flight: "",
    hotel: "",
    notes: "",
    checklist: {},
    dayPlan: [],
    searchPreferences: {
      destinationMode: "known",
      dateMode: selection.start && selection.end ? "range" : "flexible",
      startDate: selection.start || "",
      endDate: selection.end || "",
    },
    journeyPieces: {},
    updatedAt: new Date().toISOString(),
  } as TripArchiveSnapshot;
}

/**
 * Clicks are selections, not confirmed purchases. A trip is saved before
 * leaving Tripownia, and a reservation can only be confirmed by the traveller.
 */
export function rememberOutboundBooking(selection: OutboundSelection): { tripId: string; bookingId: string } | null {
  if (typeof window === "undefined" || !selection.destination?.trim()) return null;
  try {
    const active = readActiveTrip();
    const matchingActive = active && sameDestination(active, selection.destination) && isSameDates(active, selection.start);
    const archived = matchingActive ? active : readTripArchive().find(
      (trip) => sameDestination(trip, selection.destination) && isSameDates(trip, selection.start)
    );
    const trip = archived || makePendingTrip(selection);
    const kind = typeFromSelection(selection);
    const bookings = readTripBookings(trip.tripId);
    const candidate = bookings.find((booking) =>
      booking.status === "selected" && booking.provider === selection.partner &&
      booking.type === kind && booking.title.includes(selection.destination)
    );
    const bookingId = candidate?.id || nextId("selection");
    const booking: SavedBooking = {
      id: bookingId,
      type: kind,
      title: selection.hotel && kind === "hotel" ? selection.hotel : selection.destination,
      status: "selected",
      provider: selection.partner || "",
      date: selection.start || "",
      createdAt: candidate?.createdAt || new Date().toISOString(),
      source: "partner",
      note: "Przejście do partnera. Czeka na potwierdzenie zakupu.",
    };
    writeBookings(trip.tripId, candidate
      ? bookings.map((item) => item.id === candidate.id ? { ...item, ...booking } : item)
      : [...bookings, booking]);

    const pieceKey = kind === "attraction" ? "attractions" : kind;
    const supportedPiece = ["flight", "hotel", "transfer", "car", "attractions"].includes(pieceKey);
    const next = {
      ...trip,
      journeyPieces: {
        ...((trip as TripArchiveSnapshot & { journeyPieces?: Record<string, unknown> }).journeyPieces || {}),
        ...(supportedPiece ? { [pieceKey]: {
          status: "selected", provider: selection.partner, label: booking.title,
          selectedAt: new Date().toISOString(),
        } } : {}),
      },
    };
    upsertTripArchive(next);
    if (!active || active.tripId === trip.tripId) {
      localStorage.setItem(ACTIVE_TRIP_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("tripownia-my-trip-updated"));
    }
    return { tripId: trip.tripId, bookingId };
  } catch {
    // Partner checkout must not be blocked by storage errors.
    return null;
  }
}

export function confirmOutboundBooking(tripId: string, bookingId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const active = readActiveTrip();
    const trip = (active?.tripId === tripId ? active : readTripArchive().find((item) => item.tripId === tripId));
    if (!trip) return false;
    const bookings = readTripBookings(tripId);
    const target = bookings.find((item) => item.id === bookingId);
    if (!target) return false;
    writeBookings(tripId, bookings.map((item) => item.id === bookingId ? {
      ...item, status: "confirmed" as const,
      note: "Zakup potwierdzony przez użytkownika. Status nie jest weryfikowany u partnera.",
    } : item));

    const pieceKey = target.type === "attraction" ? "attractions" : target.type;
    const supportedPiece = ["flight", "hotel", "transfer", "car", "attractions"].includes(pieceKey);
    const oldPieces = (trip as TripArchiveSnapshot & { journeyPieces?: Record<string, unknown> }).journeyPieces || {};
    const next = {
      ...trip,
      journeyPieces: {
        ...oldPieces,
        ...(supportedPiece ? {
          [pieceKey]: {
            ...((oldPieces[pieceKey] && typeof oldPieces[pieceKey] === "object") ? oldPieces[pieceKey] : {}),
            status: "owned", label: target.title, provider: target.provider || "",
            bookedAt: new Date().toISOString(),
          },
        } : {}),
      },
    };
    upsertTripArchive(next);
    if (active?.tripId === tripId) {
      localStorage.setItem(ACTIVE_TRIP_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("tripownia-my-trip-updated"));
    } else {
      activateArchivedTrip(tripId);
    }
    return true;
  } catch {
    return false;
  }
}
