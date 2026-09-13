"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Plane, RefreshCw, WalletCards } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { type Offer } from "@/lib/offers";
import { trackEvent } from "@/lib/analytics";
import { useLiveOffers } from "@/lib/useLiveOffers";

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

const DESTINATION_GROUPS: Record<string, string[]> = {
  azja: ["wietnam", "tajlandia", "indonezja", "bali", "japonia", "sri lanka", "malediwy"],
  europa: ["wlochy", "hiszpania", "portugalia", "grecja", "cypr", "malta", "czechy", "austria", "wegry", "francja", "wielka brytania", "albania", "turcja"],
  cieplo: ["cieplo"],
  plaza: ["plaza"],
  "all inclusive": ["allinclusive"],
};

function norm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function destinationTerms(value: string) {
  return value
    .split(/[,;]+/)
    .map(norm)
    .filter(Boolean);
}

function offerMatchesDestination(offer: Offer, terms: string[]) {
  if (!terms.length) return true;
  const haystack = norm(`${offer.city} ${offer.country} ${offer.category.join(" ")}`);
  return terms.some((term) => {
    const group = DESTINATION_GROUPS[term];
    if (group?.some((alias) => haystack.includes(norm(alias)))) return true;
    return haystack.includes(term);
  });
}

function findMatchingOffers(settings: AlertSettings, sourceOffers: Offer[]) {
  const departure = norm(settings.departure);
  const terms = destinationTerms(settings.destinations);
  const maxPrice = Number(settings.maxPrice || 0);

  return sourceOffers
    .filter((offer) => offer.availabilityStatus !== "expired")
    .filter((offer) => {
      if (!departure) return true;
      const offerDeparture = norm(offer.departure);
      return offerDeparture.includes(departure) || departure.includes(offerDeparture);
    })
    .filter((offer) => offerMatchesDestination(offer, terms))
    .filter((offer) => !maxPrice || offer.price <= maxPrice)
    .sort((a, b) => a.price - b.price || b.score - a.score);
}

function matchFingerprint(settings: AlertSettings, matches: Offer[]) {
  return [
    norm(settings.departure),
    destinationTerms(settings.destinations).join(","),
    settings.maxPrice,
    matches.map((offer) => `${offer.id}:${offer.price}`).sort().join("-"),
  ].join("|");
}

