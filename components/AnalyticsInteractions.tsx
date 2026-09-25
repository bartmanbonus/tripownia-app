"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { trackMetaCustomEvent } from "@/lib/metaPixel";

function readSearchContext(root: HTMLElement) {
  const destination = root.querySelector<HTMLInputElement>("#tripownia-destination")?.value.trim() || "";
  const formSelects = Array.from(root.querySelectorAll<HTMLSelectElement>(".search-v3-form select"));
  const board = root.querySelector<HTMLSelectElement>(".search-v3-board select")?.value || "all";

  return {
    destination: destination.slice(0, 120),
    departure: formSelects[0]?.value || "all",
    duration: formSelects[1]?.value || "all",
    budget: formSelects[2]?.value || "all",
    board,
  };
}

export default function AnalyticsInteractions() {
  useEffect(() => {
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.matches(".search-v3-form")) return;
      const searchRoot = form.closest<HTMLElement>("#wyszukiwarka");
      if (!searchRoot) return;

      const context = { ...readSearchContext(searchRoot), trigger: "submit" };
      trackEvent("search_use", context);
      trackMetaCustomEvent("SearchUse", context);
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>("button");
      const searchRoot = target.closest<HTMLElement>("#wyszukiwarka");
      if (!button || !searchRoot) return;

      if (button.closest(".search-v3-quick")) {
        const context = {
          ...readSearchContext(searchRoot),
          quick_pick: button.textContent?.replace(/\s+/g, " ").trim().slice(0, 100) || "quick_pick",
          trigger: "quick_pick",
        };
        trackEvent("search_use", context);
        trackMetaCustomEvent("SearchUse", context);
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
