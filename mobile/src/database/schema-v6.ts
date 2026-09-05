import type { SQLiteDatabase } from 'expo-sqlite';

const coordinates = [
  { id: 'estanzuela', latitude: 13.02741, longitude: -86.35318 },
  { id: 'tisey', latitude: 12.9850, longitude: -86.3703 },
  { id: 'garnacha', latitude: 12.9702631, longitude: -86.3766618 },
  { id: 'duende', latitude: 12.9712, longitude: -86.3808 },
  { id: 'jalacate', latitude: 12.9836479, longitude: -86.3587145 },
];

export async function migrateV6(db: SQLiteDatabase) {
  for (const point of coordinates) {
    const row = await db.getFirstAsync<{ route_coordinates_json: string }>('SELECT route_coordinates_json FROM destinations WHERE id = ?', point.id);
    let routeJson = row?.route_coordinates_json;
    if (routeJson) {
      try {
        const route = JSON.parse(routeJson) as Array<{ latitude: number; longitude: number }>;
        if (route.length) route[route.length - 1] = { latitude: point.latitude, longitude: point.longitude };
        routeJson = JSON.stringify(route);
      } catch {
        // Si una ruta antigua estuviera dañada, la ubicación principal se corrige igual.
        routeJson = undefined;
      }
    }
    await db.runAsync(
      routeJson ? 'UPDATE destinations SET latitude = ?, longitude = ?, route_coordinates_json = ?, updated_at = ? WHERE id = ?' : 'UPDATE destinations SET latitude = ?, longitude = ?, updated_at = ? WHERE id = ?',
      ...(routeJson ? [point.latitude, point.longitude, routeJson, new Date().toISOString(), point.id] : [point.latitude, point.longitude, new Date().toISOString(), point.id]),
    );
  }
}
