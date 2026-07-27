# Aktivitäten Finder

Eine Expo-App zur gemeinsamen Planung von Gruppenaktivitäten.

Mitglieder erstellen Gruppen, teilen Einladungslinks, schlagen Aktivitäten und
Zeitfenster vor und finden anhand ihrer Verfügbarkeiten einen gemeinsamen
Termin. Kommentare und Push-Benachrichtigungen begleiten die Planung.

## Entwicklung

```bash
npm ci
npm start
```

Die Firebase-Emulatoren werden separat gestartet:

```bash
npm run firebaseEmulator
```

Cloud Functions und Firestore-Regeln:

```bash
npm run deployFirestore
```
