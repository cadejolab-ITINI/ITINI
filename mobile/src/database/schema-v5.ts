import type { SQLiteDatabase } from 'expo-sqlite';

/** Preferencias añadidas después de la primera versión de cuentas locales. */
export async function migrateV5(db: SQLiteDatabase) {
  await db.runAsync('INSERT OR IGNORE INTO app_settings(key, value, updated_at) VALUES (?, ?, ?)', 'light_mode', 0, new Date().toISOString());
}
