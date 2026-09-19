import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "pl.tripownia.app",
  appName: "Tripownia",
  webDir: "public",
  server: {
    url: "https://tripownia.pl",
    cleartext: false,
    androidScheme: "https",
    allowNavigation: ["tripownia.pl", "*.tripownia.pl"],
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
