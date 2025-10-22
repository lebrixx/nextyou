import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.02242e9ba7334244a277ad7efa295676',
  appName: 'Next You 2.0',
  webDir: 'dist',
  server: {
    url: 'https://02242e9b-a733-4244-a277-ad7efa295676.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
