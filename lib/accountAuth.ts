export type AccountUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

export type AccountSession = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
  expires_at?: number;
  user?: AccountUser;
};

export type TripowniaUserState = {
  user_id: string;
  travel_profile: Record<string, unknown>;
  favorite_offer_ids: number[];
  compare_offer_ids: number[];
  current_trip: Record<string, unknown> | null;
  visited_countries: string[];
  excluded_visited_countries: string[];
  created_at?: string;
  updated_at?: string;
};

const AUTH_SESSION_KEY = "tripownia-auth-session-v1";
const AUTH_EVENT = "tripownia-auth-changed";
const DEFAULT_SUPABASE_URL = "https://wgbzccgcfhnouakswyvj.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_5S3oW5eD0MTLArG0gZANIw_ORJiqQQl";

function authBaseUrl() {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
}

function authApiKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY;
}

export function isAccountAuthConfigured() {
  return Boolean(authBaseUrl() && authApiKey());
}

export function accountAuthEventName() {
  return AUTH_EVENT;
}

function publicHeaders() {
  const key = authApiKey();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

function sessionHeaders(session: AccountSession) {
  return {
    apikey: authApiKey(),
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

function normalizeSession(raw: AccountSession): AccountSession {
  const expiresIn = Number(raw.expires_in || 3600);
  return {
    ...raw,
    expires_in: expiresIn,
    expires_at: raw.expires_at || Math.floor(Date.now() / 1000) + expiresIn,
  };
}

export function readAccountSession(): AccountSession | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null") as AccountSession | null;
    return parsed?.access_token && parsed?.refresh_token ? parsed : null;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function saveAccountSession(session: AccountSession) {
  if (typeof window === "undefined") return;
  const normalized = normalizeSession(session);
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAccountSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function consumeAccountSessionFromUrl(): AccountSession | null {
  if (typeof window === "undefined" || !window.location.hash) return null;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (!accessToken || !refreshToken) return null;

  const session = normalizeSession({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: hash.get("token_type") || "bearer",
    expires_in: Number(hash.get("expires_in") || 3600),
  });

  saveAccountSession(session);
  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
  return session;
}

export async function requestMagicLink(email: string, redirectTo: string) {
  if (!isAccountAuthConfigured()) throw new Error("Logowanie nie jest jeszcze podłączone.");
  const response = await fetch(`${authBaseUrl()}/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ email, create_user: true, data: { product: "Tripownia" } }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(String(payload?.msg || payload?.message || payload?.error_description || "Nie udało się wysłać linku logowania."));
  }
}

export function socialLoginUrl(provider: "google" | "apple", redirectTo: string) {
  if (!isAccountAuthConfigured()) return "";
  const url = new URL(`${authBaseUrl()}/auth/v1/authorize`);
  url.searchParams.set("provider", provider);
  url.searchParams.set("redirect_to", redirectTo);
  return url.toString();
}

export function isSocialProviderEnabled(provider: "google" | "apple") {
  if (provider === "google") return process.env.NEXT_PUBLIC_SUPABASE_GOOGLE_ENABLED === "1";
  return process.env.NEXT_PUBLIC_SUPABASE_APPLE_ENABLED === "1";
}

export async function refreshAccountSession(session: AccountSession) {
  if (!isAccountAuthConfigured()) return null;
  const response = await fetch(`${authBaseUrl()}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  if (!response.ok) {
    clearAccountSession();
    return null;
  }
  const refreshed = normalizeSession(await response.json() as AccountSession);
  saveAccountSession(refreshed);
  return refreshed;
}

export async function ensureFreshAccountSession(session = readAccountSession()) {
  if (!session) return null;
  const expiresAt = Number(session.expires_at || 0);
  if (!expiresAt || expiresAt - Math.floor(Date.now() / 1000) < 120) {
    return refreshAccountSession(session);
  }
  return session;
}

export async function getAccountUser(session: AccountSession) {
  if (!isAccountAuthConfigured()) return null;
  const response = await fetch(`${authBaseUrl()}/auth/v1/user`, {
    headers: sessionHeaders(session),
    cache: "no-store",
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Nie udało się pobrać konta.");
  return await response.json() as AccountUser;
}

export async function updateAccountMetadata(session: AccountSession, data: Record<string, unknown>) {
  if (!isAccountAuthConfigured()) throw new Error("Logowanie nie jest jeszcze podłączone.");
  const response = await fetch(`${authBaseUrl()}/auth/v1/user`, {
    method: "PUT",
    headers: sessionHeaders(session),
    body: JSON.stringify({ data }),
  });
  if (!response.ok) throw new Error("Nie udało się zsynchronizować konta.");
  return await response.json() as AccountUser;
}

export async function saveTripowniaUserState(session: AccountSession, state: Omit<TripowniaUserState, "user_id">) {
  const accountUser = session.user || await getAccountUser(session);
  if (!accountUser?.id) throw new Error("Nie udało się rozpoznać użytkownika.");

  const response = await fetch(`${authBaseUrl()}/rest/v1/tripownia_user_state?on_conflict=user_id`, {
    method: "POST",
    headers: {
      ...sessionHeaders(session),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({ user_id: accountUser.id, ...state }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(String(payload?.message || "Nie udało się zsynchronizować danych Tripowni."));
  }
  const rows = await response.json() as TripowniaUserState[];
  return rows[0] || null;
}

export async function getTripowniaUserState(session: AccountSession) {
  const response = await fetch(`${authBaseUrl()}/rest/v1/tripownia_user_state?select=*`, {
    headers: sessionHeaders(session),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Nie udało się pobrać zsynchronizowanych danych.");
  const rows = await response.json() as TripowniaUserState[];
  return rows[0] || null;
}

export async function signOutAccount(session = readAccountSession()) {
  if (session && isAccountAuthConfigured()) {
    await fetch(`${authBaseUrl()}/auth/v1/logout`, {
      method: "POST",
      headers: sessionHeaders(session),
    }).catch(() => undefined);
  }
  clearAccountSession();
}
