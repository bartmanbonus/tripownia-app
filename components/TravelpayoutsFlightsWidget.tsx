"use client";

import { useEffect } from "react";

const WL_ID = "15770";
const SCRIPT_SRC = `https://tpemd.com/wl_web/main.js?wl_id=${WL_ID}`;

export default function TravelpayoutsFlightsWidget() {
  useEffect(() => {
    const selector = `script[data-tripownia-tpwl="${WL_ID}"]`;
    if (document.querySelector(selector)) return;

    const script = document.createElement("script");
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
    document.head.appendChild(script);
  }, []);

  return (
    <section className="tpwl-tripownia" aria-label="Porównywarka lotów Tripownia">
      <div id="tpwl-search" />
      <div id="tpwl-tickets" />

    </section>
  );
}
