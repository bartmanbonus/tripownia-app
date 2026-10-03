import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pl.tripownia.app',
  appName: 'Tripownia',
  webDir: 'www',
  loggingBehavior: 'debug',
  server: {
    // Existing online shell. Assess TWA before public production release;
    // Capacitor documents server.url as a development/live-reload option.
    url: 'https://tripownia.pl/app',
    cleartext: false,
    allowNavigation: ['tripownia.pl'],
    errorPath: 'offline.html',
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
