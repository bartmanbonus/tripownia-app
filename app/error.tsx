"use client";
import { useEffect } from "react";
import Link from "next/link";
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[tripownia_page_error]", error); }, [error]);
  return <main className="shell" style={{padding:"64px 20px 96px",maxWidth:760}}><div className="kicker">TRIPOWNIA</div><h1>Coś poszło nie tak.</h1><p>Nie zostawiamy Cię w ślepej uliczce. Spróbuj ponownie albo wróć do wyszukiwarki i kontynuuj planowanie.</p><div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:24}}><button className="primary-cta" onClick={reset}>Spróbuj ponownie</button><Link className="secondary-cta" href="/#wyszukiwarka">Wróć do wyszukiwarki</Link></div></main>;
}