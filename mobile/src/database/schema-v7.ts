import type { SQLiteDatabase } from 'expo-sqlite';

const corrected = [
  { id: 'garnacha', latitude: 12.9702631, longitude: -86.3766618 },
  { id: 'jalacate', latitude: 12.9836479, longitude: -86.3587145 },
];

export async function migrateV7(db: SQLiteDatabase) {
  for (const point of corrected) {
    const row = await db.getFirstAsync<{ route_coordinates_json: string }>('SELECT route_coordinates_json FROM destinations WHERE id = ?', point.id);
    let routeJson: string | undefined;
    if (row?.route_coordinates_json) {
      try {
        const route = JSON.parse(row.route_coordinates_json) as Array<{ latitude: number; longitude: number }>;
        if (route.length) route[route.length - 1] = { latitude: point.latitude, longitude: point.longitude };
        routeJson = JSON.stringify(route);
      } catch {
        routeJson = undefined;
      }
    }
    if (routeJson) {
      await db.runAsync('UPDATE destinations SET latitude = ?, longitude = ?, route_coordinates_json = ?, updated_at = ? WHERE id = ?', point.latitude, point.longitude, routeJson, new Date().toISOString(), point.id);
    } else {
      await db.runAsync('UPDATE destinations SET latitude = ?, longitude = ?, updated_at = ? WHERE id = ?', point.latitude, point.longitude, new Date().toISOString(), point.id);
    }
  }
}
