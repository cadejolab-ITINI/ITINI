import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { UserLocation } from '@/types/domain';
import { validCoordinate } from '@/services/map-routing';

export function useUserLocation(autoStart = false) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permission, setPermission] = useState<Location.PermissionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const generation = useRef(0);
  const pending = useRef<Promise<UserLocation | null> | null>(null);

  const stop = useCallback(() => {
    generation.current += 1;
    pending.current = null;
    subscription.current?.remove();
    subscription.current = null;
  }, []);

  const start = useCallback((): Promise<UserLocation | null> => {
    if (pending.current) return pending.current;
    const attempt = ++generation.current;
    const active = () => generation.current === attempt;
    const run = async () => {
      setLoading(true);
      setError(null);
      subscription.current?.remove();
      subscription.current = null;
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        const result = await Location.requestForegroundPermissionsAsync();
        if (!active()) return null;
        setPermission(result.status);
        if (result.status !== Location.PermissionStatus.GRANTED) {
          setLocation(null);
          setError('Activá el permiso de ubicación para usar GPS y preparar el SOS Demo.');
          return null;
        }

        const current = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
          new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('GPS timeout')), 20000); }),
        ]);
        clearTimeout(timeout);
        if (!active()) return null;
        if (!validCoordinate(current.coords)) throw new Error('GPS invalid');
        const point: UserLocation = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          accuracy: current.coords.accuracy,
          timestamp: current.timestamp,
        };
        setLocation(point);
        const watcher = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
          (next) => {
            if (active() && validCoordinate(next.coords)) setLocation({
              latitude: next.coords.latitude,
              longitude: next.coords.longitude,
              accuracy: next.coords.accuracy,
              timestamp: next.timestamp,
            });
          },
          () => { if (active()) setError('Se interrumpió el GPS. Tocá ubicación para actualizar el último punto recibido.'); },
        );
        if (!active()) { watcher.remove(); return null; }
        subscription.current = watcher;
        return point;
      } catch {
        if (active()) setError('No pudimos obtener el GPS. Revisá los permisos y tocá el botón de ubicación para reintentar.');
        return null;
      } finally {
        clearTimeout(timeout);
        if (active()) { setLoading(false); pending.current = null; }
      }
    };
    pending.current = run();
    return pending.current;
  }, []);

  useEffect(() => {
    if (autoStart) void start();
    return stop;
  }, [autoStart, start, stop]);

  return { location, permission, loading, error, start, stop };
}
