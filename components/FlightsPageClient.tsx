"use client";

import { useState } from "react";
import { CalendarDays, Sparkles } from "lucide-react";
import FlexibleFlightsExplorer from "@/components/FlexibleFlightsExplorer";
import TravelpayoutsFlightsWidget from "@/components/TravelpayoutsFlightsWidget";

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
    <section className="flights-mode-shell">
      <div className="flights-mode-switch" role="tablist" aria-label="Sposób wyszukiwania lotu">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "flex"}
          className={mode === "flex" ? "active" : ""}
          onClick={() => setMode("flex")}
        >
          <Sparkles size={19}/>
          <span><strong>Szukam okazji</strong><small>elastyczne daty · Gdziekolwiek · kilka lotnisk</small></span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "exact"}
          className={mode === "exact" ? "active" : ""}
          onClick={() => setMode("exact")}
        >
          <CalendarDays size={19}/>
          <span><strong>Mam konkretne daty</strong><small>dokładna trasa i termin</small></span>
        </button>
      </div>

      {mode === "flex" ? (
        <FlexibleFlightsExplorer
          initialDestination={initialDestination}
          initialOrigin={initialOrigin}
          initialMonth={initialMonth}
        />
      ) : (
        <div className="flights-exact-panel">
          <div className="flights-exact-head">
            <div>
              <div className="kicker">DOKŁADNY LOT</div>
              <h2>Porównaj połączenia dla konkretnego terminu.</h2>
              <p>{summary || "Ustaw trasę i daty w porównywarce poniżej."}</p>
            </div>
          </div>
          <TravelpayoutsFlightsWidget />
        </div>
      )}
    </section>
  );
}
