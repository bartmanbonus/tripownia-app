"use client";

import { useState } from "react";
import { CalendarDays, Sparkles } from "lucide-react";
import FlexibleFlightsExplorer from "@/components/FlexibleFlightsExplorer";
import EskyFlightsSearch from "@/components/EskyFlightsSearch";

type Mode = "flex" | "exact";

export default function FlightsPageClient({
  initialDestination = "",
  initialDestinationCode = "",
  autoSearch = false,
  initialDuration = "2-4",
  marketFrom = "",
  marketTo = "",
  initialOrigin = "WAW",
  initialMonth = "",
  initialOutbound = "",
  initialInbound = "",
}: {
  initialDestination?: string;
  initialDestinationCode?: string;
  autoSearch?: boolean;
  initialDuration?: string;
  marketFrom?: string;
  marketTo?: string;
  initialOrigin?: string;
  initialMonth?: string;
  initialOutbound?: string;
  initialInbound?: string;
}) {
  const hasExactDates = Boolean(initialOutbound);
  const [mode, setMode] = useState<Mode>(hasExactDates ? "exact" : "flex");

  const summary = [
    initialOrigin ? `wylot: ${initialOrigin}` : "",
    initialDestination ? `kierunek: ${initialDestination}` : "",
    initialOutbound ? `od: ${initialOutbound}` : "",
    initialInbound ? `powrót: ${initialInbound}` : "",
  ].filter(Boolean).join(" · ");

  return (
    <section className="flights-mode-shell skyline-flights-page">
      <FlexibleFlightsExplorer
        initialDestination={initialDestination}
        initialDestinationCode={initialDestinationCode}
        autoSearch={autoSearch}
        initialDuration={initialDuration}
        marketFrom={marketFrom}
        marketTo={marketTo}
        initialOrigin={initialOrigin}
        initialMonth={initialMonth}
        initialOutbound={initialOutbound}
        initialInbound={initialInbound}
      />
    </section>
  );
}
