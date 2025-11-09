# Configuration des Widgets iOS et Android pour Next You 2.0

Ce guide explique comment ajouter des widgets natifs iOS et Android à l'application Next You 2.0 pour afficher les compteurs et les citations sur l'écran d'accueil.

## Prérequis

- Avoir exporté le projet sur GitHub
- **Pour iOS** : Xcode installé sur un Mac
- **Pour Android** : Android Studio installé
- Avoir suivi les étapes de configuration Capacitor dans `MOBILE_SETUP.md`

## Architecture des Widgets

L'application utilise Capacitor avec des extensions de widgets natives. Les widgets peuvent afficher :
1. **Widget Compteurs** : Affichage en temps réel des compteurs configurés
2. **Widget Citations** : Citations motivantes mises à jour régulièrement

---

# Configuration iOS

## Étapes de Configuration iOS

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

---

# Configuration Android

## Étapes de Configuration Android

### 1. Créer un App Widget Android

Dans Android Studio, après avoir ouvert le projet Android :

1. **Créer le Widget Layout**
   - Créer `android/app/src/main/res/layout/widget_timer.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="8dp"
    android:background="@drawable/widget_background">
    
    <TextView
        android:id="@+id/widget_title"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="⏱️ Next You 2.0"
        android:textSize="12sp"
        android:textStyle="bold"
        android:textColor="#8B5CF6"
        android:layout_marginBottom="8dp"/>
    
    <LinearLayout
        android:id="@+id/timers_container"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_below="@id/widget_title"
        android:orientation="vertical">
        
        <LinearLayout
            android:id="@+id/timer_1"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:padding="4dp">
            
            <TextView
                android:id="@+id/timer_1_name"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="Compteur 1"
                android:textSize="14sp"
                android:textColor="#FFFFFF"/>
            
            <TextView
                android:id="@+id/timer_1_value"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="0j 0h"
                android:textSize="14sp"
                android:textStyle="bold"
                android:textColor="#8B5CF6"/>
        </LinearLayout>
        
    </LinearLayout>
    
</RelativeLayout>
```

2. **Créer le Widget Background**
   - Créer `android/app/src/main/res/drawable/widget_background.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <gradient
        android:startColor="#1A8B5CF6"
        android:endColor="#1A6366F1"
        android:angle="135"/>
    <corners android:radius="16dp"/>
</shape>
```

3. **Créer le Widget Provider**
   - Créer `android/app/src/main/java/app/lovable/nextyou/TimerWidgetProvider.kt`

```kotlin
package app.lovable.nextyou

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import org.json.JSONArray
import java.util.concurrent.TimeUnit

class TimerWidgetProvider : AppWidgetProvider() {
    
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }
    
    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_timer)
        
        // Charger les données depuis SharedPreferences
        val prefs = context.getSharedPreferences("nextyou_widgets", Context.MODE_PRIVATE)
        val timersJson = prefs.getString("timers", "[]")
        
        try {
            val timers = JSONArray(timersJson)
            if (timers.length() > 0) {
                val timer = timers.getJSONObject(0)
                val name = timer.getString("name")
                val startTime = timer.getLong("startDate")
                
                val duration = System.currentTimeMillis() - startTime
                val days = TimeUnit.MILLISECONDS.toDays(duration)
                val hours = TimeUnit.MILLISECONDS.toHours(duration) % 24
                
                views.setTextViewText(R.id.timer_1_name, name)
                views.setTextViewText(R.id.timer_1_value, "${days}j ${hours}h")
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        
        // Intent pour ouvrir l'app au clic
        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.timers_container, pendingIntent)
        
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
    
    companion object {
        fun updateWidgets(context: Context) {
            val intent = Intent(context, TimerWidgetProvider::class.java)
            intent.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            val ids = AppWidgetManager.getInstance(context)
                .getAppWidgetIds(
                    android.content.ComponentName(context, TimerWidgetProvider::class.java)
                )
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
            context.sendBroadcast(intent)
        }
    }
}
```

