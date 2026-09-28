import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarDays, ExternalLink, MapPin, Moon, Plane, Utensils } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AffiliateOfferLink from "@/components/AffiliateOfferLink";
import { getSocialOffer, type SocialOffer } from "@/lib/socialOffers";

type SocialOfferPage = SocialOffer & { expired?: boolean };

const LEGACY_RZYM_529: SocialOfferPage = {
  slug: "rzym-529",
  city: "Rzym",
  country: "Włochy",
  price: 529,
  departure: "Warszawa–Modlin",
  nights: 3,
  dates: "30 listopada – 3 grudnia 2026",
  board: "Bez wyżywienia",
  hotel: "hu Roma Camping In Town",
  partner: "other",
  partnerLabel: "Oferta archiwalna",
  affiliateUrl: "",
  imageSrc: "/images/destinations/rzym.jpg",
  imageCountry: "Włochy",
  checkedAt: "2026-09-28T13:30:00+02:00",
  status: "expired",
  expired: true,
};

function getOfferForPage(slug: string): SocialOfferPage | null {
  if (slug.toLocaleLowerCase("pl") === "rzym-529") return LEGACY_RZYM_529;
  return getSocialOffer(slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const offer = getOfferForPage(slug);
  if (!offer) {
    return {
      title: "Okazja podróżnicza | Tripownia.pl",
      description: "Sprawdź szczegóły okazji znalezionej przez Tripownię.",
      robots: { index: false, follow: true },
    };
  }

  const title = `${offer.city} od ${offer.price.toLocaleString("pl-PL")} zł/os. | Tripownia.pl`;
  const description = `${offer.hotel} • ${offer.dates} • ${offer.nights} nocy • wylot: ${offer.departure}. Sprawdź konkretną ofertę na Tripowni.`;
  const image = `/o/${offer.slug}/opengraph-image`;

  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: "Tripownia",
      locale: "pl_PL",
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: "Tripownia.pl" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ShortSocialOfferPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const offer = getOfferForPage(slug);
  if (!offer) return notFound();

  return (
    <main>
      <SiteHeader />
      <div className="shell">
        <div className="offer-detail-top">
          <Link href="/okazje"><ArrowLeft size={17}/> Zobacz wszystkie okazje</Link>
        </div>
        <section className="detail-hero">
          <div className="detail-image">
            {offer.imageSrc ? (
              <Image src={offer.imageSrc} alt={`${offer.city}, ${offer.country}`} className="detail-photo-img" width={1600} height={1000} sizes="(max-width: 760px) 100vw, 50vw" priority />
            ) : (
              <div className="tripownia-image-empty detail-photo-img" role="img" aria-label={`${offer.city}, ${offer.country}`}>
                <div className="tripownia-image-empty-inner"><span className="tripownia-image-mark">✈</span><strong>{offer.city}</strong><small>{offer.country}</small></div>
              </div>
            )}
            <span className="badge hot">OKAZJA TRIPOWNI</span>
          </div>
          <div className="detail-copy">
            <div className="eyebrow">{offer.country}</div>
            <h1>{offer.city}</h1>
            <div className="detail-topline"><div className="detail-score"><BadgeCheck size={18}/><span>Oferta zweryfikowana przez Tripownię</span></div></div>
            <div className="detail-price-card">
              <div className="detail-price"><small>znaleźliśmy od</small> <strong>{offer.price.toLocaleString("pl-PL")} zł</strong> / os.</div>
              <div className="price-status detail-price-status">Finalną cenę i dostępność potwierdza {offer.partnerLabel}.</div>
            </div>
            <p className="detail-lead"><strong>{offer.hotel}</strong></p>
            <div className="detail-meta">
              <span><Plane/> <b>{offer.departure}</b></span>
              <span><Moon/> <b>{offer.nights} nocy</b></span>
              <span><CalendarDays/> <b>{offer.dates}</b></span>
              <span><Utensils/> <b>{offer.board}</b></span>
              <span><MapPin/> <b>{offer.city}, {offer.country}</b></span>
            </div>
            {offer.expired ? (
              <>
                <div className="detail-source"><strong>Ta konkretna oferta 529 zł/os. na 30.11–03.12.2026 nie jest już dostępna.</strong> Nie przekierowujemy jej do innego terminu ani innej ceny.</div>
                <div className="detail-action-box">
                  <Link className="btn primary" href="/okazje">Zobacz aktualne okazje</Link>
                </div>
              </>
            ) : (
              <>
                <div className="detail-source">Najpierw oglądasz szczegóły w Tripowni. Rezerwacja i płatność odbywają się bezpośrednio u partnera.</div>
                <div className="detail-action-box">
                  <AffiliateOfferLink href={offer.affiliateUrl} partner={offer.partnerLabel} slug={offer.slug} destination={`${offer.city}, ${offer.country}`} />
                  <small className="affiliate-note">Link partnerski. Możemy otrzymać prowizję bez dodatkowego kosztu dla Ciebie.</small>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
