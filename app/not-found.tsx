import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
export default function NotFound() {
  return <><SiteHeader/><main className="shell" style={{padding:"64px 20px 96px",maxWidth:760}}><div className="kicker">404</div><h1>Tej strony już tu nie ma.</h1><p>Zamiast kończyć podróż tutaj, przejdź do aktualnych ofert albo ułóż własny plan.</p><div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:24}}><Link className="primary-cta" href="/#wyszukiwarka">Znajdź wyjazd</Link><Link className="secondary-cta" href="/dodaj-podroz">Ułóż plan za 0 zł</Link></div></main><SiteFooter/></>;
}