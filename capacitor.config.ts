import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.94d006c68e754332897c5bfe0fe12394',
  appName: 'Better Buddy',
  webDir: 'dist',
  server: {
    url: 'https://94d006c6-8e75-4332-897c-5bfe0fe12394.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    ScreenTime: {
      requestPermissions: true
    }
  }
};

export default config;
