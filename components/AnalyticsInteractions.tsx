"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

function readSearchContext(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>(".search-v3-form");
  const draftDestination = root.querySelector<HTMLInputElement>("#tripownia-destination")?.value.trim() || "";
  const selectedDestinations = form?.dataset.searchDestinations || "";
  const selectedDepartures = form?.dataset.searchDepartures || "";
  const duration = root.querySelector<HTMLSelectElement>(".search-v3-duration select")?.value || "all";
  const budget = root.querySelector<HTMLSelectElement>(".search-v3-budget select")?.value || "all";
  const board = root.querySelector<HTMLSelectElement>(".search-v3-board select")?.value || "all";

  return {
    destination: (selectedDestinations || draftDestination || "anywhere").slice(0, 160),
    departure: selectedDepartures || "all",
    date: form?.dataset.searchDate || "Dowolnie",
    duration,
    budget,
    board,
  };
}

export default function AnalyticsInteractions() {
  useEffect(() => {
    const userAgent = navigator.userAgent || "";
    const isAndroidApp = userAgent.includes("TripowniaAndroid/");
    const isStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches
      || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

    if (isAndroidApp) {
      trackEvent("app_session", { platform: "android", shell: "capacitor" });
    } else if (isStandalone) {
      trackEvent("app_session", { platform: "pwa", shell: "standalone" });
    }

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.matches(".search-v3-form")) return;
      const searchRoot = form.closest<HTMLElement>("#wyszukiwarka");
      if (!searchRoot) return;

      trackEvent("search_use", {
        ...readSearchContext(searchRoot),
        trigger: "submit",
      });
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>("button");
      const searchRoot = target.closest<HTMLElement>("#wyszukiwarka");
      if (!button || !searchRoot) return;

      if (button.closest(".search-v3-quick")) {
        trackEvent("search_use", {
          ...readSearchContext(searchRoot),
          quick_pick: button.textContent?.replace(/\s+/g, " ").trim().slice(0, 100) || "quick_pick",
          trigger: "quick_pick",
        });
        return;
      }

      if (button.closest(".search-v3-tabs")) {
        trackEvent("search_tab", {
          tab: button.textContent?.trim().slice(0, 60) || "unknown",
        });
      }
    };

    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
