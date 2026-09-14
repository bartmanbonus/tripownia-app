"use client";

import { useEffect } from "react";

const LEGACY_SEARCH_HASH = "#szukaj-samodzielnie";
const PRIMARY_SEARCH_HASH = "#wyszukiwarka";

function rewriteLegacySearchLinks() {
  document
    .querySelectorAll<HTMLAnchorElement>('a[href="#szukaj-samodzielnie"], a[href="/#szukaj-samodzielnie"]')
    .forEach((link) => {
      link.setAttribute("href", window.location.pathname === "/" ? PRIMARY_SEARCH_HASH : `/${PRIMARY_SEARCH_HASH}`);
    });
}

export default function LegacyHomeAnchorBridge() {
  useEffect(() => {
    const resolveLegacyHash = () => {
      const { hash, pathname } = window.location;

      if (hash === LEGACY_SEARCH_HASH) {
        const nextUrl = pathname === "/" ? PRIMARY_SEARCH_HASH : `/${PRIMARY_SEARCH_HASH}`;
        window.history.replaceState(window.history.state, "", nextUrl);
        window.requestAnimationFrame(() => {
          document.getElementById("wyszukiwarka")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return;
      }

      if (pathname === "/" && hash === "#okazje") {
        window.location.replace("/okazje");
      }
    };

    rewriteLegacySearchLinks();
    resolveLegacyHash();

    const observer = new MutationObserver(() => rewriteLegacySearchLinks());
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("hashchange", resolveLegacyHash);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", resolveLegacyHash);
    };
  }, []);

  return null;
}
