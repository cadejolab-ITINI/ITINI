import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

export function useConnectivity() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    Network.getNetworkStateAsync().then((state) => setOnline(Boolean(state.isConnected && state.isInternetReachable !== false)));
    const subscription = Network.addNetworkStateListener((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return () => subscription.remove();
  }, []);

  return online;
}
