"use client";

import { useEffect } from "react";

type CapacitorBrowser = {
  open?: (options: { url: string; presentationStyle?: "fullscreen" | "popover" }) => Promise<unknown>;
};

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  Plugins?: {
    Browser?: CapacitorBrowser;
  };
};

function nativeCapacitor() {
  if (typeof window === "undefined") return null;
  return (window as Window & { Capacitor?: CapacitorGlobal }).Capacitor || null;
}

function externalOrTrackedUrl(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href") || "";
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return "";

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return url.toString();

    if (url.pathname === "/go/live") {
      const target = url.searchParams.get("target");
      if (target) {
        try {
          const parsedTarget = new URL(target);
          if (parsedTarget.protocol === "https:" || parsedTarget.protocol === "http:") return url.toString();
        } catch {}
      }
    }
  } catch {}

  return "";
}

export default function NativeAppBridge() {
  useEffect(() => {
    const capacitor = nativeCapacitor();
    if (!capacitor?.isNativePlatform?.()) return;

    document.documentElement.classList.add("tripownia-native-app");

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const outbound = externalOrTrackedUrl(anchor);
      if (!outbound) return;

      const browser = capacitor.Plugins?.Browser;
      if (!browser?.open) return;

      event.preventDefault();
      event.stopPropagation();
      void browser.open({ url: outbound, presentationStyle: "popover" }).catch(() => {
        window.location.href = outbound;
      });
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.documentElement.classList.remove("tripownia-native-app");
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
