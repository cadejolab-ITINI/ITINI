const base = require('./app.json');

/**
 * Las claves se inyectan únicamente al compilar desde variables de entorno.
 * Nunca se guardan en app.json ni en GitHub.
 */
module.exports = ({ config }) => ({
  ...base.expo,
  ...config,
  android: {
    ...base.expo.android,
    ...config.android,
    ...(process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY
      ? { config: { ...(config.android?.config ?? {}), googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY } } }
      : {}),
  },
  ios: {
    ...base.expo.ios,
    ...config.ios,
    ...(process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY
      ? { config: { ...(config.ios?.config ?? {}), googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY } }
      : {}),
  },
  plugins: [
    ...(base.expo.plugins ?? []),
    ...(process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY
      ? [['react-native-maps', {
          androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY,
          iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY,
        }]]
      : []),
  ],
});
