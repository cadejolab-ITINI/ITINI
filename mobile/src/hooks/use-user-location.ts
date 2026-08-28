import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { UserLocation } from '@/types/domain';

export function useUserLocation(autoStart = false) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permission, setPermission] = useState<Location.PermissionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscription = useRef<Location.LocationSubscription | null>(null);

  const stop = useCallback(() => {
    subscription.current?.remove();
    subscription.current = null;
  }, []);

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await Location.requestForegroundPermissionsAsync();
    setPermission(result.status);
    if (result.status !== Location.PermissionStatus.GRANTED) {
      setError('Activa el permiso de ubicación para usar GPS y preparar el SOS Demo.');
      setLoading(false);
      return null;
    }

    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const point: UserLocation = {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
      accuracy: current.coords.accuracy,
      timestamp: current.timestamp,
    };
    setLocation(point);
    stop();
    subscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (next) => setLocation({
        latitude: next.coords.latitude,
        longitude: next.coords.longitude,
        accuracy: next.coords.accuracy,
        timestamp: next.timestamp,
      }),
    );
    setLoading(false);
    return point;
  }, [stop]);

  useEffect(() => {
    if (autoStart) start().catch(() => setError('No fue posible obtener tu ubicación.'));
    return stop;
  }, [autoStart, start, stop]);

  return { location, permission, loading, error, start, stop };
}
