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

- A Tripownia account is optional. Users can browse and plan locally without creating an account.
- When a user chooses to sign in, Tripownia can synchronize profile preferences, favorites, compared offers, current and archived trips, alerts and planner/toolkit data between devices.
- Authentication uses Supabase. Email is processed when a user chooses email-based sign-in.
- Tripownia does not currently operate its own checkout for travel bookings; booking links open external partners.
- Affiliate links may contain tracking identifiers used to attribute clicks or bookings to Tripownia.
- Analytics and Meta Pixel may run according to the user's consent choices on the web experience loaded by the app.
- Hosting/infrastructure may process technical request data such as IP address, device/browser information, request time and requested page for delivery, security and diagnostics.

Before submission, verify the final production build and every enabled analytics/auth SDK or web integration against the current Google Play Data safety definitions.

## Apple App Privacy — draft

Current product behavior may involve:

- Email address, only when the user chooses to sign in using email.
- User-provided travel profile and trip-planning data when the user chooses to use account synchronization.
- Technical usage/diagnostic data through hosting and analytics integrations, subject to the production consent configuration.
- Affiliate attribution data on outbound partner links.

Tripownia does not currently request precise location, contacts, health data, financial account information, microphone, camera or photo-library access as part of the core app experience.

Review Apple's current definitions of collected data, tracking and linked-to-user data at submission time and answer according to the final production stack.

## Content rating draft

Tripownia is a travel discovery and planning app. The current first-party app content does not intentionally contain violence, sexual content, gambling, drugs, profanity or horror themes. External travel-partner pages may display ordinary commercial travel content.

Expected rating target: the lowest general-audience rating permitted by the store questionnaire, subject to the final answers in Play Console/App Store Connect.

## Account deletion

Tripownia accounts are optional. Logged-in users can permanently delete their account and synchronized cloud data from the in-app account settings. The deletion flow calls an authenticated Supabase Edge Function, removes the user's Tripownia state and deletes the Supabase Auth user. Local Tripownia account data is then cleared from the device.

Re-check the final store questionnaire wording and privacy-policy wording before submission.

## Payments

Tripownia does not currently sell digital content or digital subscriptions inside the app. Travel purchases are completed with external travel providers. Re-check store payment rules before introducing any paid digital features.

## Reviewer notes draft

Tripownia helps users discover travel ideas and offers, compare selected options, save favorites and organize a trip. The app links users to external travel providers to complete bookings. Login is optional and is used for synchronization and personalization.
