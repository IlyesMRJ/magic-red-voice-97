import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ca3584a8e8994865a4698634a7dbbb7e',
  appName: 'Magic Assistant',
  webDir: 'dist',
  server: {
    url: 'https://ca3584a8-e899-4865-a469-8634a7dbbb7e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#1a1a1a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#00bcd4",
      splashFullScreen: true,
    },
  },
};

export default config;