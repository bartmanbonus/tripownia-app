import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { partnerFromUrl } from "@/lib/affiliateJourney";
import { affiliateLinkContext, openAffiliateLink, sealAffiliateLink } from "@/lib/affiliateLinkToken";

export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Przejście do rezerwacji",
  robots: { index: false, follow: false },
};

type Search = Record<string, string | string[] | undefined>;

// Retain compatibility with old links without displaying another screen.
// New links already go straight to the encrypted /przejdz exit endpoint.
export default async function PartnerReview({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const query = await searchParams;
  const read = (name: string, max = 220) => {
    const value = query[name];
    return (Array.isArray(value) ? value[0] : value || "").trim().slice(0, max);
  };

  const legacyTarget = read("target", 8192);
  const payload = (() => {
    if (!legacyTarget) return openAffiliateLink(read("ref", 12000));
    const partner = partnerFromUrl(legacyTarget);
    if (!partner) return null;
    const context: Record<string, string> = {};
    for (const [name, value] of Object.entries(query)) {
      if (name === "target" || name === "partner" || name === "ref") continue;
      if (typeof value === "string") context[name] = value;
    }
    return {
      mode: "review" as const,
      partner,
      target: legacyTarget,
      context: affiliateLinkContext(context),
    };
  })();

  if (!payload || payload.mode !== "review") redirect("/okazje");

  const nextSource = payload.context.source || "site_offer";
  const ref = sealAffiliateLink({
    mode: "exit",
    partner: payload.partner,
    target: payload.target,
    context: {
      ...payload.context,
      source: nextSource.endsWith(":detail") ? nextSource : `${nextSource}:detail`,
      page: payload.context.page || "/sprawdz-oferte",
    },
  });
  redirect(`/przejdz/${ref}`);
}
