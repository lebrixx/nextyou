# Configuration des Notifications iOS

Pour que les notifications fonctionnent correctement sur iOS, tu dois suivre ces étapes :

## 1. Ajouter les permissions dans Info.plist

Après avoir exécuté `npx cap add ios`, tu dois modifier le fichier `ios/App/App/Info.plist` :

Ajoute ces clés avant la balise fermante `</dict>` :

```xml
<key>NSUserNotificationsUsageDescription</key>
<string>Cette application a besoin d'envoyer des notifications pour te rappeler tes habitudes et te motiver avec des citations inspirantes.</string>

<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>remote-notification</string>
</array>
```

## 2. Configuration dans Xcode

1. Ouvre le projet dans Xcode : `ios/App/App.xcworkspace`
2. Sélectionne le projet dans le navigateur de gauche
3. Va dans l'onglet "Signing & Capabilities"
4. Clique sur "+ Capability"
5. Ajoute "Push Notifications"
6. Assure-toi que "Background Modes" est activé avec :
   - Background fetch
   - Remote notifications

## 3. Vérification du code

Le code dans `src/pages/Index.tsx` demande déjà correctement les permissions au démarrage :

```typescript
const permStatus = await LocalNotifications.checkPermissions();
if (permStatus.display !== 'granted') {
  const result = await LocalNotifications.requestPermissions();
}
```

## 4. Synchronisation

Après ces modifications, exécute :

```bash
npx cap sync ios
```

## 5. Build et test

1. Build depuis Xcode
2. Teste sur un appareil réel (les notifications ne marchent pas toujours sur le simulateur)
3. Vérifie que les permissions sont acceptées au premier lancement

## Problèmes courants

- **"Impossible d'activer les notifications"** : Vérifie que tu as bien ajouté la capability "Push Notifications" dans Xcode
- **Notifications ne s'affichent pas** : Assure-toi que les permissions sont accordées dans Réglages iOS > Next Me > Notifications
- **Crash au lancement** : Vérifie que le Info.plist est bien formé (XML valide)

## Logs de debug

Pour voir les logs dans Xcode :
1. Ouvre la console (Cmd+Shift+C)
2. Recherche "Notification" dans les logs
3. Les logs afficheront "Notification permissions result:" avec le statut
