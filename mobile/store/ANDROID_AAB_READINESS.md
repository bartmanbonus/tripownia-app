**Tripownia — gotowość Androida i najkrótsza ścieżka do AAB**

Audyt z 30 września 2026. Punkt odniesienia: `main` przy commicie `0cbedfee1e65430b5c12e2ad33ca484935c73c7f`. Potwierdzenie weryfikacji tożsamości z 28 września pochodzi od właścicielki konta. Audyt nie obejmował zalogowanego Play Console ani odczytu sekretów podpisujących.

Wrapper już istnieje w `mobile/` na `main`. Najkrótsza droga do aktualnego, podpisanego AAB to istniejący Capacitor, poprawiony workflow budowania i ręczne wgranie pliku na test wewnętrzny w Play Console. Do tej ścieżki nie potrzeba konta usługi ani Google Play Developer API.

| Sprawdzony element | Wynik |
| --- | --- |
| Główne `package.json` | Aplikacja webowa Next.js; deklaruje `^15.2.4`, a aktualny główny lockfile rozwiązuje Next.js do `15.5.25`. |
| `mobile/package.json` | Osobny projekt Capacitor dla Androida i iOS. Przed zmianą używał `latest` i nie miał własnego lockfile. |
| `mobile/capacitor.config.ts` | `appId: pl.tripownia.app`, `webDir: www`, ładowanie `https://tripownia.pl/app`. |
| Projekt Gradle | Nie jest zapisany w żadnej z 170 pobranych gałęzi. Workflow generuje `mobile/android/` przez `cap add android`. |
| Pozostałe gałęzie | `feature/native-mobile-app`, `chore/mobile-store-release`, `chore/store-compliance`, `chore/store-listings` zawierają konfigurację w `mobile/`. `tripownia-android-app` ma dodatkowo historyczny `capacitor.config.json` w katalogu głównym. |
| Android APK workflow | Buduje debug APK; to plik do testów, nie wydanie AAB do Play Console. |
| Dotychczasowy AAB workflow | Generował `bundleRelease` bez podpisania kluczem upload. |
| Workflow publikujący | Potrafi podpisywać AAB, lecz później wymaga konta usługi i próbuje od razu publikować na wybrany track. |
| Istniejący artefakt | [Build z 12 września](https://github.com/bartmanbonus/tripownia-app/actions/runs/34685192348) zakończył się sukcesem; artefakt `tripownia-android-release-aab` był dostępny podczas audytu. |
| Kontrola starego AAB | Potwierdzono `package=pl.tripownia.app`, `versionCode=1`, `versionName=1.0`, `minSdk=24`, `targetSdk=36`, `compileSdk=36`. `jarsigner` potwierdził brak podpisu. W pliku nie było bibliotek `.so`. |
| Publiczna strona | `/app`, `/konto`, `/manifest.webmanifest` i polityka prywatności zwracają HTTP 200. `/.well-known/assetlinks.json` zwraca HTTP 404. |

**Zakres proponowanego diffu**

Zmiany porządkują istniejący build: przypinają Capacitor `8.5.2`, Browser `8.0.4` i narzędzia, dodają mobilny lockfile i `npm ci`, ustawiają jawne `versionCode` / `versionName`, sprawdzają pakiet i SDK 36, generują ikony, podpisują i weryfikują AAB oraz wystawiają plik jako artefakt GitHub Actions. Workflow uruchamia się ręcznie. Hasła są przekazywane do `jarsigner` przez środowisko; tymczasowy keystore jest usuwany po podpisaniu. Dodano też lokalny ekran błędu połączenia i ograniczono nawigację WebView do właściwej domeny.

Wersje `tar`, `sharp` i `uuid` w mobilnych narzędziach są nadpisane do zweryfikowanych, nowszych wersji. Audyt początkowej instalacji wykazał podatności w zależnościach narzędzi budujących, w tym starszym CLI używanym przez generator grafik. Po zmianie zależności `npm audit` raportuje 0 znanych podatności, a generator ponownie poprawnie utworzył 74 zasoby Androida.

**Kroki do podpisanego AAB**

1. W Play Console sprawdzić, czy istnieje już aplikacja z pakietem `pl.tripownia.app`, czy był wgrany jakikolwiek AAB i jaki jest najwyższy `versionCode`. Zachować dotychczasowy pakiet i zarejestrowany klucz upload. Weryfikacja tożsamości dewelopera i podpis aplikacji to oddzielne rzeczy.
2. Przy pierwszym wydaniu utworzyć klucz upload na zaufanym komputerze, np. w Android Studio przez **Build → Generate Signed Bundle / APK → Android App Bundle → Create new**. Wybrać RSA i przechowywać keystore oraz hasła z kopią zapasową poza repo. Alternatywa w terminalu, z interaktywnymi pytaniami o hasła:

   ```powershell
   keytool -genkeypair -v -storetype JKS -keystore C:\Klucze\tripownia-upload.jks -alias tripownia-upload -keyalg RSA -keysize 2048 -validity 10000
   ```

   Jeżeli klucz upload był już zarejestrowany w Play, użyć tego klucza. Utracony klucz wymaga procedury resetu klucza upload w Play Console.
3. Dodać w GitHub **Settings → Secrets and variables → Actions** cztery sekrety:

   | Sekret | Wartość |
   | --- | --- |
   | `ANDROID_KEYSTORE_BASE64` | Cały keystore zakodowany Base64. |
   | `ANDROID_KEYSTORE_PASSWORD` | Hasło magazynu kluczy. |
   | `ANDROID_KEY_ALIAS` | Alias, np. `tripownia-upload`. |
   | `ANDROID_KEY_PASSWORD` | Hasło klucza dla tego aliasu. |

   Na Windows Base64 można skopiować bez wypisywania klucza w terminalu:

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\Klucze\tripownia-upload.jks')) | Set-Clipboard
   ```

   Base64 nie szyfruje keystore. Wartość wkleić wyłącznie do sekretu GitHub; nie do opisu PR, plików ani wiadomości.
4. Po przyjęciu diffu uruchomić w GitHub Actions **Mobile Android Signed AAB → Run workflow** na aktualnym `main`. Wprowadzić `version_code=1` wyłącznie przy pierwszym wgraniu; w kolejnych wydaniach numer musi przekraczać poprzednie użyte kody. `version_name` np. `1.0.0`.
5. Pobrać artefakt `tripownia-signed-aab-<versionCode>`, rozpakować ZIP. Plik do wgrania: `tripownia-<versionName>-<versionCode>.aab`. Obok znajduje się suma SHA-256. Klucza prywatnego nie ma w artefakcie.
6. W Play Console wybrać aplikację i **Testowanie i publikowanie → Testowanie → Testy wewnętrzne → Utwórz nową wersję** (nazwy sekcji mogą zależeć od języka interfejsu), skonfigurować **Play App Signing** i wgrać podpisany AAB. Dla pierwszej aplikacji najprościej pozwolić Google wygenerować i przechowywać klucz podpisujący aplikację. Lokalny klucz upload podpisuje przesyłane AAB; Google podpisuje APK dostarczane użytkownikom innym kluczem aplikacji.
7. Dodać testerów i testować instalację przez link Google Play. AAB nie instaluje się bezpośrednio jak APK. Sprawdzić start, przycisk Wstecz, linki afiliacyjne i powrót od partnera, zapis planów, logowanie, usuwanie konta i działanie po utracie sieci.

Równoległa ścieżka lokalna: w `mobile/` wykonać `npm ci`, następnie `npx cap add android` tylko gdy projekt Android nie istnieje, ustawić zmienne `ANDROID_VERSION_CODE` i `ANDROID_VERSION_NAME`, wykonać `npm run android:release:configure` oraz `npx cap sync android`. Projekt `mobile/android` otworzyć w Android Studio z SDK 36 i JDK 21; **Generate Signed Bundle / APK** wytworzy podpisany AAB w wybranym folderze. Samo `gradlew bundleRelease` nadal daje niepodpisany bundle, ponieważ szablon nie zawiera konfiguracji klucza release.

**Gotowość do publicznego wydania**

| Kwestia | Co trzeba potwierdzić przed publicznym wydaniem |
| --- | --- |
| Architektura WebView | Dokumentacja Capacitor wskazuje `server.url` jako opcję live reload, nie zaleca jej do produkcji. Podpisany plik AAB nie potwierdza gotowości produktu ani akceptacji przez Google Play. |
| Logowanie przez mail / OAuth | W `lib/accountAuth.ts` powrót prowadzi do webowego `/konto`. Brak integracji `@capacitor/app`, Android App Links i obsługi powrotu do aplikacji. Link otwarty z maila może ustanowić sesję w przeglądarce, a WebView zachowa osobną sesję. Wymaga testu na urządzeniu i docelowej implementacji powrotu lub logowania kodem OTP w aplikacji. |
| Afiliacje i przycisk Wstecz | Jest `NativeAppBridge` i plugin Browser; sprawdzić wszystkie ścieżki przekierowań, także `/go/*` i `/out/*`. Nie wszystkie te ścieżki są jawnie przechwytywane w bridge. |
| Konto i dane | W repo istnieje usuwanie konta przez backend i kontrolki danych. Nie potwierdzono wykonania backendowej operacji na testowym koncie. Do formularza Play potrzebny jest działający webowy link pozwalający zażądać usunięcia konta i danych. |
| Opis i prywatność | Uzupełnić listing, ikonę 512×512, feature graphic 1024×500, zrzuty ekranu, kontakt, politykę prywatności, Data safety, ocenę treści, grupę odbiorców, deklarację reklam oraz instrukcje dostępu dla recenzenta według faktycznego działania aplikacji. Data safety obejmuje także kontrolowane przez Tripownię treści webowe, analitykę i uwierzytelnianie. |
| Wartość aplikacji | Przy aplikacji zarabiającej na afiliacjach trzeba wykazać własną użyteczność: planner, organizację podróży, zapis planów i personalizację. Google Play ma odrębną politykę dotyczącą aplikacji, których podstawowym celem jest kierowanie ruchu afiliacyjnego. |
| Rodzaj konta Play | Dla osobistych kont utworzonych po 13.11.2023: zamknięty test z co najmniej 12 testerami zapisanymi nieprzerwanie przez minimum 14 dni, potem wniosek o dostęp do produkcji. Test wewnętrzny nie zastępuje tego wymogu. |
| Urządzenie | Nowe konta osobiste mogą wymagać osobnej weryfikacji fizycznego telefonu Android 10+. Można użyć pożyczonego telefonu; iPhone i emulator nie zastępują tej weryfikacji. |

**Wybór rozwiązania dla tej aplikacji**

| Opcja | Ocena |
| --- | --- |
| Istniejący Capacitor | Najkrótsza ścieżka do AAB i testu wewnętrznego. Zachowuje przygotowane iOS i integrację Browser. Wymaga uporządkowania wydawania i potwierdzenia zachowania online wrappera. |
| TWA / Bubblewrap | Lepsze dopasowanie do Androida, jeśli produkt ma pozostać aplikacją webową zależną od serwera. To ocena architektury na podstawie repo: liczne dynamiczne endpointy, middleware, przekierowania i działająca PWA. Trzeba przygotować nowy projekt TWA, ikony PWA 192/512, połączenie domeny przez Digital Asset Links oraz testy. Fingerprint w `assetlinks.json` dla instalacji z Play musi pochodzić z **certyfikatu klucza podpisującego aplikację w Play**, a nie tylko z klucza upload. Obecnie assetlinks zwraca 404. |
| Capacitor z lokalnym frontendem | Docelowa opcja przy większej liczbie funkcji natywnych. Wymaga wydzielenia frontendu i pozostawienia API na serwerze. Nie jest minimalną zmianą. |
| `output: 'export'` dla obecnego Next.js | Nie daje kompletnego produktu w tej architekturze. Dynamiczne endpointy, middleware i przekierowania wymagają serwera; nie należy zmieniać całej aplikacji na eksport statyczny tylko po to, aby uzyskać AAB. |

**Zakres walidacji**

Potwierdzono historyczny udany build Androida oraz zbadano rzeczywisty stary AAB narzędziami `bundletool` i `jarsigner`. Dla diffu wykonano instalację mobilnych zależności, generowanie projektu Androida, konfigurację SDK i wersji, generowanie ikon i synchronizację Capacitor, parsowanie YAML/Bash, walidację istniejącego projektu i kontrolę diffu. Sprawdzono odrzucanie nieprawidłowych wersji, prób wstrzyknięcia tekstu i SDK 35. Podpisywanie i ścisłą weryfikację sprawdzono na tymczasowym kluczu testowym, który następnie usunięto.

Nie wykonano pełnej nowej kompilacji Gradle ani testu na Androidzie; środowisko audytu nie ma Android SDK. Nie użyto prawdziwego klucza upload ani nie wgrano wersji do Play Console. Obecność klucza, status aplikacji i rodzaj konta Play wymagają sprawdzenia po stronie właścicielki konta.

Aktualne wymagania sprawdzono w źródłach pierwotnych:

- [Google Play: target API, od 31.08.2026 wymagany Android 16 / API 36](https://developer.android.com/google/play/requirements/target-sdk)
- [Android: podpisywanie AAB i Play App Signing](https://developer.android.com/studio/publish/app-signing)
- [Android: versionCode i versionName](https://developer.android.com/studio/publish/versioning)
- [Capacitor: server.url i errorPath](https://capacitorjs.com/docs/config)
- [Capacitor 8: SDK 36 i wymagania środowiska](https://capacitorjs.com/docs/updating/8-0)
- [Google: Trusted Web Activities i Digital Asset Links](https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2)
- [Next.js: ograniczenia eksportu statycznego](https://nextjs.org/docs/app/guides/static-exports)
- [Supabase: powrót z uwierzytelniania do aplikacji mobilnej](https://supabase.com/docs/guides/auth/native-mobile-deep-linking)
- [Play: testowanie nowych kont osobistych](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Play: weryfikacja fizycznego urządzenia](https://support.google.com/googleplay/android-developer/answer/14316361)
- [Play: usuwanie konta](https://support.google.com/googleplay/android-developer/answer/13327111)
- [Play: Webviews and Affiliate Spam](https://support.google.com/googleplay/android-developer/answer/9899034)
- [Play: wymagania grafik i zrzutów ekranu](https://support.google.com/googleplay/android-developer/answer/9866151)
