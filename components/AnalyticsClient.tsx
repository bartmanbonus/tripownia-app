"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ANALYTICS_CONSENT_EVENT, bootstrapAnalytics, trackEvent, trackPageView } from "@/lib/analytics";

function trackReferral(searchParams: URLSearchParams) {
  const source = (searchParams.get("utm_source") || "").toLowerCase();
  const medium = (searchParams.get("utm_medium") || "").toLowerCase();
  const campaign = searchParams.get("utm_campaign") || "";
  const content = searchParams.get("utm_content") || "";
  if (!source && !medium && !campaign) return;

  trackEvent("campaign_referral", {
    source,
    medium,
    campaign,
    content,
  });

  if (["facebook", "instagram", "fb", "ig", "meta"].includes(source) || medium.includes("social")) {
    trackEvent("social_referral", { source, medium, campaign, content });
  }
}

export default function AnalyticsClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    const path = `${pathname}${query ? `?${query}` : ""}`;
    if (bootstrapAnalytics()) {
      trackPageView(path);
      trackReferral(new URLSearchParams(query));
    }
  }, [pathname, query]);

  useEffect(() => {
    const handleConsent = () => {
      if (bootstrapAnalytics()) {
        const path = `${window.location.pathname}${window.location.search}`;
        trackPageView(path);
        trackReferral(new URLSearchParams(window.location.search));
      }
    };
    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsent as EventListener);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsent as EventListener);
  }, []);

  return null;
}
