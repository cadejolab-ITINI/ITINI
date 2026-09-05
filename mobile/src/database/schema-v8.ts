import type { SQLiteDatabase } from 'expo-sqlite';

export async function migrateV8(db: SQLiteDatabase) {
  const latitude = 13.02741;
  const longitude = -86.35318;
  const row = await db.getFirstAsync<{ route_coordinates_json: string }>('SELECT route_coordinates_json FROM destinations WHERE id = ?', 'estanzuela');
  let routeJson: string | undefined;
  if (row?.route_coordinates_json) {
    try {
      const route = JSON.parse(row.route_coordinates_json) as Array<{ latitude: number; longitude: number }>;
      if (route.length) route[route.length - 1] = { latitude, longitude };
      routeJson = JSON.stringify(route);
    } catch {
      routeJson = undefined;
    }
  }
  if (routeJson) {
    await db.runAsync('UPDATE destinations SET latitude = ?, longitude = ?, route_coordinates_json = ?, updated_at = ? WHERE id = ?', latitude, longitude, routeJson, new Date().toISOString(), 'estanzuela');
  } else {
    await db.runAsync('UPDATE destinations SET latitude = ?, longitude = ?, updated_at = ? WHERE id = ?', latitude, longitude, new Date().toISOString(), 'estanzuela');
  }
}
