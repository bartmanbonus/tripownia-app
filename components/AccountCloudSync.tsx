"use client";

import { useEffect } from "react";
import { accountAuthEventName, ensureFreshAccountSession, getTripowniaUserState, readAccountSession, saveTripowniaUserState } from "@/lib/accountAuth";
import { applyCloudAccountState, collectLocalAccountState, hasMeaningfulLocalAccountState } from "@/lib/accountState";

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
      if (!session || cancelled) return;
      try {
        const remote = await getTripowniaUserState(session);
        if (cancelled) return;
        if (remote && !hasMeaningfulLocalAccountState()) applyCloudAccountState(remote);
        else if (!remote && hasMeaningfulLocalAccountState()) await saveTripowniaUserState(session, collectLocalAccountState());
        ready = true;
      } catch {
        ready = true;
      }
    }

    async function push() {
      if (!ready || cancelled) return;
      const session = await ensureFreshAccountSession(readAccountSession());
      if (!session || cancelled) return;
      await saveTripowniaUserState(session, collectLocalAccountState()).catch(() => undefined);
    }

    const schedule = () => {
      if (!ready) return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => void push(), 900);
    };

    void bootstrap();
    EVENTS.forEach((name) => window.addEventListener(name, schedule));
    window.addEventListener(accountAuthEventName(), () => void bootstrap());

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      EVENTS.forEach((name) => window.removeEventListener(name, schedule));
    };
  }, []);

  return null;
}
