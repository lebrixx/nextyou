# Configuration de l'Application Mobile Time Ritual

Votre application est maintenant configurée pour devenir une vraie application mobile native avec **Capacitor** ! 🚀

## Fonctionnalités Mobiles Activées

✅ Notifications push et locales (citations, rappels habitudes, agenda)  
✅ Safe Area iOS pour la barre de statut  
✅ Support complet iOS et Android  
✅ Accès aux paramètres système de notifications  

## Prérequis

- **iOS** : Mac avec Xcode 15+ et compte Apple Developer ($99/an)
- **Android** : Android Studio et compte Google Play Developer ($25 une fois)

## Étapes pour Déployer sur les Stores

### 1. Exporter vers GitHub
Cliquez sur le bouton "Export to Github" dans Lovable et transférez votre projet.

### 2. Installation Locale
```bash
git clone [votre-repo]
cd [nom-du-projet]
npm install
```

### 3. Build du Projet
```bash
npm run build
```

### 4. Ajouter les Plateformes

**Pour iOS :**
```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

**Pour Android :**
```bash
npx cap add android
npx cap sync android
npx cap open android
```

## Configuration iOS pour l'App Store

### 1. Dans Xcode :
1. Ouvrez `ios/App/App.xcworkspace`
2. Sélectionnez le projet "App" dans le navigateur
3. Onglet "Signing & Capabilities" :
   - Sélectionnez votre Team
   - Activez "Automatically manage signing"
   - Ajoutez la capability "Push Notifications"
   - Ajoutez la capability "Background Modes" (Background fetch, Remote notifications)

### 2. Modifier Info.plist (`ios/App/App/Info.plist`) :
```xml
<key>NSUserNotificationsUsageDescription</key>
<string>Time Ritual a besoin des notifications pour t'envoyer des rappels d'habitudes et des citations motivantes.</string>

<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>remote-notification</string>
</array>
```

### 3. Icônes et Splash Screen :
- Remplacez les images dans `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Tailles requises : 20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024 pixels

### 4. Build pour l'App Store :
1. Product → Archive
2. Distribute App → App Store Connect
3. Upload

## Configuration Android pour le Play Store

### 1. Dans Android Studio :
1. Ouvrez le dossier `android/`
2. Build → Generate Signed Bundle / APK
3. Choisissez Android App Bundle (.aab)

### 2. Icônes :
- Remplacez dans `android/app/src/main/res/mipmap-*/`
- Utilisez [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/) pour générer toutes les tailles

### 3. Configuration (`android/app/build.gradle`) :
```gradle
android {
    defaultConfig {
        applicationId "com.timeritual.app"
        versionCode 1
        versionName "1.0.0"
    }
}
```

### 4. Permissions (`android/app/src/main/AndroidManifest.xml`) :
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
```

## Checklist avant Soumission

### App Store (iOS)
- [ ] Icône d'app 1024x1024 pixels
- [ ] Screenshots iPhone 6.7" (1290x2796)
- [ ] Screenshots iPhone 6.5" (1284x2778)  
- [ ] Screenshots iPad 12.9" (2048x2732)
- [ ] Description courte (max 30 caractères)
- [ ] Description longue (max 4000 caractères)
- [ ] Mots-clés (max 100 caractères)
- [ ] Politique de confidentialité URL
- [ ] Support URL
- [ ] Catégorie : Santé et forme / Productivité

### Play Store (Android)
- [ ] Icône 512x512 pixels
- [ ] Feature graphic 1024x500 pixels
- [ ] Screenshots phone (min 2, max 8)
- [ ] Description courte (max 80 caractères)
- [ ] Description longue (max 4000 caractères)
- [ ] Politique de confidentialité URL
- [ ] Formulaire de sécurité des données rempli
- [ ] Catégorie : Santé et remise en forme / Productivité

## Notes Importantes

⚠️ **AppId** : L'identifiant `com.timeritual.app` doit être unique. Vérifiez qu'il n'existe pas déjà sur les stores.

⚠️ **Section Server** : La section `server` dans `capacitor.config.ts` doit rester **commentée** pour les builds de production.

⚠️ **Notifications** : Les notifications nécessitent les permissions accordées par l'utilisateur.

## Ressources

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)
