"use client";

import SearchHub from "@/components/SearchHub";

type Mode = "all" | "city" | "holiday" | "lastminute";

type Props = {
  mode?: Mode;
  initialDestination?: string;
  initialDeparture?: string;
  initialDepartureCode?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialAdults?: number;
  initialWeekendOnly?: boolean;
};

function tabForMode(mode: Mode) {
  if (mode === "city") return "City break";
  if (mode === "holiday") return "Wakacje";
  if (mode === "lastminute") return "Last minute";
  return "Inspiracje";
}

function durationForDates(start?: string, end?: string) {
  if (!start || !end) return "all";
  const a = new Date(start + "T12:00:00Z").getTime();
  const b = new Date(end + "T12:00:00Z").getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return "all";
  const nights = Math.round((b - a) / 86400000);
  if (nights === 1) return "1";
  if (nights === 2) return "2";
  if (nights === 3) return "3";
  if (nights === 4) return "4";
  if (nights <= 7) return "5-7";
  if (nights <= 10) return "8-10";
  if (nights <= 14) return "11-14";
  return "15+";
}

/**
 * Compatibility adapter.
 *
 * Older pages used UnifiedPartnerSearch while the homepage and app use SearchHub.
 * Keep the old public API so all pages can migrate without breaking URLs, but render
 * exactly the same search experience and result logic everywhere.
 */
export default function UnifiedPartnerSearch({
  mode = "all",
  initialDestination = "",
  initialDepartureCode = "",
  initialStartDate = "",
  initialEndDate = "",
  initialWeekendOnly = false,
}: Props) {
  const hasRange = Boolean(initialStartDate && initialEndDate && initialStartDate !== initialEndDate);
  const hasExact = Boolean(initialStartDate && (!initialEndDate || initialStartDate === initialEndDate));

  return (
    <SearchHub
      embedded
      initialTab={tabForMode(mode)}
      initialDestinations={initialDestination ? [initialDestination] : []}
      initialAirports={initialDepartureCode && initialDepartureCode !== "ANY" ? [initialDepartureCode] : []}
      initialDuration={durationForDates(initialStartDate, initialEndDate)}
      initialDateMode={hasRange ? "range" : hasExact ? "exact" : "any"}
      initialDateFrom={initialStartDate}
      initialDateTo={initialEndDate}
      initialWeekendOnly={initialWeekendOnly}
    />
  );
}
