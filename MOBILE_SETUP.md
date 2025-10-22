# Configuration de l'Application Mobile HabitFlow

Votre application est maintenant configurée pour devenir une vraie application mobile native avec **Capacitor** ! 🚀

## Fonctionnalités Mobiles Activées

✅ Notifications push quotidiennes avec citations  
✅ Widgets pour afficher les citations et compteurs sur l'écran d'accueil  
✅ Safe Area iOS pour la barre de statut  
✅ Support complet iOS et Android  

## Étapes pour Tester sur Appareil Réel

### 1. Exporter vers GitHub
Cliquez sur le bouton "Export to Github" dans Lovable et transférez votre projet.

### 2. Installation Locale
```bash
git clone [votre-repo]
cd [nom-du-projet]
npm install
```

### 3. Initialiser Capacitor
```bash
npx cap init
```
Les valeurs sont déjà préconfigurées dans `capacitor.config.ts`.

### 4. Build du Projet
```bash
npm run build
```

### 5. Ajouter les Plateformes

**Pour iOS (nécessite un Mac avec Xcode):**
```bash
npx cap add ios
npx cap update ios
npx cap sync
npx cap open ios
```

**Pour Android (nécessite Android Studio):**
```bash
npx cap add android
npx cap update android
npx cap sync
npx cap open android
```

### 6. Lancer l'App
```bash
# Pour Android
npx cap run android

# Pour iOS
npx cap run ios
```

## Configuration des Widgets

### iOS
1. Maintiens appuyé sur l'écran d'accueil
2. Appuie sur le bouton "+" en haut à gauche
3. Recherche "HabitFlow"
4. Sélectionne le widget de citations ou compteurs
5. Ajoute-le à ton écran d'accueil

### Android
1. Maintiens appuyé sur l'icône de l'app
2. Sélectionne "Widgets"
3. Choisis le widget que tu veux ajouter
4. Fais-le glisser sur ton écran d'accueil

## Notes Importantes

- Les notifications nécessitent les permissions de l'appareil (demandées au premier lancement)
- Pour tester en développement, l'app se connecte au serveur Lovable (hot-reload activé)
- Pour la production, vous devrez build l'app et la publier sur les stores

## Support

Pour plus d'informations sur Capacitor : https://capacitorjs.com/docs
