"use client";

import { useEffect } from "react";

const WL_ID = "15770";
const SCRIPT_SRC = `https://tpemd.com/wl_web/main.js?wl_id=${WL_ID}`;

function hideThirdPartyHotelToggle(root: ParentNode = document) {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>("label, button, span, div"));
  for (const node of nodes) {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim().toLocaleLowerCase("pl-PL");
    if (text !== "pokaż hotele" && text !== "pokaz hotele") continue;

    const candidate =
      node.closest<HTMLElement>("label") ||
      node.closest<HTMLElement>("[class*='hotel']") ||
      node.closest<HTMLElement>("[class*='checkbox']") ||
      node.parentElement;

    if (candidate) {
      candidate.style.display = "none";
      candidate.setAttribute("aria-hidden", "true");
      candidate.setAttribute("data-tripownia-hidden-hotel-toggle", "1");
    }
  }
}

export default function TravelpayoutsFlightsWidget() {
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(".tpwl-tripownia");
    if (!container) return;

    hideThirdPartyHotelToggle(container);

    const observer = new MutationObserver(() => hideThirdPartyHotelToggle(container));
    observer.observe(container, { childList: true, subtree: true });

    const blockHotelToggle = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const clickable = target?.closest<HTMLElement>("label, button, a, [role='button']");
      if (!clickable) return;
      const text = (clickable.textContent || "").replace(/\s+/g, " ").trim().toLocaleLowerCase("pl-PL");
      if (!text.includes("pokaż hotele") && !text.includes("pokaz hotele")) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    container.addEventListener("click", blockHotelToggle, true);
    container.addEventListener("change", blockHotelToggle, true);

    const selector = `script[data-tripownia-tpwl="${WL_ID}"]`;
    if (!document.querySelector(selector)) {
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
    }

    return () => {
      observer.disconnect();
      container.removeEventListener("click", blockHotelToggle, true);
      container.removeEventListener("change", blockHotelToggle, true);
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
