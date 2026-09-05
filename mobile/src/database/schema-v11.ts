import type { SQLiteDatabase } from 'expo-sqlite';

/** Limpia registros de Cotran Sur sin tarifa y conserva la excepción turística de Tisey. */
export async function migrateV11(db: SQLiteDatabase) {
  await db.runAsync("DELETE FROM bus_schedules WHERE terminal_id = 'cotran-sur' AND fare_cordobas IS NULL AND destination <> 'Tisey · La Estanzuela'");
  await db.runAsync(
    "UPDATE bus_schedules SET fare_cordobas = 30, notes = 'Tarifa indicada para salir desde Estelí: C$30 por persona.' WHERE terminal_id = 'cotran-sur' AND destination = 'Tisey · La Estanzuela'",
  );
}