async function showMatchNotification(settings: AlertSettings, matches: Offer[]) {
  if (!("Notification" in window) || Notification.permission !== "granted" || !("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  const fingerprint = matchFingerprint(settings, matches);
  const lastFingerprint = localStorage.getItem("tripownia-alert-last-notified");
  if (lastFingerprint === fingerprint) return;

  const best = matches[0];
  const body = best
    ? `${best.city} z ${best.departure} od ${best.price} zł/os. Sprawdź aktualną cenę i pozostałe trafienia.`
    : "Na razie nie mamy nowej oferty pasującej do Twojego alertu.";

  await registration.showNotification(
    matches.length ? `Tripownia: ${matches.length} ${matches.length === 1 ? "trafienie" : "trafienia"}` : "Tripownia: alert sprawdzony",
    {
      body,
      icon: "/tripownia-app-icon-v2.png",
      badge: "/tripownia-app-icon-v2.png",
      data: { url: "/alerty" },
    },
  );
  localStorage.setItem("tripownia-alert-last-notified", fingerprint);
  trackEvent("alert_match_notification", {
    match_count: matches.length,
    best_offer_id: best?.id,
  });
}

export default function AlertsPage() {
  const [settings, setSettings] = useState<AlertSettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const { offers, source, loading, checkedAt, refresh } = useLiveOffers("/api/today-offers?mode=search&broad=1", 3 * 60 * 1000);
  const matchingOffers = useMemo(() => findMatchingOffers(settings, offers), [settings, offers]);

  useEffect(() => {
    let next = { ...DEFAULTS };
    try {
      const stored = JSON.parse(localStorage.getItem("tripownia-alert-settings") || "null") as AlertSettings | null;
      if (stored) next = { ...next, ...stored };
    } catch {}

    const params = new URLSearchParams(window.location.search);
    const destination = params.get("destination")?.trim();
    const departure = params.get("departure")?.trim();
    const maxPrice = params.get("maxPrice")?.replace(/\D/g, "");
    if (destination) next.destinations = destination.slice(0, 120);
    if (departure) next.departure = departure.slice(0, 80);
    if (maxPrice) next.maxPrice = maxPrice.slice(0, 8);
    setSettings(next);

    if (destination || departure || maxPrice) {
      trackEvent("alert_prefilled", {
        destination: destination?.slice(0, 120),
        departure: departure?.slice(0, 80),
        max_price: Number(maxPrice || 0),
      });
    }

    setPermission("Notification" in window ? Notification.permission : "unsupported");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !settings.enabled || permission !== "granted" || loading) return;
    showMatchNotification(settings, matchingOffers).catch(() => {});
  }, [hydrated, matchingOffers, permission, settings, loading]);

  function save(event: FormEvent) {
    event.preventDefault();
    const next = { ...settings, enabled: true };
    const matches = findMatchingOffers(next, offers);
    setSettings(next);
    localStorage.setItem("tripownia-alert-settings", JSON.stringify(next));
    window.dispatchEvent(new Event("tripownia-alerts-updated"));
    trackEvent("alert_created", {
      departure: next.departure.trim().slice(0, 80),
      destinations: next.destinations.trim().slice(0, 120),
      max_price: Number(next.maxPrice || 0),
      match_count: matches.length,
      offer_source: source,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  function disableAlert() {
    const next = { ...settings, enabled: false };
    setSettings(next);
    localStorage.setItem("tripownia-alert-settings", JSON.stringify(next));
    localStorage.removeItem("tripownia-alert-last-notified");
    window.dispatchEvent(new Event("tripownia-alerts-updated"));
    trackEvent("alert_disabled");
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
      if (settings.enabled) {
        localStorage.removeItem("tripownia-alert-last-notified");
        await showMatchNotification(settings, matchingOffers);
      } else {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification("Tripownia — powiadomienia włączone", {
          body: "Zapisz alert, a Tripownia będzie sprawdzać aktualne oferty na tym urządzeniu.",
          icon: "/tripownia-app-icon-v2.png",
          badge: "/tripownia-app-icon-v2.png",
          data: { url: "/alerty" },
        });
      }
    }
  }

  const freshness = source === "live"
    ? checkedAt ? `Live · ${new Date(checkedAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}` : "Live"
    : "Tryb awaryjny";

  return (
    <main>
      <SiteHeader />
      <section className="shell app-alerts-page">
        <div className="app-alerts-hero">
          <div className="app-alerts-icon"><Bell size={28} /></div>
          <div>
            <div className="kicker">TWOJA TRIPOWNIA</div>
            <h1>Alerty podróżnicze</h1>
            <p>Powiedz, czego szukasz. Tripownia porównuje alert z aktualnymi ofertami i pokaże trafienia.</p>
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
            <div className="app-alerts-status"><span>{freshness}</span><button type="button" className="app-secondary-button" onClick={refresh}><RefreshCw size={16}/> {loading ? "Sprawdzam…" : "Sprawdź teraz"}</button></div>
            <button className="primary-cta app-alerts-save" type="submit">
              {saved ? <><CheckCircle2 size={18} /> Zapisano</> : settings.enabled ? "Aktualizuj alert" : "Zapisz alert"}
            </button>
            {settings.enabled && <button className="app-secondary-button" type="button" onClick={disableAlert}>Wyłącz alert</button>}
            <small>Alert jest zapisany na tym urządzeniu — bez konta i logowania.</small>
          </form>

          <aside className="app-alerts-card app-alerts-notification-card">
            <div className="kicker">POWIADOMIENIA</div>
            <h2>Daj znać od razu</h2>
            <p>Włącz zgodę na powiadomienia. Gdy używasz Tripowni, aplikacja regularnie odświeża live feed i poinformuje Cię, gdy zestaw trafień się zmieni.</p>
            {permission === "granted" ? (
              <div className="app-alerts-status success"><CheckCircle2 size={18} /> Powiadomienia są włączone</div>
            ) : permission === "denied" ? (
              <div className="app-alerts-status">Powiadomienia są zablokowane w ustawieniach przeglądarki.</div>
            ) : permission === "unsupported" ? (
              <div className="app-alerts-status">Ta przeglądarka nie obsługuje powiadomień.</div>
            ) : (
              <button className="app-secondary-button" onClick={enableNotifications}><Bell size={18} /> Włącz powiadomienia</button>
            )}
            <p className="app-alerts-note">Pełny push działający również przy całkowicie zamkniętej aplikacji wymaga kolejnego kroku: backendu subskrypcji push i bezpiecznego magazynu urządzeń. Live dopasowanie alertów jest już podłączone.</p>
          </aside>
        </div>

        {hydrated && settings.enabled && (
          <section className="legacy-offers">
            <div className="section-heading">
              <div>
                <div className="kicker">TRAFIENIA ALERTU</div>
                <h2>{matchingOffers.length ? `Mamy ${matchingOffers.length} ${matchingOffers.length === 1 ? "pasującą propozycję" : "pasujące propozycje"}` : loading ? "Sprawdzamy aktualne oferty…" : "Na razie brak trafień"}</h2>
                <p>{matchingOffers.length ? "Pokazujemy najlepsze aktualne wyniki według zapisanych warunków." : "Alert jest aktywny. Zmień kierunek, lotnisko lub budżet albo wróć później."}</p>
              </div>
              <Link href="/okazje">Wszystkie okazje →</Link>
            </div>
            {matchingOffers.length > 0 && <div className="cards-grid">{matchingOffers.slice(0, 3).map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div>}
          </section>
        )}

        <div className="app-alerts-footer-link">
          <Link href="/ulubione">Przejdź do ulubionych →</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
