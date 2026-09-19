"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Cloud, Download, LogOut, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { readTravelProfile, saveTravelProfile, type TravelProfile } from "@/lib/travelProfile";
import {
  accountAuthEventName,
  consumeAccountSessionFromUrl,
  ensureFreshAccountSession,
  getAccountUser,
  getTripowniaUserState,
  isAccountAuthConfigured,
  isSocialProviderEnabled,
  readAccountSession,
  requestMagicLink,
  saveTripowniaUserState,
  signOutAccount,
  socialLoginUrl,
  type AccountSession,
  type AccountUser,
  type TripowniaUserState,
} from "@/lib/accountAuth";

function readNumberList(key: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is number => typeof item === "number") : [];
  } catch {
    return [];
  }
}

function readCurrentTrip() {
  try {
    const parsed = JSON.parse(localStorage.getItem("tripownia-my-trip") || "null");
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function localAccountSnapshot() {
  const travelProfile = readTravelProfile();
  return {
    travel_profile: travelProfile as unknown as Record<string, unknown>,
    favorite_offer_ids: readNumberList("tripownia-favorites"),
    compare_offer_ids: readNumberList("tripownia-compare"),
    current_trip: readCurrentTrip(),
    visited_countries: travelProfile.visitedCountries,
    excluded_visited_countries: travelProfile.excludedVisitedCountries,
  };
}

function applyCloudState(state: TripowniaUserState) {
  const profile = state.travel_profile as unknown as Partial<TravelProfile>;
  if (profile && typeof profile === "object") saveTravelProfile({ ...readTravelProfile(), ...profile });
  localStorage.setItem("tripownia-favorites", JSON.stringify(state.favorite_offer_ids || []));
  localStorage.setItem("tripownia-compare", JSON.stringify(state.compare_offer_ids || []));
  if (state.current_trip) localStorage.setItem("tripownia-my-trip", JSON.stringify(state.current_trip));
  else localStorage.removeItem("tripownia-my-trip");
  window.dispatchEvent(new Event("tripownia-favorites-updated"));
  window.dispatchEvent(new Event("tripownia-compare-updated"));
  window.dispatchEvent(new Event("tripownia-my-trip-updated"));
}

export default function AccountPage() {
  const [session, setSession] = useState<AccountSession | null>(null);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [cloudState, setCloudState] = useState<TripowniaUserState | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [synced, setSynced] = useState(0);
  const [accountRedirectUrl, setAccountRedirectUrl] = useState("/konto");
  const configured = isAccountAuthConfigured();

  const localStats = useMemo(() => {
    if (typeof window === "undefined") return { visited: 0, favorites: 0, compare: 0, trip: false };
    const profile = readTravelProfile();
    return {
      visited: profile.visitedCountries.length,
      favorites: readNumberList("tripownia-favorites").length,
      compare: readNumberList("tripownia-compare").length,
      trip: Boolean(localStorage.getItem("tripownia-my-trip")),
    };
  }, [session, synced]);

  useEffect(() => {
    setAccountRedirectUrl(`${window.location.origin}/konto`);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const fromUrl = consumeAccountSessionFromUrl();
      const current = await ensureFreshAccountSession(fromUrl || readAccountSession());
      if (cancelled) return;
      setSession(current);
      if (!current) {
        setUser(null);
        setCloudState(null);
        return;
      }
      try {
        const [accountUser, remote] = await Promise.all([
          getAccountUser(current),
          getTripowniaUserState(current),
        ]);
        if (!cancelled) {
          setUser(accountUser);
          setCloudState(remote);
        }
      } catch {
        if (!cancelled) setMessage("Konto jest zalogowane, ale nie udało się teraz pobrać wszystkich danych.");
      }
    };

    void load();
    const eventName = accountAuthEventName();
    const handleAuthChange = () => void load();
    window.addEventListener(eventName, handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      cancelled = true;
      window.removeEventListener(eventName, handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  async function sendMagicLink(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      await requestMagicLink(email.trim(), accountRedirectUrl);
      setMessage("Link do logowania wysłany. Sprawdź skrzynkę e-mail.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się wysłać linku logowania.");
    } finally {
      setBusy(false);
    }
  }

  async function syncLocalData() {
    if (!session) return;
    setBusy(true);
    setMessage("");
    try {
      const saved = await saveTripowniaUserState(session, localAccountSnapshot());
      setCloudState(saved);
      setSynced((value) => value + 1);
      setMessage("Zapisano w chmurze. Profil, kraje, ulubione, porównanie i bieżąca podróż są przypisane do konta.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się zsynchronizować danych.");
    } finally {
      setBusy(false);
    }
  }

  function restoreCloudData() {
    if (!cloudState) return;
    applyCloudState(cloudState);
    setSynced((value) => value + 1);
    setMessage("Dane z konta zostały wczytane na tym urządzeniu.");
  }

  async function logout() {
    setBusy(true);
    await signOutAccount(session);
    setSession(null);
    setUser(null);
    setCloudState(null);
    setBusy(false);
    setMessage("Wylogowano. Dane zapisane na tym urządzeniu pozostają dostępne lokalnie.");
  }

  const googleEnabled = isSocialProviderEnabled("google");
  const appleEnabled = isSocialProviderEnabled("apple");

  return (
    <main>
      <SiteHeader />
      <section className="shell account-page">
        <div className="account-hero">
          <div className="account-hero-icon"><UserRound size={28}/></div>
          <div>
            <div className="kicker">TWOJA TRIPOWNIA</div>
            <h1>Konto, które pamięta jak podróżujesz.</h1>
            <p>Profil, odwiedzone kraje, ulubione oferty i bieżąca podróż mogą być zapisane w chmurze i przenoszone między urządzeniami.</p>
          </div>
        </div>

        {!configured ? (
          <div className="account-card account-setup-card">
            <div className="account-card-title"><Cloud size={21}/><div><small>BACKEND KONTA</small><strong>Logowanie jest chwilowo niedostępne.</strong></div></div>
            <p>Personalizacja nadal działa lokalnie. Gdy połączenie wróci, dane możesz zsynchronizować jednym przyciskiem.</p>
          </div>
        ) : session && user ? (
          <div className="account-grid">
            <div className="account-card">
              <div className="account-card-title"><CheckCircle2 size={21}/><div><small>ZALOGOWANO</small><strong>{user.email || "Konto Tripowni"}</strong></div></div>
              <p>Wybierz kierunek synchronizacji. Niczego nie nadpisujemy automatycznie bez Twojej decyzji.</p>
              <button type="button" className="account-primary-button" onClick={syncLocalData} disabled={busy}><Cloud size={17}/>{busy ? "Synchronizuję…" : "Zapisz to urządzenie w chmurze"}</button>
              {cloudState && <button type="button" className="account-social-button" onClick={restoreCloudData} disabled={busy}><Download size={16}/> Wczytaj dane z chmury na to urządzenie</button>}
              <button type="button" className="account-logout" onClick={logout} disabled={busy}><LogOut size={16}/> Wyloguj</button>
            </div>

            <div className="account-card">
              <div className="account-card-title"><Sparkles size={21}/><div><small>TWOJE DANE</small><strong>{cloudState ? "Kopia w chmurze istnieje" : "Utwórz pierwszą kopię"}</strong></div></div>
              <div className="account-local-stats account-local-stats-grid">
                <span><b>{localStats.visited}</b> odwiedzonych krajów</span>
                <span><b>{localStats.favorites}</b> ulubionych</span>
                <span><b>{localStats.compare}</b> porównywanych</span>
                <span><b>{localStats.trip ? "Tak" : "Nie"}</b> moja podróż</span>
              </div>
              <small className="account-footnote">Dane kont są odseparowane regułami dostępu — zalogowany użytkownik widzi i zmienia wyłącznie swój zapis.</small>
            </div>
          </div>
        ) : (
          <div className="account-grid">
            <div className="account-card account-login-card">
              <div className="account-card-title"><Mail size={21}/><div><small>NAJPROŚCIEJ</small><strong>Zaloguj się e-mailem</strong></div></div>
              <p>Bez hasła. Wyślemy bezpieczny link, który zaloguje Cię do Tripowni.</p>
              <form onSubmit={sendMagicLink} className="account-email-form">
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="twoj@email.pl" autoComplete="email" required />
                <button type="submit" disabled={busy}>{busy ? "Wysyłam…" : "Wyślij link logowania"}</button>
              </form>

              {(googleEnabled || appleEnabled) && <div className="account-divider"><span>lub</span></div>}
              {googleEnabled && <a className="account-social-button" href={socialLoginUrl("google", accountRedirectUrl)}>Kontynuuj z Google</a>}
              {appleEnabled && <a className="account-social-button" href={socialLoginUrl("apple", accountRedirectUrl)}>Kontynuuj z Apple</a>}
            </div>

            <div className="account-card account-benefits-card">
              <div className="account-card-title"><ShieldCheck size={21}/><div><small>PO CO KONTO?</small><strong>Jedna Tripownia na każdym urządzeniu</strong></div></div>
              <ul>
                <li>profil i ograniczenia podróżowania</li>
                <li>checklista odwiedzonych krajów i wykluczenia</li>
                <li>ulubione i porównywane oferty</li>
                <li>bieżąca podróż</li>
                <li>personalizowane rekomendacje</li>
              </ul>
              <small className="account-footnote">Nie potrzebujesz konta, żeby przeglądać Tripownię. Konto służy do synchronizacji i personalizacji.</small>
            </div>
          </div>
        )}

        {message && <div className="account-message" role="status">{message}</div>}
        <div className="account-local-stats account-bottom-stats">
          <span><b>{localStats.visited}</b> krajów na tym urządzeniu</span>
          <span><b>{localStats.favorites}</b> ulubionych</span>
          <span><b>{localStats.compare}</b> porównywanych</span>
          <span><Link href="/profil">Edytuj profil →</Link></span>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
