# Tripownia — store compliance draft

This file records the current store-submission answers for the mobile wrapper. Re-check it whenever analytics, accounts, payments, push notifications, or new SDKs are added.

## Product

- App name: Tripownia
- Bundle/package id: `pl.tripownia.app`
- Category: Travel
- Primary language: Polish
- Support URL: https://tripownia.pl/
- Privacy policy: https://tripownia.pl/polityka-prywatnosci
- Current mobile architecture: Capacitor shell loading `https://tripownia.pl/app`

## Google Play — Data safety draft

Current product behavior:

- No Tripownia account is required for the current app experience.
- Favorites, comparison, profile preferences and My Trip are currently stored locally on the user's device/browser storage.
- Tripownia does not currently operate its own checkout for travel bookings; booking links open external partners.
- Affiliate links may contain tracking identifiers used to attribute clicks or bookings to Tripownia.
- Hosting/infrastructure may process technical request data such as IP address, device/browser information, request time and requested page for delivery, security and diagnostics.

Before submission, verify the final production build and every third-party SDK. If no additional analytics/ads SDK is added, do not declare data collection that the app does not perform itself. External partner websites have their own data practices after the user leaves Tripownia.

## Apple App Privacy — draft

Current architecture does not intentionally request name, email, phone number, precise location, contacts, photos, health data, financial information or user-generated content from Tripownia users.

Potential technical data processed by hosting/network infrastructure may include IP address and device/browser diagnostics. Review Apple's current definition of "collected" at submission time and answer according to the actual production stack and any enabled analytics SDKs.

The current app does not use data for cross-company advertising tracking by Tripownia itself. Affiliate attribution parameters are used on outbound partner links and should be re-evaluated against Apple's tracking definition before final submission.

## Content rating draft

Tripownia is a travel discovery and planning app. The current first-party app content does not intentionally contain violence, sexual content, gambling, drugs, profanity or horror themes. External travel-partner pages may display ordinary commercial travel content.

Expected rating target: the lowest general-audience rating permitted by the store questionnaire, subject to the final answers in Play Console/App Store Connect.

## Account deletion

The current product does not require or create a Tripownia user account. Therefore there is currently no Tripownia account-deletion flow to expose. If server-side accounts are added later, an in-app and web account-deletion path must be added before store submission/update where required.

## Payments

Tripownia does not currently sell digital content or digital subscriptions inside the app. Travel purchases are completed with external travel providers. Re-check store payment rules before introducing any paid digital features.

## Reviewer notes draft

Tripownia helps users discover travel ideas and offers, compare selected options, save favorites and organize a trip. The app links users to external travel providers to complete bookings. No login is required for the current experience.
