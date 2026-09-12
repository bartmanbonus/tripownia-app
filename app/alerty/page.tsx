"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Plane, WalletCards } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { trackEvent } from "@/lib/analytics";

type AlertSettings = {
  departure: string;
  destinations: string;
  maxPrice: string;
  enabled: boolean;
};

const DEFAULTS: AlertSettings = {
  departure: "Warszawa",
  destinations: "",
  maxPrice: "1500",
  enabled: false,
};

export default function AlertsPage() {
  const [settings, setSettings] = useState<AlertSettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("tripownia-alert-settings") || "null") as AlertSettings | null;
      if (stored) setSettings({ ...DEFAULTS, ...stored });
    } catch {}
    setPermission("Notification" in window ? Notification.permission : "unsupported");
  }, []);

  function save(event: FormEvent) {
    event.preventDefault();
    const next = { ...settings, enabled: true };
    setSettings(next);
    localStorage.setItem("tripownia-alert-settings", JSON.stringify(next));
    window.dispatchEvent(new Event("tripownia-alerts-updated"));
    trackEvent("alert_created", {
      departure: next.departure.trim().slice(0, 80),
      destinations: next.destinations.trim().slice(0, 120),
      max_price: Number(next.maxPrice || 0),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      trackEvent("notification_permission", { result: "unsupported" });
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    trackEvent("notification_permission", { result });
    if (result === "granted" && "serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("Tripownia — alerty włączone", {
        body: "To urządzenie jest gotowe na powiadomienia o okazjach.",
        icon: "/tripownia-app-icon.svg",
        data: { url: "/alerty" },
      });
    }
  }

  return (
    <main>
      <SiteHeader />
      <section className="shell app-alerts-page">
        <div className="app-alerts-hero">
          <div className="app-alerts-icon"><Bell size={28} /></div>
          <div>
            <div className="kicker">TWOJA TRIPOWNIA</div>
            <h1>Alerty podróżnicze</h1>
            <p>Powiedz, czego szukasz. Ustawienia zapisujemy na tym urządzeniu i wykorzystamy je do dopasowania okazji.</p>
          </div>
        </div>

        <div className="app-alerts-grid">
          <form className="app-alerts-card" onSubmit={save}>
            <label>
              <span><Plane size={17} /> Wylot z</span>
              <input value={settings.departure} onChange={(e) => setSettings({ ...settings, departure: e.target.value })} placeholder="np. Warszawa" />
            </label>
            <label>
              <span><Bell size={17} /> Kierunki</span>
              <input value={settings.destinations} onChange={(e) => setSettings({ ...settings, destinations: e.target.value })} placeholder="np. Włochy, Hiszpania, Azja" />
            </label>
            <label>
              <span><WalletCards size={17} /> Maksymalna cena za osobę</span>
              <div className="app-alerts-price-row">
                <input inputMode="numeric" value={settings.maxPrice} onChange={(e) => setSettings({ ...settings, maxPrice: e.target.value.replace(/\D/g, "") })} placeholder="1500" />
                <strong>zł</strong>
              </div>
            </label>
            <button className="primary-cta app-alerts-save" type="submit">
              {saved ? <><CheckCircle2 size={18} /> Zapisano</> : "Zapisz alert"}
            </button>
            <small>Alert jest zapisany lokalnie — bez konta i logowania.</small>
          </form>

          <aside className="app-alerts-card app-alerts-notification-card">
            <div className="kicker">POWIADOMIENIA</div>
            <h2>Daj znać od razu</h2>
            <p>Włącz zgodę na powiadomienia na tym urządzeniu. To przygotowuje telefon do otrzymywania alertów z aplikacji.</p>
            {permission === "granted" ? (
              <div className="app-alerts-status success"><CheckCircle2 size={18} /> Powiadomienia są włączone</div>
            ) : permission === "denied" ? (
              <div className="app-alerts-status">Powiadomienia są zablokowane w ustawieniach przeglądarki.</div>
            ) : permission === "unsupported" ? (
              <div className="app-alerts-status">Ta przeglądarka nie obsługuje powiadomień.</div>
            ) : (
              <button className="app-secondary-button" onClick={enableNotifications}><Bell size={18} /> Włącz powiadomienia</button>
            )}
            <p className="app-alerts-note">Pełne automatyczne wysyłanie alertów po pojawieniu się oferty wymaga jeszcze podłączenia backendu push. Ten ekran i urządzenie są już na to przygotowane.</p>
          </aside>
        </div>

        <div className="app-alerts-footer-link">
          <Link href="/ulubione">Przejdź do ulubionych →</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
