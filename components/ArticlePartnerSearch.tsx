import UnifiedPartnerSearch from "@/components/UnifiedPartnerSearch";
import type { ArticleSearchMode } from "@/lib/articleContext";

type Props = {
  mode?: ArticleSearchMode;
  initialDestination?: string;
  initialDeparture?: string;
  initialDepartureCode?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialWeekendOnly?: boolean;
};

function plusDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(start?: string, end?: string) {
  if (!start || !end) return 0;
  const a = new Date(`${start}T12:00:00Z`).getTime();
  const b = new Date(`${end}T12:00:00Z`).getTime();
  return Math.round((b - a) / 86400000);
}

function nextFriday(iso: string) {
  const date = new Date(`${iso}T12:00:00Z`);
  const day = date.getUTCDay();
  const add = (5 - day + 7) % 7;
  date.setUTCDate(date.getUTCDate() + add);
  return date.toISOString().slice(0, 10);
}

export default function ArticlePartnerSearch(props: Props) {
  const mode = props.mode || "all";
  let startDate = props.initialStartDate;
  let endDate = props.initialEndDate;

  // ArticleContext can describe a whole month. UnifiedPartnerSearch expects an
  // actual stay, so convert very broad editorial ranges into a useful example
  // instead of creating a 29- or 30-night trip by accident.
  if (startDate && endDate && daysBetween(startDate, endDate) > 14) {
    if (mode === "city") {
      startDate = nextFriday(startDate);
      endDate = plusDays(startDate, 3);
    } else {
      startDate = plusDays(startDate, 7);
      endDate = plusDays(startDate, 7);
    }
  }

  return (
    <UnifiedPartnerSearch
      mode={mode}
      initialDestination={props.initialDestination}
      initialDeparture={props.initialDeparture}
      initialDepartureCode={props.initialDepartureCode}
      initialStartDate={startDate}
      initialEndDate={endDate}
      initialWeekendOnly={props.initialWeekendOnly}
    />
  );
}
