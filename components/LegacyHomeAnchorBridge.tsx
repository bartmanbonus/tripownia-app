"use client";

import { useEffect } from "react";

export default function LegacyHomeAnchorBridge() {
  useEffect(() => {
    const resolveLegacyHash = () => {
      const { hash, pathname } = window.location;

      if (hash === "#szukaj-samodzielnie") {
        window.requestAnimationFrame(() => {
          document.getElementById("wyszukiwarka")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return;
      }

      if (pathname === "/" && hash === "#okazje") {
        window.location.replace("/okazje");
      }
    };

    resolveLegacyHash();
    window.addEventListener("hashchange", resolveLegacyHash);
    return () => window.removeEventListener("hashchange", resolveLegacyHash);
  }, []);

  return null;
}
