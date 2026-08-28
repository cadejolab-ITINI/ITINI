import type { ConfigContext, ExpoConfig } from 'expo/config';

import baseConfig from './app.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  const expo = baseConfig.expo;

  return {
    ...config,
    ...expo,
    android: {
      ...expo.android,
      ...(googleMapsApiKey
        ? { config: { googleMaps: { apiKey: googleMapsApiKey } } }
        : {}),
    },
  } as ExpoConfig;
};
