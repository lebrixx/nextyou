import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.timeritual.app',
  appName: 'Time Ritual',
  webDir: 'dist',
  // IMPORTANT: Commente la section "server" pour tester l'app native avec toutes les fonctionnalités
  // Décommente uniquement pour le développement avec hot-reload
  // server: {
  //   url: 'https://02242e9b-a733-4244-a277-ad7efa295676.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#8B5CF6",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0A0A0B",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    }
  },
  ios: {
    contentInset: "automatic"
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
