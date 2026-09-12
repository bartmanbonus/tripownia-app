"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

function readSearchContext(root: HTMLElement) {
  const inputs = Array.from(root.querySelectorAll<HTMLInputElement>("input"));
  const selects = Array.from(root.querySelectorAll<HTMLSelectElement>("select"));
  const destination = inputs.map(input => input.value.trim()).filter(Boolean).join(" | ").slice(0, 120);
  const values = selects.map(select => select.value).filter(Boolean);
  return {
    destination,
    duration: values[0] || "all",
    budget: values[1] || "all",
    board: values[2] || "all",
  };
}

export default function AnalyticsInteractions() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const button = target.closest<HTMLButtonElement>("button");
      const searchRoot = target.closest<HTMLElement>("#wyszukiwarka");

      if (button && searchRoot && button.matches(".compact-submit, .search-submit")) {
        trackEvent("search_use", {
          ...readSearchContext(searchRoot),
          trigger: "submit",
        });
        return;
      }

      if (button && searchRoot && button.closest(".quick-destination-grid")) {
        trackEvent("search_use", {
          quick_pick: button.textContent?.replace(/\s+/g, " ").trim().slice(0, 100) || "quick_pick",
          trigger: "quick_pick",
        });
        return;
      }

      if (button && searchRoot && button.closest(".search-tabs")) {
        trackEvent("search_tab", {
          tab: button.textContent?.trim().slice(0, 60) || "unknown",
        });
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
