"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { adminFetch } from "@/lib/adminClient";

type State = "checking" | "allowed" | "signed_out" | "forbidden" | "error";

export default function AdminAccessGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let active = true;

    void adminFetch("/api/admin/access")
      .then((response) => {
        if (!active) return;
        if (response.ok) {
          setState("allowed");
          return;
        }
        if (response.status === 401) setState("signed_out");
        else if (response.status === 403) setState("forbidden");
        else setState("error");
      })
      .catch(() => {
        if (active) setState("signed_out");
      });

    return () => { active = false; };
  }, []);

  if (state === "checking") {
    return (
      <section className="shell hub-page" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <div className="admin-local-warning">
          <ShieldCheck size={18}/>
          <span><strong>Sprawdzam dostęp administratora…</strong></span>
        </div>
      </section>
    );
  }

  if (state !== "allowed") {
    return (
      <section className="shell hub-page" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <div className="affiliate-empty" style={{ maxWidth: 620 }}>
          <ShieldAlert size={30}/>
          <strong>{state === "forbidden" ? "To konto nie ma dostępu do panelu administratora." : "Panel administratora wymaga zalogowania."}</strong>
          <span>
            {state === "forbidden"
              ? "Dostęp jest nadawany wyłącznie przez rolę admin w zabezpieczonych metadanych konta."
              : "Zaloguj się na konto administracyjne i wróć do panelu."}
          </span>
          <Link className="primary-cta" href="/konto">Przejdź do logowania →</Link>
          <Link className="secondary-cta" href="/">Wróć na Tripownię</Link>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
