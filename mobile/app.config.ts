import type { ConfigContext, ExpoConfig } from 'expo/config';

import baseConfig from './app.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  const androidGoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY;
  const iosGoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY;
  const expo = baseConfig.expo;

  return {
    ...config,
    ...expo,
    android: {
      ...expo.android,
      ...(androidGoogleMapsApiKey
        ? { config: { googleMaps: { apiKey: androidGoogleMapsApiKey } } }
        : {}),
    },
    plugins: [
      ...(expo.plugins ?? []),
      ...(androidGoogleMapsApiKey || iosGoogleMapsApiKey
        ? [['react-native-maps', { androidGoogleMapsApiKey, iosGoogleMapsApiKey }]]
        : []),
    ],
  } as ExpoConfig;
};
