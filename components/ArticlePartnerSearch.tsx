"use client";

import { useState } from "react";
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
  presets?: string[];
};

const destinationPresetGroups: Record<string, string[]> = {
  Hiszpania: ["Hiszpania", "Majorka", "Teneryfa", "Alicante"],
  Wietnam: ["Wietnam", "Da Nang", "Phu Quoc"],
  Cypr: ["Cypr", "Pafos", "Larnaka"],
  Albania: ["Albania", "Saranda", "Vlora"],
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
  const fallbackPresets = props.initialDestination ? destinationPresetGroups[props.initialDestination] || [] : [];
  const presets = [...new Set((props.presets?.length ? props.presets : fallbackPresets).filter(Boolean))];
  const firstDestination = props.initialDestination || presets[0] || "";
  const [selectedDestination, setSelectedDestination] = useState(firstDestination);
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
    <>
      {presets.length > 1 && (
        <div className="article-search-presets" aria-label="Szybki wybór kierunku">
          <span>Porównaj też:</span>
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-pressed={selectedDestination === preset}
              onClick={() => setSelectedDestination(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      )}
      <UnifiedPartnerSearch
        key={selectedDestination || "article-search"}
        mode={mode}
        initialDestination={selectedDestination || props.initialDestination}
        initialDeparture={props.initialDeparture}
        initialDepartureCode={props.initialDepartureCode}
        initialStartDate={startDate}
        initialEndDate={endDate}
        initialWeekendOnly={props.initialWeekendOnly}
      />
    </>
  );
}
