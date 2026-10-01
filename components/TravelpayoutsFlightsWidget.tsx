"use client";

import { useEffect } from "react";

const WL_ID = "15770";
const SCRIPT_SRC = `https://tpemd.com/wl_web/main.js?wl_id=${WL_ID}`;

type TravelpayoutsConfiguration = {
  showHotels?: boolean;
  [key: string]: unknown;
};

type TravelpayoutsWindow = Window & {
  TPWL_CONFIGURATION?: TravelpayoutsConfiguration;
};

function forceFlightsOnly() {
  const tpWindow = window as TravelpayoutsWindow;

  // Travelpayouts merges TPWL_CONFIGURATION after its backend White Label
  // configuration. Setting this before the script loads overrides the
  // White Label's showHotels=true value. After initialization the same
  // object is wrapped in a Proxy, so assigning the property also updates
  // an already mounted widget.
  if (tpWindow.TPWL_CONFIGURATION) {
    tpWindow.TPWL_CONFIGURATION.showHotels = false;
    return;
  }

  tpWindow.TPWL_CONFIGURATION = { showHotels: false };
}

export default function TravelpayoutsFlightsWidget() {
  useEffect(() => {
    // The exact-flight flow in Tripownia is flights-only. Do this before
    // loading Travelpayouts so its hotel checkbox is never rendered and
    // the submit action stays an in-page flight search.
    forceFlightsOnly();

    const selector = `script[data-tripownia-tpwl="${WL_ID}"]`;
    let script = document.querySelector<HTMLScriptElement>(selector);

    const onLoad = () => {
      // Reassert after vendor initialization as a safeguard. If the vendor
      // has already replaced TPWL_CONFIGURATION with its reactive Proxy,
      // this assignment triggers an immediate widget configuration update.
      forceFlightsOnly();
    };

    if (!script) {
      script = document.createElement("script");
      script.async = true;
      script.type = "module";
      script.src = SCRIPT_SRC;
      script.setAttribute("data-tripownia-tpwl", WL_ID);
      script.setAttribute("nowprocket", "");
      script.setAttribute("data-noptimize", "1");
      script.setAttribute("data-cfasync", "false");
      script.setAttribute("data-wpfc-render", "false");
      script.setAttribute("seraph-accel-crit", "1");
      script.setAttribute("data-no-defer", "1");
      script.addEventListener("load", onLoad);
      document.head.appendChild(script);
    } else {
      // Covers navigation back to this mode when the vendor script is
      // already present on the page.
      forceFlightsOnly();
      script.addEventListener("load", onLoad);
    }

    return () => {
      script?.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <section className="tpwl-tripownia" aria-label="Porównywarka lotów Tripownia">
      <div id="tpwl-search" />
      <div className="tpwl-tripownia-note">
        Najpierw wybierz lot. Hotel dobierzesz później w Tripowni bez utraty wyników lotniczych.
      </div>
      <div id="tpwl-tickets" />
    </section>
  );
}