4. **Créer Widget Info XML**
   - Créer `android/app/src/main/res/xml/timer_widget_info.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="180dp"
    android:minHeight="110dp"
    android:targetCellWidth="3"
    android:targetCellHeight="2"
    android:updatePeriodMillis="60000"
    android:initialLayout="@layout/widget_timer"
    android:description="@string/widget_timer_description"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:previewImage="@drawable/widget_preview"/>
```

5. **Enregistrer le Widget dans AndroidManifest.xml**

```xml
<receiver
    android:name=".TimerWidgetProvider"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/timer_widget_info" />
</receiver>
```

### 2. Plugin Capacitor pour Android

Créer un plugin pour mettre à jour les widgets depuis React :

```kotlin
// android/app/src/main/java/app/lovable/nextyou/WidgetPlugin.kt
package app.lovable.nextyou

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONArray

@CapacitorPlugin(name = "Widget")
class WidgetPlugin : Plugin() {
    
    @PluginMethod
    fun updateWidgetData(call: PluginCall) {
        val timers = call.getArray("timers")
        val quotes = call.getArray("quotes")
        
        val prefs = context.getSharedPreferences("nextyou_widgets", Context.MODE_PRIVATE)
        val editor = prefs.edit()
        
        if (timers != null) {
            editor.putString("timers", timers.toString())
        }
        if (quotes != null) {
            editor.putString("quotes", quotes.toString())
        }
        
        editor.apply()
        
        // Mettre à jour tous les widgets
        TimerWidgetProvider.updateWidgets(context)
        QuoteWidgetProvider.updateWidgets(context)
        
        call.resolve()
    }
}
```

### 3. Widget Citations Android

Suivre la même structure que pour les compteurs, mais adapter pour afficher des citations :

- Layout : `widget_quote.xml`
- Provider : `QuoteWidgetProvider.kt`
- Info XML : `quote_widget_info.xml`

## Utilisation dans l'Application

Le code TypeScript pour mettre à jour les widgets fonctionne identiquement sur iOS et Android :

```typescript
import { Capacitor } from '@capacitor/core';
import Widget from '@/plugins/WidgetPlugin';

const updateWidgets = async () => {
  if (!Capacitor.isNativePlatform()) return;
  
  const timers = JSON.parse(localStorage.getItem("habitflow_timers") || "[]");
  const allQuotes = Object.values(quotes).flat();
  
  try {
    await Widget.updateWidgetData({
      timers: timers,
      quotes: allQuotes.map(q => ({ text: q.text, author: q.author }))
    });
  } catch (error) {
    console.error('Failed to update widgets:', error);
  }
};

// Appeler après modification des compteurs ou au lancement de l'app
useEffect(() => {
  updateWidgets();
}, [timers]);
```

## Test des Widgets

### iOS
1. Simulateur ou device physique
2. Long press sur l'écran d'accueil → + → Chercher "Next You 2.0"

### Android
1. Émulateur ou device physique  
2. Long press sur l'écran d'accueil → Widgets → Chercher "Next You 2.0"

## Notes Importantes

- **iOS** : Rafraîchissement selon les politiques système (15-30 min minimum)
- **Android** : Peut être configuré plus fréquemment (updatePeriodMillis)
- Limitez les données stockées dans SharedPreferences/App Groups
- Testez sur de vrais appareils pour une expérience complète

## Déploiement

### iOS
1. Configurer App Groups dans le portail Apple
2. Signer les targets (app + widget)
3. Tester sur TestFlight
4. Publier sur App Store

### Android
1. Signer l'APK avec le keystore de production
2. Tester via Google Play Console (Internal/Beta)
3. Publier sur Google Play Store

---

Pour plus d'informations, consulte :
- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Apple WidgetKit](https://developer.apple.com/documentation/widgetkit)
- [Android App Widgets](https://developer.android.com/guide/topics/appwidgets)
