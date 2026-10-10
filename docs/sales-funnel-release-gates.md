# Tripownia — sales funnel release gates

Before merging a conversion or SEO change, verify:

- [ ] Home page retains all existing offer sections and cards.
- [ ] Every promoted offer has a valid destination, travel dates and clear price freshness.
- [ ] Clicking an offer opens its specific booking result, not an empty generic search.
- [ ] Affiliate attribution survives redirect; no partner brand or tracking token is exposed in customer-facing copy.
- [ ] Redirect tracking fires once per outbound click.
- [ ] Empty live results show honest alternatives, never invented availability or stale prices presented as live.
- [ ] Search covers multi-origin, flexible dates and mobile viewport.
- [ ] Canonical, sitemap and structured data do not claim unavailable offers.
- [ ] Production smoke tests and build pass on the exact release commit.
- [ ] After release, check outbound-click events, error logs and a representative sample of offer URLs.

## Measurement

Record baseline and 7-day trends for: landing sessions, offer detail views, partner outbound clicks, outbound CTR, confirmed bookings, attributed commission, and revenue per session. Do not report bookings as confirmed based only on clicks.

## Rollout

Ship on a review branch, validate on preview, then promote the tested build. Roll back if offer cards disappear, affiliate attribution breaks, or booking redirects fail.
