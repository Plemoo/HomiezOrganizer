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

In einem zweiten Terminal lassen sich wiederholbar lokale Testdaten für den zuletzt aktiven
anonymen App-Nutzer anlegen:

```bash
npm run seedEmulator
```

Das Script erzeugt vier User, zwei Gruppen und vier Aktivitäten. Falls mehrere reale Nutzer im
Auth-Emulator existieren, kann die gewünschte UID explizit angegeben werden:

```bash
npm run seedEmulator -- --uid <AUTH-UID>
```

Cloud Functions und Firestore-Regeln:

```bash
npm run deployFirestore
```

## Android-Release über EAS

Ein Push eines Git-Tags, das mit `v` beginnt, startet den EAS-Workflow
`.eas/workflows/android-production.yml`. Nach Lint, Typecheck und Tests wird ein
signiertes Android App Bundle gebaut und als Entwurf in den internen Test-Track
der Google Play Console hochgeladen.

Einmalig müssen vor dem ersten automatischen Release folgende Punkte erledigt sein:

1. Das EAS-Projekt muss mit diesem GitHub-Repository verknüpft sein.
2. In der Google Play Console muss eine App mit der Paket-ID `com.homiesOrganizer`
   existieren.
3. Unter den Android-Credentials des EAS-Projekts müssen ein Android-Keystore und
   ein Google-Play-Service-Account-Key hinterlegt sein. Der Service Account benötigt
   Zugriff auf diese App in der Play Console.
4. Im EAS-Environment `production` muss `GOOGLE_SERVICES_JSON` als File-Variable
   mit `secure/google-services.json` angelegt sein.

Die Firebase-File-Variable wird einmalig lokal angelegt (der Dateiinhalt wird
dabei nicht in Git gespeichert):

```bash
eas env:set production --name GOOGLE_SERVICES_JSON --value secure/google-services.json --type file --visibility secret --scope project
```

Android-Build- und Google-Play-Credentials lassen sich interaktiv prüfen oder
ergänzen:

```bash
eas credentials --platform android
```

Danach wird ein Release zum Beispiel so ausgelöst:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Das Submit-Profil verwendet zunächst `track: internal` und
`releaseStatus: draft`. Nach erfolgreichem Test kann dies in `eas.json` bewusst
auf einen anderen Track beziehungsweise Release-Status umgestellt werden.
