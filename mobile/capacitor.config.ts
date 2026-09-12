import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pl.tripownia.app',
  appName: 'Tripownia',
  webDir: 'www',
  server: {
    url: 'https://tripownia.pl/app',
    cleartext: false,
    allowNavigation: ['tripownia.pl', '*.tripownia.pl'],
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
