import type { Metadata } from "next";
import Link from "next/link";
import OfferHeroImage from "@/components/OfferHeroImage";
import OfferJourney from "@/components/OfferJourney";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarDays, MapPin, Moon, Plane, PlusCircle, Utensils } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AffiliateOfferLink from "@/components/AffiliateOfferLink";
import { getSocialOfferForLanding, socialOfferDateRange, isSocialOfferExpired, socialOfferReady, type SocialOffer } from "@/lib/socialOffers";
import CompleteTripSales from "@/components/CompleteTripSales";
import OfferAlternativeFinder from "@/components/OfferAlternativeFinder";
import OfferAlternativeJump from "@/components/OfferAlternativeJump";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import SocialShare from "@/components/SocialShare";
import PurchaseChoices from "@/components/PurchaseChoices";

// Recompute social preview validity at least every 30 minutes; a checked price is never permanent.
export const revalidate = 1800;

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
  const normalizedSlug = slug.toLocaleLowerCase("pl");
  if (normalizedSlug === "rzym-529") return LEGACY_RZYM_529;
  return getSocialOfferForLanding(slug);
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

  // Never advertise a historical price as if it were still bookable in Facebook/WhatsApp previews.
  // New, recently verified offers keep the existing on-brand destination card.
  const priceVerified = !isSocialOfferExpired(offer) && socialOfferReady(offer);
  const title = priceVerified
    ? `${offer.city} od ${offer.price.toLocaleString("pl-PL")} zł/os. | Tripownia.pl`
    : `${offer.city} — sprawdź aktualne propozycje | Tripownia.pl`;
  const description = priceVerified
    ? `${offer.hotel} • ${offer.dates} • ${offer.nights} nocy • wylot: ${offer.departure}. Cena przy ostatnim sprawdzeniu; potwierdź dostępność przed rezerwacją.`
    : `Zobacz szczegóły wyjazdu: ${offer.city}, ${offer.dates}, wylot z ${offer.departure}. Cena z posta może być nieaktualna — sprawdź aktualne alternatywy w Tripowni.`;
  const image = priceVerified ? `/api/social-card/${offer.slug}?format=facebook` : "/opengraph-image";
  const imageAlt = priceVerified
    ? `${offer.city}, cena przy ostatnim sprawdzeniu od ${offer.price.toLocaleString("pl-PL")} zł — Tripownia.pl`
    : `Tripownia.pl — sprawdź aktualne okazje i wyjazdy do ${offer.city}`;
  const pageUrl = `/o/${offer.slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: pageUrl },
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: "Tripownia",
      locale: "pl_PL",
      url: pageUrl,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ShortSocialOfferPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const offer = getOfferForPage(slug);
  if (!offer) return notFound();

  const tripKind = offer.partner === "kiwi" ? "flight" : offer.partner === "booking" ? "hotel" : "package";
  const dateRange = socialOfferDateRange(offer);
  const expired = offer.expired || isSocialOfferExpired(offer);
  const directAffiliateHref = (() => {
    if (!offer.affiliateUrl || offer.partner === "other") return offer.affiliateUrl;
    const value = (key: string) => {
      const raw = query[key];
      return Array.isArray(raw) ? raw[0] || "" : raw || "";
    };
    const tracked = new URLSearchParams({
      target: offer.affiliateUrl,
      partner: offer.partner,
      source: "social_offer",
      page: `/o/${offer.slug}`,
      offer: offer.slug,
      destination: `${offer.city}, ${offer.country}`,
      price: String(offer.price),
      landing: `/o/${offer.slug}`,
    });
    const utmSource = value("utm_source");
    const utmMedium = value("utm_medium");
    const utmCampaign = value("utm_campaign");
    const utmContent = value("utm_content");
    if (utmSource) tracked.set("utmSource", utmSource);
    if (utmMedium) tracked.set("utmMedium", utmMedium);
    if (utmCampaign) tracked.set("utmCampaign", utmCampaign);
    if (utmContent) tracked.set("utmContent", utmContent);
    return `/go/live?${tracked.toString()}`;
  })();

  const plannerParams = new URLSearchParams({
    mode: "known",
    source: "offer",
    city: offer.city,
    country: offer.country,
    kind: tripKind,
    slug: offer.slug,
    departure: offer.departure,
    hotel: offer.hotel,
    board: offer.board,
    nights: String(offer.nights),
    ...(dateRange.start ? { start: dateRange.start } : {}),
    ...(dateRange.end ? { end: dateRange.end } : {}),
  });
  const plannerHref = `/dodaj-podroz?${plannerParams.toString()}`;

  return (
    <main className="social-offer-page offer-journey-page">
      <SiteHeader />
      <div className="shell">
        <div className="offer-detail-top">
          <Link href="/okazje"><ArrowLeft size={17}/> Zobacz wszystkie okazje</Link>
        </div>
        <OfferJourney offerId={offer.slug} destination={offer.city} partner={offer.partner} price={offer.price} source="social_offer" />
        <section className="detail-hero">
          <OfferHeroImage city={offer.city} country={offer.country} src={offer.imageSrc} />
          <div className="detail-copy">
            <div className="eyebrow">{offer.country}</div>
            <h1>{offer.city}</h1>
            <div className="detail-topline"><div className="detail-score"><BadgeCheck size={18}/><span>Szczegóły wybranej propozycji</span></div></div>
            <div className="detail-price-card">
              <div className="detail-price"><small>znaleźliśmy od</small> <strong>{offer.price.toLocaleString("pl-PL")} zł</strong> / os.</div>
              <div className="price-status detail-price-status">Cena zapisana {new Intl.DateTimeFormat("pl-PL", { timeZone: "Europe/Warsaw", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(offer.checkedAt))}. Sprawdź aktualną cenę i dostępność przed rezerwacją.</div>
            </div>
            <p className="detail-lead"><strong>{offer.hotel}</strong></p>
            {(expired) ? (
              <>
                <div className="detail-source"><strong>Ta konkretna oferta {offer.price.toLocaleString("pl-PL")} zł/os. na {offer.dates} nie jest już dostępna w potwierdzonej cenie.</strong> Nie przekierowujemy jej do innego terminu ani wyższej ceny. Zobacz aktualne okazje poniżej.</div>
                <div className="detail-action-box">
                  <Link className="btn primary" href="/okazje">Zobacz aktualne okazje</Link>
                </div>
              </>
            ) : (
              <>
                <div className="detail-action-box">
                  <AffiliateOfferLink
                    href={directAffiliateHref}
                    partnerLabel={offer.partnerLabel}
                    partner={offer.partner}
                    slug={offer.slug}
                    price={offer.price}
                    destination={`${offer.city}, ${offer.country}`}
                    tripKind={tripKind}
                    departure={offer.departure}
                    hotel={offer.hotel}
                    board={offer.board}
                    nights={offer.nights}
                    start={dateRange.start}
                    end={dateRange.end}
                  />
                  <OfferAlternativeJump />
                  <Link className="btn secondary" href={plannerHref}><PlusCircle size={17}/> Dodaj do planera</Link>
                  <small className="affiliate-note">Link partnerski. Możemy otrzymać prowizję bez dodatkowego kosztu dla Ciebie.</small>
                </div>
              </>
            )}
            <div className="detail-meta">
              <span><Plane/> <b>{offer.departure}</b></span>
              <span><Moon/> <b>{offer.nights} {offer.nights === 1 ? "noc" : offer.nights >= 2 && offer.nights <= 4 ? "noce" : "nocy"}</b></span>
              <span><CalendarDays/> <b>{offer.dates}</b></span>
              <span><Utensils/> <b>{offer.board}</b></span>
              <span><MapPin/> <b>{offer.city}, {offer.country}</b></span>
            </div>
          </div>
        </section>
        {!(expired) && (
          <PurchaseChoices
            city={offer.city}
            country={offer.country}
            nights={offer.nights}
            board={offer.board}
            departure={offer.departure}
            currentPrice={offer.price}
          />
        )}
        {!expired && directAffiliateHref && (
          <div className="social-offer-mobile-booking-bar">
            <div>
              <small>Tripownia znalazła od</small>
              <strong>{offer.price.toLocaleString("pl-PL")} zł / os.</strong>
            </div>
            <AffiliateOfferLink
              href={directAffiliateHref}
              partnerLabel={offer.partnerLabel}
              partner={offer.partner}
              slug={offer.slug}
              price={offer.price}
              destination={`${offer.city}, ${offer.country}`}
              tripKind={tripKind}
              departure={offer.departure}
              hotel={offer.hotel}
              board={offer.board}
              nights={offer.nights}
              start={dateRange.start}
              end={dateRange.end}
            />
          </div>
        )}

        {!(expired) && (
          <OfferAlternativeFinder
            city={offer.city}
            country={offer.country}
            nights={offer.nights}
            board={offer.board}
            departure={offer.departure}
            dates={offer.dates}
            hotel={offer.hotel}
          />
        )}
      </div>
      <section className="section shell" aria-label="Poleć tę ofertę">
        <SocialShare
          url={`/o/${offer.slug}`}
          title={`${offer.city} – Tripownia.pl`}
          text={`Zobacz ${offer.city} w Tripowni. Cena i termin mogą się zmienić; przed rezerwacją sprawdź aktualną dostępność.`}
          placement="social_offer_after_details"
          label="WYŚLIJ ZNAJOMYM"
          heading="Kto poleciałby z Tobą?"
          description="Wyślij znajomym szczegóły tej propozycji. Każda osoba zobaczy aktualny status i opcje rezerwacji w Tripowni."
        />
      </section>
      <section className="section shell" aria-label="Nie przegap kolejnej okazji">
        <FacebookFollowCTA placement="social_offer_after_details" compact />
      </section>
      {!offer.expired && <CompleteTripSales city={offer.city} country={offer.country} source="social_offer" />}
      <SiteFooter />
    </main>
  );
}
