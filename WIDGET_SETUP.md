# Configuration des Widgets iOS pour Next You 2.0

Ce guide explique comment ajouter des widgets natifs iOS à l'application Next You 2.0 pour afficher les compteurs et les citations sur l'écran d'accueil.

## Prérequis

- Avoir exporté le projet sur GitHub
- Xcode installé sur un Mac
- Avoir suivi les étapes de configuration Capacitor dans `MOBILE_SETUP.md`

## Architecture des Widgets

L'application utilise Capacitor avec des extensions de widgets natives iOS. Les widgets peuvent afficher :
1. **Widget Compteurs** : Affichage en temps réel des timers configurés
2. **Widget Citations** : Citations motivantes mises à jour toutes les 30 minutes

## Étapes de Configuration

### 1. Ajouter l'Extension Widget iOS

Dans Xcode, après avoir ouvert le projet iOS :

1. **Créer une nouvelle Target Widget Extension**
   - File → New → Target
   - Sélectionner "Widget Extension"
   - Nom : "NextYouWidgets"
   - Cocher "Include Configuration Intent"

2. **Structure du Widget**
```swift
import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), quote: "Chaque jour est une opportunité")
    }
    
    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), quote: loadQuoteFromSharedData())
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let currentDate = Date()
        let refreshDate = Calendar.current.date(byAdding: .minute, value: 30, to: currentDate)!
        
        let entry = SimpleEntry(date: currentDate, quote: loadQuoteFromSharedData())
        let timeline = Timeline(entries: [entry], policy: .after(refreshDate))
        
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let quote: String
}

struct NextYouWidgetEntryView : View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("💪 Next You 2.0")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.secondary)
            
            Text(entry.quote)
                .font(.body)
                .fontWeight(.medium)
                .foregroundColor(.primary)
                .lineLimit(4)
            
            Spacer()
        }
        .padding()
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color.purple, Color.blue]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .opacity(0.1)
        )
    }
}

@main
struct NextYouWidget: Widget {
    let kind: String = "NextYouWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            NextYouWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Citations Next You")
        .description("Reçois des citations motivantes directement sur ton écran d'accueil.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

### 2. Partage de Données entre l'App et le Widget

Les widgets iOS nécessitent un App Group pour partager des données avec l'application principale.

1. **Créer un App Group**
   - Dans Xcode, sélectionner la Target principale
   - Signing & Capabilities → + Capability → App Groups
   - Créer un groupe : `group.app.lovable.nextyou`
   - Répéter pour la Target Widget

2. **Sauvegarder les données dans le App Group**

Créer un helper dans l'app React Native/Capacitor :

```typescript
// src/plugins/WidgetPlugin.ts
import { registerPlugin } from '@capacitor/core';

export interface WidgetPlugin {
  updateWidgetData(options: { quotes: string[], timers: any[] }): Promise<void>;
}

const Widget = registerPlugin<WidgetPlugin>('Widget');

export default Widget;
```

3. **Code natif Swift pour gérer les données**

```swift
// ios/App/App/WidgetPlugin.swift
import Foundation
import Capacitor

@objc(WidgetPlugin)
public class WidgetPlugin: CAPPlugin {
    @objc func updateWidgetData(_ call: CAPPluginCall) {
        guard let sharedDefaults = UserDefaults(suiteName: "group.app.lovable.nextyou") else {
            call.reject("Unable to access shared data")
            return
        }
        
        let quotes = call.getArray("quotes", String.self) ?? []
        let timers = call.getArray("timers", JSObject.self) ?? []
        
        sharedDefaults.set(quotes, forKey: "widget_quotes")
        sharedDefaults.set(timers.map { $0.description }, forKey: "widget_timers")
        sharedDefaults.synchronize()
        
        // Refresh widgets
        WidgetCenter.shared.reloadAllTimelines()
        
        call.resolve()
    }
}
```

### 3. Utilisation dans l'Application

```typescript
// src/pages/Plan.tsx
import Widget from '@/plugins/WidgetPlugin';

const updateWidgets = async () => {
  const allQuotes = Object.values(quotes).flat();
  const timers = JSON.parse(localStorage.getItem("habitflow_timers") || "[]");
  
  try {
    await Widget.updateWidgetData({
      quotes: allQuotes.map(q => `"${q.text}" - ${q.author}`),
      timers: timers
    });
  } catch (error) {
    console.error('Failed to update widgets:', error);
  }
};

// Appeler updateWidgets() après modification des données
```

## Configuration du Widget Timer

Pour le widget des compteurs :

```swift
struct TimerWidgetView: View {
    var entry: TimerEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("⏱️ Mes Compteurs")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.secondary)
            
            ForEach(entry.timers.prefix(3), id: \.id) { timer in
                HStack {
                    Text(timer.name)
                        .font(.caption)
                        .lineLimit(1)
                    Spacer()
                    Text(formatTimerDuration(timer.startDate))
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.purple)
                }
            }
        }
        .padding()
    }
    
    func formatTimerDuration(_ startDate: Date) -> String {
        let interval = Date().timeIntervalSince(startDate)
        let days = Int(interval / 86400)
        let hours = Int((interval.truncatingRemainder(dividingBy: 86400)) / 3600)
        return "\(days)j \(hours)h"
    }
}
```

## Tester les Widgets

1. **Simulateur iOS** : Les widgets peuvent être testés dans le simulateur
2. **Device physique** : Pour une expérience complète, testez sur un appareil réel
3. **Débogage** : Utilisez `print()` dans le code Swift et consultez la console Xcode

## Notes Importantes

- Les widgets iOS se rafraîchissent selon les politiques système (généralement toutes les 15-30 minutes minimum)
- Les widgets ne peuvent pas exécuter de code interactif complexe
- Limitez la quantité de données stockées dans le App Group
- Testez avec différentes tailles de widgets (petit, moyen, grand)

## Ressources

- [Documentation officielle Apple Widgets](https://developer.apple.com/documentation/widgetkit)
- [Guide Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [App Groups iOS](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups)

## Déploiement

Pour que les widgets fonctionnent en production :
1. Configurer les App Groups dans le portail développeur Apple
2. Signer les deux targets (app + widget) avec le même profil
3. Tester sur TestFlight avant la publication
4. Publier sur l'App Store

---

Pour toute question, consulte la documentation Capacitor ou les forums Apple Developer.
