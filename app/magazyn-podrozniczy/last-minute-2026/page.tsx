import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Last minute 2026 — jak kupować taniej | Magazyn Tripowni",
  description: "Poradnik Tripowni: kiedy last minute ma sens, jak porównywać pakiety i na co uważać przed rezerwacją.",
  alternates: { canonical: "/magazyn-podrozniczy/last-minute-2026" },
};

export default function LastMinuteGuide(){
  return <main><SiteHeader/><article className="shell magazine-article-page">
    <div className="kicker">MAGAZYN PODRÓŻNICZY</div>
    <h1>Last minute 2026 — jak kupować taniej i nie kupować w ciemno</h1>
    <p className="hub-lead">Stara treść informacyjna o last minute zostaje w Tripowni jako poradnik. Zakupy i aktualne wyjazdy znajdziesz teraz w żywej sekcji sprzedażowej.</p>
    <h2>Kiedy last minute ma największy sens?</h2><p>Najlepiej działa przy elastycznym terminie, kilku możliwych lotniskach wylotu i gotowości do szybkiej rezerwacji. Przy popularnych terminach nie warto zakładać, że cena zawsze spadnie.</p>
    <h2>Co porównywać?</h2><p>Sprawdź pełną cenę pakietu, bagaż, transfer, wyżywienie, długość pobytu i dokładne lotnisko wylotu. Tripownia zestawia źródła, ale finalną dostępność potwierdza partner.</p>
    <h2>Gdzie szukać?</h2><p>W sekcji zakupowej Tripownia najpierw sprawdza EXIM, następnie Wakacje.pl, a dla lot + hotel także eSky.</p>
    <div className="premium-actions"><Link className="primary-cta" href="/last-minute">⚡ Zobacz aktualne last minute</Link><Link className="secondary-cta" href="/#wyszukiwarka">Wyszukaj po swojemu</Link></div>
  </article><SiteFooter/></main>;
}
