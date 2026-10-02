"use client";

import { ensureFreshAccountSession, readAccountSession } from "@/lib/accountAuth";

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const current = readAccountSession();
  const session = current ? await ensureFreshAccountSession(current) : null;
  if (!session?.access_token) {
    throw new Error("Brak aktywnej sesji administratora.");
  }

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${session.access_token}`);

  return fetch(input, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });
}
