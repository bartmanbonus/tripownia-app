"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Download, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const dismissed = localStorage.getItem("tripownia-pwa-banner-dismissed") === "1";
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
      if (!dismissed) setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") {
      setVisible(false);
      setInstallPrompt(null);
    }
  }

  function dismiss() {
    localStorage.setItem("tripownia-pwa-banner-dismissed", "1");
    setVisible(false);
  }

  if (!visible || !installPrompt) return null;

  return (
    <aside className="pwa-install-banner" aria-label="Zainstaluj Tripownię">
      <button className="pwa-install-close" onClick={dismiss} aria-label="Zamknij">
        <X size={18} />
      </button>
      <div className="pwa-install-icon"><Download size={22} /></div>
      <div className="pwa-install-copy">
        <strong>Miej Tripownię pod ręką</strong>
        <span>Zainstaluj aplikację i ustaw własne alerty podróżnicze.</span>
      </div>
      <button className="pwa-install-button" onClick={install}>Zainstaluj</button>
      <Link className="pwa-install-alerts" href="/alerty"><Bell size={16} /> Alerty</Link>
    </aside>
  );
}
