"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ANALYTICS_CONSENT_EVENT } from "@/lib/analytics";
import { trackMetaPageView } from "@/lib/metaPixel";

export default function MetaPixelClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    trackMetaPageView();
  }, [pathname, query]);

  useEffect(() => {
    const handleConsent = () => trackMetaPageView();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsent as EventListener);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsent as EventListener);
  }, []);

  return null;
}
