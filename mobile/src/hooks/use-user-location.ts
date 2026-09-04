import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import type { UserLocation } from '@/types/domain';
import { validCoordinate } from '@/services/map-routing';

export function useUserLocation(autoStart = false) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permission, setPermission] = useState<Location.PermissionStatus | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [servicesEnabled, setServicesEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const generation = useRef(0);
  const pending = useRef<Promise<UserLocation | null> | null>(null);

  const stop = useCallback(() => {
    generation.current += 1;
    pending.current = null;
    setLoading(false);
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
        const permissionRequest = Location.requestForegroundPermissionsAsync();
        const result = Platform.OS === 'web' ? await Promise.race([
          permissionRequest,
          new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('Permission timeout')), 30000); }),
        ]) : await permissionRequest;
        clearTimeout(timeout);
        if (!active()) return null;
        setPermission(result.status);
        setCanAskAgain(result.canAskAgain);
        if (result.status !== Location.PermissionStatus.GRANTED) {
          setLocation(null);
          setError('Activá el permiso de ubicación para usar GPS y preparar el SOS Demo.');
          return null;
        }

        const enabled = await Location.hasServicesEnabledAsync();
        if (!active()) return null;
        setServicesEnabled(enabled);
        if (!enabled) {
          setError('El permiso está concedido, pero la ubicación del dispositivo está apagada. Activala en los ajustes del sistema y reintentá.');
          return null;
        }

        // Expo forwards web options to the browser; require a fresh GPS reading.
        const options: Location.LocationOptions & { maximumAge?: number; timeout?: number } = {
          accuracy: Location.Accuracy.High,
          ...(Platform.OS === 'web' ? { maximumAge: 0, timeout: 20000 } : {}),
        };
        const current = await Promise.race([
          Location.getCurrentPositionAsync(options),
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

  return { location, permission, canAskAgain, servicesEnabled, loading, error, start, stop };
}
