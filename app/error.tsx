"use client";

import { useEffect } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[tripownia_page_error]", error); }, [error]);

  return <>
    <SiteHeader/>
    <main className="shell system-state-page">
      <div className="kicker">TRIPOWNIA</div>
      <h1>Coś poszło nie tak.</h1>
      <p>Spróbuj ponownie. Jeśli problem wróci, przejdź do wyszukiwarki albo do swojego panelu i kontynuuj stamtąd.</p>
      <div className="system-state-actions">
        <button className="primary-cta" type="button" onClick={reset}>Spróbuj ponownie</button>
        <Link className="secondary-cta" href="/#wyszukiwarka">Znajdź wyjazd</Link>
        <Link className="secondary-cta" href="/app">Moja Tripownia</Link>
      </div>
    </main>
    <SiteFooter/>
  </>;
}
