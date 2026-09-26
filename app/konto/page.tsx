"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Cloud, Download, LogOut, Mail, ShieldCheck, Sparkles, Trash2, UserRound } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { readTravelProfile } from "@/lib/travelProfile";
import { trackEvent } from "@/lib/analytics";
import { trackMetaCustomEvent } from "@/lib/metaPixel";
import { applyCloudAccountState, clearLocalAccountState, collectLocalAccountState } from "@/lib/accountState";
import {
  accountAuthEventName,
  consumeAccountSessionFromUrl,
  deleteAccount,
  ensureFreshAccountSession,
  getAccountUser,
  getTripowniaUserState,
  isAccountAuthConfigured,
  isSocialProviderEnabled,
  readAccountSession,
  requestMagicLink,
  saveTripowniaUserState,
  signInWithPassword,
  signOutAccount,
  signUpWithPassword,
  socialLoginUrl,
  type AccountSession,
  type AccountUser,
  type TripowniaUserState,
} from "@/lib/accountAuth";

function safeNextPath() {
  if (typeof window === "undefined") return "";
  const next = new URLSearchParams(window.location.search).get("next") || "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "";
}

export default function AccountPage() {
  const [session, setSession] = useState<AccountSession | null>(null);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [cloudState, setCloudState] = useState<TripowniaUserState | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [synced, setSynced] = useState(0);
  const configured = isAccountAuthConfigured();

  const localStats = useMemo(() => {
    if (typeof window === "undefined") return { visited: 0, favorites: 0, compare: 0, trip: false, trips: 0 };
    const profile = readTravelProfile();
    const state = collectLocalAccountState();
    return {
      visited: profile.visitedCountries.length,
      favorites: state.favorite_offer_ids.length,
      compare: state.compare_offer_ids.length,
      trip: Boolean(state.current_trip),
      trips: Array.isArray(state.trip_archive) ? state.trip_archive.length : 0,
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
          const next = safeNextPath();
          if (next) window.setTimeout(() => window.location.replace(next), 250);
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

  async function submitPasswordAuth(event: FormEvent) {
    event.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return;
    if (password.length < 8) {
      setMessage("Hasło powinno mieć co najmniej 8 znaków.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      if (authMode === "register") {
        const result = await signUpWithPassword(cleanEmail, password);
        if (result.session) {
          const remote = await getTripowniaUserState(result.session).catch(() => null);
          if (!remote) await saveTripowniaUserState(result.session, collectLocalAccountState());
          setSession(result.session);
          const accountUser = await getAccountUser(result.session);
          setUser(accountUser);
          trackEvent("sign_up", { method: "password", confirmation_required: false });
          trackMetaCustomEvent("AccountCreated", { method: "password" });
          setMessage("Konto utworzone. Twoje dane Tripowni są teraz przypisane do konta.");
        } else {
          trackEvent("sign_up", { method: "password", confirmation_required: true });
          trackMetaCustomEvent("AccountCreated", { method: "password", confirmation_required: true });
          setMessage("Konto utworzone. Sprawdź e-mail i potwierdź adres, a potem wróć tutaj i zaloguj się hasłem.");
        }
      } else {
        const logged = await signInWithPassword(cleanEmail, password);
        setSession(logged);
        const [accountUser, remote] = await Promise.all([
          getAccountUser(logged),
          getTripowniaUserState(logged),
        ]);
        setUser(accountUser);
        setCloudState(remote);
        if (remote) applyCloudAccountState(remote);
        else if (collectLocalAccountState()) await saveTripowniaUserState(logged, collectLocalAccountState());
        trackEvent("login", { method: "password" });
        setMessage("Zalogowano. Wczytaliśmy Twoją Tripownię.");
        const next = safeNextPath();
        if (next) window.setTimeout(() => window.location.replace(next), 350);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się zalogować.");
    } finally {
      setBusy(false);
    }
  }

  async function sendMagicLink(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      const next = safeNextPath();
      const redirect = `${window.location.origin}/konto${next ? `?next=${encodeURIComponent(next)}` : ""}`;
      await requestMagicLink(email.trim(), redirect);
      trackEvent("magic_link_requested", { method: "email" });
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
      trackEvent("account_sync", { action: "save_to_cloud" });
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

  async function removeAccount() {
    if (!session) return;
    const confirmed = window.confirm("Usunąć konto Tripowni na stałe? Znikną dane zapisane w chmurze i nie będzie można ich odzyskać.");
    if (!confirmed) return;

    const secondConfirmed = window.confirm("To ostatnie potwierdzenie. Czy na pewno chcesz trwale usunąć konto i dane konta?");
    if (!secondConfirmed) return;

    setBusy(true);
    setMessage("");
    try {
      await deleteAccount(session);
      clearLocalAccountState();
      setSession(null);
      setUser(null);
      setCloudState(null);
      setSynced((value) => value + 1);
      setMessage("Konto i dane zapisane w chmurze zostały trwale usunięte.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się usunąć konta.");
    } finally {
      setBusy(false);
    }
  }

  const googleEnabled = isSocialProviderEnabled("google");
  const nextPath = typeof window !== "undefined" ? safeNextPath() : "";
  const authRedirect = typeof window !== "undefined"
    ? window.location.origin + "/konto" + (nextPath ? "?next=" + encodeURIComponent(nextPath) : "")
    : "";
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
              <button type="button" className="account-delete" onClick={removeAccount} disabled={busy}><Trash2 size={16}/> Usuń konto i dane</button>
            </div>

            <div className="account-card">
              <div className="account-card-title"><Sparkles size={21}/><div><small>TWOJE DANE</small><strong>{cloudState ? "Kopia w chmurze istnieje" : "Utwórz pierwszą kopię"}</strong></div></div>
              <div className="account-local-stats account-local-stats-grid">
                <span><b>{localStats.trips}</b> zapisanych podróży</span>
                <span><b>{localStats.visited}</b> odwiedzonych krajów</span>
                <span><b>{localStats.favorites}</b> ulubionych</span>
                <span><b>{localStats.compare}</b> porównywanych</span>
              </div>
              <div className="account-hub-links">
                <Link href="/moje-podroze">Moje podróże →</Link>
                <Link href="/dodaj-podroz">+ Dodaj podróż</Link>
                <Link href="/profil">Mój profil →</Link>
                <Link href="/dla-ciebie">Dla Ciebie →</Link>
              </div>
              <small className="account-footnote">Dane kont są odseparowane regułami dostępu — zalogowany użytkownik widzi i zmienia wyłącznie swój zapis.</small>
            </div>
          </div>
        ) : (
          <div className="account-grid">
            <div className="account-card account-login-card">
              <div className="account-card-title"><Mail size={21}/><div><small>TWOJE KONTO</small><strong>{authMode === "register" ? "Utwórz konto Tripowni" : "Zaloguj się do Tripowni"}</strong></div></div>
              <p>{authMode === "register" ? "Załóż konto raz i wracaj do swoich podróży, profilu, checklist, rezerwacji i ulubionych na webie oraz w aplikacji." : "Zaloguj się tym samym kontem na webie i w aplikacji. Twoje podróże i preferencje będą w jednym miejscu."}</p>

              <div className="account-auth-tabs">
                <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Logowanie</button>
                <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>Nowe konto</button>
              </div>

              <form onSubmit={submitPasswordAuth} className="account-password-form">
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="twoj@email.pl" autoComplete="email" required />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={authMode === "register" ? "Hasło — min. 8 znaków" : "Hasło"} autoComplete={authMode === "register" ? "new-password" : "current-password"} minLength={8} required />
                <button type="submit" disabled={busy}>{busy ? "Chwila…" : authMode === "register" ? "Utwórz konto" : "Zaloguj się"}</button>
              </form>

              <div className="account-divider"><span>albo bez hasła</span></div>
              <form onSubmit={sendMagicLink} className="account-magic-form">
                <button type="submit" disabled={busy || !email.trim()}>Wyślij jednorazowy link na ten e-mail</button>
              </form>

              {(googleEnabled || appleEnabled) && <div className="account-divider"><span>lub</span></div>}
              {googleEnabled && <a className="account-social-button" href={socialLoginUrl("google", authRedirect)}>Kontynuuj z Google</a>}
              {appleEnabled && <a className="account-social-button" href={socialLoginUrl("apple", authRedirect)}>Kontynuuj z Apple</a>}
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
