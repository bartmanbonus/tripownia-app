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

      const anchor = target.closest<HTMLAnchorElement>("a");
      if (anchor) {
        const rawHref = anchor.getAttribute("href") || "";
        const placement = anchor.closest("header")
          ? "header"
          : anchor.closest("footer")
            ? "footer"
            : "content";
        const params = {
          placement,
          href: rawHref.slice(0, 240),
          label: anchor.textContent?.replace(/\s+/g, " ").trim().slice(0, 120) || "link",
        };

        if (rawHref.includes("/dodaj-podroz") || rawHref.includes("/planer-podrozy")) {
          trackEvent("planner_intent", params);
          trackMetaCustomEvent("PlannerIntent", params);
        } else if (rawHref.includes("/konto")) {
          trackEvent("account_intent", params);
        } else if (rawHref.includes("#wyszukiwarka")) {
          trackEvent("search_intent", params);
        }

        const sponsored = (anchor.getAttribute("rel") || "").split(/\s+/).includes("sponsored");
        if (sponsored && !anchor.closest(".offer-card")) {
          let partnerHost = "";
          try {
            partnerHost = new URL(anchor.href, window.location.origin).hostname;
          } catch {}
          const outboundParams = { ...params, partner_host: partnerHost };
          trackEvent("outbound_partner_click", outboundParams);
          trackMetaCustomEvent("PartnerOutboundClick", outboundParams);
        }
      }

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
