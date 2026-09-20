# Tripownia Android

Android shell for Tripownia using Capacitor.

## App identity
- App name: Tripownia
- Application ID: `pl.tripownia.app`
- Web origin: `https://tripownia.pl`

## Local build
1. `npm install`
2. `npx cap add android`
3. `npm run android:sync`
4. `npm run android:open`

Build a signed Android App Bundle (AAB) in Android Studio for Google Play. Keep signing keys and Play credentials outside the repository.

## Link behavior
Tripownia pages remain in the app shell. External affiliate/partner destinations should continue to open as external HTTPS destinations according to the web app link behavior.

## Release checklist
- Replace generated launcher assets with final Tripownia icon and splash assets.
- Test login/account, search, favorites, comparison and outbound affiliate links on a physical Android device.
- Verify back navigation and external browser hand-off.
- Create signed release AAB.
- Upload to Google Play Console internal testing first.
- Complete store listing, privacy/data-safety declarations and content rating before production rollout.

## GitHub release workflow
The manual `Android release AAB` workflow creates the Google Play bundle. Every run gets a monotonically increasing `versionCode` based on the GitHub Actions run number and a `versionName` in the form `0.1.<run>`.

Required repository secrets:
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Never commit the upload keystore or its passwords to the repository.
