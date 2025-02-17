import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dlinqntshield.app',
  appName: 'Dlinqnt Shield',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://dlinqnt-shield.replit.app',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'key0',
      keystorePassword: 'dlinqnt',
      keyPassword: 'dlinqnt',
    }
  }
};

export default config;
