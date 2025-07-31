// app.config.js
const { withPlugins, withAndroidManifest } = require('@expo/config-plugins');
// Deine bestehende app.json importieren
const baseConfig = require('./app.json');

function withAndroidQueries(config) {
  return withAndroidManifest(config, config => {
    console.log(config.modResults)
    const manifest = config.modResults.manifest;
    // Stelle sicher, dass manifest.queries existiert
    console.log(manifest.queries[0].intent.data);
    if (!manifest.queries) {
        manifest.queries = [{ intent: [] }];
        manifest.queries[0].intent.push({
          action: 'android.intent.action.VIEW',
          category: ['android.intent.category.BROWSABLE'],
          data: {
            scheme: 'https',
            host: 'homiesorganizer.web.app',
          },
        });
    }
    if(manifest.queries[0].intent){
        console.log('Intent already exists',manifest.queries[0].intent[0].data);
        manifest.queries[0].intent[0].data=[{"$":{
            "android:scheme": ['https'],
            "android:host": ['homiesorganizer.web.app'],
          }}];
    }
    // Füge den VIEW-Intent für deine HTTPS-Domain hinzu
    return config;
  });
}

// Merge baseConfig mit den Ergänzungen
module.exports = withPlugins(
  {
    expo: {
      ...baseConfig.expo,
      android: {
        ...baseConfig.expo.android,
        // Ergänze einen neuen Intent-Filter mit autoVerify
        intentFilters: [
          // deine existierenden Intent-Filters
          ...(baseConfig.expo.android.intentFilters || []),
          // neuer Universal Link Intent-Filter
          {
            action: 'VIEW',
            autoVerify: true,
            category: ['BROWSABLE', 'DEFAULT'],
            data: {
              scheme: 'https',
              host: 'homiesorganizer.web.app',
              pathPrefix: '/',
            },
          },
        ],
      },
      plugins: [
        // alle deine Plugins aus app.json
        ...(baseConfig.expo.plugins || []),
        // unser Manifest-Plugin für <queries>
        withAndroidQueries,
      ],
    },
  },
    [
        // Hier kannst du weitere Plugins hinzufügen, falls nötig
    ]
);