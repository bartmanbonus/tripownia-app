"use client";

import { useState } from "react";
import { CalendarDays, Sparkles } from "lucide-react";
import FlexibleFlightsExplorer from "@/components/FlexibleFlightsExplorer";
import EskyFlightsSearch from "@/components/EskyFlightsSearch";

type Mode = "flex" | "exact";

export default function FlightsPageClient({
  initialDestination = "",
  initialOrigin = "WAW",
  initialMonth = "",
  initialOutbound = "",
  initialInbound = "",
}: {
  initialDestination?: string;
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
        initialOrigin={initialOrigin}
        initialMonth={initialMonth}
        initialOutbound={initialOutbound}
        initialInbound={initialInbound}
      />
    </section>
  );
}
