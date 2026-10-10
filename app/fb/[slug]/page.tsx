import { notFound, redirect } from "next/navigation";
import { getSocialOfferForLanding } from "@/lib/socialOffers";

type Props = { params: Promise<{ slug: string }> };

// This path should only resolve to known first-party Tripownia offer pages.
// It intentionally never contains the affiliate destination or the old price.
export default async function FacebookOfferReferral({ params }: Props) {
  const { slug } = await params;
  const offer = getSocialOfferForLanding(slug);
  if (!offer) notFound();

  const query = new URLSearchParams({
    utm_source: "facebook",
    utm_medium: "organic_social",
    utm_campaign: "fb_offer",
    utm_content: offer.slug,
  });
  redirect(`/o/${encodeURIComponent(offer.slug)}?${query.toString()}`);
}
