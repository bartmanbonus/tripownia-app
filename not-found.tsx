import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound(){return <main><SiteHeader/><section className="shell not-found-page"><div className="kicker">404 · ZŁY KIERUNEK</div><h1>Ta strona odleciała.</h1><p>Nie zostawiamy Cię jednak na lotnisku. Wróć do dzisiejszych okazji albo ustaw własny kierunek w wyszukiwarce.</p><div><Link className="primary-cta" href="/#wyszukiwarka">Wyszukaj wyjazd →</Link><Link className="secondary-cta" href="/okazje">Dzisiejsze okazje</Link></div></section><SiteFooter/></main>}
