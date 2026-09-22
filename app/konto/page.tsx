"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Cloud, Download, LogOut, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { readTravelProfile } from "@/lib/travelProfile";
import { applyCloudAccountState, clearLocalAccountState, collectLocalAccountState } from "@/lib/accountState";
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

export default function AccountPage() {
  const [session, setSession] = useState<AccountSession | null>(null);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [cloudState, setCloudState] = useState<TripowniaUserState | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [synced, setSynced] = useState(0);
  const configured = isAccountAuthConfigured();

  const localStats = useMemo(() => {
    if (typeof window === "undefined") return { visited: 0, favorites: 0, compare: 0, trip: false };
    const profile = readTravelProfile();
    return {
      visited: profile.visitedCountries.length,
      favorites: collectLocalAccountState().favorite_offer_ids.length,
      compare: collectLocalAccountState().compare_offer_ids.length,
      trip: Boolean(collectLocalAccountState().current_trip),
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
      const saved = await saveTripowniaUserState(session, collectLocalAccountState());
      setCloudState(saved);
      setSynced((value) => value + 1);
      setMessage("Zapisano w chmurze. Profil, ulubione, porównania, podróże, alerty i planner są przypisane do konta.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się zsynchronizować danych.");
    } finally {
      setBusy(false);
    }
  }

  function restoreCloudData() {
    if (!cloudState) return;
    applyCloudAccountState(cloudState);
    setSynced((value) => value + 1);
    setMessage("Dane z konta zostały wczytane na tym urządzeniu.");
  }

  async function logout() {
    setBusy(true);
    await signOutAccount(session);
    clearLocalAccountState();
    setSession(null);
    setUser(null);
    setCloudState(null);
    setSynced((value) => value + 1);
    setBusy(false);
    setMessage("Wylogowano. Prywatne dane podróży zostały usunięte z tego urządzenia; kopia konta pozostaje w chmurze.");
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
            <p>Po zalogowaniu Tripownia synchronizuje profil, podróże, checklisty, rezerwacje, wydatki, alerty i zapisane oferty między urządzeniami.</p>
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
              <p>Synchronizacja działa automatycznie. Poniższe przyciski pozwalają też ręcznie wymusić zapis lub wczytanie danych.</p>
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
              {googleEnabled && <a className="account-social-button" href={socialLoginUrl("google", `${window.location.origin}/konto`)}>Kontynuuj z Google</a>}
              {appleEnabled && <a className="account-social-button" href={socialLoginUrl("apple", `${window.location.origin}/konto`)}>Kontynuuj z Apple</a>}
            </div>

            <div className="account-card account-benefits-card">
              <div className="account-card-title"><ShieldCheck size={21}/><div><small>PO CO KONTO?</small><strong>Jedna Tripownia na każdym urządzeniu</strong></div></div>
              <ul>
                <li>profil i ograniczenia podróżowania</li>
                <li>checklista odwiedzonych krajów i wykluczenia</li>
                <li>ulubione i porównywane oferty</li>
                <li>bieżąca i wcześniejsze podróże</li>
                <li>checklisty, rezerwacje, wydatki i zapisane miejsca</li>
                <li>alerty podróżnicze</li>
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
