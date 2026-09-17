"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Cloud, LogOut, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { readTravelProfile } from "@/lib/travelProfile";
import {
  accountAuthEventName,
  consumeAccountSessionFromUrl,
  ensureFreshAccountSession,
  getAccountUser,
  isAccountAuthConfigured,
  isSocialProviderEnabled,
  readAccountSession,
  requestMagicLink,
  signOutAccount,
  socialLoginUrl,
  updateAccountMetadata,
  type AccountSession,
  type AccountUser,
} from "@/lib/accountAuth";

function readNumberList(key: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is number => typeof item === "number") : [];
  } catch {
    return [];
  }
}

function localAccountSnapshot() {
  return {
    travelProfile: readTravelProfile(),
    favoriteOfferIds: readNumberList("tripownia-favorites"),
    compareOfferIds: readNumberList("tripownia-compare"),
    hasTrip: Boolean(localStorage.getItem("tripownia-my-trip")),
    migratedAt: new Date().toISOString(),
  };
}

export default function AccountPage() {
  const [session, setSession] = useState<AccountSession | null>(null);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [synced, setSynced] = useState(false);
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
    let cancelled = false;

    const load = async () => {
      const fromUrl = consumeAccountSessionFromUrl();
      const current = await ensureFreshAccountSession(fromUrl || readAccountSession());
      if (cancelled) return;
      setSession(current);
      if (!current) {
        setUser(null);
        return;
      }
      try {
        const accountUser = await getAccountUser(current);
        if (!cancelled) setUser(accountUser);
      } catch {
        if (!cancelled) setMessage("Konto jest zalogowane, ale nie udało się teraz pobrać danych profilu.");
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
      await requestMagicLink(email.trim(), `${window.location.origin}/konto`);
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
      const accountUser = await updateAccountMetadata(session, { tripownia: localAccountSnapshot() });
      setUser(accountUser);
      setSynced(true);
      setMessage("Twoje preferencje i historia Tripowni zostały przypisane do konta.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się zsynchronizować danych.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    await signOutAccount(session);
    setSession(null);
    setUser(null);
    setBusy(false);
    setMessage("Wylogowano z konta. Dane zapisane na tym urządzeniu pozostają dostępne lokalnie.");
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
            <p>Profil, odwiedzone kraje, ulubione oferty i Twoje podróże mają docelowo być dostępne na każdym urządzeniu — nie tylko w jednej przeglądarce.</p>
          </div>
        </div>

        {!configured ? (
          <div className="account-card account-setup-card">
            <div className="account-card-title"><Cloud size={21}/><div><small>BACKEND KONTA</small><strong>Interfejs jest gotowy. Trzeba jeszcze podłączyć Supabase.</strong></div></div>
            <p>Po podłączeniu aktywujemy prawdziwą rejestrację, logowanie e-mailem oraz synchronizację danych między urządzeniami. Do tego czasu obecna personalizacja nadal działa lokalnie i niczego nie tracisz.</p>
            <div className="account-local-stats">
              <span><b>{localStats.visited}</b> odwiedzonych krajów</span>
              <span><b>{localStats.favorites}</b> ulubionych ofert</span>
              <span><b>{localStats.compare}</b> w porównaniu</span>
              <span><b>{localStats.trip ? "1" : "0"}</b> aktywna podróż</span>
            </div>
            <Link href="/profil" className="account-secondary-link">Dopracuj profil podróżnika →</Link>
          </div>
        ) : session && user ? (
          <div className="account-grid">
            <div className="account-card">
              <div className="account-card-title"><CheckCircle2 size={21}/><div><small>ZALOGOWANO</small><strong>{user.email || "Konto Tripowni"}</strong></div></div>
              <p>Masz aktywne konto. Możesz teraz przypisać do niego ustawienia zapisane wcześniej na tym urządzeniu.</p>
              <button type="button" className="account-primary-button" onClick={syncLocalData} disabled={busy}><Cloud size={17}/>{busy ? "Synchronizuję…" : "Synchronizuj to urządzenie"}</button>
              <button type="button" className="account-logout" onClick={logout} disabled={busy}><LogOut size={16}/> Wyloguj</button>
            </div>

            <div className="account-card">
              <div className="account-card-title"><Sparkles size={21}/><div><small>TWOJE DANE</small><strong>To zabierasz ze sobą</strong></div></div>
              <div className="account-local-stats account-local-stats-grid">
                <span><b>{localStats.visited}</b> odwiedzonych krajów</span>
                <span><b>{localStats.favorites}</b> ulubionych</span>
                <span><b>{localStats.compare}</b> porównywanych</span>
                <span><b>{localStats.trip ? "Tak" : "Nie"}</b> moja podróż</span>
              </div>
              <small className="account-footnote">Pierwsza wersja synchronizacji zapisuje profil i stan Tripowni przy koncie. Kolejny krok to osobne tabele dla podróży, alertów i historii.</small>
            </div>
          </div>
        ) : (
          <div className="account-grid">
            <div className="account-card account-login-card">
              <div className="account-card-title"><Mail size={21}/><div><small>NAJPROŚCIEJ</small><strong>Zaloguj się e-mailem</strong></div></div>
              <p>Bez hasła. Wyślemy bezpieczny link, który od razu zaloguje Cię do Tripowni.</p>
              <form onSubmit={sendMagicLink} className="account-email-form">
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="twoj@email.pl" autoComplete="email" required />
                <button type="submit" disabled={busy}>{busy ? "Wysyłam…" : "Wyślij link logowania"}</button>
              </form>

              {(googleEnabled || appleEnabled) && <div className="account-divider"><span>lub</span></div>}
              {googleEnabled && <a className="account-social-button" href={socialLoginUrl("google", `${window.location.origin}/konto`)}>Kontynuuj z Google</a>}
              {appleEnabled && <a className="account-social-button" href={socialLoginUrl("apple", `${window.location.origin}/konto`)}>Kontynuuj z Apple</a>}
            </div>

            <div className="account-card account-benefits-card">
              <div className="account-card-title"><ShieldCheck size={21}/><div><small>PO CO KONTO?</small><strong>Jedna Tripownia na każdym urządzeniu</strong></div></div>
              <ul>
                <li>profil i ograniczenia podróżowania</li>
                <li>checklista odwiedzonych krajów</li>
                <li>ulubione i porównywane oferty</li>
                <li>moja podróż i organizer</li>
                <li>alerty cenowe i personalizowane rekomendacje</li>
              </ul>
              <small className="account-footnote">Nie potrzebujesz konta, żeby przeglądać Tripownię. Konto służy do wygody i synchronizacji.</small>
            </div>
          </div>
        )}

        {message && <div className="account-message" role="status">{message}</div>}
      </section>
      <SiteFooter />
    </main>
  );
}
