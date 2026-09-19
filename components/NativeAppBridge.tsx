"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type PluginHandle = { remove?: () => Promise<void> | void };

type CapacitorPlugins = {
  Browser?: {
    open?: (options: { url: string }) => Promise<void>;
  };
  App?: {
    addListener?: (
      eventName: "backButton",
      listener: (event: { canGoBack: boolean }) => void,
    ) => Promise<PluginHandle> | PluginHandle;
    minimizeApp?: () => Promise<void>;
  };
};

declare global {
  interface Window {
    Capacitor?: {
      Plugins?: CapacitorPlugins;
    };
  }
}

function isAndroidShell() {
  return (navigator.userAgent || "").includes("TripowniaAndroid/");
}

function shouldOpenNatively(anchor: HTMLAnchorElement, url: URL) {
  if (!["http:", "https:"].includes(url.protocol)) return false;
  if (url.pathname.startsWith("/go/")) return true;
  if (url.origin !== window.location.origin) return true;
  return false;
}

export default function NativeAppBridge() {
  useEffect(() => {
    if (!isAndroidShell()) return;

    const plugins = window.Capacitor?.Plugins;
    const Browser = plugins?.Browser;
    const App = plugins?.App;
    let backHandle: PluginHandle | null = null;
    let cancelled = false;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (!shouldOpenNatively(anchor, url)) return;
      if (!Browser?.open) return;

      event.preventDefault();
      event.stopPropagation();

      trackEvent("native_external_open", {
        host: url.host,
        path: url.pathname.slice(0, 120),
        sponsored: anchor.rel.includes("sponsored"),
      });

      void Browser.open({ url: url.toString() }).catch(() => {
        window.open(url.toString(), "_blank", "noopener,noreferrer");
      });
    };

    document.addEventListener("click", onClick, true);

    if (App?.addListener) {
      Promise.resolve(
        App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack && window.history.length > 1) {
            window.history.back();
            return;
          }
          void App.minimizeApp?.();
        }),
      ).then((handle) => {
        if (cancelled) {
          void handle?.remove?.();
          return;
        }
        backHandle = handle || null;
      }).catch(() => undefined);
    }

    return () => {
      cancelled = true;
      document.removeEventListener("click", onClick, true);
      void backHandle?.remove?.();
    };
  }, []);

  return null;
}
