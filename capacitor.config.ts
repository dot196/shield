import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dlinqntshield.app',
  appName: 'Dlinqnt Shield',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    url: 'https://dlinqnt-shield.replit.app',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'key0',
      keystorePassword: 'dlinqnt'
    }
  }
};

export default config;