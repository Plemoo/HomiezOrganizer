const { withPlugins, withAndroidManifest } = require('@expo/config-plugins');

const hostingDomain = 'homiesorganizer.web.app';

function withAndroidQueries(config) {
  return withAndroidManifest(config, config => {
    const manifest = config.modResults.manifest;
    manifest.queries ??= [];
    manifest.queries[0] ??= { intent: [] };
    manifest.queries[0].intent ??= [];

    const browserIntent = {
      action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
      category: [{ $: { 'android:name': 'android.intent.category.BROWSABLE' } }],
      data: [{
        $: {
          'android:scheme': 'https',
          'android:host': hostingDomain,
        },
      }],
    };
    const existingBrowserIntentIndex = manifest.queries[0].intent.findIndex(intent =>
      intent.action?.some(action => action.$?.['android:name'] === 'android.intent.action.VIEW')
    );
    if (existingBrowserIntentIndex >= 0) {
      manifest.queries[0].intent[existingBrowserIntentIndex] = browserIntent;
    } else {
      manifest.queries[0].intent.push(browserIntent);
    }

    return config;
  });
}

module.exports = ({ config }) => withPlugins(
  {
    ...config,
    android: {
      ...config.android,
      intentFilters: [
        ...(config.android?.intentFilters || []),
        {
          action: 'VIEW',
          autoVerify: true,
          category: ['BROWSABLE', 'DEFAULT'],
          data: {
            scheme: 'https',
            host: hostingDomain,
            pathPrefix: '/',
          },
        },
      ],
    },
  },
  [
    withAndroidQueries,
  ]
);
