"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ANALYTICS_CONSENT_EVENT, bootstrapAnalytics, trackPageView } from "@/lib/analytics";

export default function AnalyticsClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    const path = `${pathname}${query ? `?${query}` : ""}`;
    if (bootstrapAnalytics()) trackPageView(path);
  }, [pathname, query]);

  useEffect(() => {
    const handleConsent = () => {
      if (bootstrapAnalytics()) {
        const path = `${window.location.pathname}${window.location.search}`;
        trackPageView(path);
      }
    };
    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsent as EventListener);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsent as EventListener);
  }, []);

  return null;
}
