"use client";

import { useEffect } from "react";
import { accountAuthEventName, ensureFreshAccountSession, getTripowniaUserState, readAccountSession, saveTripowniaUserState } from "@/lib/accountAuth";
import { applyCloudAccountState, clearLocalAccountState, collectLocalAccountState, hasMeaningfulLocalAccountState } from "@/lib/accountState";

const DIRTY_KEY = "tripownia-local-dirty-v1";

const EVENTS = [
  "tripownia-profile-updated",
  "tripownia-favorites-updated",
  "tripownia-compare-updated",
  "tripownia-my-trip-updated",
  "tripownia-trips-updated",
  "tripownia-alerts-updated",
  "tripownia-toolkit-updated",
];

export default function AccountCloudSync() {
  useEffect(() => {
    let cancelled = false;
    let ready = false;
    let timer: number | undefined;

    async function bootstrap() {
      const session = await ensureFreshAccountSession(readAccountSession());
      if (!session || cancelled) {
        ready = false;
        return;
      }
      try {
        const remote = await getTripowniaUserState(session);
        if (cancelled) return;

        const currentUserId = session.user?.id || remote?.user_id || "";
        const localOwner = localStorage.getItem("tripownia-local-owner-v1") || "";

        if (localOwner && currentUserId && localOwner !== currentUserId) {
          clearLocalAccountState();
        }

        const localDirty = localStorage.getItem(DIRTY_KEY);

        if (remote && localDirty && (!localOwner || localOwner === currentUserId)) {
          await saveTripowniaUserState(session, collectLocalAccountState());
          localStorage.removeItem(DIRTY_KEY);
        } else if (remote) {
          applyCloudAccountState(remote);
        } else if (hasMeaningfulLocalAccountState() && (!localOwner || localOwner === currentUserId)) {
          await saveTripowniaUserState(session, collectLocalAccountState());
          localStorage.removeItem(DIRTY_KEY);
        }

        if (currentUserId) localStorage.setItem("tripownia-local-owner-v1", currentUserId);
        ready = true;
      } catch {
        ready = true;
      }
    }

    async function push() {
      if (!ready || cancelled) return;
      const session = await ensureFreshAccountSession(readAccountSession());
      if (!session || cancelled) return;
      await saveTripowniaUserState(session, collectLocalAccountState())
        .then(() => localStorage.removeItem(DIRTY_KEY))
        .catch(() => undefined);
    }

    const schedule = () => {
      try { localStorage.setItem(DIRTY_KEY, String(Date.now())); } catch {}
      if (!ready) return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => void push(), 900);
    };

    const handleAuthChange = () => void bootstrap();
    void bootstrap();
    EVENTS.forEach((name) => window.addEventListener(name, schedule));
    window.addEventListener(accountAuthEventName(), handleAuthChange);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      EVENTS.forEach((name) => window.removeEventListener(name, schedule));
      window.removeEventListener(accountAuthEventName(), handleAuthChange);
    };
  }, []);

  return null;
}
