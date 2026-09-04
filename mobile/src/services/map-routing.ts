import type { Coordinate } from '../types/domain';

export type RoadRoute = {
  coordinates: Coordinate[];
  origin: Coordinate;
  destination: Coordinate;
  distanceMeters: number;
  durationSeconds: number;
};

export function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
}

export function distanceKm(a: Coordinate, b: Coordinate) {
  const rad = Math.PI / 180;
  const h = Math.sin((b.latitude - a.latitude) * rad / 2) ** 2
    + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad)
    * Math.sin((b.longitude - a.longitude) * rad / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
}

export function validCoordinate(point: Coordinate) {
  return Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90
    && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180;
}

// Explicit opt-in only. Public driving service, not validated hiking navigation.
export async function fetchRoadRoute(origin: Coordinate, destination: Coordinate, signal: AbortSignal): Promise<RoadRoute> {
  if (!validCoordinate(origin) || !validCoordinate(destination)) throw new Error('Coordenadas no válidas.');
  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&radiuses=1000;1000`, { signal });
  if (!response.ok) throw new Error('El servicio de rutas no está disponible. Intentá de nuevo.');
  const body = await response.json();
  const route = body.routes?.[0];
  if (body.code !== 'Ok' || !route || !Array.isArray(route.geometry?.coordinates)) {
    throw new Error('No encontramos una ruta por carretera hasta este punto. Consultá el acceso con un guía local.');
  }
  const points: Coordinate[] = route.geometry.coordinates.map((point: number[]) => ({ latitude: point[1], longitude: point[0] }));
  if (points.length < 2 || !points.every(validCoordinate) || !Number.isFinite(route.distance) || route.distance < 0 || !Number.isFinite(route.duration) || route.duration < 0) {
    throw new Error('El servicio devolvió una ruta incompleta. Intentá de nuevo.');
  }
  return { origin, destination, coordinates: points, distanceMeters: route.distance, durationSeconds: route.duration };
}
