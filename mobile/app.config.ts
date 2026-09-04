import type { ConfigContext, ExpoConfig } from 'expo/config';

import baseConfig from './app.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  const expo = baseConfig.expo;

  return {
    ...config,
    ...expo,
    plugins: [
      ...(expo.plugins ?? []),
      '@maplibre/maplibre-react-native',
    ],
  } as ExpoConfig;
};
